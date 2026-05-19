"""Prompt adaptation instruction ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


class PromptAdaptationInstructionORM(Base):
    __tablename__ = "prompt_adaptation_instructions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    lesson_id = Column(String, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    tone = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    teaching_strategy = Column(String, nullable=False)
    focus_weaknesses = Column(JSON, nullable=False, default=list)
    avoid_patterns = Column(JSON, nullable=False, default=list)
    micro_goal = Column(String, nullable=False)
    instruction_text = Column(String, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
