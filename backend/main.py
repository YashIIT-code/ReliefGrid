from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from config import settings
from seed import seed_database

# Import routers
from routes import auth, shelters, hospitals, warehouses, sos, map_data, whatsapp, analytics, simulation, allocation

# Import all models to ensure they're registered with Base
import models

app = FastAPI(title="ReliefGrid API", description="AI-Powered Disaster Logistics Coordination", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(shelters.router)
app.include_router(hospitals.router)
app.include_router(warehouses.router)
app.include_router(sos.router)
app.include_router(map_data.router)
app.include_router(whatsapp.router)
app.include_router(analytics.router)
app.include_router(simulation.router)
app.include_router(allocation.router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    _migrate_sos_columns()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


def _migrate_sos_columns():
    """Add new SOS columns to an existing SQLite table if missing."""
    new_cols = {
        "affected_people": "INTEGER DEFAULT 0",
        "distance_from_impact_km": "REAL",
        "nearest_impact_zone": "TEXT",
        "nearest_warehouse_id": "INTEGER",
        "nearest_warehouse_name": "TEXT",
        "warehouse_distance_km": "REAL",
        "estimated_delivery_minutes": "INTEGER",
        "food_stock_units": "INTEGER",
        "food_stock_status": "TEXT",
    }
    with engine.connect() as conn:
        result = conn.execute(
            __import__("sqlalchemy").text("PRAGMA table_info(sos_requests)")
        )
        existing = {row[1] for row in result}
        for col_name, col_type in new_cols.items():
            if col_name not in existing:
                conn.execute(
                    __import__("sqlalchemy").text(
                        f"ALTER TABLE sos_requests ADD COLUMN {col_name} {col_type}"
                    )
                )
        conn.commit()

@app.get("/")
def read_root():
    return {"status": "ReliefGrid API is running"}
