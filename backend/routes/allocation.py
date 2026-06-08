from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.allocation_engine import optimize_allocation
from schemas.allocation import AllocationResponse

router = APIRouter(prefix="/api/allocation", tags=["allocation"])

last_allocations = []

@router.post("/optimize", response_model=AllocationResponse)
def run_optimization(db: Session = Depends(get_db)):
    global last_allocations
    allocations = optimize_allocation(db)
    last_allocations = allocations
    return {
        "allocations": allocations,
        "total_allocations": len(allocations)
    }

@router.get("/results", response_model=AllocationResponse)
def get_results():
    global last_allocations
    return {
        "allocations": last_allocations,
        "total_allocations": len(last_allocations)
    }
