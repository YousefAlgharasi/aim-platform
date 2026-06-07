"""Unit-of-work port."""

from __future__ import annotations

from typing import Protocol


class UnitOfWork(Protocol):
    def commit(self) -> None: ...
    def rollback(self) -> None: ...

