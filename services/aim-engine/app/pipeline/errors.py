"""Pipeline-specific errors."""


class PipelineExecutionError(RuntimeError):
    """Base error for AIM Engine pipeline execution failures."""


class PipelineNotImplementedError(PipelineExecutionError):
    """Raised when a requested adaptive pipeline is not implemented yet."""
