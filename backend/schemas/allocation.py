from pydantic import BaseModel
from typing import List, Optional

class AllocationRequest(BaseModel):
    filters: Optional[dict] = None

class AllocationResult(BaseModel):
    warehouse_id: int
    warehouse_name: str
    destination_id: int
    destination_name: str
    destination_type: str # 'shelter' or 'hospital'
    resource_type: str
    quantity: int
    vehicle_id: int
    priority_score: float

class AllocationResponse(BaseModel):
    allocations: List[AllocationResult]
    total_allocations: int
