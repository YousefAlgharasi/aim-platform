class SessionValidationModel {
  const SessionValidationModel({
    required this.valid,
    this.userId,
    this.status,
  });

  factory SessionValidationModel.fromJson(Map<String, dynamic> json) {
    return SessionValidationModel(
      valid: json['valid'] as bool? ?? false,
      userId: json['userId'] as String?,
      status: json['status'] as String?,
    );
  }

  final bool valid;
  final String? userId;
  final String? status;
}
