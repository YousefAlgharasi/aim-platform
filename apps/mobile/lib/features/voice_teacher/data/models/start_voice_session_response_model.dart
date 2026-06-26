class StartVoiceSessionResponseModel {
  final String sessionId;
  final String studentId;
  final String contextRef;
  final String status;
  final String createdAt;

  const StartVoiceSessionResponseModel({
    required this.sessionId,
    required this.studentId,
    required this.contextRef,
    required this.status,
    required this.createdAt,
  });

  factory StartVoiceSessionResponseModel.fromJson(Map<String, dynamic> json) {
    return StartVoiceSessionResponseModel(
      sessionId: json['sessionId'] as String,
      studentId: json['studentId'] as String,
      contextRef: json['contextRef'] as String,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
    );
  }
}
