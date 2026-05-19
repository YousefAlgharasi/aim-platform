"""SQLAlchemy repository for prompt adaptation instructions."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.domain.services.prompt_adaptation_generator import PromptAdaptationResult
from aim.infrastructure.database.models.prompt_adaptation import (
    PromptAdaptationInstructionORM,
)


class SQLPromptAdaptationRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add_instruction(
        self,
        result: PromptAdaptationResult,
    ) -> PromptAdaptationInstructionORM:
        row = PromptAdaptationInstructionORM(
            student_id=result.student_id,
            lesson_id=result.lesson_id,
            skill_id=result.skill_id,
            tone=result.tone,
            difficulty=result.difficulty,
            teaching_strategy=result.teaching_strategy,
            focus_weaknesses=list(result.focus_weaknesses),
            avoid_patterns=list(result.avoid_patterns),
            micro_goal=result.micro_goal,
            instruction_text=result.instruction_text,
        )
        self._db.add(row)
        self._db.flush()
        return row
