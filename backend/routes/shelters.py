from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.shelter import Shelter
from schemas.shelter import ShelterCreate, ShelterUpdate, ShelterResponse
from services.priority_engine import calculate_shelter_priority

router = APIRouter(prefix="/api/shelters", tags=["shelters"])

@router.get("/", response_model=list[ShelterResponse])
def get_shelters(db: Session = Depends(get_db)):
    return db.query(Shelter).all()

@router.get("/{id}", response_model=ShelterResponse)
def get_shelter(id: int, db: Session = Depends(get_db)):
    shelter = db.query(Shelter).filter(Shelter.id == id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return shelter

@router.post("/", response_model=ShelterResponse)
def create_shelter(shelter: ShelterCreate, db: Session = Depends(get_db)):
    db_shelter = Shelter(**shelter.model_dump())
    db_shelter.priority_score, _ = calculate_shelter_priority(db_shelter)
    db.add(db_shelter)
    db.commit()
    db.refresh(db_shelter)
    return db_shelter

@router.put("/{id}", response_model=ShelterResponse)
def update_shelter(id: int, shelter_update: ShelterUpdate, db: Session = Depends(get_db)):
    db_shelter = db.query(Shelter).filter(Shelter.id == id).first()
    if not db_shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    
    update_data = shelter_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_shelter, key, value)
        
    db_shelter.priority_score, _ = calculate_shelter_priority(db_shelter)
    db.commit()
    db.refresh(db_shelter)
    return db_shelter

@router.delete("/{id}")
def delete_shelter(id: int, db: Session = Depends(get_db)):
    db_shelter = db.query(Shelter).filter(Shelter.id == id).first()
    if not db_shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    db.delete(db_shelter)
    db.commit()
    return {"message": "Deleted"}
