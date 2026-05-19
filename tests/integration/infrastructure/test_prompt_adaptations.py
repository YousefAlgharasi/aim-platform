from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from aim.domain.services.prompt_adaptation_generator import (
    PromptAdaptationGenerator,
    PromptLearnerState,
)
from aim.domain.services.recommendation_engine import (
    RecommendationActionType,
    RecommendationResult,
)
from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.prompt_adaptation import (
    PromptAdaptationInstructionORM,
)
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork


def test_prompt_adaptation_repository_saves_generated_instruction() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = session_factory()

    try:
        recommendation = RecommendationResult(
            student_id=1,
            action_type=RecommendationActionType.TIMED_PRACTICE,
            skill_id="GRAMMAR_VERB_FORMS",
            difficulty=2,
            reason="Use paced practice.",
            inputs_snapshot={"error_pattern_type": "rushing"},
        )
        result = PromptAdaptationGenerator().generate(
            student_id=1,
            lesson_id="session-1",
            skill_id="GRAMMAR_VERB_FORMS",
            recommendation=recommendation,
            learner_state=PromptLearnerState(error_pattern_type="rushing"),
        )

        uow = SqlAlchemyUnitOfWork(session)
        row = uow.prompt_adaptations.add_instruction(result)
        uow.commit()

        saved = session.query(PromptAdaptationInstructionORM).one()
        assert row.id == saved.id
        assert saved.student_id == 1
        assert saved.lesson_id == "session-1"
        assert saved.skill_id == "GRAMMAR_VERB_FORMS"
        assert saved.tone == "calm and coaching"
        assert saved.focus_weaknesses == ["GRAMMAR_VERB_FORMS"]
        assert saved.avoid_patterns == ["speed-first wording", "punitive timing", "rushing"]
        assert "paced timed practice" in saved.instruction_text
    finally:
        session.close()
