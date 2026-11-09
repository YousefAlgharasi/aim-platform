import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/api_client_exception.dart';
import '../../../core/networking/backend_api_client.dart';
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
}

final learnerToolsApiProvider = Provider<LearnerToolsApi>(
  (ref) => LearnerToolsApi(ref.watch(authenticatedBackendApiClientProvider)),
);

final vocabularyProvider = FutureProvider.autoDispose<VocabularyList>(
  (ref) => ref.watch(learnerToolsApiProvider).listWords(),
);

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
