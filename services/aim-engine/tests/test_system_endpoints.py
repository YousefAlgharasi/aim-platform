"""Tests for AIM Engine safe system endpoints."""

from fastapi.testclient import TestClient

from app.main import create_app


def test_health_endpoint_returns_ok_when_ready() -> None:
    client = TestClient(create_app())

    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()

    assert payload["service"] == "aim-engine"
    assert payload["status"] == "ok"
    assert payload["phase"] == "phase-5-aim-integration"
    assert payload["environment"] == "local"
    assert isinstance(payload["timestamp"], str)
    assert isinstance(payload["uptime_seconds"], float)

    serialized = str(payload).lower()
    assert "secret" not in serialized
    assert "password" not in serialized
    assert "database" not in serialized
    assert "token" not in serialized


def test_health_endpoint_returns_503_when_not_ready() -> None:
    app = create_app()
    app.state._ready = False
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/health")

    assert response.status_code == 503
    payload = response.json()

    assert payload["service"] == "aim-engine"
    assert payload["status"] == "unavailable"
    assert payload["phase"] == "phase-5-aim-integration"

    serialized = str(payload).lower()
    assert "secret" not in serialized
    assert "password" not in serialized
    assert "database" not in serialized
    assert "token" not in serialized


def test_root_endpoint_returns_ok() -> None:
    client = TestClient(create_app())

    response = client.get("/")

    assert response.status_code == 200
    payload = response.json()

    assert payload["service"] == "aim-engine"
    assert payload["status"] == "ok"
    assert payload["health"] == "/health"
    assert payload["version"] == "/version"

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
        "phase": "phase-5-aim-integration",
        "environment": "local",
    }

    serialized = str(payload).lower()
    assert "secret" not in serialized
    assert "password" not in serialized
    assert "database" not in serialized
    assert "token" not in serialized
