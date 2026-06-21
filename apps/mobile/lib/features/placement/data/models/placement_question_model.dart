// P6-048: Placement question model — represents backend placement question data.
// Flutter NEVER calculates correctness or scores; all evaluation is backend-owned.

import 'package:aim_mobile/features/placement/logic/entity/placement_question.dart';

class PlacementQuestionModel {
  const PlacementQuestionModel({
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
  final List<PlacementOptionModel> options;
  final String type;
  final String? mediaUrl;
  final int? ordinal;

  factory PlacementQuestionModel.fromJson(Map<String, dynamic> json) {
    return PlacementQuestionModel(
      id: json['id'] as String,
      sectionId: json['section_id'] as String,
      text: json['text'] as String,
      options: (json['options'] as List<dynamic>)
          .map((o) => PlacementOptionModel.fromJson(o as Map<String, dynamic>))
          .toList(),
      type: json['type'] as String,
      mediaUrl: json['media_url'] as String?,
      ordinal: json['ordinal'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'section_id': sectionId,
        'text': text,
        'options': options.map((o) => o.toJson()).toList(),
        'type': type,
        if (mediaUrl != null) 'media_url': mediaUrl,
        if (ordinal != null) 'ordinal': ordinal,
      };

  PlacementQuestion toEntity() => PlacementQuestion(
        id: id,
        sectionId: sectionId,
        text: text,
        options: options.map((o) => o.toEntity()).toList(),
        type: type,
        mediaUrl: mediaUrl,
        ordinal: ordinal,
      );
}

class PlacementOptionModel {
  const PlacementOptionModel({required this.id, required this.text});

  final String id;
  final String text;

  factory PlacementOptionModel.fromJson(Map<String, dynamic> json) {
    return PlacementOptionModel(
      id: json['id'] as String,
      text: json['text'] as String,
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'text': text};

  PlacementOption toEntity() => PlacementOption(id: id, text: text);
}
