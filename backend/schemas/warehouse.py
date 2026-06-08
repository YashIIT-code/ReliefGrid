from pydantic import BaseModel
from typing import Optional

class WarehouseBase(BaseModel):
    name: str
    lat: float
    lng: float
    food_supply: int = 0
    water_supply: int = 0
    blankets: int = 0
    medicine: int = 0
    vehicles: int = 0

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    food_supply: Optional[int] = None
    water_supply: Optional[int] = None
    blankets: Optional[int] = None
    medicine: Optional[int] = None
    vehicles: Optional[int] = None

class WarehouseResponse(WarehouseBase):
    id: int

    model_config = {"from_attributes": True}
