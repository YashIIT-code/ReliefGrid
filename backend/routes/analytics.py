from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.shelter import Shelter
from models.hospital import Hospital
from models.warehouse import Warehouse
from models.sos_request import SOSRequest
from models.volunteer import Volunteer

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total_shelters = db.query(Shelter).count()
    total_hospitals = db.query(Hospital).count()
    total_warehouses = db.query(Warehouse).count()
    active_sos = db.query(SOSRequest).filter(SOSRequest.status != 'resolved').count()
    
    # High priority alerts: Shelters/Hospitals with score > 75
    high_priority = db.query(Shelter).filter(Shelter.priority_score > 75).count() + \
                    db.query(Hospital).filter(Hospital.priority_score > 75).count() + \
                    db.query(SOSRequest).filter(SOSRequest.priority_score > 75, SOSRequest.status != 'resolved').count()
                    
    volunteers = db.query(Volunteer).filter(Volunteer.available == True).count()
    total_people = db.query(func.sum(Shelter.people_count)).scalar() or 0
    
    return {
        "total_shelters": total_shelters,
        "total_hospitals": total_hospitals,
        "total_warehouses": total_warehouses,
        "active_sos_requests": active_sos,
        "high_priority_alerts": high_priority,
        "available_volunteers": volunteers,
        "total_people_affected": total_people,
        "resources_delivered": 1450 # Mock metric
    }

@router.get("/charts")
def get_charts(db: Session = Depends(get_db)):
    # SOS requests by category
    sos_cats = db.query(SOSRequest.category, func.count(SOSRequest.id)).group_by(SOSRequest.category).all()
    requests_by_category = {cat: count for cat, count in sos_cats}
    
    # Priority distribution (simplified mock logic for MVP)
    critical = db.query(SOSRequest).filter(SOSRequest.priority_score > 80).count()
    high = db.query(SOSRequest).filter(SOSRequest.priority_score > 60, SOSRequest.priority_score <= 80).count()
    medium = db.query(SOSRequest).filter(SOSRequest.priority_score > 30, SOSRequest.priority_score <= 60).count()
    low = db.query(SOSRequest).filter(SOSRequest.priority_score <= 30).count()
    
    return {
        "requests_by_category": requests_by_category,
        "resource_shortages": [
            {"name": "Food", "type": "critical", "shortage_pct": 85},
            {"name": "Water", "type": "high", "shortage_pct": 60},
            {"name": "Medicine", "type": "critical", "shortage_pct": 90},
            {"name": "Blankets", "type": "medium", "shortage_pct": 40}
        ],
        "priority_distribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        }
    }
