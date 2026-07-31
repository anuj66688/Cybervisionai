from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    department: str = Field(..., min_length=2)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    uid: str
    name: str
    email: EmailStr
    department: str
    role: str = "Analyst"
    status: str = "Active"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

class UserVerifyResponse(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None
    authenticated: bool = True
