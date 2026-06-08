from pydantic import BaseModel
from typing import Optional

class ShelterBase(BaseModel):
    name: str
    lat: float
    lng: float
    people_count: int = 0
    food_stock: int = 0
    water_stock: int = 0
    blankets: int = 0
    medicine_stock: int = 0
    contact_name: Optional[str] = None
    priority_score: float = 0.0

class ShelterCreate(ShelterBase):
    pass

class ShelterUpdate(BaseModel):
    name: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    people_count: Optional[int] = None
    food_stock: Optional[int] = None
    water_stock: Optional[int] = None
    blankets: Optional[int] = None
    medicine_stock: Optional[int] = None
    contact_name: Optional[str] = None
    priority_score: Optional[float] = None

class ShelterResponse(ShelterBase):
    id: int

    model_config = {"from_attributes": True}
