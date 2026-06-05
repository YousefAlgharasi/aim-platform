from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, model_validator


class QuestionType(str, Enum):
    mcq = "mcq"
    fill = "fill"
    true_false = "true_false"
    matching = "matching"
    ordering = "ordering"


class QuestionModel(BaseModel):
    question_id: str = Field(pattern=r"^[A-Z0-9]{1,6}-Q[0-9]{2,3}$")
    skill_id: str = Field(pattern=r"^SK-[A-Z][0-9]{2}$")
    concept: str = Field(min_length=3)
    difficulty: int = Field(ge=1, le=5)
    type: QuestionType
    prompt_en: str = Field(min_length=5)
    prompt_ar: str = Field(min_length=5)
    choices: Optional[List[str]] = None
    correct_answer: str = Field(min_length=1)
    explanation_en: str = Field(min_length=10)
    explanation_ar: str = Field(min_length=10)
    common_error_tags: List[str]
    prerequisites: List[str]
    hints: List[str] = Field(min_length=1)

    @model_validator(mode="after")
    def choices_required_for_mcq(self) -> "QuestionModel":
        if self.type in (QuestionType.mcq, QuestionType.matching):
            if not self.choices or len(self.choices) < 2:
                raise ValueError(
                    f"question_id={self.question_id}: 'choices' required for type={self.type}"
                )
        return self

    @model_validator(mode="after")
    def prerequisites_are_valid_skill_ids(self) -> "QuestionModel":
        import re
        pattern = re.compile(r"^SK-[A-Z][0-9]{2}$")
        for p in self.prerequisites:
            if not pattern.match(p):
                raise ValueError(
                    f"question_id={self.question_id}: invalid prerequisite skill_id '{p}'"
                )
        return self

    model_config = {"extra": "forbid"}


class LessonModel(BaseModel):
    lesson_id: str = Field(pattern=r"^L[0-9]{2}$")
    task_id: Optional[str] = None
    title_en: str = Field(min_length=3)
    title_ar: str = Field(min_length=3)
    week: int = Field(ge=1, le=2)
    difficulty: int = Field(ge=1, le=5)
    sprint: Optional[str] = None
    prerequisites: List[str]
    skills_covered: List[str] = Field(min_length=1)
    learning_objectives: List[str] = Field(min_length=1)
    reading_passage: Optional[dict] = None
    questions: List[QuestionModel] = Field(min_length=3)

    @model_validator(mode="after")
    def skills_covered_are_valid(self) -> "LessonModel":
        import re
        pattern = re.compile(r"^SK-[A-Z][0-9]{2}$")
        for s in self.skills_covered:
            if not pattern.match(s):
                raise ValueError(
                    f"lesson_id={self.lesson_id}: invalid skill_id '{s}' in skills_covered"
                )
        return self

    @model_validator(mode="after")
    def question_ids_are_unique(self) -> "LessonModel":
        ids = [q.question_id for q in self.questions]
        if len(ids) != len(set(ids)):
            raise ValueError(
                f"lesson_id={self.lesson_id}: duplicate question_id values detected"
            )
        return self

    model_config = {"extra": "forbid"}


class ScoringModel(BaseModel):
    total_questions: int = Field(ge=1)
    pass_threshold: int = Field(ge=1)
    score_mapping: dict

    model_config = {"extra": "forbid"}


class AssessmentModel(BaseModel):
    assessment_id: str = Field(min_length=3)
    task_id: Optional[str] = None
    title_en: str = Field(min_length=3)
    title_ar: str = Field(min_length=3)
    instructions_en: str = Field(min_length=10)
    instructions_ar: str = Field(min_length=10)
    duration_minutes: int = Field(ge=1)
    usage: str = Field(min_length=10)
    questions: List[QuestionModel] = Field(min_length=5)
    scoring: ScoringModel

    @model_validator(mode="after")
    def question_ids_are_unique(self) -> "AssessmentModel":
        ids = [q.question_id for q in self.questions]
        if len(ids) != len(set(ids)):
            raise ValueError(
                f"assessment_id={self.assessment_id}: duplicate question_id values detected"
            )
        return self

    model_config = {"extra": "forbid"}
