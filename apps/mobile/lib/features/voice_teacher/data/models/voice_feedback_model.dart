class VoiceFeedbackModel {
  final String messageId;
  final String rating;
  final String? comment;

  const VoiceFeedbackModel({
    required this.messageId,
    required this.rating,
    this.comment,
  });

  Map<String, dynamic> toJson() {
    return {
      'messageId': messageId,
      'rating': rating,
      if (comment != null) 'comment': comment,
    };
  }
}
