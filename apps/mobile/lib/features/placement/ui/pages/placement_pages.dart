// Phase 4 — P4-061
// Placement UI pages barrel.
//
// Scope: Placement Test phase only.
// Pages are added in P4-066 (Build Flutter Placement UI).
//
// Pages in this feature:
// - PlacementGatePage  : checks if student needs placement (P4-066)
// - PlacementTestPage  : renders sections and questions (P4-066)
// - PlacementResultPage: displays the estimated level from the API (P4-066)
//
// Rules:
// - No page may display raw placement scores to students.
// - No page may compute or derive the estimated level locally.
// - PlacementResultPage must display the estimatedLevel field from the
//   API response exactly as received.
