from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.shelter import Shelter
from models.hospital import Hospital
from models.warehouse import Warehouse
from models.volunteer import Volunteer
from models.disaster_zone import DisasterZone
from models.blocked_road import BlockedRoad
from models.sos_request import SOSRequest

router = APIRouter(prefix="/api/map", tags=["map"])

@router.get("/data")
def get_map_data(db: Session = Depends(get_db)):
    return {
        "shelters": db.query(Shelter).all(),
        "hospitals": db.query(Hospital).all(),
        "warehouses": db.query(Warehouse).all(),
        "volunteers": db.query(Volunteer).all(),
        "disaster_zones": db.query(DisasterZone).all(),
        "blocked_roads": db.query(BlockedRoad).all(),
        "sos_requests": db.query(SOSRequest).all(),
    }
