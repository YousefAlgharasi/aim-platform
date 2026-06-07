"""FastAPI dependencies."""

from __future__ import annotations

from aim.infrastructure.database.session import get_db
from aim.presentation.api.auth import get_current_supabase_user

__all__ = ["get_current_supabase_user", "get_db"]

