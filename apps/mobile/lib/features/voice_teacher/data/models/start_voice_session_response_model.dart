class StartVoiceSessionResponseModel {
  final String sessionId;

  const StartVoiceSessionResponseModel({required this.sessionId});

  factory StartVoiceSessionResponseModel.fromJson(Map<String, dynamic> json) {
    return StartVoiceSessionResponseModel(
      sessionId: json['sessionId'] as String,
    );
  }
}
