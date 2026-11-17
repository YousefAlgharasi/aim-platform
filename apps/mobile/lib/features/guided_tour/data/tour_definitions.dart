// Guided tour content — the single place to edit the tour text and steps.
//
// Mirrors the student web app's guided tour (apps/student-web/src/features/
// tour/tours.ts, Arabic in i18n/ar/tips.ts). The English and Arabic copy is
// the web copy word for word, except where a line is noted below.
//
// A step points at a screen element by `target`, the id given to a
// `TourTarget` widget on that screen. A step whose element is not on screen
// is skipped, exactly like the web tour.
//
// The Voice Teacher tour is written for the app (the web has no tour on its voice
// screen), in the same short style as the web copy.
//
// The tours the web has but this app does not (course detail, AI Teacher, and
// the web "Remember and fix" step) are left out on purpose: the mobile screens
// have no matching element to point at.

import '../../../core/routing/app_route_paths.dart';

/// A line of copy in both languages.
class TourText {
  const TourText(this.en, this.ar);

  final String en;
  final String ar;

  String of(bool arabic) => arabic ? ar : en;
}

class TourStep {
  const TourStep({
    required this.target,
    required this.title,
    required this.body,
  });

  /// The id of the `TourTarget` this step points at.
  final String target;
  final TourText title;
  final TourText body;
}

class TourDefinition {
  const TourDefinition({
    required this.id,
    required this.steps,
    this.autoStart = false,
    this.afterWelcome = false,
  });

  final String id;
  final List<TourStep> steps;

  /// Offered automatically on the first visit. Only the dashboard and the
  /// Voice Teacher do this; the others wait for the "?" button.
  final bool autoStart;

  /// With [autoStart]: wait until the first-time welcome walkthrough has been
  /// closed in this session (the dashboard is the first screen a new student
  /// sees, under that walkthrough).
  final bool afterWelcome;
}

/// Controls and Settings copy (web: the "Controls" and "Settings" groups).
class TourStrings {
  const TourStrings._();

  static const stepOf = TourText('Step {n} of {total}', 'الخطوة {n} من {total}');
  static const counter = TourText('{n} of {total}', '{n} من {total}');
  static const skip = TourText('Skip tour', 'تخطي الجولة');
  static const back = TourText('Back', 'رجوع');
  static const next = TourText('Next', 'التالي');
  static const done = TourText('Done', 'تم');
  static const help =
      TourText('Take a tour of this page', 'جولة تعريفية بهذه الصفحة');
  static const settingsTitle = TourText('Guided tour', 'الجولة التعريفية');
  static const settingsBody = TourText(
    'Take a short tour of your dashboard. On other pages, use the ? button at the top.',
    'خذ جولة قصيرة في لوحة التحكم. وفي الصفحات الأخرى استخدم زر ؟ في الأعلى.',
  );
  static const settingsAction =
      TourText('Take the dashboard tour', 'ابدأ جولة لوحة التحكم');
}

const String dashboardTourId = 'dashboard';
const String voiceTeacherTourId = 'voice-teacher';

const List<TourDefinition> tourDefinitions = [
  TourDefinition(
    id: dashboardTourId,
    autoStart: true,
    afterWelcome: true,
    steps: [
      TourStep(
        target: 'course-lessons',
        title: TourText('Continue your lessons', 'أكمل دروسك'),
        body: TourText(
          'Your next lessons are here. Tap one to keep learning.',
          'دروسك التالية هنا. اضغط على أي درس لتتابع التعلم.',
        ),
      ),
      TourStep(
        target: 'daily-goal',
        title: TourText('Your daily goal', 'هدفك اليومي'),
        body: TourText(
          'Finish your daily lessons to fill this ring.',
          'أنهِ دروسك اليومية لتملأ هذه الحلقة.',
        ),
      ),
      TourStep(
        target: 'streak',
        title: TourText('Your streak', 'أيامك المتتالية'),
        // Web adds "Tap the flame to see your week." The flame is not
        // tappable in the app, so that sentence is left out here.
        body: TourText(
          'Learn every day to grow your streak.',
          'تعلّم كل يوم لتزيد أيامك المتتالية.',
        ),
      ),
      TourStep(
        target: 'word-of-day',
        title: TourText('Word of the day', 'كلمة اليوم'),
        body: TourText(
          'Learn one new word each day. Tap the speaker to hear it, then add it to My words.',
          'تعلّم كلمة جديدة كل يوم. اضغط على السماعة لتسمعها ثم أضفها إلى كلماتي.',
        ),
      ),
      TourStep(
        target: 'daily-challenges',
        title: TourText('Daily challenges', 'تحديات اليوم'),
        body: TourText(
          'These are small goals for today. Finish them to earn extra XP.',
          'هذه أهداف صغيرة لليوم. أنهِها لتحصل على نقاط XP إضافية.',
        ),
      ),
      TourStep(
        target: 'xp-stats',
        title: TourText('XP and badges', 'نقاط XP والشارات'),
        body: TourText(
          'You earn XP for every lesson. XP raises your level and unlocks badges.',
          'تحصل على نقاط XP مع كل درس. ترفع النقاط مستواك وتفتح لك الشارات.',
        ),
      ),
      TourStep(
        target: 'nav',
        title: TourText('Find your way around', 'تنقّل بسهولة'),
        body: TourText(
          'Use the menu to move between Learn, Practice, Progress and your account.',
          'استخدم القائمة للتنقل بين التعلّم والتدريب والتقدّم وحسابك.',
        ),
      ),
    ],
  ),
  TourDefinition(
    id: 'courses',
    steps: [
      TourStep(
        target: 'level-badge',
        title: TourText('Your level', 'مستواك'),
        body: TourText(
          'Courses are matched to your level.',
          'الدورات مناسبة لمستواك.',
        ),
      ),
      TourStep(
        target: 'courses-list',
        title: TourText('Pick a course', 'اختر دورة'),
        body: TourText(
          'Tap a course to open it. The bar shows how much you have finished.',
          'اضغط على دورة لتفتحها. يوضح الشريط ما أنجزته منها.',
        ),
      ),
    ],
  ),
  TourDefinition(
    id: 'practice',
    steps: [
      TourStep(
        target: 'practice-plan',
        title: TourText('Your 5-minute plan', 'خطتك لخمس دقائق'),
        body: TourText(
          'This shows what is waiting for you today. Tap the button to start.',
          'هنا ما ينتظرك اليوم. اضغط على الزر لتبدأ.',
        ),
      ),
      TourStep(
        target: 'practice-speak',
        title: TourText('Speak and write', 'تكلّم واكتب'),
        body: TourText(
          'Pick a topic, talk or write about it, and get feedback.',
          'اختر موضوعًا، وتحدّث أو اكتب عنه، واحصل على ملاحظات.',
        ),
      ),
    ],
  ),
  TourDefinition(
    id: 'progress',
    steps: [
      TourStep(
        target: 'progress-next',
        title: TourText('Your next step', 'خطوتك التالية'),
        body: TourText(
          'This is the best thing to do next, based on your results.',
          'هذا أفضل ما يمكنك فعله الآن بحسب نتائجك.',
        ),
      ),
      TourStep(
        target: 'progress-skills',
        title: TourText('Your skills', 'مهاراتك'),
        body: TourText(
          'See which skills are strong and which need more practice.',
          'اطّلع على المهارات القوية وتلك التي تحتاج إلى مزيد من التدريب.',
        ),
      ),
    ],
  ),
  TourDefinition(
    id: voiceTeacherTourId,
    autoStart: true,
    steps: [
      TourStep(
        target: 'voice-mic',
        title: TourText('Tap here to talk', 'اضغط هنا للتحدث'),
        body: TourText(
          'Tap the mic and say your answer. Tap it again to stop and send.',
          'اضغط على المايك وقل إجابتك. اضغط عليه مرة أخرى لتتوقف وترسل.',
        ),
      ),
      TourStep(
        target: 'voice-text',
        title: TourText('Or type your answer', 'أو اكتب إجابتك'),
        body: TourText(
          'Prefer typing? Write your answer here and tap the arrow.',
          'تفضّل الكتابة؟ اكتب إجابتك هنا ثم اضغط على السهم.',
        ),
      ),
      TourStep(
        target: 'voice-speaker',
        title: TourText('Your teacher’s voice', 'صوت معلّمك'),
        body: TourText(
          'Tap the speaker to turn the voice off or on. You can still read the replies.',
          'اضغط على السماعة لتُوقف الصوت أو تُشغّله. وتبقى الردود مكتوبة لتقرأها.',
        ),
      ),
      TourStep(
        target: 'voice-messages',
        title: TourText('Your conversation', 'محادثتك'),
        body: TourText(
          'Open Messages to read everything you and your teacher said.',
          'افتح الرسائل لتقرأ كل ما قلتَه أنت ومعلّمك.',
        ),
      ),
    ],
  ),
  TourDefinition(
    id: 'vocabulary-library',
    steps: [
      TourStep(
        target: 'vocab-search',
        title: TourText('Search and filter', 'ابحث وصفِّ'),
        body: TourText(
          'Type a word, or choose a level to see words that fit you.',
          'اكتب كلمة، أو اختر مستوى لترى الكلمات المناسبة لك.',
        ),
      ),
      TourStep(
        target: 'vocab-list',
        title: TourText('Listen and save', 'استمع واحفظ'),
        body: TourText(
          'Tap the speaker to hear a word. Tap the bookmark to save it to My words.',
          'اضغط على السماعة لتسمع الكلمة. واضغط على العلامة لتحفظها في كلماتي.',
        ),
      ),
    ],
  ),
  TourDefinition(
    id: 'my-words',
    steps: [
      TourStep(
        target: 'words-review',
        title: TourText('Today’s review', 'مراجعة اليوم'),
        body: TourText(
          'Words come back at the right time so you remember them. Start your review here.',
          'تعود الكلمات في الوقت المناسب لتتذكرها. ابدأ مراجعتك من هنا.',
        ),
      ),
      TourStep(
        target: 'words-add',
        title: TourText('Add your own words', 'أضف كلماتك الخاصة'),
        body: TourText(
          'Found a new word? Add it with its meaning and an example.',
          'وجدت كلمة جديدة؟ أضفها مع معناها ومثال عليها.',
        ),
      ),
      TourStep(
        target: 'words-list',
        title: TourText('Your saved words', 'كلماتك المحفوظة'),
        body: TourText(
          'The bars show how well you know each word.',
          'توضح الأشرطة مدى إتقانك لكل كلمة.',
        ),
      ),
    ],
  ),
];

TourDefinition? tourById(String id) {
  for (final t in tourDefinitions) {
    if (t.id == id) return t;
  }
  return null;
}

/// Which tour belongs to the screen the student is on, or null.
///
/// [location] is the route path; [mainTab] is the selected tab of the main
/// shell (0 Dashboard, 1 Courses, ...). Lessons, practice sessions, tests and
/// chat are never given a tour.
String? tourIdForScreen({required String location, required int mainTab}) {
  final onMain = location == AppRoutePaths.mainShell ||
      location.startsWith('${AppRoutePaths.mainShell}/');
  if (onMain) {
    return switch (mainTab) {
      0 => dashboardTourId,
      1 => 'courses',
      3 => 'progress',
      _ => null,
    };
  }
  if (location == AppRoutePaths.voiceTeacher) return voiceTeacherTourId;
  if (location == AppRoutePaths.practiceHub) return 'practice';
  if (location == AppRoutePaths.vocabularyLibrary) return 'vocabulary-library';
  if (location == AppRoutePaths.vocabulary) return 'my-words';
  return null;
}
