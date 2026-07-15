// P4-052: First-login placement gate — GET/POST /placement/decision.
//
// Scope: Placement Test phase only.
//
// Security rules:
// - Flutter never decides locally whether the gate should show — the
//   backend is the sole authority (student_profiles.placement_decision +
//   completed-attempt / student_level_state checks).

class PlacementDecisionModel {
  const PlacementDecisionModel({
    required this.shouldShowGate,
    this.decision,
  });

  final bool shouldShowGate;

  /// One of 'take_placement' / 'start_from_scratch', or null if undecided.
  final String? decision;

  factory PlacementDecisionModel.fromJson(Map<String, dynamic> json) {
    return PlacementDecisionModel(
      shouldShowGate: json['should_show_gate'] as bool? ?? false,
      decision: json['decision'] as String?,
    );
  }
}
