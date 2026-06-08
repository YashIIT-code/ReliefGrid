from pydantic import BaseModel
from typing import Optional

class HospitalBase(BaseModel):
    name: str
    lat: float
    lng: float
    oxygen_available: int = 0
    blood_units: int = 0
    icu_beds: int = 0
    ambulances: int = 0
    contact_name: Optional[str] = None
    priority_score: float = 0.0

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    oxygen_available: Optional[int] = None
    blood_units: Optional[int] = None
    icu_beds: Optional[int] = None
    ambulances: Optional[int] = None
    contact_name: Optional[str] = None
    priority_score: Optional[float] = None

class HospitalResponse(HospitalBase):
    id: int

    model_config = {"from_attributes": True}
