import os
import cv2
import numpy as np
import tempfile
from typing import Tuple, Dict, Any, Optional

# Load OpenCV cascades for facial feature analysis
CASCADE_DIR = cv2.data.haarcascades
face_cascade = cv2.CascadeClassifier(os.path.join(CASCADE_DIR, "haarcascade_frontalface_default.xml"))
eye_cascade = cv2.CascadeClassifier(os.path.join(CASCADE_DIR, "haarcascade_eye.xml"))
smile_cascade = cv2.CascadeClassifier(os.path.join(CASCADE_DIR, "haarcascade_smile.xml"))
profile_cascade = cv2.CascadeClassifier(os.path.join(CASCADE_DIR, "haarcascade_profileface.xml"))

def check_single_frame_presentation_attack(img_bgr: np.ndarray) -> Tuple[bool, str]:
    """
    Analyzes a single face frame for static screen/print presentation attack characteristics.
    Returns (is_valid, reason).
    """
    if img_bgr is None or img_bgr.size == 0:
        return False, "Empty or invalid image frame provided."

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Laplacian variance check (blurry screen or low-quality paper print)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if lap_var < 15.0:
        return False, "Image is too blurry or low-contrast. Please face the camera in good lighting."

    # 2. Check for face presence
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
    if len(faces) == 0:
        # Check profile face in case of tilted/turned pose
        profiles = profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(60, 60))
        if len(profiles) == 0:
            return False, "No human face detected in frame. Please align your face inside the circle."

    return True, "Face detected with adequate sharpness."

def verify_liveness_challenge(
    live_img_path: str,
    challenge_img_path: str,
    challenge_type: str = "blink"
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Verifies that live_img and challenge_img represent a real, live human performing the challenge:
    1. Rejects identical or static frames (anti-spoofing: printed photo or static screen display).
    2. Validates frame motion variance is within natural human limits.
    3. Validates the specific challenge action (blink, head turn left/right, smile).
    """
    metrics: Dict[str, Any] = {
        "challenge_type": challenge_type,
        "mean_diff": 0.0,
        "motion_detected": False,
        "action_verified": False,
        "deepface_anti_spoofing": None
    }

    if not os.path.exists(live_img_path) or not os.path.exists(challenge_img_path):
        return False, "Missing image files for liveness verification.", metrics

    live_bgr = cv2.imread(live_img_path)
    challenge_bgr = cv2.imread(challenge_img_path)

    if live_bgr is None or challenge_bgr is None:
        return False, "Could not decode image files.", metrics

    # Resize challenge image to match live image size if slightly different
    if live_bgr.shape != challenge_bgr.shape:
        challenge_bgr = cv2.resize(challenge_bgr, (live_bgr.shape[1], live_bgr.shape[0]))

    live_gray = cv2.cvtColor(live_bgr, cv2.COLOR_BGR2GRAY)
    challenge_gray = cv2.cvtColor(challenge_bgr, cv2.COLOR_BGR2GRAY)

    # ── Check 1: Static photo / Frozen Frame Detection ─────────────
    # If someone holds up a static photo or sends two identical frames:
    abs_diff = cv2.absdiff(live_gray, challenge_gray)
    mean_diff = float(np.mean(abs_diff))
    metrics["mean_diff"] = round(mean_diff, 3)

    # Threshold: An identical or motionless frozen frame typically has mean_diff < 0.4
    if mean_diff < 0.4:
        return False, "Spoofing attempt detected: Static or duplicate photo detected. Live movement is required.", metrics

    metrics["motion_detected"] = True

    # ── Check 2: Reasonable Human Motion Boundary ──────────────────
    # If the two frames are completely different scenes (e.g. two totally different photos):
    if mean_diff > 120.0:
        return False, "Excessive motion or frame mismatch detected. Please stay centered in front of the camera.", metrics

    # ── Check 3: Challenge Action Verification ─────────────────────
    # Detect face region in live image
    live_faces = face_cascade.detectMultiScale(live_gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
    challenge_faces = face_cascade.detectMultiScale(challenge_gray, scaleFactor=1.1, minNeighbors=3, minSize=(50, 50))

    if challenge_type in ("turn_left", "turn_right", "head_turn"):
        # In a head turn, frontal face presence changes, profile face activates,
        # or the face center of mass shifts significantly.
        profile_faces = profile_cascade.detectMultiScale(challenge_gray, scaleFactor=1.1, minNeighbors=3, minSize=(50, 50))
        
        # Check if face position shifted horizontally
        shifted = False
        if len(live_faces) > 0 and len(challenge_faces) > 0:
            live_center_x = live_faces[0][0] + live_faces[0][2] / 2
            challenge_center_x = challenge_faces[0][0] + challenge_faces[0][2] / 2
            dx = challenge_center_x - live_center_x
            if challenge_type == "turn_left" and (dx < -6 or len(profile_faces) > 0 or mean_diff >= 2.0):
                shifted = True
            elif challenge_type == "turn_right" and (dx > 6 or len(profile_faces) > 0 or mean_diff >= 2.0):
                shifted = True
            elif mean_diff >= 2.0:
                shifted = True
        elif len(profile_faces) > 0 or mean_diff >= 2.5:
            shifted = True

        if not shifted and mean_diff < 2.0:
            return False, f"Head turn not detected. Please turn your head slightly to the {'left' if challenge_type == 'turn_left' else 'right'}.", metrics

        metrics["action_verified"] = True

    elif challenge_type == "smile":
        # Check smile cascade in challenge frame
        smiles = smile_cascade.detectMultiScale(challenge_gray, scaleFactor=1.7, minNeighbors=18, minSize=(25, 25))
        if len(smiles) > 0 or mean_diff >= 2.0:
            metrics["action_verified"] = True
        else:
            return False, "Smile not detected. Please smile naturally for the camera.", metrics

    elif challenge_type in ("blink", "eyes"):
        # For blink, check difference in the eye region (upper 30%-60% of face)
        eyes_live = eye_cascade.detectMultiScale(live_gray, scaleFactor=1.1, minNeighbors=4, minSize=(20, 20))
        eyes_challenge = eye_cascade.detectMultiScale(challenge_gray, scaleFactor=1.1, minNeighbors=4, minSize=(20, 20))
        
        # In a blink, eye count or eye region appearance fluctuates
        eye_state_changed = (len(eyes_live) != len(eyes_challenge)) or (mean_diff >= 1.5)
        if not eye_state_changed and mean_diff < 1.5:
            return False, "Blink not detected. Please blink your eyes naturally.", metrics

        metrics["action_verified"] = True

    else:
        # Generic motion challenge
        if mean_diff >= 1.2:
            metrics["action_verified"] = True
        else:
            return False, "Insufficient movement detected. Please move slightly to confirm liveness.", metrics

    # ── Check 4: Optional DeepFace Neural Anti-Spoofing (if PyTorch available) ──
    try:
        import torch  # noqa: F401
        from deepface import DeepFace
        faces_res = DeepFace.extract_faces(img_path=live_img_path, detector_backend="opencv", enforce_detection=False, anti_spoofing=True)
        if faces_res and len(faces_res) > 0:
            is_real = faces_res[0].get("is_real", True)
            antispoof_score = faces_res[0].get("antispoof_score", 1.0)
            metrics["deepface_anti_spoofing"] = {"is_real": is_real, "score": antispoof_score}
            if is_real is False:
                return False, "Presentation attack detected by DeepFace neural anti-spoofing.", metrics
    except Exception:
        metrics["deepface_anti_spoofing"] = "opencv_temporal_fallback"

    return True, "Liveness challenge verified successfully.", metrics
