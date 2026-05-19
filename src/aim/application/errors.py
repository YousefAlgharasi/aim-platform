"""Application-layer errors mapped by the API layer."""

from __future__ import annotations


class ApplicationError(Exception):
    """Base class for application errors."""


class NotFoundError(ApplicationError):
    """Raised when an expected resource is missing."""


class ConflictError(ApplicationError):
    """Raised when a request conflicts with existing state."""


class ValidationError(ApplicationError):
    """Raised when a request is valid syntactically but invalid semantically."""

