import 'package:aim_mobile/features/assessments/data/models/assessment_detail_model.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> _json(Map<String, dynamic> extra) => {
      'id': 'exam-1',
      'type': 'exam',
      'title': 'Starter Course — Final Exam',
      'description': null,
      'sections': [
        {'id': 's-1', 'title': 'Part 1', 'order': 1, 'questionCount': 20},
        {'id': 's-2', 'title': 'Part 2', 'order': 2, 'questionCount': 13},
      ],
      'maxAttempts': 3,
      'timeLimitSeconds': null,
      'deadline': null,
      ...extra,
    };

void main() {
  test('parses backend attempt status and start block', () {
    final detail = AssessmentDetailModel.fromJson(_json({
      'questionCount': 33,
      'attemptsUsed': 3,
      'attemptsRemaining': 0,
      'hasActiveAttempt': false,
      'passed': false,
      'bestScorePercent': 48,
      'canStart': false,
      'blockedReason': 'MAX_ATTEMPTS_REACHED',
    }));

    expect(detail.questionCount, 33);
    expect(detail.attemptsUsed, 3);
    expect(detail.attemptsRemaining, 0);
    expect(detail.passed, isFalse);
    expect(detail.bestScorePercent, 48);
    expect(detail.canStart, isFalse);
    expect(detail.blockedReason, 'MAX_ATTEMPTS_REACHED');
  });

  test('stays usable against an older backend without the new fields', () {
    final detail = AssessmentDetailModel.fromJson(_json({}));

    expect(detail.questionCount, 33);
    expect(detail.attemptsRemaining, 3);
    expect(detail.canStart, isTrue);
    expect(detail.blockedReason, isNull);
    expect(detail.bestScorePercent, isNull);
  });
}
