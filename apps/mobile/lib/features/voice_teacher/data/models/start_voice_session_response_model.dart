class StartVoiceSessionResponseModel {
  final String sessionId;
  final String status;
  final String createdAt;

  const StartVoiceSessionResponseModel({
    required this.sessionId,
    required this.status,
    required this.createdAt,
  });

  factory StartVoiceSessionResponseModel.fromJson(Map<String, dynamic> json) {
    return StartVoiceSessionResponseModel(
      sessionId: json['sessionId'] as String,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
    );
  }
}
