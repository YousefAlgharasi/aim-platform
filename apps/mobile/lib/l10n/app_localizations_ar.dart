// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'AIM';

  @override
  String get commonBack => 'رجوع';

  @override
  String get commonCancel => 'إلغاء';

  @override
  String get commonSave => 'حفظ';

  @override
  String get commonSubmit => 'إرسال';

  @override
  String get commonRetry => 'أعد المحاولة';

  @override
  String get commonClose => 'إغلاق';

  @override
  String get commonContinue => 'متابعة';

  @override
  String get commonStart => 'ابدأ';

  @override
  String get commonDone => 'تم';

  @override
  String get commonLoading => 'جارٍ التحميل…';

  @override
  String get commonError => 'حدث خطأ ما';

  @override
  String get commonYes => 'نعم';

  @override
  String get commonNo => 'لا';

  @override
  String get commonOk => 'حسنًا';

  @override
  String get commonDelete => 'حذف';

  @override
  String get commonEdit => 'تعديل';

  @override
  String get commonSeeAll => 'عرض الكل';

  @override
  String get commonJustNow => 'الآن';

  @override
  String get commonYesterday => 'أمس';

  @override
  String get commonFocusAreas => 'مجالات التركيز';

  @override
  String commonDoneProgress(int done, int total) {
    return '$done/$total مكتمل';
  }

  @override
  String commonWeaknessSemantic(String skillId, String severity) {
    return 'ضعف في $skillId: $severity';
  }

  @override
  String get authEmailLabel => 'البريد الإلكتروني';

  @override
  String get authEmailPlaceholder => 'you@example.com';

  @override
  String get authEmailSemantic => 'عنوان البريد الإلكتروني';

  @override
  String get authPasswordLabel => 'كلمة المرور';

  @override
  String get authPasswordSemantic => 'كلمة المرور';

  @override
  String get authForgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get authSignInButton => 'تسجيل الدخول';

  @override
  String get authSignInSemantic => 'تسجيل الدخول';

  @override
  String get authNoAccountPrompt => 'ليس لديك حساب؟ ';

  @override
  String get authCreateOneLink => 'أنشئ حسابًا';

  @override
  String get authOpenEndpointTester => 'فتح أداة اختبار واجهة برمجة التطبيقات';

  @override
  String get authWelcomeBackTitle => 'مرحبًا بعودتك';

  @override
  String get authWelcomeBackSubtitle => 'سجّل الدخول للحفاظ على سلسلة إنجازاتك';

  @override
  String get authOrContinueWith => 'أو تابع باستخدام';

  @override
  String get authContinueWithGoogle => 'المتابعة باستخدام Google';

  @override
  String get authContinueWithGoogleSemantic =>
      'المتابعة باستخدام Google (قريبًا)';

  @override
  String get authAppleButton => 'Apple';

  @override
  String get authFacebookButton => 'Facebook';

  @override
  String get authContinueWithAppleSemantic =>
      'المتابعة باستخدام Apple (قريبًا)';

  @override
  String get authContinueWithFacebookSemantic =>
      'المتابعة باستخدام Facebook (قريبًا)';

  @override
  String get authTestModeLabel => 'وضع الاختبار';

  @override
  String get authEnterAsTestStudentSemantic => 'الدخول كطالب تجريبي';

  @override
  String get authStudentButton => 'طالب';

  @override
  String get authEnterAsTestParentSemantic => 'الدخول كولي أمر تجريبي';

  @override
  String get authParentButton => 'ولي الأمر';

  @override
  String get authEnterAsTestAdminSemantic => 'الدخول كمسؤول تجريبي';

  @override
  String get authAdminButton => 'مسؤول';

  @override
  String get authCreateAccount => 'إنشاء حساب';

  @override
  String get authStartLearningTagline =>
      'ابدأ تعلّم اللغة الإنجليزية بطريقة ممتعة';

  @override
  String get authConfirmPasswordLabel => 'تأكيد كلمة المرور';

  @override
  String get authConfirmPasswordSemantic => 'تأكيد كلمة المرور';

  @override
  String get authPasswordsDoNotMatch => 'كلمتا المرور غير متطابقتين';

  @override
  String get authOrSignUpWith => 'أو سجّل باستخدام';

  @override
  String get authSignUpWithGoogle => 'التسجيل باستخدام Google';

  @override
  String get authSignUpWithGoogleSemantic => 'التسجيل باستخدام Google (قريبًا)';

  @override
  String get authSignUpWithAppleSemantic => 'التسجيل باستخدام Apple (قريبًا)';

  @override
  String get authSignUpWithFacebookSemantic =>
      'التسجيل باستخدام Facebook (قريبًا)';

  @override
  String get authAgreeToTermsPrefix => 'بالتسجيل، فإنك توافق على ';

  @override
  String get authTermsLink => 'شروط الاستخدام';

  @override
  String get authAndConnector => ' و';

  @override
  String get authPrivacyPolicyLink => 'سياسة الخصوصية';

  @override
  String get authAlreadyHaveAccount => 'لديك حساب بالفعل؟ سجّل الدخول';

  @override
  String get authCheckYourEmailTitle => 'تحقق من بريدك الإلكتروني';

  @override
  String get authConfirmationEmailSentTitle => 'تم إرسال رسالة التأكيد';

  @override
  String authConfirmationEmailBody(String email) {
    return 'أرسلنا رابط تأكيد إلى:\n$email\n\nافتح الرابط لتفعيل حسابك، ثم سجّل الدخول.';
  }

  @override
  String get authGoToSignInButton => 'الذهاب إلى تسجيل الدخول';

  @override
  String get authGoToSignInSemantic => 'الذهاب إلى تسجيل الدخول';

  @override
  String get authPasswordStrengthWeak => 'ضعيفة';

  @override
  String get authPasswordStrengthMedium => 'متوسطة';

  @override
  String get authPasswordStrengthStrong => 'قوية';

  @override
  String authPasswordStrengthSemantic(String strength) {
    return 'قوة كلمة المرور: $strength';
  }

  @override
  String get authSignOutSemantic => 'تسجيل الخروج';

  @override
  String get authSignOutButton => 'تسجيل الخروج';

  @override
  String get authFailedToLoadUser => 'فشل تحميل بيانات المستخدم';

  @override
  String get authFailedToSyncUser => 'فشل مزامنة بيانات المستخدم وتحميلها';

  @override
  String get authSessionExpiredError =>
      'انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى.';

  @override
  String get authSignInFailedGeneric => 'فشل تسجيل الدخول. حاول مرة أخرى.';

  @override
  String get authTestLoginFailedGeneric =>
      'فشل تسجيل الدخول التجريبي. حاول مرة أخرى.';

  @override
  String get authRegistrationFailedGeneric =>
      'فشل إنشاء الحساب. حاول مرة أخرى.';

  @override
  String get devToolsEndpointTesterTitle => 'أداة اختبار واجهة برمجة التطبيقات';

  @override
  String get devToolsBodyLabel => 'المحتوى:';

  @override
  String get devToolsSendRequestButton => 'إرسال الطلب';

  @override
  String get devToolsNoAuthTokenError =>
      'خطأ: لم يتم العثور على رمز الدخول. الرجاء تسجيل الدخول أولاً.';

  @override
  String get shellOpenMenuTooltip => 'فتح القائمة';

  @override
  String get shellNavHome => 'الرئيسية';

  @override
  String get shellNavHomeSemantic => 'تبويب الرئيسية';

  @override
  String get shellNavLearn => 'التعلّم';

  @override
  String get shellNavLearnSemantic => 'تبويب التعلّم';

  @override
  String get shellNavReview => 'المراجعة';

  @override
  String get shellNavReviewSemantic => 'تبويب المراجعة';

  @override
  String get shellNavProgress => 'التقدّم';

  @override
  String get shellNavProgressSemantic => 'تبويب التقدّم';

  @override
  String get shellNavProfile => 'الملف الشخصي';

  @override
  String get shellNavProfileSemantic => 'تبويب الملف الشخصي';

  @override
  String get shellMenuSectionLabel => 'القائمة';

  @override
  String get shellMoreSectionLabel => 'المزيد';

  @override
  String get shellNotifications => 'الإشعارات';

  @override
  String get shellAchievements => 'الإنجازات';

  @override
  String get shellAimPlus => 'AIM Plus';

  @override
  String get shellPlacementTest => 'اختبار تحديد المستوى';

  @override
  String get shellSupport => 'الدعم';

  @override
  String shellUnreadNotificationsSemantic(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count إشعار غير مقروء',
      many: '$count إشعارًا غير مقروء',
      few: '$count إشعارات غير مقروءة',
      two: 'إشعاران غير مقروءين',
      one: 'إشعار واحد غير مقروء',
      zero: 'لا توجد إشعارات غير مقروءة',
    );
    return '$_temp0';
  }

  @override
  String get shellBrandName => 'AIM Learning';

  @override
  String get shellBrandTagline => 'الإنجليزية بذكاء';

  @override
  String get shellThemeLight => 'فاتح';

  @override
  String get shellThemeDark => 'داكن';

  @override
  String shellThemeSemantic(String theme) {
    return 'مظهر $theme';
  }

  @override
  String get shellLanguageEnglish => 'English';

  @override
  String get shellLanguageArabic => 'العربية';

  @override
  String shellLanguageSemantic(String language) {
    return 'لغة $language';
  }

  @override
  String get onboardingBrandName => 'AIM';

  @override
  String get onboardingTagline => 'ذكاء تكيّفي من أجل الإتقان';

  @override
  String get onboardingTapToContinue => 'اضغط للمتابعة';

  @override
  String get onboardingWalkthroughWelcomeTitle => 'مرحبًا بك في AIM';

  @override
  String get onboardingWalkthroughWelcomeBody =>
      'رفيقك التكيفي لتعلّم اللغة الإنجليزية. لنلقِ نظرة سريعة.';

  @override
  String get onboardingWalkthroughPlacementTitle => 'اكتشف مستواك';

  @override
  String get onboardingWalkthroughPlacementBody =>
      'خذ اختبار تحديد المستوى من القائمة للحصول على دروس تناسب مستواك الحقيقي.';

  @override
  String get onboardingWalkthroughLessonsTitle => 'تعلّم بالسرعة التي تناسبك';

  @override
  String get onboardingWalkthroughLessonsBody =>
      'تصفّح الدورات والدروس في تبويب التعلّم — يفتح كل درس مع تقدّمك.';

  @override
  String get onboardingWalkthroughStreakTitle => 'حافظ على تتابعك';

  @override
  String get onboardingWalkthroughStreakBody =>
      'مارس قليلاً كل يوم — تتابع الشاشة الرئيسية سلسلة أيامك وتقدّمك.';

  @override
  String get onboardingWalkthroughSkip => 'تخطي';

  @override
  String get onboardingWalkthroughNext => 'التالي';

  @override
  String get onboardingWalkthroughGetStarted => 'ابدأ الآن';

  @override
  String get homeLoadingSemantic => 'جارٍ تحميل بيانات الرئيسية';

  @override
  String get homeLastUpdatedJustNow => 'تم التحديث الآن';

  @override
  String homeLastUpdatedMinutesAgo(int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      minutes,
      locale: localeName,
      other: 'تم التحديث قبل $minutes دقيقة',
      many: 'تم التحديث قبل $minutes دقيقة',
      few: 'تم التحديث قبل $minutes دقائق',
      two: 'تم التحديث قبل دقيقتين',
      one: 'تم التحديث قبل دقيقة',
    );
    return '$_temp0';
  }

  @override
  String homeLastUpdatedHoursAgo(int hours) {
    String _temp0 = intl.Intl.pluralLogic(
      hours,
      locale: localeName,
      other: 'تم التحديث قبل $hours ساعة',
      many: 'تم التحديث قبل $hours ساعة',
      few: 'تم التحديث قبل $hours ساعات',
      two: 'تم التحديث قبل ساعتين',
      one: 'تم التحديث قبل ساعة',
    );
    return '$_temp0';
  }

  @override
  String homeUnreadNotificationsSubtitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count إشعار جديد',
      many: '$count إشعارًا جديدًا',
      few: '$count إشعارات جديدة',
      two: 'إشعاران جديدان',
      one: 'إشعار جديد واحد',
      zero: 'لا توجد إشعارات جديدة',
    );
    return '$_temp0';
  }

  @override
  String homeMinutesAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قبل $count دقيقة',
      many: 'قبل $count دقيقة',
      few: 'قبل $count دقائق',
      two: 'قبل دقيقتين',
      one: 'قبل دقيقة',
      zero: 'الآن',
    );
    return '$_temp0';
  }

  @override
  String homeHoursAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قبل $count ساعة',
      many: 'قبل $count ساعة',
      few: 'قبل $count ساعات',
      two: 'قبل ساعتين',
      one: 'قبل ساعة',
    );
    return '$_temp0';
  }

  @override
  String homeDaysAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قبل $count يوم',
      many: 'قبل $count يومًا',
      few: 'قبل $count أيام',
      two: 'قبل يومين',
      one: 'قبل يوم',
    );
    return '$_temp0';
  }

  @override
  String homeWeeksAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قبل $count أسبوع',
      many: 'قبل $count أسبوعًا',
      few: 'قبل $count أسابيع',
      two: 'قبل أسبوعين',
      one: 'قبل أسبوع',
    );
    return '$_temp0';
  }

  @override
  String get homeContinueLearningTitle => 'متابعة التعلم';

  @override
  String get homeLibraryLink => 'المكتبة';

  @override
  String get homeDailyChallengesTitle => 'التحديات اليومية';

  @override
  String homeDailyChallengeCountLabel(int done, int total) {
    return '$done / $total مكتمل';
  }

  @override
  String get homeQuickStartTitle => 'بداية سريعة';

  @override
  String get homeRecommendedCourseTitle => 'دورة موصى بها';

  @override
  String get homeGoalTitle => 'الهدف';

  @override
  String get homeSkillStatesTitle => 'حالة المهارات';

  @override
  String get homeReviewScheduleTitle => 'جدول المراجعة';

  @override
  String get homeRecommendationsTitle => 'توصيات AIM';

  @override
  String get homeGetStartedTitle => 'ابدأ الآن';

  @override
  String get homePlacementTestTitle => 'اختبار تحديد المستوى';

  @override
  String get homePlacementTestSubtitle =>
      'حدد مستواك واحصل على توصيات مخصصة لك.';

  @override
  String get homeBrowseCoursesTitle => 'تصفح الدورات';

  @override
  String get homeBrowseCoursesSubtitle =>
      'استكشف الدورات المتاحة وابدأ التعلم.';

  @override
  String get homeAssessmentsTitle => 'التقييمات';

  @override
  String get homeAssessmentsSubtitle =>
      'اطّلع على التقييمات المتاحة وابدأ فيها.';

  @override
  String homeGreetingWeekdayLine(String weekday) {
    return '$weekday · هيا بنا';
  }

  @override
  String homeGreetingHey(String name) {
    return 'مرحبًا $name ✦';
  }

  @override
  String homeStreakDaysSemantic(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'سلسلة $count يوم',
      many: 'سلسلة $count يومًا',
      few: 'سلسلة $count أيام',
      two: 'سلسلة يومين',
      one: 'سلسلة يوم واحد',
    );
    return '$_temp0';
  }

  @override
  String get homeCrushingGoalsTitle => 'أنت تحقق أهدافك بامتياز 🚀';

  @override
  String get homeLevelLabel => 'المستوى';

  @override
  String get homeXpTodayLabel => 'نقاط اليوم';

  @override
  String homeLevelHeroSemanticNext(
      int level, int xp, int nextXp, int nextLevel) {
    return 'المستوى $level، $xp نقطة خبرة، $nextXp نقطة للوصول إلى المستوى $nextLevel';
  }

  @override
  String homeLevelHeroSemanticMax(int level, int xp) {
    return 'المستوى $level، $xp نقطة خبرة (أعلى مستوى)';
  }

  @override
  String homeXpProgressWithNext(String xp, String nextXp) {
    return '$xp / $nextXp نقطة خبرة';
  }

  @override
  String homeXpProgressMax(String xp) {
    return '$xp نقطة خبرة';
  }

  @override
  String homeNextLevelCta(int level) {
    return 'المستوى $level ←';
  }

  @override
  String get homeMaxLevelLabel => 'أعلى مستوى';

  @override
  String homeBadgeCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count شارة',
      many: '$count شارة',
      few: '$count شارات',
      two: 'شارتان',
      one: 'شارة واحدة',
    );
    return '$_temp0';
  }

  @override
  String homeTopPercentLabel(int percent) {
    return 'الأفضل $percent%';
  }

  @override
  String get homeResumeButton => 'استئناف';

  @override
  String homePercentCompleteLabel(int percent) {
    return 'اكتمال $percent%';
  }

  @override
  String homeContinueSemanticLabel(String title, int percent) {
    return 'متابعة $title، اكتمال $percent بالمئة';
  }

  @override
  String homeDailyChallengeSemantic(String title, int progress, int target) {
    return 'التحدي اليومي: $title، $progress من $target';
  }

  @override
  String homeQuickStartSemantic(String title) {
    return 'بداية سريعة: $title';
  }

  @override
  String homeRecommendedCourseSemantic(String title) {
    return 'دورة موصى بها: $title';
  }

  @override
  String homeRecommendationSemantic(String kind, String skillId) {
    return 'توصية AIM: $kind $skillId';
  }

  @override
  String homeContinueLearningCardSemantic(String title, int percent) {
    return 'متابعة التعلم: $title، اكتمال $percent%';
  }

  @override
  String homeReviewScheduleSemantic(String skillId, String dueAt) {
    return 'مراجعة $skillId المستحقة في $dueAt';
  }

  @override
  String homeSkillMasterySemantic(String skillId, String percent) {
    return 'إتقان $skillId: $percent%';
  }

  @override
  String homeMasteryPercentLabel(String percent) {
    return 'إتقان $percent%';
  }

  @override
  String homeGoalSemantic(int completed, int target, int streak) {
    return 'الهدف اليومي: $completed من $target دروس، سلسلة $streak يوم';
  }

  @override
  String get homeTodaysGoalTitle => 'هدف اليوم';

  @override
  String homeGoalProgressLabel(int completed, int target) {
    return 'أكملت $completed من $target دروس اليوم';
  }

  @override
  String get learningPathLoadingSemantic => 'جارٍ تحميل بيانات مسار التعلم';

  @override
  String get learningPathHeaderTitle => 'مسار التعلم';

  @override
  String get learningPathHeaderSubtitle => 'خارطة طريقك الشخصية';

  @override
  String get learningPathEmptyTitle => 'مسار التعلم فارغ حاليًا';

  @override
  String get learningPathEmptySubtitle =>
      'أكمل اختبار تحديد المستوى لإنشاء مسار تعلم مخصص لك.';

  @override
  String get learningPathSkillCoverageTitle => 'تغطية المهارات';

  @override
  String get learningPathNextUpTitle => 'التالي';

  @override
  String get learningPathAiPickedBadge => 'اختيار الذكاء الاصطناعي';

  @override
  String learningPathRecommendationSemantic(String kind, String skillId) {
    return 'توصية AIM: $kind لـ $skillId';
  }

  @override
  String learningPathSkillMasterySemantic(
      String title, String percent, String trend) {
    return 'إتقان $title: $percent%، $trend';
  }

  @override
  String get lessonsLoadingChaptersSemantic => 'جارٍ تحميل الفصول';

  @override
  String lessonsChapterCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count فصل',
      many: '$count فصلًا',
      few: '$count فصول',
      two: 'فصلان',
      one: 'فصل واحد',
    );
    return '$_temp0';
  }

  @override
  String lessonsPercentDoneSemantic(int percent) {
    return '$percent بالمئة مكتمل';
  }

  @override
  String get lessonsDoneBadge => 'تم';

  @override
  String get lessonsFilterAllChapters => 'كل الفصول';

  @override
  String get lessonsInProgressLabel => 'قيد التقدم';

  @override
  String get lessonsCompletedLabel => 'مكتمل';

  @override
  String get lessonsNotStartedLabel => 'لم يبدأ';

  @override
  String get lessonsNoChaptersTitle => 'لا توجد فصول متاحة';

  @override
  String get lessonsNoChaptersSubtitle => 'ستظهر الفصول المنشورة هنا.';

  @override
  String get lessonsNoChaptersFilterTitle => 'لا توجد فصول ضمن هذا الفلتر';

  @override
  String get lessonsTryDifferentFilterSubtitle => 'جرّب فلترًا مختلفًا أعلاه.';

  @override
  String get lessonsLoadingCoursesSemantic => 'جارٍ تحميل الدورات';

  @override
  String get lessonsNoCoursesTitle => 'لا توجد دورات متاحة';

  @override
  String get lessonsNoCoursesSubtitle => 'ستظهر الدورات المنشورة هنا.';

  @override
  String get lessonsCoursesPageTitle => 'الدورات';

  @override
  String get lessonsCourseLockedMessage => 'أكمل مستواك الحالي لفتح هذه الدورة';

  @override
  String get lessonsCourseLockedSemantic => 'مقفلة';

  @override
  String lessonsLevelBadge(String level) {
    return 'المستوى $level';
  }

  @override
  String get lessonsCoursesSubtitle => 'طوّر لغتك الإنجليزية خطوة بخطوة';

  @override
  String get lessonsCurrentCourseBadge => 'الحالية';

  @override
  String get lessonsStartCourseDialogTitle => 'بدء هذه الدورة؟';

  @override
  String lessonsStartCourseDialogMessage(String courseTitle) {
    return 'ستصبح $courseTitle دورتك النشطة.';
  }

  @override
  String lessonsSwitchCourseDialogMessage(
      String currentCourseTitle, String courseTitle) {
    return 'أنت حاليًا في $currentCourseTitle. سيؤدي التبديل إلى $courseTitle إلى جعلها دورتك النشطة بدلاً منها.';
  }

  @override
  String get lessonsStartCourseConfirmButton => 'بدء الدورة';

  @override
  String get lessonsStartCourseCancelButton => 'إلغاء';

  @override
  String get lessonsStartCourseFailedMessage =>
      'تعذر بدء هذه الدورة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';

  @override
  String get lessonsFilterAllCourses => 'كل الدورات';

  @override
  String get lessonsNoCoursesFilterMessage =>
      'لا توجد دورات ضمن هذا الفلتر بعد.';

  @override
  String get lessonsLoadingLessonsSemantic => 'جارٍ تحميل الدروس';

  @override
  String lessonsChapterEyebrowLabel(int number) {
    return 'الفصل $number';
  }

  @override
  String get lessonsNoLessonsTitle => 'لا توجد دروس متاحة';

  @override
  String get lessonsNoLessonsSubtitle => 'ستظهر الدروس المنشورة هنا.';

  @override
  String get lessonsLoadingLessonSemantic => 'جارٍ تحميل الدرس';

  @override
  String get lessonsLessonAppBarTitle => 'الدرس';

  @override
  String get lessonsSaveLessonComingSoonSemantic => 'حفظ الدرس (قريبًا)';

  @override
  String get lessonsWhatsInsideTitle => 'ما الذي يحتويه';

  @override
  String lessonsStepsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count خطوة',
      many: '$count خطوة',
      few: '$count خطوات',
      two: 'خطوتان',
      one: 'خطوة واحدة',
    );
    return '$_temp0';
  }

  @override
  String get lessonsNoContentTitle => 'لا يوجد محتوى بعد';

  @override
  String get lessonsNoContentSubtitle => 'سيظهر محتوى الدرس المنشور هنا.';

  @override
  String get lessonsStartPracticeButton => 'ابدأ التدريب';

  @override
  String get lessonsPracticeContextLabel => 'تدريب الدرس';

  @override
  String lessonsLessonNumberPill(int number) {
    return 'الدرس $number';
  }

  @override
  String lessonsMinutesLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count دقيقة',
      many: '$count دقيقة',
      few: '$count دقائق',
      two: 'دقيقتان',
      one: 'دقيقة واحدة',
    );
    return '$_temp0';
  }

  @override
  String lessonsBlocksCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count جزء',
      many: '$count جزءًا',
      few: '$count أجزاء',
      two: 'جزءان',
      one: 'جزء واحد',
    );
    return '$_temp0';
  }

  @override
  String lessonsXpBadge(int xp) {
    return '+$xp نقطة خبرة';
  }

  @override
  String lessonsStepTitleLabel(int number) {
    return 'الخطوة $number';
  }

  @override
  String lessonsStepSemantic(int number, String title) {
    return 'الخطوة $number: $title';
  }

  @override
  String lessonsAssetSemantic(String type, String title) {
    return 'عنصر $type: $title';
  }

  @override
  String lessonsCourseSemanticBase(String title, int percent) {
    return 'الدورة: $title، اكتمال $percent بالمئة';
  }

  @override
  String lessonsCourseSemanticWithLevel(
      String title, String level, int percent) {
    return 'الدورة: $title، المستوى $level، اكتمال $percent بالمئة';
  }

  @override
  String lessonsLessonsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count درس',
      many: '$count درسًا',
      few: '$count دروس',
      two: 'درسان',
      one: 'درس واحد',
    );
    return '$_temp0';
  }

  @override
  String lessonsLessonSemantic(String title) {
    return 'الدرس: $title';
  }

  @override
  String lessonsXpValueLabel(int xp) {
    return '$xp نقطة خبرة';
  }

  @override
  String get lessonsStartLessonSemantic => 'ابدأ الدرس';

  @override
  String lessonsChapterSemantic(String title) {
    return 'الفصل: $title';
  }

  @override
  String lessonsImageUrlMissingError(String title) {
    return 'رابط الصورة مفقود للعنصر: $title';
  }

  @override
  String lessonsImageLoadFailedError(String title) {
    return 'فشل تحميل الصورة: $title';
  }

  @override
  String lessonsNewWordsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count كلمة جديدة',
      many: '$count كلمة جديدة',
      few: '$count كلمات جديدة',
      two: 'كلمتان جديدتان',
      one: 'كلمة جديدة واحدة',
    );
    return '$_temp0';
  }

  @override
  String lessonsItemsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count عنصر',
      many: '$count عنصرًا',
      few: '$count عناصر',
      two: 'عنصران',
      one: 'عنصر واحد',
    );
    return '$_temp0';
  }

  @override
  String get lessonsPracticeQuestionsButton => 'تدرّب على الأسئلة';

  @override
  String get practiceNextQuestionButton => 'السؤال التالي';

  @override
  String get practiceSessionLoadingSemantic => 'جارٍ بدء جلسة التدريب';

  @override
  String get practiceSessionFailedMessage => 'تعذّر بدء جلسة التدريب';

  @override
  String get practiceSessionEmptyTitle => 'لا توجد أسئلة بعد';

  @override
  String get practiceSessionEmptySubtitle =>
      'لا توجد أسئلة تدريب لهذا الدرس حتى الآن. عُد لاحقًا.';

  @override
  String get practiceSessionCompleteTitle => 'اكتمل التدريب!';

  @override
  String get practiceSessionDoneButton => 'تم';

  @override
  String practiceSessionCompleteSubtitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'أجبت عن $count أسئلة. يقوم AIM بتحليل إجاباتك.',
      one: 'أجبت عن سؤال واحد. يقوم AIM بتحليل إجاباتك.',
    );
    return '$_temp0';
  }

  @override
  String get practiceSessionCompletionNotSavedMessage =>
      'تعذر حفظ تقدمك. قد يبقى الدرس التالي مقفلاً حتى يتم الحفظ — تحقق من اتصالك وحاول مرة أخرى.';

  @override
  String get practiceSessionRetrySaveButton => 'إعادة محاولة حفظ التقدم';
}
