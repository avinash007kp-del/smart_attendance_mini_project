from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
import schemas
from database import get_db
from services.auth_utils import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/has_admin")
def has_admin(db: Database = Depends(get_db)):
    count = db["users"].count_documents({"role": "admin"})
    return {"has_admin": count > 0}

@router.post("/login", response_model=schemas.Token)
def login(request: schemas.UserLogin, db: Database = Depends(get_db)):
    user = db["users"].find_one({"email": request.email})
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
            
    # Role is automatically determined from the database user record,
    # so we no longer check request.role. This ensures users can't
    # login as a role they don't possess.

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    # Cast MongoDB ObjectId helper directly into _id so Pydantic picks it up
    user["_id"] = str(user["_id"])
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Database = Depends(get_db)):
    if user.role == "admin":
        admin_count = db["users"].count_documents({"role": "admin"})
        if admin_count > 0:
            raise HTTPException(status_code=403, detail="An admin account already exists. Only one admin is allowed.")

    db_user = db["users"].find_one({"email": user.email})
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "hashed_password": hashed_password,
        "name": user.name,
        "role": user.role,
        "dept": user.dept,
        "subject": user.subject
    }
    
    res = db["users"].insert_one(new_user)
    saved_user = db["users"].find_one({"_id": res.inserted_id})
    saved_user["_id"] = str(saved_user["_id"])
    return saved_user

@router.delete("/users/{email}")
def delete_user(email: str, db: Database = Depends(get_db)):
    db_user = db["users"].find_one({"email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db["users"].delete_one({"email": email})
    db["face_profiles"].delete_many({"student_id": email})
    return {"detail": "User and associated data deleted"}

@router.get("/users")
def get_all_users(db: Database = Depends(get_db)):
    users = list(db["users"].find({}, {"hashed_password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])
    return users
