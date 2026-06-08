from sqlalchemy.orm import Session
import bcrypt
from models.user import User
from models.shelter import Shelter
from models.hospital import Hospital
from models.warehouse import Warehouse
from models.disaster_zone import DisasterZone
from models.blocked_road import BlockedRoad
from models.volunteer import Volunteer
from models.sos_request import SOSRequest

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_database(db: Session):
    if db.query(User).first():
        return # Already seeded

    # Users
    users = [
        User(name="Admin User", email="admin@reliefgrid.com", password_hash=get_password_hash("password123"), role="government_admin"),
        User(name="NGO Coordinator", email="ngo@reliefgrid.com", password_hash=get_password_hash("password123"), role="ngo_coordinator"),
        User(name="Dr. Sharma", email="hospital@reliefgrid.com", password_hash=get_password_hash("password123"), role="hospital_staff"),
        User(name="Shelter Manager", email="shelter@reliefgrid.com", password_hash=get_password_hash("password123"), role="shelter_manager"),
        User(name="Volunteer One", email="volunteer@reliefgrid.com", password_hash=get_password_hash("password123"), role="volunteer")
    ]
    db.add_all(users)

    # Shelters
    shelters = [
        Shelter(name="Shelter Alpha", lat=19.076, lng=72.878, people_count=120, food_stock=200, water_stock=150, blankets=80, medicine_stock=30),
        Shelter(name="Shelter Beta", lat=19.022, lng=72.856, people_count=85, food_stock=150, water_stock=100, blankets=50, medicine_stock=20),
        Shelter(name="Shelter Gamma", lat=19.105, lng=72.837, people_count=45, food_stock=300, water_stock=200, blankets=100, medicine_stock=50)
    ]
    db.add_all(shelters)

    # Hospitals
    hospitals = [
        Hospital(name="Hospital Beta", lat=19.060, lng=72.850, oxygen_available=30, blood_units=80, icu_beds=10, ambulances=4),
        Hospital(name="City General Hospital", lat=19.035, lng=72.840, oxygen_available=50, blood_units=120, icu_beds=15, ambulances=6)
    ]
    db.add_all(hospitals)

    # Warehouses
    warehouses = [
        Warehouse(name="Warehouse A", lat=19.090, lng=72.890, food_supply=1000, water_supply=800, blankets=500, medicine=200, vehicles=5),
        Warehouse(name="Warehouse B", lat=19.045, lng=72.820, food_supply=800, water_supply=600, blankets=300, medicine=150, vehicles=3)
    ]
    db.add_all(warehouses)

    # Disaster Zone
    db.add(DisasterZone(name="Zone A", zone_type="flood", severity=3, active=False, bounds_json="[[19.06, 72.84], [19.10, 72.84], [19.10, 72.90], [19.06, 72.90]]"))

    # Blocked Road
    db.add(BlockedRoad(name="Road X", start_lat=19.076, start_lng=72.870, end_lat=19.060, end_lng=72.855, reason="Flooded", active=False))

    # Volunteers
    db.add_all([
        Volunteer(name="Vol 1", lat=19.08, lng=72.88, skills="first_aid"),
        Volunteer(name="Vol 2", lat=19.03, lng=72.83, skills="driving"),
        Volunteer(name="Vol 3", lat=19.05, lng=72.86, skills="logistics"),
    ])

    db.commit()
