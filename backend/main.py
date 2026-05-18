from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, attendance
import tempfile, os, numpy as np

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm the SFace model on startup so the first student scan is fast
    try:
        from deepface import DeepFace
        import cv2
        blank = np.zeros((112, 112, 3), dtype=np.uint8)
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            cv2.imwrite(f.name, blank)
            path = f.name
        try:
            DeepFace.represent(img_path=path, model_name="SFace", enforce_detection=False)
        except Exception:
            pass
        finally:
            os.remove(path)
        print("✅ SFace model pre-warmed successfully")
    except Exception as e:
        print(f"⚠️ Model pre-warm failed (non-critical): {e}")
    yield

app = FastAPI(title="Smart Attendance API", description="Native MongoDB Backend", lifespan=lifespan)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Smart Attendance API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler to ensure CORS headers are sent even on 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

app.include_router(auth.router)
app.include_router(attendance.router)

