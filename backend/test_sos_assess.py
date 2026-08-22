"""Tests for the Admin Pre-Dispatch Risk Assessment endpoint."""
import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db, Base, engine
from sqlalchemy.orm import Session


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test and drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. POST /api/sos/assess does NOT create a database record
# ---------------------------------------------------------------------------
class TestAssessNoRecord:
    def test_assess_does_not_create_record(self):
        # Count existing SOS records
        before = client.get("/api/sos/").json()
        before_count = len(before)

        # Call assess
        resp = client.post("/api/sos/assess", json={
            "category": "fire",
            "severity": 5,
            "description": "Building on fire downtown",
        })
        assert resp.status_code == 200

        # Count again — must be identical
        after = client.get("/api/sos/").json()
        assert len(after) == before_count, "assess must not create a DB record"

    def test_assess_returns_required_fields(self):
        resp = client.post("/api/sos/assess", json={
            "category": "medical",
            "severity": 3,
            "description": "Patient needs help",
        })
        data = resp.json()
        assert "priority_score" in data
        assert "risk_category" in data
        assert "factors" in data
        assert "explanation" in data
        assert "recommended_action" in data
        assert data["risk_category"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")


# ---------------------------------------------------------------------------
# 2. Assess and dispatch use the SAME score for identical inputs
# ---------------------------------------------------------------------------
class TestScoreConsistency:
    def test_assess_and_create_same_score(self):
        payload = {
            "category": "rescue",
            "severity": 4,
            "description": "People trapped under debris",
        }

        assess_resp = client.post("/api/sos/assess", json=payload)
        assess_score = assess_resp.json()["priority_score"]

        create_resp = client.post("/api/sos/", json={
            **payload,
            "name": "Test Reporter",
            "lat": 19.08,
            "lng": 72.88,
        })
        create_score = create_resp.json()["priority_score"]

        assert assess_score == create_score, (
            f"Scores must match: assess={assess_score}, create={create_score}"
        )


# ---------------------------------------------------------------------------
# 3. All four frontend categories receive intentional (non-default) scores
# ---------------------------------------------------------------------------
class TestCategoryScores:
    @pytest.mark.parametrize("category,severity,expected_min", [
        ("medical", 5, 90),   # 100 * 0.95 = 95
        ("food", 5, 60),      # 100 * 0.7  = 70
        ("rescue", 5, 95),    # 100 * 1.0  = 100
        ("fire", 5, 85),      # 100 * 0.9  = 90
    ])
    def test_category_has_intentional_score(self, category, severity, expected_min):
        resp = client.post("/api/sos/assess", json={
            "category": category,
            "severity": severity,
            "description": "Test emergency",
        })
        data = resp.json()
        assert data["priority_score"] >= expected_min, (
            f"{category} sev-{severity}: score {data['priority_score']} "
            f"below expected minimum {expected_min}"
        )
        # The category should appear in the factors list
        cat_mentioned = any(category in f.lower() for f in data["factors"])
        assert cat_mentioned, f"Category '{category}' not mentioned in factors"


# ---------------------------------------------------------------------------
# 4. Risk category thresholds
# ---------------------------------------------------------------------------
class TestRiskThresholds:
    @pytest.mark.parametrize("severity,category,expected_risk", [
        (1, "food", "LOW"),       # 20 * 0.7  = 14
        (2, "rescue", "MEDIUM"),  # 40 * 1.0  = 40
        (3, "food", "MEDIUM"),    # 60 * 0.7  = 42
        (4, "medical", "HIGH"),   # 80 * 0.95 = 76
        (5, "rescue", "CRITICAL"),# 100 * 1.0 = 100
    ])
    def test_risk_category_mapping(self, severity, category, expected_risk):
        resp = client.post("/api/sos/assess", json={
            "category": category,
            "severity": severity,
            "description": "Test",
        })
        data = resp.json()
        assert data["risk_category"] == expected_risk, (
            f"sev={severity} cat={category}: "
            f"got {data['risk_category']} (score {data['priority_score']}), "
            f"expected {expected_risk}"
        )
