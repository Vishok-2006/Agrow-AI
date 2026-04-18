from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


class AuthPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    user_id: Optional[str] = None


class CropRecommendationRequest(BaseModel):
    humidity: float
    location: str
    temperature: float
    soil_type: Optional[str] = "Loamy"
    user_id: Optional[str] = None
