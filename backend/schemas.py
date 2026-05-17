from pydantic import BaseModel, Field, GetCoreSchemaHandler
from pydantic_core import core_schema
from datetime import datetime
from typing import List, Optional, Any

# Custom validator for MongoDB ObjectId mapping cleanly to Pydantic v2
class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(str),
                core_schema.no_info_plain_validator_function(lambda v: str(v)),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda v: str(v), when_used='unless-none'
            ),
        )

# ---- Users ----
class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str
    role: str = "student"
    dept: Optional[str] = None
    subject: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    role: str = "student"

class UserResponse(UserBase):
    id: PyObjectId = Field(alias="_id")
    role: str
    profile_image_path: Optional[str] = None

    class Config:
        populate_by_name = True

# ---- Auth Tokens ----
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# ---- Attendance ----
class AttendanceBase(BaseModel):
    method: str
    course_id: Optional[str] = None
    timestamp: Optional[datetime] = None
    status: str = "present"

class AttendanceCreate(AttendanceBase):
    student_id: str

class AttendanceResponse(AttendanceBase):
    id: PyObjectId = Field(alias="_id")
    student_id: str
    
    class Config:
        populate_by_name = True

# ---- QR Generation ----
class QRGenerateRequest(BaseModel):
    course_id: str
    duration_minutes: float = 10.0

class QRGenerateResponse(BaseModel):
    token: str
    course_id: str
    duration_minutes: float

class QRSendRequest(BaseModel):
    course_id: str
    token: str
