from __future__ import annotations

from aim.presentation.api.app import create_app


def test_app_uses_cors_origins_from_environment(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "https://pilot.example.com,http://localhost:3000")

    app = create_app()

    cors = next(
        middleware
        for middleware in app.user_middleware
        if middleware.cls.__name__ == "CORSMiddleware"
    )
    assert cors.kwargs["allow_origins"] == [
        "https://pilot.example.com",
        "http://localhost:3000",
    ]
