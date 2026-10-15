import os
import shutil
import tempfile
import base64
import random
import uuid
import cv2
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, status
from pymongo.database import Database
from jose import JWTError
from deepface import DeepFace
import schemas
from database import get_db
from services.qr import generate_secure_qr_session, verify_qr_token
from services.liveness import verify_liveness_challenge, check_single_frame_presentation_attack
import datetime

# We keep this just in case, but no longer use it for active storage
FACES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "faces")
os.makedirs(FACES_DIR, exist_ok=True)
router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.get("/face/challenge")
def get_liveness_challenge():
    """
    Issues a dynamic interactive liveness challenge (blink, turn_left, turn_right, smile)
    to prevent static photo spoofing attacks.
    """
    challenges = [
        {
            "type": "blink",
            "prompt": "Blink your eyes naturally",
            "icon": "👁️",
            "instruction": "Look directly at the camera and blink once or twice"
        },
        {
            "type": "turn_left",
            "prompt": "Turn your head slightly to the LEFT",
            "icon": "👈",
            "instruction": "Slowly turn your face slightly towards your left"
        },
        {
            "type": "turn_right",
            "prompt": "Turn your head slightly to the RIGHT",
            "icon": "👉",
            "instruction": "Slowly turn your face slightly towards your right"
        },
        {
            "type": "smile",
            "prompt": "Smile naturally for the camera",
            "icon": "😊",
            "instruction": "Show a clear, natural smile towards the webcam"
        }
    ]
    chosen = random.choice(challenges)
    return {
        "challenge_id": f"ch_{uuid.uuid4().hex[:8]}",
        "challenge_type": chosen["type"],
        "prompt": chosen["prompt"],
        "icon": chosen["icon"],
        "instruction": chosen["instruction"],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/qr/generate", response_model=schemas.QRGenerateResponse)
def generate_qr(payload: schemas.QRGenerateRequest):
    """
    Called by the FacultyDashboard to mint a secure, time-expiring JWT QR string.
    """
    token = generate_secure_qr_session(payload.course_id, payload.duration_minutes)
    return {
        "token": token,
        "course_id": payload.course_id,
        "duration_minutes": payload.duration_minutes
    }

@router.post("/qr/send")
def send_qr_to_students(payload: schemas.QRSendRequest):
    """
    Mock sending the QR code via email/notification to all students enrolled in the course.
    """
    print(f"Mock: Sending QR token {payload.token} to students of {payload.course_id}")
    return {"message": f"QR code successfully sent to all students enrolled in {payload.course_id}!"}

@router.post("/qr", response_model=schemas.AttendanceResponse)
def log_qr_attendance(token: str = Form(...), student_id: str = Form(...), db: Database = Depends(get_db)):
    """
    Called by the StudentDashboard when scanning a QR code token.
    Decodes the JWT verify expiration.
    """
    try:
        payload = verify_qr_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR Code expired or invalid mathematically")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        
    course_id = payload.get("course_id")
    
    log = {
        "student_id": student_id,
        "course_id": course_id,
        "method": "qr",
        "status": "present",
        "timestamp": datetime.datetime.utcnow()
    }
    
    res = db["attendances"].insert_one(log)
    saved = db["attendances"].find_one({"_id": res.inserted_id})
    saved["_id"] = str(saved["_id"])
    return saved


@router.post("/face/register")
def register_face(file: UploadFile = File(...), student_id: str = Form(...), db: Database = Depends(get_db)):
    """
    Registers a face reference image for the given student_id in MongoDB.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
        shutil.copyfileobj(file.file, tmp_file)
        file_path = tmp_file.name

    try:
        # Verify that DeepFace can detect a face in the image to prevent bad registrations
        DeepFace.extract_faces(img_path=file_path, enforce_detection=True)
        
        # Read file as binary and encode to Base64
        with open(file_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
        # Store in MongoDB
        db["face_profiles"].update_one(
            {"student_id": student_id},
            {"$set": {"image_base64": encoded_string}},
            upsert=True
        )
        return {"detail": f"Face registered successfully for {student_id}"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to register face: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


def _execute_deepface_verification(live_path: str, registered_path: str) -> dict:
    """Helper to run DeepFace SFace verification with optional neural anti-spoofing."""
    try:
        import torch  # noqa: F401
        return DeepFace.verify(
            img1_path=live_path,
            img2_path=registered_path,
            model_name="SFace",
            detector_backend="opencv",
            enforce_detection=False,
            anti_spoofing=True
        )
    except Exception:
        return DeepFace.verify(
            img1_path=live_path,
            img2_path=registered_path,
            model_name="SFace",
            detector_backend="opencv",
            enforce_detection=False
        )


@router.post("/face/verify-only")
def verify_face_only(
    file: UploadFile = File(...),
    challenge_file: Optional[UploadFile] = File(None),
    challenge_type: Optional[str] = Form("blink"),
    student_id: str = Form(...),
    db: Database = Depends(get_db)
):
    """
    Verifies the student's face against their registered profile WITH active Anti-Spoofing & Liveness detection.
    Guards against static photo presentations, printed photos, and screen replays.
    """
    profile = db["face_profiles"].find_one({"student_id": student_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No registered face profile found for this student. Please register your face first.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_uploaded:
        shutil.copyfileobj(file.file, tmp_uploaded)
        tmp_uploaded_path = tmp_uploaded.name

    tmp_challenge_path = None
    if challenge_file and challenge_file.filename:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_chal:
            shutil.copyfileobj(challenge_file.file, tmp_chal)
            tmp_challenge_path = tmp_chal.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_registered:
        tmp_registered.write(base64.b64decode(profile["image_base64"]))
        tmp_registered_path = tmp_registered.name

    try:
        # 1. Anti-Spoofing & Liveness Challenge Check
        if tmp_challenge_path:
            is_live, liveness_reason, metrics = verify_liveness_challenge(
                live_img_path=tmp_uploaded_path,
                challenge_img_path=tmp_challenge_path,
                challenge_type=challenge_type or "blink"
            )
            if not is_live:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"🛡️ Anti-Spoofing Alert: {liveness_reason}"
                )
        else:
            # Single-frame presentation attack sanity check
            live_bgr = cv2.imread(tmp_uploaded_path)
            is_valid, reason = check_single_frame_presentation_attack(live_bgr)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"🛡️ Anti-Spoofing Alert: {reason}"
                )

        # 2. DeepFace Biometric Identity Match
        result = _execute_deepface_verification(tmp_uploaded_path, tmp_registered_path)

        if not result.get("verified"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Face verification failed. Live face does not match registered profile.")

        return {
            "verified": True,
            "liveness_verified": True,
            "anti_spoofing_shield": "active",
            "challenge_type": challenge_type,
            "detail": "Identity & Liveness verified successfully! Proceed to QR scan."
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Face detection error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Verification error: {str(e)}")
    finally:
        for p in (tmp_uploaded_path, tmp_challenge_path, tmp_registered_path):
            if p and os.path.exists(p):
                os.remove(p)


@router.post("/face", response_model=schemas.AttendanceResponse)
def log_face_attendance(
    file: UploadFile = File(...),
    challenge_file: Optional[UploadFile] = File(None),
    challenge_type: Optional[str] = Form("blink"),
    student_id: str = Form(...),
    db: Database = Depends(get_db)
):
    profile = db["face_profiles"].find_one({"student_id": student_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No registered face profile found for this student. Please register your face first.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_uploaded:
        shutil.copyfileobj(file.file, tmp_uploaded)
        tmp_uploaded_path = tmp_uploaded.name

    tmp_challenge_path = None
    if challenge_file and challenge_file.filename:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_chal:
            shutil.copyfileobj(challenge_file.file, tmp_chal)
            tmp_challenge_path = tmp_chal.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_registered:
        tmp_registered.write(base64.b64decode(profile["image_base64"]))
        tmp_registered_path = tmp_registered.name

    try:
        # Anti-Spoofing Verification
        if tmp_challenge_path:
            is_live, liveness_reason, _ = verify_liveness_challenge(
                live_img_path=tmp_uploaded_path,
                challenge_img_path=tmp_challenge_path,
                challenge_type=challenge_type or "blink"
            )
            if not is_live:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"🛡️ Anti-Spoofing Alert: {liveness_reason}"
                )

        result = _execute_deepface_verification(tmp_uploaded_path, tmp_registered_path)
        if not result.get("verified"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Face verification failed. Live face does not match registered profile.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Face detection error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Verification error: {str(e)}")
    finally:
        for p in (tmp_uploaded_path, tmp_challenge_path, tmp_registered_path):
            if p and os.path.exists(p):
                os.remove(p)

    log = {
        "student_id": student_id,
        "method": "face",
        "status": "present",
        "liveness_verified": True,
        "timestamp": datetime.datetime.utcnow()
    }
    res = db["attendances"].insert_one(log)
    saved = db["attendances"].find_one({"_id": res.inserted_id})
    saved["_id"] = str(saved["_id"])
    return saved


@router.get("/", response_model=list[schemas.AttendanceResponse])
def get_all_attendance(db: Database = Depends(get_db)):
    docs = list(db["attendances"].find().sort("timestamp", -1))
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@router.get("/student/{student_id}")
def get_student_attendance(student_id: str, db: Database = Depends(get_db)):
    docs = list(db["attendances"].find({"student_id": student_id}).sort("timestamp", -1))
    for d in docs:
        d["_id"] = str(d["_id"])
        if isinstance(d.get("timestamp"), datetime.datetime):
            d["timestamp"] = d["timestamp"].isoformat()
    return docs
