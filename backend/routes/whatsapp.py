from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import re
from database import get_db
from models.shelter import Shelter
from schemas.shelter import ShelterResponse
from services.priority_engine import calculate_shelter_priority

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

class WhatsAppParseRequest(BaseModel):
    message: str
    shelter_id: int

@router.post("/parse")
def parse_whatsapp(request: WhatsAppParseRequest, db: Session = Depends(get_db)):
    shelter = db.query(Shelter).filter(Shelter.id == request.shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    msg = request.message.upper()
    
    # Simple regex to find KEY=VALUE or KEY VALUE
    # Matches PEOPLE=300, FOOD=50, WATER 20 etc.
    patterns = {
        "people_count": r'PEOPLE[=\s]+(\d+)',
        "food_stock": r'FOOD[=\s]+(\d+)',
        "water_stock": r'WATER[=\s]+(\d+)',
        "blankets": r'BLANKETS[=\s]+(\d+)',
        "medicine_stock": r'MEDICINE[=\s]+(\d+)'
    }
    
    parsed_data = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, msg)
        if match:
            val = int(match.group(1))
            setattr(shelter, key, val)
            parsed_data[key] = val
            
    shelter.priority_score, explanation = calculate_shelter_priority(shelter)
    db.commit()
    db.refresh(shelter)
    
    warnings = []
    if "Food shortage" in explanation:
        warnings.append("Food shortage predicted within 6 hours.")
    if "Severe water" in explanation:
        warnings.append("Severe water shortage predicted.")
    if "Critical medicine" in explanation:
        warnings.append("Critical medicine shortage.")
        
    return {
        "parsed_data": parsed_data,
        "shelter_updated": ShelterResponse.model_validate(shelter),
        "warnings": warnings
    }

@router.get("/messages")
def get_messages():
    # Mock data for UI
    return [
        {"sender": "Shelter Alpha", "message": "PEOPLE=250 FOOD=100 WATER=80", "time": "10:30 AM"},
        {"sender": "Shelter Beta", "message": "Need more blankets. PEOPLE=150 BLANKETS=20", "time": "11:15 AM"},
        {"sender": "Shelter Gamma", "message": "Water running low! WATER=10 PEOPLE=80", "time": "11:45 AM"}
    ]
