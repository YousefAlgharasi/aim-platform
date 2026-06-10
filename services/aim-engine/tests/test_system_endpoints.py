"""Tests for AIM Engine safe system endpoints."""

from fastapi.testclient import TestClient

from app.main import create_app


def test_health_endpoint_returns_safe_metadata() -> None:
    client = TestClient(create_app())

    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()

    assert payload["service"] == "aim-engine"
    assert payload["status"] == "ok"
    assert payload["phase"] == "phase-1-system-foundation"
    assert payload["environment"] == "local"
    assert isinstance(payload["timestamp"], str)
    assert isinstance(payload["uptime_seconds"], float)

    serialized = str(payload).lower()
    assert "secret" not in serialized
    assert "password" not in serialized
    assert "database" not in serialized
    assert "token" not in serialized


def test_version_endpoint_returns_safe_metadata() -> None:
    client = TestClient(create_app())

    response = client.get("/version")

    assert response.status_code == 200
    payload = response.json()

    assert payload == {
        "service": "aim-engine",
        "version": "0.1.0",
        "phase": "phase-1-system-foundation",
        "environment": "local",
    }
