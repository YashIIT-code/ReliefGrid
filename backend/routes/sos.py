from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sos_request import SOSRequest
from schemas.sos_request import SOSCreate, SOSResponse, SOSAssessRequest, SOSAssessResponse
from services.priority_engine import calculate_sos_risk
from typing import Optional

router = APIRouter(prefix="/api/sos", tags=["sos"])

@router.get("/", response_model=list[SOSResponse])
def get_sos_requests(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SOSRequest)
    if category:
        query = query.filter(SOSRequest.category == category)
    return query.order_by(SOSRequest.priority_score.desc()).all()

@router.post("/assess", response_model=SOSAssessResponse)
def assess_sos_risk(payload: SOSAssessRequest, db: Session = Depends(get_db)):
    """Calculate risk assessment without creating a database record.

    Reads DisasterZone and Warehouse records for logistics lookups.
    """
    result = calculate_sos_risk(
        category=payload.category,
        severity=payload.severity,
        description=payload.description,
        affected_people=payload.affected_people,
        lat=payload.lat,
        lng=payload.lng,
        db=db,
    )
    return result

@router.post("/", response_model=SOSResponse)
def create_sos_request(sos: SOSCreate, db: Session = Depends(get_db)):
    db_sos = SOSRequest(**sos.model_dump())

    # Use the shared calculation for consistent scoring
    result = calculate_sos_risk(
        category=db_sos.category,
        severity=db_sos.severity,
        description=db_sos.description,
        affected_people=db_sos.affected_people or 0,
        lat=db_sos.lat,
        lng=db_sos.lng,
        db=db,
    )

    # Persist risk and logistics fields
    db_sos.priority_score = result["priority_score"]
    db_sos.priority_explanation = result["explanation"]
    db_sos.distance_from_impact_km = result["distance_from_impact_km"]
    db_sos.nearest_impact_zone = result["nearest_impact_zone"]
    db_sos.nearest_warehouse_id = result["nearest_warehouse_id"]
    db_sos.nearest_warehouse_name = result["nearest_warehouse_name"]
    db_sos.warehouse_distance_km = result["warehouse_distance_km"]
    db_sos.estimated_delivery_minutes = result["estimated_delivery_minutes"]
    db_sos.food_stock_units = result["food_stock_units"]
    db_sos.food_stock_status = result["food_stock_status"]

    db.add(db_sos)
    db.commit()
    db.refresh(db_sos)
    return db_sos

@router.put("/{id}/status", response_model=SOSResponse)
def update_sos_status(id: int, status: str, db: Session = Depends(get_db)):
    if status not in ("pending", "completed", "not_completed"):
        raise HTTPException(status_code=400, detail="Invalid status")

    db_sos = db.query(SOSRequest).filter(SOSRequest.id == id).first()
    if not db_sos:
        raise HTTPException(status_code=404, detail="SOS request not found")

    db_sos.status = status
    db.commit()
    db.refresh(db_sos)
    return db_sos

@router.delete("/{id}")
def delete_sos_request(id: int, db: Session = Depends(get_db)):
    db_sos = db.query(SOSRequest).filter(SOSRequest.id == id).first()
    if not db_sos:
        raise HTTPException(status_code=404, detail="SOS request not found")
    db.delete(db_sos)
    db.commit()
    return {"message": "Deleted"}
