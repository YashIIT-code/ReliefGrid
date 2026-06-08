from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sos_request import SOSRequest
from schemas.sos_request import SOSCreate, SOSResponse
from services.priority_engine import calculate_sos_priority
from typing import Optional

router = APIRouter(prefix="/api/sos", tags=["sos"])

@router.get("/", response_model=list[SOSResponse])
def get_sos_requests(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SOSRequest)
    if category:
        query = query.filter(SOSRequest.category == category)
    return query.order_by(SOSRequest.priority_score.desc()).all()

@router.post("/", response_model=SOSResponse)
def create_sos_request(sos: SOSCreate, db: Session = Depends(get_db)):
    db_sos = SOSRequest(**sos.model_dump())
    db_sos.priority_score, db_sos.priority_explanation = calculate_sos_priority(db_sos)
    db.add(db_sos)
    db.commit()
    db.refresh(db_sos)
    return db_sos

@router.put("/{id}/status", response_model=SOSResponse)
def update_sos_status(id: int, status: str, db: Session = Depends(get_db)):
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
