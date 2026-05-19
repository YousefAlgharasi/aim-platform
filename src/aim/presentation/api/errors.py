"""FastAPI error translation."""

from __future__ import annotations

from fastapi import HTTPException, status

from aim.application.errors import ConflictError, NotFoundError, ValidationError


def raise_http_error(error: Exception) -> None:
    if isinstance(error, NotFoundError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    if isinstance(error, ConflictError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error
    if isinstance(error, ValidationError):
        status_code = (
            status.HTTP_400_BAD_REQUEST
            if str(error) == "No attempts provided."
            else getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)
        )
        raise HTTPException(status_code=status_code, detail=str(error)) from error
    raise error
