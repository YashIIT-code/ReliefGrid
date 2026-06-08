from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.hospital import Hospital
from schemas.hospital import HospitalCreate, HospitalUpdate, HospitalResponse
from services.priority_engine import calculate_hospital_priority

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])

@router.get("/", response_model=list[HospitalResponse])
def get_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).all()

@router.get("/{id}", response_model=HospitalResponse)
def get_hospital(id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@router.post("/", response_model=HospitalResponse)
def create_hospital(hospital: HospitalCreate, db: Session = Depends(get_db)):
    db_hospital = Hospital(**hospital.model_dump())
    db_hospital.priority_score, _ = calculate_hospital_priority(db_hospital)
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@router.put("/{id}", response_model=HospitalResponse)
def update_hospital(id: int, hospital_update: HospitalUpdate, db: Session = Depends(get_db)):
    db_hospital = db.query(Hospital).filter(Hospital.id == id).first()
    if not db_hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    update_data = hospital_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_hospital, key, value)
        
    db_hospital.priority_score, _ = calculate_hospital_priority(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@router.delete("/{id}")
def delete_hospital(id: int, db: Session = Depends(get_db)):
    db_hospital = db.query(Hospital).filter(Hospital.id == id).first()
    if not db_hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    db.delete(db_hospital)
    db.commit()
    return {"message": "Deleted"}
