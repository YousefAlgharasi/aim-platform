"""Minimal tests for the AIM Engine service skeleton."""

from fastapi import FastAPI

from app.main import create_app


def test_create_app_returns_fastapi_instance() -> None:
    app = create_app()

    assert isinstance(app, FastAPI)
    assert app.title == "AIM Engine"


def test_app_has_phase_metadata() -> None:
    app = create_app()

    assert app.state.service_phase == "phase-1-system-foundation"
