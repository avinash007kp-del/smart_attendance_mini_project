import os
import shutil
import tempfile
import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, status
from pymongo.database import Database
from jose import JWTError
from deepface import DeepFace
import schemas
from database import get_db
from services.qr import generate_secure_qr_session, verify_qr_token
import datetime

# We keep this just in case, but no longer use it for active storage
FACES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "faces")
os.makedirs(FACES_DIR, exist_ok=True)
router = APIRouter(prefix="/attendance", tags=["attendance"])

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


@router.post("/face/verify-only")
def verify_face_only(file: UploadFile = File(...), student_id: str = Form(...), db: Database = Depends(get_db)):
    """
    Verifies the student's face against their MongoDB registered profile WITHOUT logging attendance.
    """
    profile = db["face_profiles"].find_one({"student_id": student_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No registered face profile found for this student. Please register your face first.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_uploaded:
        shutil.copyfileobj(file.file, tmp_uploaded)
        tmp_uploaded_path = tmp_uploaded.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_registered:
        tmp_registered.write(base64.b64decode(profile["image_base64"]))
        tmp_registered_path = tmp_registered.name

    try:
        result = DeepFace.verify(img1_path=tmp_uploaded_path, img2_path=tmp_registered_path, model_name="Facenet", enforce_detection=True)
        if not result.get("verified"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Face verification failed. Faces do not match.")
        return {"verified": True, "detail": "Identity verified successfully. Proceed to QR scan."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Face detection failed: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Verification error: {str(e)}")
    finally:
        if os.path.exists(tmp_uploaded_path):
            os.remove(tmp_uploaded_path)
        if os.path.exists(tmp_registered_path):
            os.remove(tmp_registered_path)


@router.post("/face", response_model=schemas.AttendanceResponse)
def log_face_attendance(file: UploadFile = File(...), student_id: str = Form(...), db: Database = Depends(get_db)):
    profile = db["face_profiles"].find_one({"student_id": student_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No registered face profile found for this student. Please register your face first.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_uploaded:
        shutil.copyfileobj(file.file, tmp_uploaded)
        tmp_uploaded_path = tmp_uploaded.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_registered:
        tmp_registered.write(base64.b64decode(profile["image_base64"]))
        tmp_registered_path = tmp_registered.name

    try:
        result = DeepFace.verify(img1_path=tmp_uploaded_path, img2_path=tmp_registered_path, model_name="Facenet", enforce_detection=True)
        if not result.get("verified"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Face verification failed. Faces do not match.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Face detection failed: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Verification error: {str(e)}")
    finally:
        if os.path.exists(tmp_uploaded_path):
            os.remove(tmp_uploaded_path)
        if os.path.exists(tmp_registered_path):
            os.remove(tmp_registered_path)

    log = {
        "student_id": student_id,
        "method": "face",
        "status": "present",
        "timestamp": datetime.datetime.utcnow()
    }
    res = db["attendances"].insert_one(log)
    saved = db["attendances"].find_one({"_id": res.inserted_id})
    saved["_id"] = str(saved["_id"])
    return saved


@router.get("/", response_model=list[schemas.AttendanceResponse])
def get_all_attendance(db: Database = Depends(get_db)):
    docs = list(db["attendances"].find())
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs
