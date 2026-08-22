from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SOSBase(BaseModel):
    name: str
    lat: float
    lng: float
    category: str
    description: str
    severity: int = Field(ge=1, le=5)

class SOSCreate(SOSBase):
    affected_people: int = Field(default=0, ge=0)

class SOSResponse(SOSBase):
    id: int
    status: str
    priority_score: float
    priority_explanation: Optional[str] = None
    created_at: datetime
    affected_people: int = 0
    distance_from_impact_km: Optional[float] = None
    nearest_impact_zone: Optional[str] = None
    nearest_warehouse_id: Optional[int] = None
    nearest_warehouse_name: Optional[str] = None
    warehouse_distance_km: Optional[float] = None
    estimated_delivery_minutes: Optional[int] = None
    food_stock_units: Optional[int] = None
    food_stock_status: Optional[str] = None

    model_config = {"from_attributes": True}

class SOSAssessRequest(BaseModel):
    category: str
    severity: int = Field(ge=1, le=5)
    description: str
    affected_people: int = Field(default=0, ge=0)
    lat: float
    lng: float

class SOSAssessResponse(BaseModel):
    priority_score: float
    risk_category: str
    factors: list[str]
    explanation: str
    recommended_action: str
    affected_people: int = 0
    distance_from_impact_km: Optional[float] = None
    nearest_impact_zone: Optional[str] = None
    nearest_warehouse_id: Optional[int] = None
    nearest_warehouse_name: Optional[str] = None
    warehouse_distance_km: Optional[float] = None
    estimated_delivery_minutes: Optional[int] = None
    food_stock_units: Optional[int] = None
    food_stock_status: Optional[str] = None
