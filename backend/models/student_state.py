"""Compatibility exports for student ORM models and schemas."""

from __future__ import annotations

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
from aim.presentation.api.schemas.students import (
    StudentCreate,
    StudentRead,
    StudentSkillStateCreate,
    StudentSkillStateRead,
    StudentSkillStateUpdate,
)

__all__ = [
    "Base",
    "StudentCreate",
    "StudentORM",
    "StudentRead",
    "StudentSkillStateCreate",
    "StudentSkillStateORM",
    "StudentSkillStateRead",
    "StudentSkillStateUpdate",
]

