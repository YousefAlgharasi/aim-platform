/// One entry of the Word of the Day list.
class DailyWord {
  const DailyWord(this.word, this.pos, this.en, this.ar, this.example);

  final String word;
  final String pos;
  final String en;
  final String ar;
  final String example;
}

/// Hand-picked words per CEFR band (the same list the web dashboard uses). The
/// word for a day is chosen from the learner's band by the date, so it stays
/// the same all day.
const Map<String, List<DailyWord>> dailyWords = {
  'A1': [
    DailyWord('borrow', 'verb', 'to take something and give it back later', 'يستعير', 'Can I borrow your pen?'),
    DailyWord('early', 'adjective', 'before the usual or expected time', 'مبكرًا', 'I wake up early on Sundays.'),
    DailyWord('cheap', 'adjective', 'not costing much money', 'رخيص', 'This bag is cheap but strong.'),
    DailyWord('repeat', 'verb', 'to say or do something again', 'يكرّر', 'Please repeat the question.'),
    DailyWord('neighbour', 'noun', 'a person who lives near you', 'جار', 'My neighbour is very kind.'),
    DailyWord('journey', 'noun', 'a trip from one place to another', 'رحلة', 'The journey took two hours.'),
  ],
  'A2': [
    DailyWord('improve', 'verb', 'to become better, or to make something better', 'يحسّن', 'I want to improve my English.'),
    DailyWord('popular', 'adjective', 'liked by many people', 'شائع / محبوب', 'Football is popular in my country.'),
    DailyWord('delay', 'noun', 'a time when something happens later than planned', 'تأخير', 'There was a delay at the airport.'),
    DailyWord('comfortable', 'adjective', 'making you feel relaxed and at ease', 'مريح', 'This chair is very comfortable.'),
    DailyWord('decide', 'verb', 'to choose after thinking', 'يقرّر', 'We decided to stay home.'),
    DailyWord('schedule', 'noun', 'a plan of when things will happen', 'جدول زمني', 'My schedule is full on Monday.'),
  ],
  'B1': [
    DailyWord('achieve', 'verb', 'to succeed in doing something you worked for', 'يحقّق', 'She worked hard to achieve her goal.'),
    DailyWord('reliable', 'adjective', 'able to be trusted to do what is expected', 'موثوق', 'He is a reliable friend.'),
    DailyWord('consider', 'verb', 'to think carefully about something', 'يأخذ في الاعتبار', 'Consider all the options before you choose.'),
    DailyWord('opportunity', 'noun', 'a chance to do something good', 'فرصة', 'This job is a great opportunity.'),
    DailyWord('rely', 'verb', 'to depend on someone or something', 'يعتمد على', 'You can rely on me.'),
    DailyWord('maintain', 'verb', 'to keep something in good condition or at the same level', 'يحافظ على', 'It is important to maintain a healthy routine.'),
  ],
  'B2': [
    DailyWord('elaborate', 'verb', 'to explain something in more detail', 'يسهب / يوضّح بالتفصيل', 'Could you elaborate on your idea?'),
    DailyWord('reluctant', 'adjective', 'not willing, and slow to act', 'متردد', 'He was reluctant to share his plans.'),
    DailyWord('crucial', 'adjective', 'extremely important', 'حاسم', 'Sleep is crucial for good health.'),
    DailyWord('overcome', 'verb', 'to deal with a problem and win against it', 'يتغلّب على', 'She overcame her fear of speaking.'),
    DailyWord('ambiguous', 'adjective', 'having more than one possible meaning', 'غامض', 'The instructions were ambiguous.'),
    DailyWord('sustain', 'verb', 'to keep something going over time', 'يديم / يستمر في', 'It is hard to sustain this pace.'),
  ],
  'C1': [
    DailyWord('meticulous', 'adjective', 'very careful about every detail', 'دقيق جدًا', 'He is meticulous about his research.'),
    DailyWord('mitigate', 'verb', 'to make something less harmful or serious', 'يخفّف', 'Trees help mitigate the effects of heat.'),
    DailyWord('inevitable', 'adjective', 'certain to happen and impossible to avoid', 'حتمي', 'Change is inevitable.'),
    DailyWord('scrutinize', 'verb', 'to examine something very closely', 'يدقّق في', 'Auditors scrutinize every report.'),
    DailyWord('pragmatic', 'adjective', 'dealing with things in a practical, realistic way', 'عملي / واقعي', 'She took a pragmatic approach to the problem.'),
    DailyWord('nuance', 'noun', 'a small difference in meaning or feeling', 'فارق دقيق', 'The translation missed the nuance.'),
  ],
};

/// Whole days since 1970 for a local calendar date: the same number for
/// everyone on the same day.
int dayNumber(DateTime d) =>
    DateTime.utc(d.year, d.month, d.day).millisecondsSinceEpoch ~/ 86400000;

/// The word for [date]. C2 learners draw from the C1 list; no level yet draws
/// from A2.
DailyWord wordOfTheDay(String? band, DateTime date) {
  final key = band == null ? 'A2' : (band == 'C2' ? 'C1' : band);
  final list = dailyWords[key] ?? dailyWords['A2']!;
  return list[dayNumber(date) % list.length];
}
