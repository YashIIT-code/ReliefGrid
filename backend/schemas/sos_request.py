from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SOSBase(BaseModel):
    name: str
    lat: float
    lng: float
    category: str
    description: str
    severity: int

class SOSCreate(SOSBase):
    pass

class SOSResponse(SOSBase):
    id: int
    status: str
    priority_score: float
    priority_explanation: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class SOSAssessRequest(BaseModel):
    category: str
    severity: int
    description: str

class SOSAssessResponse(BaseModel):
    priority_score: float
    risk_category: str
    factors: list[str]
    explanation: str
    recommended_action: str

