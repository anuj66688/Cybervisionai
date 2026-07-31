import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data

def test_mock_login():
    payload = {
        "email": "analyst.lead@cybervision.ai",
        "password": "validsecurepasscode"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "analyst.lead@cybervision.ai"

def test_get_threats_unauthorized():
    response = client.get("/api/threats")
    assert response.status_code in [401, 403]

def test_get_threats_authorized():
    # Login to get mock token
    login_res = client.post("/api/auth/login", json={
        "email": "analyst.lead@cybervision.ai",
        "password": "validsecurepasscode"
    })
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/threats", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_bookmarks_authorized():
    login_res = client.post("/api/auth/login", json={
        "email": "analyst.lead@cybervision.ai",
        "password": "validsecurepasscode"
    })
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/threats/bookmarks", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dashboard_analytics():
    login_res = client.post("/api/auth/login", json={
        "email": "analyst.lead@cybervision.ai",
        "password": "validsecurepasscode"
    })
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/analytics/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "totalThreats" in data
    assert "criticalAlerts" in data
