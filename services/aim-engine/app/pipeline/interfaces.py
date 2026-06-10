"""AIM Engine pipeline interface definitions."""

from typing import Protocol

from app.contracts import AdaptiveSessionCompletionRequest, AdaptiveSessionCompletionResponse
from app.pipeline.context import PipelineExecutionContext


class AdaptiveSessionCompletionPipeline(Protocol):
    """Interface for future adaptive session-completion orchestration.

    Implementations must keep AIM intelligence backend-owned. They must not rely
    on client-calculated mastery, weakness, difficulty, retention, or
    recommendation values.
    """

    async def complete_session(
        self,
        request: AdaptiveSessionCompletionRequest,
        context: PipelineExecutionContext,
    ) -> AdaptiveSessionCompletionResponse:
        """Process a completed learning session.

        P1-029 defines this boundary only. Real adaptive behavior belongs in
        later implementation tasks.
        """
        ...
