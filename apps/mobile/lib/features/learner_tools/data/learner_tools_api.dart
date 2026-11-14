import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/api_client_exception.dart';
import '../../../core/networking/backend_api_client.dart';
import '../../../core/state/app_async_state.dart';
import '../../auth/logic/provider/auth_context_provider.dart';
import '../../auth/logic/provider/auth_token_interceptor_provider.dart';

/// A word the student saved (`GET /vocabulary`).
class SavedWord {
  const SavedWord({
    required this.id,
    required this.word,
    required this.box,
    required this.nextReviewAt,
    this.meaning,
    this.context,
  });

  final String id;
  final String word;
  final String? meaning;
  final String? context;

  /// Spaced-repetition box, 0-6 (server-owned).
  final int box;
  final DateTime nextReviewAt;

  bool get isDue => !nextReviewAt.isAfter(DateTime.now());

  factory SavedWord.fromJson(Map<String, dynamic> j) => SavedWord(
        id: j['id']?.toString() ?? '',
        word: j['word']?.toString() ?? '',
        meaning: j['meaning'] as String?,
        context: j['context'] as String?,
        box: (j['box'] as num?)?.round() ?? 0,
        nextReviewAt:
            DateTime.tryParse(j['nextReviewAt']?.toString() ?? '') ?? DateTime.now(),
      );
}

class VocabularyList {
  const VocabularyList({required this.words, required this.dueCount});
  final List<SavedWord> words;
  final int dueCount;
}

/// A word from the vocabulary library (`GET /vocabulary-library`).
class LibraryWord {
  const LibraryWord({
    required this.id,
    required this.word,
    required this.translationAr,
    required this.exampleSentence,
    required this.level,
    required this.saved,
    this.partOfSpeech,
  });

  final String id;
  final String word;

  /// Arabic translation of the word only (not the sentence).
  final String translationAr;
  final String exampleSentence;
  final String? partOfSpeech;

  /// `beginner`, `intermediate` or `advanced`.
  final String level;
  final bool saved;

  LibraryWord copyWith({bool? saved}) => LibraryWord(
        id: id,
        word: word,
        translationAr: translationAr,
        exampleSentence: exampleSentence,
        level: level,
        partOfSpeech: partOfSpeech,
        saved: saved ?? this.saved,
      );

  factory LibraryWord.fromJson(Map<String, dynamic> j) => LibraryWord(
        id: j['id']?.toString() ?? '',
        word: j['word']?.toString() ?? '',
        translationAr: j['translationAr']?.toString() ?? '',
        exampleSentence: j['exampleSentence']?.toString() ?? '',
        partOfSpeech: j['partOfSpeech'] as String?,
        level: j['level']?.toString() ?? 'beginner',
        saved: j['saved'] == true,
      );
}

class LibraryPage {
  const LibraryPage({required this.words, required this.total});
  final List<LibraryWord> words;
  final int total;
}

class MistakeOption {
  const MistakeOption({required this.id, required this.text});
  final String id;
  final String text;
}

/// A wrong answer the student can retry (`GET /student/mistakes`).
class MistakeItem {
  const MistakeItem({
    required this.itemId,
    required this.prompt,
    required this.options,
    this.yourAnswer,
    this.skillIds = const [],
  });

  final String itemId;
  final String prompt;
  final List<MistakeOption> options;
  final String? yourAnswer;
  final List<String> skillIds;

  factory MistakeItem.fromJson(Map<String, dynamic> j) => MistakeItem(
        itemId: j['itemId']?.toString() ?? '',
        prompt: j['prompt']?.toString() ?? '',
        yourAnswer: j['yourAnswer'] as String?,
        skillIds: (j['skillIds'] as List<dynamic>? ?? const [])
            .map((e) => e.toString())
            .toList(),
        options: (j['options'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map((o) => MistakeOption(
                  id: o['id']?.toString() ?? '',
                  text: o['text']?.toString() ?? '',
                ))
            .toList(),
      );
}

class MistakeList {
  const MistakeList({required this.total, required this.items});
  final int total;
  final List<MistakeItem> items;
}

/// Result of checking one retried answer. The server decides correctness.
class MistakeCheck {
  const MistakeCheck({
    required this.correct,
    this.correctChoiceId,
    this.correctText,
    this.explanation,
  });

  final bool correct;
  final String? correctChoiceId;
  final String? correctText;
  final String? explanation;
}

/// A review that is due now for a skill the student is weak at
/// (`GET /aim/students/:id/due-reviews`). The backend decides what is due and
/// what counts as weak; the app only shows it and opens the lesson to practise.
class DueReview {
  const DueReview({
    required this.scheduleId,
    required this.skillId,
    required this.dueAt,
    this.skillTitle,
    this.severity,
    this.masteryScore,
    this.lessonId,
    this.lessonTitle,
  });

  factory DueReview.fromJson(Map<String, dynamic> json) => DueReview(
        scheduleId: json['scheduleId'] as String,
        skillId: json['skillId'] as String,
        skillTitle: json['skillTitle'] as String?,
        dueAt: (json['dueAt'] as String?) ?? '',
        severity: json['severity'] as String?,
        masteryScore: (json['masteryScore'] as num?)?.toDouble(),
        lessonId: json['lessonId'] as String?,
        lessonTitle: json['lessonTitle'] as String?,
      );

  final String scheduleId;
  final String skillId;
  final String? skillTitle;
  final String dueAt;

  /// 'critical' | 'developing' | 'emerging' from the open weakness, if any.
  final String? severity;
  final double? masteryScore;
  final String? lessonId;
  final String? lessonTitle;
}

/// The 6 main skills the Improve page groups weak skills under.
const recoveryGroups = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'];

/// A weak skill with its retry state (`GET /student/recovery`). The server owns
/// the group, the 3-day wait and the unlock; this only displays them.
class RecoverySkill {
  const RecoverySkill({
    required this.skillKey,
    required this.title,
    required this.group,
    required this.openMistakes,
    required this.unlocked,
    this.masteryScore,
    this.retryAvailableAt,
  });

  final String skillKey;
  final String title;
  final String group;
  final int openMistakes;
  final bool unlocked;
  final double? masteryScore;

  /// Null when there is nothing to wait for.
  final DateTime? retryAvailableAt;

  /// Whole days left until the retry opens, never below 1 while it is locked.
  int daysLeft([DateTime? now]) {
    final at = retryAvailableAt;
    if (at == null) return 0;
    final ms = at.difference(now ?? DateTime.now()).inMilliseconds;
    final days = (ms / Duration.millisecondsPerDay).ceil();
    return days < 1 ? 1 : days;
  }

  factory RecoverySkill.fromJson(Map<String, dynamic> j) {
    final group = j['group']?.toString() ?? 'vocabulary';
    return RecoverySkill(
      skillKey: j['skillKey']?.toString() ?? '',
      title: j['title']?.toString() ?? '',
      group: recoveryGroups.contains(group) ? group : 'vocabulary',
      openMistakes: (j['openMistakes'] as num?)?.round() ?? 0,
      unlocked: j['unlocked'] != false,
      masteryScore: (j['masteryScore'] as num?)?.toDouble(),
      retryAvailableAt: DateTime.tryParse(j['retryAvailableAt']?.toString() ?? ''),
    );
  }
}

/// One question of a retry session. No correctness data, by contract.
class RecoveryQuestion {
  const RecoveryQuestion({
    required this.itemId,
    required this.type,
    required this.prompt,
    required this.options,
  });

  final String itemId;
  final String type;
  final String prompt;
  final List<MistakeOption> options;

  factory RecoveryQuestion.fromJson(Map<String, dynamic> j) => RecoveryQuestion(
        itemId: j['itemId']?.toString() ?? '',
        type: j['type']?.toString() ?? 'multiple_choice',
        prompt: j['prompt']?.toString() ?? '',
        options: (j['options'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map((o) => MistakeOption(id: o['id']?.toString() ?? '', text: o['text']?.toString() ?? ''))
            .toList(),
      );
}

/// A started retry session (`POST /student/recovery/start`). Answers are sent
/// through the normal session attempt call, so the AIM engine updates mastery.
class RecoveryStart {
  const RecoveryStart({required this.sessionId, required this.skillKey, required this.questions});

  final String sessionId;
  final String skillKey;
  final List<RecoveryQuestion> questions;
}

/// A skill the student can practise in grammar, listening or reading
/// (`GET /student/practice/skills`). The server picks what is allowed at their
/// level and which skill is recommended.
class PracticeSkill {
  const PracticeSkill({
    required this.skillKey,
    required this.title,
    required this.recommended,
    this.masteryScore,
  });

  final String skillKey;
  final String title;
  final bool recommended;
  final double? masteryScore;

  factory PracticeSkill.fromJson(Map<String, dynamic> j) => PracticeSkill(
        skillKey: j['skillKey']?.toString() ?? '',
        title: j['title']?.toString() ?? '',
        recommended: j['recommended'] == true,
        masteryScore: (j['masteryScore'] as num?)?.toDouble(),
      );
}

/// A started practice session (`POST /student/practice/start`). Answers are sent
/// through the normal session attempt call, so the AIM engine updates mastery.
class PracticeStart {
  const PracticeStart({
    required this.sessionId,
    required this.skillKey,
    required this.title,
    required this.questions,
    this.passage,
  });

  final String sessionId;
  final String skillKey;
  final String title;

  /// Reading only: shown once above the questions.
  final String? passage;
  final List<RecoveryQuestion> questions;
}

/// Talks to the same endpoints the web app uses for My words and My mistakes.
/// Correctness and review scheduling are decided by the backend only.
class LearnerToolsApi {
  const LearnerToolsApi(this._client);
  final BackendApiClient _client;

  Future<VocabularyList> listWords() async {
    final r = await _client.get<VocabularyList>('/vocabulary', decodeData: (json) {
      final m = json as Map<String, dynamic>? ?? const {};
      final words = (m['words'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(SavedWord.fromJson)
          .toList();
      return VocabularyList(
        words: words,
        dueCount: (m['dueCount'] as num?)?.round() ?? 0,
      );
    });
    return r.data!;
  }

  Future<void> saveWord({
    required String word,
    String? meaning,
    String? context,
  }) async {
    await _client.post<Object?>(
      '/vocabulary',
      body: {
        'word': word,
        if (meaning != null && meaning.isNotEmpty) 'meaning': meaning,
        if (context != null && context.isNotEmpty) 'context': context,
        'source': 'manual',
      },
      decodeData: (json) => json,
    );
  }

  /// One page of the vocabulary library. [level] is `beginner`, `intermediate`
  /// or `advanced`; null means every level.
  Future<LibraryPage> listLibrary({
    String? level,
    String? query,
    int limit = 24,
    int offset = 0,
  }) async {
    final r = await _client.get<LibraryPage>(
      '/vocabulary-library',
      queryParameters: {
        if (level != null) 'level': level,
        if (query != null && query.isNotEmpty) 'q': query,
        'limit': '$limit',
        'offset': '$offset',
      },
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        final words = (m['words'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(LibraryWord.fromJson)
            .toList();
        return LibraryPage(words: words, total: (m['total'] as num?)?.round() ?? words.length);
      },
    );
    return r.data!;
  }

  Future<void> saveLibraryWord(String id) async {
    await _client.post<Object?>(
      '/vocabulary-library/${Uri.encodeComponent(id)}/save',
      body: const <String, Object?>{},
      decodeData: (json) => json,
    );
  }

  Future<void> unsaveLibraryWord(String id) async {
    await _client.delete<Object?>(
      '/vocabulary-library/${Uri.encodeComponent(id)}/save',
      decodeData: (json) => json,
    );
  }

  /// Spoken pronunciation of a library word (audio bytes).
  Future<List<int>> libraryWordAudio(String id) =>
      _client.getBytes('/vocabulary-library/${Uri.encodeComponent(id)}/audio');

  Future<void> removeWord(String id) async {
    await _client.delete<Object?>(
      '/vocabulary/${Uri.encodeComponent(id)}',
      decodeData: (json) => json,
    );
  }

  Future<List<SavedWord>> dueCards() async {
    final r = await _client.get<List<SavedWord>>('/vocabulary/review',
        decodeData: (json) {
      final m = json as Map<String, dynamic>? ?? const {};
      return (m['cards'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(SavedWord.fromJson)
          .toList();
    });
    return r.data!;
  }

  Future<void> reviewWord(String id, {required bool correct}) async {
    await _client.post<Object?>(
      '/vocabulary/${Uri.encodeComponent(id)}/review',
      body: {'correct': correct},
      decodeData: (json) => json,
    );
  }

  /// Due reviews for the student's weak skills only.
  Future<List<DueReview>> dueReviews(String studentId) async {
    final r = await _client.get<List<DueReview>>(
      '/aim/students/$studentId/due-reviews',
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        return (m['dueReviews'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(DueReview.fromJson)
            .toList();
      },
    );
    return r.data ?? const [];
  }

  /// Readable titles for every published skill, keyed by skill key. The same
  /// catalogue the web app uses, so students see "Possessive Adjectives"
  /// instead of the raw key.
  Future<Map<String, String>> skillTitles() async {
    final r = await _client.get<Map<String, String>>(
      '/student/skills/titles',
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        return {
          for (final e in (m['skills'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>())
            if (e['key'] is String && e['title'] is String)
              (e['key'] as String).toLowerCase(): e['title'] as String,
        };
      },
    );
    return r.data ?? const {};
  }

  Future<MistakeList> listMistakes({String? skill}) async {
    final r = await _client.get<MistakeList>(
      '/student/mistakes',
      queryParameters: skill == null ? null : {'skill': skill},
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        final items = (m['items'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(MistakeItem.fromJson)
            .toList();
        return MistakeList(
          total: (m['total'] as num?)?.round() ?? items.length,
          items: items,
        );
      },
    );
    return r.data!;
  }

  Future<MistakeCheck> checkMistake(String itemId, String answerId) async {
    final r = await _client.post<MistakeCheck>(
      '/student/mistakes/check',
      body: {'itemId': itemId, 'answerId': answerId},
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        return MistakeCheck(
          correct: m['correct'] == true,
          correctChoiceId: m['correctChoiceId'] as String?,
          correctText: m['correctText'] as String?,
          explanation: m['explanation'] as String?,
        );
      },
    );
    return r.data!;
  }
  /// Weak skills with their group, 3-day wait and retry state.
  Future<List<RecoverySkill>> recoveryOverview() async {
    final r = await _client.get<List<RecoverySkill>>(
      '/student/recovery',
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        return (m['skills'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(RecoverySkill.fromJson)
            .toList();
      },
    );
    return r.data ?? const [];
  }

  /// Starts a retry session for [skillKey]. The server answers 403 while the wait is running.
  Future<RecoveryStart> startRecovery(String skillKey) async {
    final r = await _client.post<RecoveryStart>(
      '/student/recovery/start',
      body: {'skillKey': skillKey},
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        return RecoveryStart(
          sessionId: m['sessionId']?.toString() ?? '',
          skillKey: m['skillKey']?.toString() ?? skillKey,
          questions: (m['questions'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(RecoveryQuestion.fromJson)
              .toList(),
        );
      },
    );
    return r.data!;
  }
  /// The skills the student can practise in [mode] (`grammar`, `listening` or `reading`).
  Future<List<PracticeSkill>> practiceSkills(String mode) async {
    final r = await _client.get<List<PracticeSkill>>(
      '/student/practice/skills',
      queryParameters: {'mode': mode},
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        return (m['skills'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(PracticeSkill.fromJson)
            .toList();
      },
    );
    return r.data ?? const [];
  }

  /// Starts a scored practice session. The server writes the questions at the student's level.
  Future<PracticeStart> startPractice(String mode, String skillKey) async {
    final r = await _client.post<PracticeStart>(
      '/student/practice/start',
      body: {'mode': mode, 'skillKey': skillKey},
      decodeData: (json) {
        final m = json as Map<String, dynamic>? ?? const {};
        return PracticeStart(
          sessionId: m['sessionId']?.toString() ?? '',
          skillKey: m['skillKey']?.toString() ?? skillKey,
          title: m['title']?.toString() ?? '',
          passage: m['passage'] as String?,
          questions: (m['questions'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(RecoveryQuestion.fromJson)
              .toList(),
        );
      },
    );
    return r.data!;
  }
}

final learnerToolsApiProvider = Provider<LearnerToolsApi>(
  (ref) => LearnerToolsApi(ref.watch(authenticatedBackendApiClientProvider)),
);

final vocabularyProvider = FutureProvider.autoDispose<VocabularyList>(
  (ref) => ref.watch(learnerToolsApiProvider).listWords(),
);

/// Skill key -> readable title. Never fails the page: on any error the screens
/// fall back to a tidied version of the key.
final skillTitlesProvider = FutureProvider<Map<String, String>>((ref) async {
  try {
    return await ref.watch(learnerToolsApiProvider).skillTitles();
  } catch (_) {
    return const <String, String>{};
  }
});

/// The readable name for [skillId]: the catalogue title when known, otherwise
/// the key tidied up.
String skillName(Map<String, String> titles, String skillId) {
  final hit = titles[skillId.toLowerCase()] ?? titles[skillId.split(':').last.toLowerCase()];
  if (hit != null && hit.trim().isNotEmpty) return hit;
  final last = skillId.split(':').last;
  final tail = last.contains('.') ? last.split('.').last : last;
  final words = tail
      .split(RegExp(r'[_\-\s]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
}

/// The due reviews for weak skills. Empty while signed out; a failed request
/// is an error the screen can show with a retry.
final dueReviewsProvider = FutureProvider.autoDispose<List<DueReview>>((ref) async {
  final studentId = switch (ref.watch(authContextProvider)) {
    AppAsyncSuccess(:final data) => data.user.id,
    _ => null,
  };
  if (studentId == null) return const [];
  return ref.watch(learnerToolsApiProvider).dueReviews(studentId);
});

/// Weak skills with their retry state. A failure is not an error for the page:
/// it falls back to the plain list (no groups from the server, no retry steps).
final recoveryProvider = FutureProvider.autoDispose<List<RecoverySkill>>((ref) async {
  try {
    return await ref.watch(learnerToolsApiProvider).recoveryOverview();
  } catch (_) {
    return const <RecoverySkill>[];
  }
});

final mistakesProvider =
    FutureProvider.autoDispose.family<MistakeList, String?>(
  (ref, skill) =>
      ref.watch(learnerToolsApiProvider).listMistakes(skill: skill),
);

/// A readable message for a failed request.
String errorText(Object error, String fallback) {
  if (error is ApiClientException && error.message.isNotEmpty) {
    return error.message;
  }
  return fallback;
}
