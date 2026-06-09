# services/aim-engine — Python AIM Engine

Phase 1 AIM Engine service. Python backend-owned adaptive intelligence module.

**Phase 1 scope:** Service skeleton, health and version endpoints, contract models, pipeline interface skeleton, and no-speed guard tests.

**Constraints:**
- AIM Engine is backend-owned. It must never run in any client.
- `response_time_seconds`, average response time, and speed score do not directly affect mastery, level, or difficulty increase.
- All AIM calculations are owned exclusively by this service.
- Clients never call the AIM Engine directly.

See `docs/phase-1/repo-structure.md` and `docs/aim-engine/boundary-and-io-contract.md`.
