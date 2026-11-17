import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/guided_tour/data/tour_definitions.dart';

void main() {
  group('tour content', () {
    test('every title and explanation has English and Arabic text', () {
      for (final tour in tourDefinitions) {
        for (final step in tour.steps) {
          for (final text in [step.title, step.body]) {
            expect(text.en.trim(), isNotEmpty, reason: '${tour.id} en');
            expect(text.ar.trim(), isNotEmpty, reason: '${tour.id} ar');
          }
        }
      }
    });

    test('keeps explanations short for learners (same limit as web)', () {
      for (final tour in tourDefinitions) {
        for (final step in tour.steps) {
          expect(step.body.en.length, lessThanOrEqualTo(110));
        }
      }
    });

    test('only the dashboard and the Voice Teacher start by themselves', () {
      expect(
        tourDefinitions.where((t) => t.autoStart).map((t) => t.id).toList(),
        [dashboardTourId, voiceTeacherTourId],
      );
      // Only the dashboard (the first screen under the welcome walkthrough) waits for it to be closed.
      expect(
        tourDefinitions.where((t) => t.afterWelcome).map((t) => t.id).toList(),
        [dashboardTourId],
      );
    });

    test('the Voice Teacher tour points at the mic first, then the text box, the speaker and the messages', () {
      expect(tourById(voiceTeacherTourId)!.steps.map((s) => s.target).toList(),
          ['voice-mic', 'voice-text', 'voice-speaker', 'voice-messages']);
      expect(tourById(voiceTeacherTourId)!.steps.first.title.ar, 'اضغط هنا للتحدث');
    });

    test('tour ids and step targets are unique', () {
      final ids = tourDefinitions.map((t) => t.id).toList();
      expect(ids.toSet().length, ids.length);
      final targets =
          tourDefinitions.expand((t) => t.steps).map((s) => s.target).toList();
      expect(targets.toSet().length, targets.length);
    });

    test('the dashboard tour keeps the web order of steps', () {
      expect(tourById(dashboardTourId)!.steps.map((s) => s.target).toList(), [
        'course-lessons',
        'daily-goal',
        'streak',
        'word-of-day',
        'daily-challenges',
        'xp-stats',
        'nav',
      ]);
    });
  });

  group('tourIdForScreen', () {
    test('main tabs', () {
      expect(tourIdForScreen(location: '/main', mainTab: 0), 'dashboard');
      expect(tourIdForScreen(location: '/main', mainTab: 1), 'courses');
      expect(tourIdForScreen(location: '/main', mainTab: 2), isNull);
      expect(tourIdForScreen(location: '/main', mainTab: 3), 'progress');
      expect(tourIdForScreen(location: '/main', mainTab: 4), isNull);
    });

    test('menu pages', () {
      expect(tourIdForScreen(location: '/practice', mainTab: 0), 'practice');
      expect(tourIdForScreen(location: '/voice-teacher', mainTab: 0), 'voice-teacher');
      expect(tourIdForScreen(location: '/vocabulary', mainTab: 0), 'my-words');
      expect(tourIdForScreen(location: '/vocabulary-library', mainTab: 0),
          'vocabulary-library');
    });

    test('no tour on lessons, practice sessions or assessments', () {
      for (final path in [
        '/lessons/detail',
        '/practice/session',
        '/student/assessments/attempt',
        '/placement/question',
        '/ai-teacher/chat',
      ]) {
        expect(tourIdForScreen(location: path, mainTab: 0), isNull, reason: path);
      }
    });
  });
}
