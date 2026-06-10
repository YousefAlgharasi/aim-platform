"""Placeholder implementation for the P1 pipeline boundary.

This class intentionally does not calculate mastery, weakness, difficulty,
retention, recommendations, emotional state, or any other adaptive-learning
output.
"""

from app.contracts import (
    AdaptiveSessionCompletionRequest,
    AdaptiveSessionCompletionResponse,
    EngineProcessingStatus,
)
from app.core.service_info import SERVICE_VERSION
from app.pipeline.context import PipelineExecutionContext


class PlaceholderAdaptiveSessionCompletionPipeline:
    """Non-algorithm placeholder for wiring and tests.

    The placeholder confirms the integration boundary shape by returning an
    accepted response with empty output collections. It must be replaced by real
    pipeline orchestration in a later task.
    """

    async def complete_session(
        self,
        request: AdaptiveSessionCompletionRequest,
        context: PipelineExecutionContext,
    ) -> AdaptiveSessionCompletionResponse:
        del context

        return AdaptiveSessionCompletionResponse(
            request_id=request.request_id,
            student_id=request.student_id,
            session_id=request.session_id,
            status=EngineProcessingStatus.ACCEPTED,
            engine_version=SERVICE_VERSION,
            skill_updates=[],
            weaknesses=[],
            recommendations=[],
            retention_reviews=[],
        )
