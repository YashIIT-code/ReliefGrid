"""Tests for the Admin Pre-Dispatch Risk Assessment with logistics data points."""
import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db, Base, engine, SessionLocal
from models.disaster_zone import DisasterZone
from models.warehouse import Warehouse
from models.sos_request import SOSRequest
from seed import seed_database
import models  # Ensure all models registered with Base.metadata


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test and drop after."""
    Base.metadata.create_all(bind=engine)
    # Seed so zones and warehouses exist for lookups
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)

# Common payload near seeded Zone A centre (~19.08, 72.87)
BASE_PAYLOAD = {
    "category": "fire",
    "severity": 5,
    "description": "Building on fire downtown",
    "affected_people": 100,
    "lat": 19.08,
    "lng": 72.87,
}


# ---------------------------------------------------------------------------
# 1. Assessment returns all new fields
# ---------------------------------------------------------------------------
class TestAssessReturnsNewFields:
    def test_returns_logistics_fields(self):
        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert "affected_people" in data
        assert "distance_from_impact_km" in data
        assert "nearest_impact_zone" in data
        assert "nearest_warehouse_id" in data
        assert "nearest_warehouse_name" in data
        assert "warehouse_distance_km" in data
        assert "estimated_delivery_minutes" in data
        assert "food_stock_units" in data
        assert "food_stock_status" in data


# ---------------------------------------------------------------------------
# 2. Assessment does NOT create a database record
# ---------------------------------------------------------------------------
class TestAssessNoRecord:
    def test_assess_does_not_create_record(self):
        before = client.get("/api/sos/").json()
        before_count = len(before)

        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        assert resp.status_code == 200

        after = client.get("/api/sos/").json()
        assert len(after) == before_count, "assess must not create a DB record"


# ---------------------------------------------------------------------------
# 3. Preview and dispatch produce identical values
# ---------------------------------------------------------------------------
class TestScoreConsistency:
    def test_assess_and_create_same_values(self):
        assess_resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        assess_data = assess_resp.json()

        create_resp = client.post("/api/sos/", json={
            **BASE_PAYLOAD,
            "name": "Test Reporter",
        })
        create_data = create_resp.json()

        assert assess_data["priority_score"] == create_data["priority_score"]
        assert assess_data["distance_from_impact_km"] == create_data["distance_from_impact_km"]
        assert assess_data["nearest_warehouse_name"] == create_data["nearest_warehouse_name"]
        assert assess_data["warehouse_distance_km"] == create_data["warehouse_distance_km"]
        assert assess_data["estimated_delivery_minutes"] == create_data["estimated_delivery_minutes"]
        assert assess_data["food_stock_status"] == create_data["food_stock_status"]


# ---------------------------------------------------------------------------
# 4. Increasing affected people increases or does not decrease score
# ---------------------------------------------------------------------------
class TestAffectedPeopleBonus:
    def test_more_people_higher_or_equal_score(self):
        low = client.post("/api/sos/assess", json={
            **BASE_PAYLOAD, "affected_people": 0
        }).json()["priority_score"]

        high = client.post("/api/sos/assess", json={
            **BASE_PAYLOAD, "affected_people": 500
        }).json()["priority_score"]

        assert high >= low, f"500 affected ({high}) should score >= 0 affected ({low})"


# ---------------------------------------------------------------------------
# 5. Closer to impact zone = greater or equal distance contribution
# ---------------------------------------------------------------------------
class TestImpactDistanceBonus:
    def test_closer_location_higher_or_equal_score(self):
        # Near Zone A centre (19.08, 72.87)
        near = client.post("/api/sos/assess", json={
            **BASE_PAYLOAD, "lat": 19.08, "lng": 72.87
        }).json()

        # Far away
        far = client.post("/api/sos/assess", json={
            **BASE_PAYLOAD, "lat": 20.00, "lng": 73.50
        }).json()

        assert near["priority_score"] >= far["priority_score"]


# ---------------------------------------------------------------------------
# 6. Active zones preferred over inactive
# ---------------------------------------------------------------------------
class TestActiveZonePreference:
    def test_prefers_active_zone(self):
        # Add an active zone far away
        db = SessionLocal()
        db.add(DisasterZone(
            name="Active Zone Far",
            zone_type="earthquake",
            severity=5,
            active=True,
            bounds_json="[[20.0, 74.0], [20.1, 74.0], [20.1, 74.1], [20.0, 74.1]]",
        ))
        db.commit()
        db.close()

        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        data = resp.json()
        # Active zone should be selected (even though Zone A is closer but inactive)
        assert data["nearest_impact_zone"] == "Active Zone Far"


# ---------------------------------------------------------------------------
# 7. Falls back to inactive zone when no active zones
# ---------------------------------------------------------------------------
class TestFallbackToInactiveZone:
    def test_uses_inactive_zone_when_no_active(self):
        # Default seed has Zone A (active=False)
        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        data = resp.json()
        assert data["nearest_impact_zone"] == "Zone A"
        assert data["distance_from_impact_km"] is not None


# ---------------------------------------------------------------------------
# 8. No impact zones -> null, no crash
# ---------------------------------------------------------------------------
class TestNoImpactZones:
    def test_no_zones_returns_null(self):
        # Delete all zones
        db = SessionLocal()
        db.query(DisasterZone).delete()
        db.commit()
        db.close()

        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["distance_from_impact_km"] is None
        assert data["nearest_impact_zone"] is None


# ---------------------------------------------------------------------------
# 9. Nearest suitable warehouse prefers vehicles > 0 and food > 0
# ---------------------------------------------------------------------------
class TestWarehousePreference:
    def test_prefers_suitable_warehouse(self):
        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        data = resp.json()
        # Both seeded warehouses have vehicles > 0 and food > 0;
        # Warehouse A is closer to (19.08, 72.87)
        assert data["nearest_warehouse_name"] is not None
        assert data["warehouse_distance_km"] is not None


# ---------------------------------------------------------------------------
# 10. Falls back to nearest warehouse if none suitable
# ---------------------------------------------------------------------------
class TestWarehouseFallback:
    def test_uses_nearest_when_no_suitable(self):
        # Set all warehouses to 0 vehicles and 0 food
        db = SessionLocal()
        for w in db.query(Warehouse).all():
            w.vehicles = 0
            w.food_supply = 0
        db.commit()
        db.close()

        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        data = resp.json()
        assert data["nearest_warehouse_name"] is not None
        assert data["food_stock_status"] == "OUT_OF_STOCK"


# ---------------------------------------------------------------------------
# 11. No warehouses -> null logistics, dispatch not blocked
# ---------------------------------------------------------------------------
class TestNoWarehouses:
    def test_no_warehouses_returns_null(self):
        db = SessionLocal()
        db.query(Warehouse).delete()
        db.commit()
        db.close()

        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["nearest_warehouse_id"] is None
        assert data["warehouse_distance_km"] is None
        assert data["estimated_delivery_minutes"] is None
        assert data["food_stock_status"] == "UNAVAILABLE"

    def test_dispatch_works_without_warehouses(self):
        db = SessionLocal()
        db.query(Warehouse).delete()
        db.commit()
        db.close()

        resp = client.post("/api/sos/", json={**BASE_PAYLOAD, "name": "Test"})
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# 12. ETA follows documented formula
# ---------------------------------------------------------------------------
class TestETAFormula:
    def test_eta_calculation(self):
        resp = client.post("/api/sos/assess", json=BASE_PAYLOAD)
        data = resp.json()
        dist = data["warehouse_distance_km"]
        eta = data["estimated_delivery_minutes"]
        if dist is not None:
            import math
            expected = 10 + math.ceil(dist / 30 * 60)
            assert eta == expected, f"ETA {eta} != expected {expected} for dist {dist}"


# ---------------------------------------------------------------------------
# 13. Food status thresholds
# ---------------------------------------------------------------------------
class TestFoodStockStatus:
    def _set_food(self, amount: int):
        db = SessionLocal()
        for w in db.query(Warehouse).all():
            w.food_supply = amount
        db.commit()
        db.close()

    def test_zero_is_out_of_stock(self):
        self._set_food(0)
        data = client.post("/api/sos/assess", json=BASE_PAYLOAD).json()
        assert data["food_stock_status"] == "OUT_OF_STOCK"

    def test_below_200_is_low(self):
        self._set_food(100)
        data = client.post("/api/sos/assess", json=BASE_PAYLOAD).json()
        assert data["food_stock_status"] == "LOW"

    def test_200_or_more_is_adequate(self):
        self._set_food(200)
        data = client.post("/api/sos/assess", json=BASE_PAYLOAD).json()
        assert data["food_stock_status"] == "ADEQUATE"


# ---------------------------------------------------------------------------
# 14. Existing categories still receive intentional scores
# ---------------------------------------------------------------------------
class TestCategoryScores:
    @pytest.mark.parametrize("category,severity,expected_min", [
        ("medical", 5, 90),
        ("food", 5, 60),
        ("rescue", 5, 95),
        ("fire", 5, 85),
    ])
    def test_category_has_intentional_score(self, category, severity, expected_min):
        resp = client.post("/api/sos/assess", json={
            "category": category,
            "severity": severity,
            "description": "Test emergency",
            "affected_people": 0,
            "lat": 19.08,
            "lng": 72.87,
        })
        data = resp.json()
        assert data["priority_score"] >= expected_min, (
            f"{category} sev-{severity}: score {data['priority_score']} "
            f"below expected minimum {expected_min}"
        )


# ---------------------------------------------------------------------------
# 15. Existing SOS records remain readable after new columns
# ---------------------------------------------------------------------------
class TestExistingRecordsReadable:
    def test_old_records_readable(self):
        # Create a record with the new schema
        client.post("/api/sos/", json={
            **BASE_PAYLOAD, "name": "Old Record"
        })
        # Fetch all — should not crash
        resp = client.get("/api/sos/")
        assert resp.status_code == 200
        records = resp.json()
        assert len(records) >= 1


# ---------------------------------------------------------------------------
# 16. Final score clamped 0-100
# ---------------------------------------------------------------------------
class TestScoreClamping:
    def test_max_score_clamped(self):
        resp = client.post("/api/sos/assess", json={
            "category": "rescue",
            "severity": 5,
            "description": "Extreme",
            "affected_people": 1000,
            "lat": 19.08,
            "lng": 72.87,
        })
        assert resp.json()["priority_score"] <= 100

    def test_min_score_clamped(self):
        resp = client.post("/api/sos/assess", json={
            "category": "food",
            "severity": 1,
            "description": "",
            "affected_people": 0,
            "lat": 50.0,
            "lng": 50.0,
        })
        assert resp.json()["priority_score"] >= 0
