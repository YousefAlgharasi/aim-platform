// Pure: turns a lesson into the cards of the lesson player. Every word on a card comes from the lesson itself
// (its explanation, description and steps); nothing here writes lesson content.

import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson.dart';

sealed class LessonSlide {
  const LessonSlide();
}

class IntroSlide extends LessonSlide {
  const IntroSlide();
}

/// The presenter says something: an optional heading, a light-markdown body and example sentences.
class SaySlide extends LessonSlide {
  const SaySlide({this.title, required this.body, this.examples = const []});

  final String? title;
  final String body;
  final List<LessonExample> examples;
}

class PointsSlide extends LessonSlide {
  const PointsSlide({required this.title, required this.points});

  final String title;
  final List<String> points;
}

class MistakesSlide extends LessonSlide {
  const MistakesSlide({required this.title, required this.items});

  final String title;
  final List<LessonMistake> items;
}

class AssetSlide extends LessonSlide {
  const AssetSlide(this.asset);

  final LessonAsset asset;
}

class FinishSlide extends LessonSlide {
  const FinishSlide();
}

/// intro → explanation cards → the lesson's activities → finish.
/// With a written explanation: overview, each section, key points, common mistakes, recap, then every step.
/// Without one: the description, then the steps in order (a text step becomes a talking card, the rest show as is).
List<LessonSlide> buildLessonSlides({
  required String description,
  required LessonExplanation? explanation,
  required List<LessonAsset> assets,
  required String keyPointsLabel,
  required String recapLabel,
  required String mistakesLabel,
}) {
  final slides = <LessonSlide>[const IntroSlide()];
  final ex = explanation;
  if (ex != null) {
    if (ex.overview.trim().isNotEmpty) slides.add(SaySlide(body: ex.overview));
    for (final s in ex.sections) {
      if (s.body.trim().isEmpty) continue;
      slides.add(SaySlide(title: s.heading, body: s.body, examples: s.examples));
    }
    if (ex.keyPoints.isNotEmpty) {
      slides.add(PointsSlide(title: keyPointsLabel, points: ex.keyPoints));
    }
    if (ex.commonMistakes.isNotEmpty) {
      slides.add(MistakesSlide(title: mistakesLabel, items: ex.commonMistakes));
    }
    final recap = ex.recap;
    if (recap != null && recap.trim().isNotEmpty) {
      slides.add(SaySlide(title: recapLabel, body: recap));
    }
    for (final a in assets) {
      slides.add(AssetSlide(a));
    }
  } else {
    if (description.trim().isNotEmpty) slides.add(SaySlide(body: description));
    for (final a in assets) {
      if (a.type == 'text') {
        final d = a.description;
        if (d != null && d.trim().isNotEmpty) {
          slides.add(SaySlide(title: a.title, body: d));
        }
      } else {
        slides.add(AssetSlide(a));
      }
    }
  }
  slides.add(const FinishSlide());
  return slides;
}
