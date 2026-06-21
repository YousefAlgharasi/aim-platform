// P6-048: Placement question domain entity.
// Pure Dart — no Flutter imports, no correctness logic, no scoring.
// Flutter NEVER evaluates answers; backend is the sole authority.

class PlacementQuestion {
  const PlacementQuestion({
    required this.id,
    required this.sectionId,
    required this.text,
    required this.options,
    required this.type,
    this.mediaUrl,
    this.ordinal,
  });

  final String id;
  final String sectionId;
  final String text;
  final List<PlacementOption> options;
  final String type;
  final String? mediaUrl;
  final int? ordinal;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PlacementQuestion &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'PlacementQuestion(id: $id, sectionId: $sectionId, type: $type)';
}

class PlacementOption {
  const PlacementOption({required this.id, required this.text});

  final String id;
  final String text;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PlacementOption &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'PlacementOption(id: $id)';
}
