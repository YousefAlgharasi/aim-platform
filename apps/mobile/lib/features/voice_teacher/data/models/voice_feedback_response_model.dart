import '../../logic/entity/voice_feedback_result.dart';

class VoiceFeedbackResponseModel {
  final String feedbackId;
  final bool recorded;

  const VoiceFeedbackResponseModel({
    required this.feedbackId,
    required this.recorded,
  });

  factory VoiceFeedbackResponseModel.fromJson(Map<String, dynamic> json) {
    return VoiceFeedbackResponseModel(
      feedbackId: json['feedbackId'] as String,
      recorded: json['recorded'] as bool? ?? false,
    );
  }

  VoiceFeedbackResult toEntity() {
    return VoiceFeedbackResult(feedbackId: feedbackId, recorded: recorded);
  }
}
