// Pure helpers for dialogue lessons, ported 1:1 from the student web app so both clients cast a lesson the same way:
// read "Man: Hello! Woman: Hi!" scripts, decide which character plays each speaker, and pick a lesson's presenter.
// No Flutter widgets, no network.

import 'student_characters.dart';

class DialogueLine {
  const DialogueLine({required this.speaker, required this.text});

  final String speaker;
  final String text;

  @override
  bool operator ==(Object other) =>
      other is DialogueLine && other.speaker == speaker && other.text == text;

  @override
  int get hashCode => Object.hash(speaker, text);
}

const int maxDialogueSpeakers = 4;

/// A speaker label sits at the start of the script or right after a sentence ends: "Man: " / "Shop assistant: ".
final RegExp _label = RegExp(
  '(^|[.!?…"”’\')]\\s+)([A-Z][A-Za-z]{1,14}(?: [A-Za-z]{1,14})?):\\s+',
);

/// Splits a script into spoken lines. Returns null when it is not a conversation: it must start with a speaker
/// label, have at least two lines and two different speakers (a lone "Note: …" is just text).
List<DialogueLine>? parseDialogue(String? script) {
  final text = (script ?? '').trim();
  if (text.isEmpty) return null;
  final marks = <({String speaker, int start, int end})>[];
  for (final m in _label.allMatches(text)) {
    marks.add((
      speaker: m.group(2)!,
      start: m.start + m.group(1)!.length,
      end: m.end,
    ));
  }
  if (marks.length < 2 || marks.first.start != 0) return null;
  final lines = <DialogueLine>[];
  for (var i = 0; i < marks.length; i++) {
    final to = i + 1 < marks.length ? marks[i + 1].start : text.length;
    final body = text.substring(marks[i].end, to).trim();
    if (body.isEmpty) return null;
    lines.add(DialogueLine(speaker: marks[i].speaker, text: body));
  }
  final speakers = lines.map((l) => l.speaker).toSet();
  if (speakers.length < 2 || speakers.length > maxDialogueSpeakers) return null;
  return lines;
}

const _maleWords = {
  'boy', 'man', 'male', 'father', 'dad', 'daddy', 'brother', 'son', 'husband',
  'gentleman', 'grandfather', 'grandpa', 'uncle', 'mr', 'sir',
};
const _femaleWords = {
  'girl', 'woman', 'female', 'mother', 'mom', 'mum', 'mummy', 'sister',
  'daughter', 'wife', 'lady', 'grandmother', 'grandma', 'aunt', 'mrs', 'ms',
  'miss', 'madam', 'waitress',
};

/// Gender a speaker label points to ("Girl", "Woman"), or null for neutral roles such as "Doctor".
CharacterGender? genderOf(String label) {
  final word = label.trim().toLowerCase();
  if (_maleWords.contains(word)) return CharacterGender.male;
  if (_femaleWords.contains(word)) return CharacterGender.female;
  return null;
}

/// Small stable number from text (FNV-1a, 32-bit). Written so it is exact on web too, where ints are doubles.
int hashSeed(String text) {
  var h = 2166136261;
  for (final unit in text.codeUnits) {
    h ^= unit;
    final lo = (h & 0xFFFF) * 16777619;
    final hi = ((h >> 16) * 16777619) & 0xFFFF;
    h = (lo + (hi << 16)) & 0xFFFFFFFF;
  }
  return h;
}

/// Picks a character for each speaker, in order of first appearance. Labels that name a gender get a matching
/// character; neutral roles take the opposite gender of the previous speaker. Nobody is used twice, and the same
/// [seed] always gives the same cast.
List<StudentCharacter> assignCharacters(List<String> speakers, String seed) {
  final n = hashSeed(seed);
  final used = <String>{};
  final cast = <StudentCharacter>[];
  for (var i = 0; i < speakers.length; i++) {
    var gender = genderOf(speakers[i]);
    if (gender == null) {
      if (cast.isNotEmpty) {
        gender = cast.last.gender == CharacterGender.male
            ? CharacterGender.female
            : CharacterGender.male;
      } else {
        gender = n.isEven ? CharacterGender.male : CharacterGender.female;
      }
    }
    final pool = gender == CharacterGender.male
        ? StudentCharacters.malePool
        : StudentCharacters.femalePool;
    final free = pool.where((c) => !used.contains(c.id)).toList();
    final everyone = [...StudentCharacters.malePool, ...StudentCharacters.femalePool]
        .where((c) => !used.contains(c.id))
        .toList();
    final options = free.isNotEmpty ? free : everyone;
    final pick = options[(n + i) % options.length];
    used.add(pick.id);
    cast.add(pick);
  }
  return cast;
}

List<String> uniqueSpeakers(List<DialogueLine> lines) {
  final seen = <String>[];
  for (final l in lines) {
    if (!seen.contains(l.speaker)) seen.add(l.speaker);
  }
  return seen;
}

/// The student character who presents a lesson. The same lesson always gets the same presenter.
StudentCharacter pickPresenter(String lessonId) {
  const order = StudentCharacters.presenterOrder;
  return order[hashSeed(lessonId) % order.length];
}
