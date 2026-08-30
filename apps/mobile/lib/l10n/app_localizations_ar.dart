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
  String get commonResume => 'استئناف';

  @override
  String get commonPause => 'إيقاف مؤقت';

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
  String get authAlreadyHaveAccount => 'لديك حساب بالفعل؟ سجّل الدخول';

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
  String get shellNavHome => 'الصفحة الرئيسية';

  @override
  String get shellNavHomeSemantic => 'تبويب الرئيسية';

  @override
  String get shellNavLearn => 'الفصول والمسار';

  @override
  String get shellNavLearnSemantic => 'تبويب التعلّم';

  @override
  String get shellNavReview => 'المراجعة';

  @override
  String get shellNavReviewSemantic => 'تبويب المراجعة';

  @override
  String get shellNavProgress => 'التحليلات والتقدم';

  @override
  String get shellNavProgressSemantic => 'تبويب التقدّم';

  @override
  String get drawerLogOut => 'تسجيل الخروج';

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
  String get shellAssessments => 'التقييمات';

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
  String get onboardingTagline => 'أكاديمية العقول الذكية';

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
  String get homeCoursePathChapterQuizLabel => 'اختبار';

  @override
  String get homeCoursePathFinalExamLabel => 'الاختبار النهائي';

  @override
  String get homeCoursePathCompletedSubtitle => 'الدورة مكتملة';

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
  String lessonsQuizzesCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count اختبار',
      many: '$count اختبارًا',
      few: '$count اختبارات',
      two: 'اختباران',
      one: 'اختبار واحد',
    );
    return '$_temp0';
  }

  @override
  String lessonsExamsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count امتحان',
      many: '$count امتحانًا',
      few: '$count امتحانات',
      two: 'امتحانان',
      one: 'امتحان واحد',
    );
    return '$_temp0';
  }

  @override
  String get lessonsFinalExamTitle => 'الامتحان النهائي';

  @override
  String get lessonsFinalExamLockedSubtitle => 'أكمل جميع الفصول لفتحه';

  @override
  String get lessonsQuizRowLabel => 'اختبار';

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
  String get lessonsPracticeLockedHint =>
      'أنهِ الدرس مع معلمك الذكي أولاً لفتح التدريب.';

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

  @override
  String get authFullNameLabel => 'الاسم الكامل';

  @override
  String get authWelcomeSubtitle =>
      'يسعدنا رؤيتك هنا مجددًا. أدخل بريدك الإلكتروني وكلمة المرور';

  @override
  String get authPasswordResetComingSoon => 'إعادة تعيين كلمة المرور — قريبًا';

  @override
  String get authRegisterSubtitle =>
      'أنشئ حسابك، يستغرق الأمر أقل من دقيقة. أدخل البريد الإلكتروني وكلمة المرور';

  @override
  String get authOrConnector => 'أو';

  @override
  String get placementGateAiAdaptive => 'تكيفي بالذكاء الاصطناعي';

  @override
  String get placementGateRetention => 'نسبة الاحتفاظ 94%';

  @override
  String get placementGateVisionTitle =>
      'معلمك الشخصي بالذكاء الاصطناعي،\nمصمم خصيصًا لك.';

  @override
  String get placementGateVisionSubtitle =>
      'مسارات تعلم تكيفية تتطور مع تقدمك — دروس واختبارات وإرشاد مصمم حول احتياجاتك.';

  @override
  String get placementGateFocusTitle => 'ما هو تركيزك\nالرئيسي؟';

  @override
  String get placementGateFocusSubtitle => 'اختر الهدف الذي يطابق هدفك الحالي.';

  @override
  String get placementGateFocusCareer => 'العمل والمهنة';

  @override
  String get placementGateFocusExams => 'الاختبارات والدراسة';

  @override
  String get placementGateFocusSpeaking => 'المحادثة اليومية';

  @override
  String get placementGateFocusMedia => 'الإعلام والثقافة';

  @override
  String get placementGateHabitTitle => 'حدد هدفك اليومي';

  @override
  String get placementGateHabitSubtitle => 'كم من الوقت ستخصصه للتعلم كل يوم؟';

  @override
  String get placementGateHabit5Min => '5 دقائق / يوميًا';

  @override
  String get placementGateHabit5MinSub => 'خفيف — ممتاز للاستمرارية اليومية';

  @override
  String get placementGateHabit15Min => '15 دقيقة / يوميًا';

  @override
  String get placementGateHabit15MinSub => 'متوازن — موصى به لمعظم المتعلمين';

  @override
  String get placementGateHabit30Min => '30 دقيقة / يوميًا';

  @override
  String get placementGateHabit30MinSub => 'مكثف — أسرع طريق للإتقان';

  @override
  String get placementGateStartTitle => 'كيف ترغب\nفي البدء؟';

  @override
  String get placementGateStartSubtitle =>
      'اختر بعناية! يمكن إجراء اختبار تحديد المستوى مرة واحدة فقط لمعايرة معلمك الذكي بدقة.';

  @override
  String get placementGateStartFromZeroTitle => 'البدء من الصفر';

  @override
  String get placementGateStartFromZeroSub =>
      'تخطَّ الاختبار وابدأ من القواعد والأساسيات البسيطة.';

  @override
  String get placementGateTestKnowledgeTitle => 'اختبار مستواي';

  @override
  String get placementGateTestKnowledgeSub =>
      'اختبر مهاراتك ليتعرف الذكاء الاصطناعي على مستواك الحقيقي.';

  @override
  String placementGateStepLabel(int current, int total) {
    return 'الخطوة $current من $total';
  }

  @override
  String get placementGateFocusCareerSub =>
      'مفردات احترافية ولغة إنجليزية للأعمال';

  @override
  String get placementGateFocusExamsSub =>
      'التحضير لاختبارات IELTS و TOEFL والدراسة الأكاديمية';

  @override
  String get placementGateFocusSpeakingSub =>
      'الطلاقة في المحادثات اليومية الحقيقية';

  @override
  String get placementGateFocusMediaSub =>
      'الأفلام، البودكاست، واللغة العامية اليومية';

  @override
  String get placementGateRecommendedBadge => 'موصى به';

  @override
  String get placementIntroSectionsLabel => 'الأقسام';

  @override
  String placementIntroSectionsValue(int count) {
    return '$count أقسام';
  }

  @override
  String get placementIntroEstimatedTimeLabel => 'الوقت المقدر';

  @override
  String placementIntroEstimatedTimeValue(int minutes) {
    return '~$minutes دقيقة';
  }

  @override
  String get placementIntroNote =>
      'يتم تحديد مستواك من قبل النظام بعد الإكمال. لا يتم حساب النتائج على جهازك مطلقًا.';

  @override
  String get placementIntroTitle => 'تحديد مستوى اللغة الإنجليزية';

  @override
  String get placementIntroSubtitle => 'فحص سريع لمعرفة مستواك الأنسب للبدء.';

  @override
  String get placementMenuRetakeTitle => 'إعادة اختبار تحديد المستوى؟';

  @override
  String get placementMenuRetakeMessage =>
      'ستظل النتيجة الحالية مسجلة، ولكن المحاولة الجديدة ستحل محلها كنتيجتك الأخيرة.';

  @override
  String get placementMenuRetakeButton => 'إعادة الاختبار';

  @override
  String get placementMenuCheckingStatusSemantic =>
      'جارٍ التحقق من حالة اختبار تحديد المستوى';

  @override
  String get placementMenuLevelBeginner => 'مبتدئ';

  @override
  String get placementMenuLevelElementary => 'أساسي';

  @override
  String get placementMenuLevelIntermediate => 'متوسط';

  @override
  String get placementMenuLevelUpperIntermediate => 'فوق المتوسط';

  @override
  String get placementMenuLevelAdvanced => 'متقدم';

  @override
  String get placementStartLoadingGuidelines =>
      'جارٍ تحميل إرشادات اختبار تحديد المستوى';

  @override
  String get placementStartStartingTest => 'جارٍ بدء اختبار تحديد المستوى';

  @override
  String get placementStartTestOverview => 'نظرة عامة على الاختبار';

  @override
  String get placementStartAssessmentTitle => 'تقييم المستوى';

  @override
  String get placementStartAssessmentSubtitle =>
      'عاير معلمك الذكي لتحديد نقطة البدء المثالية لك.';

  @override
  String placementStartLimitTitle(int minutes) {
    return '$minutes دقيقة';
  }

  @override
  String get placementStartLimitDesc =>
      'الوقت المتوقع لإجراء تقييم كامل ومعاير.';

  @override
  String placementStartQuestionsTitle(int count) {
    return '$count سؤالاً تكيفيًا';
  }

  @override
  String get placementStartQuestionsDesc =>
      'تتكيف الأسئلة ديناميكياً مع مستوى مهارتك.';

  @override
  String get placementStartCalibrationTitle => 'نصيحة مفيدة';

  @override
  String get placementStartCalibrationDesc =>
      'إذا لم تكن تعرف الإجابة، فلا بأس في تخطيها ليتكيف الذكاء الاصطناعي مع ذلك.';

  @override
  String get placementQuestionDefaultTitle => 'سؤال تحديد المستوى';

  @override
  String placementSectionHeaderTitle(int index, int total) {
    return 'القسم $index من $total';
  }

  @override
  String get placementResultLoadingSemantic => 'جارٍ تحميل نتيجتك';

  @override
  String get placementResultScoringTitle => 'جارٍ تقييم الإجابات…';

  @override
  String get placementResultScoringSubtitle =>
      'يقوم النظام بتحليل إجاباتك الآن.';

  @override
  String get placementResultScoringSemantic => 'جارٍ التقييم';

  @override
  String get placementSubmitSuccessfulTitle => 'تم التقديم بنجاح';

  @override
  String get placementSubmitEvaluatingMessage =>
      'تم رفع إجاباتك بنجاح. يقوم محرك الذكاء الاصطناعي بمعايرة مستواك.';

  @override
  String get placementResultGreatJob => 'عمل رائع! 🎉';

  @override
  String get placementResultDetectedSubtitle =>
      'تم اكتشاف مهارات قوية في الاستماع والقواعد. ابدأ من هنا للحصول على أفضل تجربة.';

  @override
  String get placementResultStartFromZeroTitle => 'البدء من الصفر (A1)';

  @override
  String get placementResultStartFromZeroSubtitle =>
      'ابنِ أساسك اللغوي من الصفر.';

  @override
  String placementResultStartFromLevelTitle(String level) {
    return 'البدء من مستوى ($level)';
  }

  @override
  String get placementResultStartFromLevelSubtitle =>
      'انتقل مباشرة إلى المسارات المتقدمة';

  @override
  String get placementResultSelectPlan => 'اختر خطتك';

  @override
  String get placementResultFreePlan => 'الخطة المجانية';

  @override
  String get placementResultFreePlanSub => 'دروس قياسية، حدود يومية';

  @override
  String get placementResultPlusPlan => 'AIM بلس';

  @override
  String get placementResultPlusPlanSub =>
      'معلم ذكاء اصطناعي غير محدود، مسارات متقدمة';

  @override
  String get placementResultUnlockCourse => 'افتح دورتي التعليمية';

  @override
  String get placementMenuHeaderTitle => 'اختبار تحديد المستوى';

  @override
  String get placementMenuNotTakenTitle =>
      'لم تقم بإجراء اختبار تحديد المستوى بعد';

  @override
  String get placementMenuNotTakenSub =>
      'اختبار تكيفي قصير يحدد مستواك المناسب لتناسبك كل الحصص.';

  @override
  String get placementMenuTakeTestBtn => 'إجراء اختبار تحديد المستوى';

  @override
  String get placementMenuInScoringTitle => 'جارٍ تقييم اختبار تحديد المستوى';

  @override
  String get placementMenuInProgressTitle =>
      'لديك اختبار تحديد مستوى قيد الإجراء';

  @override
  String get placementMenuInScoringSub =>
      'يستغرق هذا عادةً لحظات فقط. تحقق مرة أخرى قريباً.';

  @override
  String get placementMenuInProgressSub =>
      'واصل الاختبار أو ابدأ من جديد — لا يتم حفظ التقدم قسماً بقسم.';

  @override
  String get placementMenuCheckAgainBtn => 'التحقق مرة أخرى';

  @override
  String get placementMenuContinueBtn => 'متابعة اختبار تحديد المستوى';

  @override
  String get placementMenuYourLevelLabel => 'مستواك';

  @override
  String placementMenuScoreSummary(String displayName, int score) {
    return '$displayName · النتيجة الإجمالية $score / 100';
  }

  @override
  String get placementMenuViewFullResult => 'عرض النتيجة الكاملة';

  @override
  String get placementSectionBeginFinal => 'بدء القسم النهائي';

  @override
  String get placementSectionBegin => 'بدء القسم';

  @override
  String placementSectionQuestionsCount(int count) {
    return '$count أسئلة';
  }

  @override
  String placementSectionAboutMinutes(int minutes) {
    return 'حوالي $minutes دقائق';
  }

  @override
  String placementSectionProgressSemantic(int current, int total) {
    return 'القسم $current من $total';
  }

  @override
  String get placementStartHonorCodeAgreement =>
      'ببدء التقييم، فإنك توافق على ميثاق شرف التقييم الخاص بنا';

  @override
  String get placementStartBtnLabel => 'ابدأ التقييم';

  @override
  String get placementSubmitCompletedQuestions => 'الأسئلة المكتملة';

  @override
  String get placementSubmitSkippedQuestions => 'الأسئلة المتجاوزة';

  @override
  String get placementSubmitAnalyzingAnswers => 'جارٍ تحليل إجاباتك';

  @override
  String get placementSubmitCalibratingBody =>
      'يقوم الذكاء الاصطناعي بمعايرة مستواك الأنسب لضمان خطة تعليمية متوازنة.';

  @override
  String get placementQuestionLoadingSemantic => 'جارٍ تحميل السؤال';

  @override
  String get placementQuestionTimerExpiredError =>
      'انتهى الوقت — تم تسليم هذه المحاولة.';

  @override
  String get placementQuestionSubmitSpeakingError =>
      'فشل تسليم الإجابة الصوتية. يرجى المحاولة مرة أخرى.';

  @override
  String get placementQuestionSubmitAnswerError =>
      'فشل تسليم الإجابة. يرجى المحاولة مرة أخرى.';

  @override
  String get homeDailyMissionsTitle => 'المهام اليومية';

  @override
  String homeMissionsResetIn(int hours) {
    return 'تحديث خلال $hoursس';
  }

  @override
  String get homeNextUp => 'التالي';

  @override
  String get homeOverallProgress => 'التقدم العام';

  @override
  String homeStreakDaysText(int days) {
    return '$days أيام';
  }

  @override
  String get settingsTitle => 'إعدادات الحساب';

  @override
  String get settingsSaveSuccess => 'تم حفظ الملف الشخصي بنجاح!';

  @override
  String get settingsPasswordSuccess => 'تم تحديث كلمة المرور بنجاح!';

  @override
  String get settingsLogoutTitle => 'تأكيد تسجيل الخروج';

  @override
  String get settingsLogoutMessage =>
      'هل أنت متأكد من رغبتك في تسجيل الخروج من حساب AIM؟';

  @override
  String get settingsFullName => 'الاسم الكامل';

  @override
  String get settingsEmailAddress => 'البريد الإلكتروني';

  @override
  String get settingsVerifiedEmail => 'بريد مؤكد';

  @override
  String get settingsDailyCommitment => 'الالتزام اليومي بالتعلم';

  @override
  String get settingsCommitmentCasual => '5 دقائق/يوم (عادي)';

  @override
  String get settingsCommitmentRecommended => '15 دقيقة/يوم (موصى به)';

  @override
  String get settingsCommitmentIntensive => '30 دقيقة/يوم (مكثف)';

  @override
  String get settingsSaveButton => 'حفظ تغييرات الملف الشخصي';

  @override
  String get settingsSavingButton => 'جارٍ الحفظ...';

  @override
  String get settingsAppThemeHeader => 'مظهر التطبيق والعرض';

  @override
  String get settingsThemeDark => 'المظهر الداكن';

  @override
  String get settingsThemeLight => 'المظهر الفاتح';

  @override
  String get settingsThemeSubtitle =>
      'بدّل للتحويل بين الخلفية الفاتحة والداكنة';

  @override
  String get settingsNotificationsHeader => 'تفضيلات الإشعارات';

  @override
  String get settingsReminders => 'تنبيهات الدراسة اليومية';

  @override
  String get settingsRemindersSubtitle =>
      'حافظ على سلسلة تعلمك نشطة مع الإشعارات اليومية';

  @override
  String get settingsDiagnostics => 'تنبيهات تشخيص نقاط الضعف';

  @override
  String get settingsDiagnosticsSubtitle =>
      'تلقى تنبيهاً عندما يكتشف نظام AIM فجوة للمراجعة';

  @override
  String get settingsSecurityHeader => 'الأمان وكلمة المرور';

  @override
  String get settingsCurrentPassword => 'كلمة المرور الحالية';

  @override
  String get settingsNewPassword => 'كلمة المرور الجديدة';

  @override
  String get settingsUpdatePassword => 'تحديث كلمة المرور';

  @override
  String get settingsUpdatingPassword => 'جارٍ التحديث...';

  @override
  String get settingsLogoutButton => 'تسجيل الخروج من حساب AIM';

  @override
  String get voiceAiTitle => 'المحادثة الصوتية المباشرة';

  @override
  String voiceAiStep(int current) {
    return 'الخطوة $current/3';
  }

  @override
  String voiceAiAudio(String time) {
    return 'صوت $time';
  }

  @override
  String get voiceAiStatusAiSpeaking => 'المعلم الآلي يتحدث...';

  @override
  String voiceAiStatusListening(String secs) {
    return 'يستمع لصوتك (00:$secs)';
  }

  @override
  String get voiceAiStatusEvaluating => 'المعلم الآلي يقيم النطق...';

  @override
  String get voiceAiFinishHint => 'انقر على الميكروفون عند الانتهاء من التحدث';

  @override
  String get voiceAiStartHint => 'انقر على الميكروفون للمقاطعة أو التحدث';

  @override
  String get voiceAiCompletedBadge => 'تم إكمال الجلسة الصوتية المباشرة!';

  @override
  String get voiceAiMasteredTitle => 'تم إتقان الدرس!';

  @override
  String voiceAiCompletedSubtitle(String title) {
    return 'لقد أكملت درس الصوت المباشر لـ \"$title\".';
  }

  @override
  String get voiceAiXpEarned => 'نقاط الخبرة المكتسبة';

  @override
  String get voiceAiAccuracy => 'دقة النطق';

  @override
  String get voiceAiAccuracyScore => 'دقة 98%';

  @override
  String get voiceAiReturnButton => 'العودة لتفاصيل الدرس';

  @override
  String get lessonsCourseOverviewHeader => 'نظرة عامة على الدورة';

  @override
  String get lessonsCourseProgressHeader => 'تقدم الدورة';

  @override
  String get lessonsCourseChaptersHeader => 'فصول الدورة';

  @override
  String get lessonsNextUpLockedCourse => 'التالي · دورة مقفلة';

  @override
  String get lessonsNextCourseLevel => 'مستوى الدورة التالي';

  @override
  String get lessonsUnlockCourseCondition =>
      'تُفتح تلقائياً بمجرد إكمال جميع فصول هذه الدورة.';

  @override
  String lessonsUnlockNextCourseCondition(String activeCourse) {
    return 'تُفتح تلقائياً بمجرد إكمال جميع فصول $activeCourse.';
  }

  @override
  String get lessonsLearningPathHeader => 'المسار التعليمي';

  @override
  String get lessonsStructuredCurriculumHeader => 'المنهج الدراسي المنظم';

  @override
  String get lessonsPersonalizedSequenceSubtitle =>
      'اتبع تسلسلك المخصص من مستوى المبتدئ إلى الإتقان المتقدم وفق الإطار الأوروبي المشترك.';

  @override
  String get lessonsKeyVocabularyHeader => 'المفردات والعبارات الرئيسية';

  @override
  String get lessonsTapToListenHeader => 'اضغط 🔊 للاستماع';

  @override
  String get lessonsAskAiTutorHeader => 'اسأل معلم الذكاء الاصطناعي';

  @override
  String get lessonsAskAiTutorSubtitle =>
      'تحدث مع معلم الذكاء الاصطناعي لتوضيح القواعد أو طرح الأسئلة.';

  @override
  String get lessonsPracticeNowHeader => 'تمرن الآن';

  @override
  String get lessonsPracticeNowSubtitle =>
      'عزز معلوماتك أو تدرب بتمارين سريعة.';

  @override
  String get lessonsQuizHeader => 'اختبار قصير';

  @override
  String get lessonsQuizSubtitle => 'اختبر استيعابك بتمارين تفاعلية سريعة.';

  @override
  String get lessonsLessonMasteredTitle => 'تم إتقان الدرس! 🌟';

  @override
  String get lessonsLessonMasteredSnackbar => 'تم تسجيل الدرس كمكتمل! 🌟';

  @override
  String lessonsMarkCompleteFailed(String error) {
    return 'تعذر تسجيل الدرس كمكتمل: $error';
  }

  @override
  String get lessonsInThisChapterHeader => 'الدروس في هذا الفصل';

  @override
  String get lessonsChapterQuizHeader => 'اختبار الفصل';

  @override
  String get lessonsPassedStatus => 'ناجح';

  @override
  String get lessonsLockedStatus => 'مقفل';

  @override
  String lessonsTotalLessonsCount(int chaptersCount, int totalLessons) {
    return '$chaptersCount فصول · $totalLessons إجمالي الدروس';
  }

  @override
  String get progressTitle => 'التقدم والتحليلات';

  @override
  String get progressSubtitle => 'تتبع كفاءتك اللغوية وإحصاءات دراستك';

  @override
  String get progressWeeklyActivity => 'النشاط الأسبوعي';

  @override
  String progressDailyAverageMins(int minutes) {
    return 'متوسط $minutes دقيقة / يومياً';
  }

  @override
  String progressTotalMins(int minutes) {
    return 'إجمالي $minutes دقيقة';
  }

  @override
  String progressTrackedSkillsHeader(int count) {
    return 'المهارات المتابعة ($count)';
  }

  @override
  String progressReviewScheduleHeader(int count) {
    return 'جدول المراجعة ($count)';
  }

  @override
  String progressWeaknessRecordsHeader(int count) {
    return 'سجلات نقاط الضعف ($count)';
  }

  @override
  String get progressWeakSpotIdentified =>
      'تم تحديد نقطة ضعف من الإجابات الأخيرة.';

  @override
  String get progressNoWeaknesses => 'لا توجد نقاط ضعف مسجلة حالياً! عمل رائع!';

  @override
  String get progressViewAll => 'عرض الكل ←';

  @override
  String get progressViewFullSchedule => 'عرض الجدول الكامل ←';

  @override
  String get progressViewFullTable => 'عرض الجدول الكامل ←';

  @override
  String progressPriorityLabel(String severity) {
    return 'أولوية $severity';
  }

  @override
  String progressIntervalAndRep(int interval, int rep) {
    return 'الفاصل: $interval يوم · التكرار #$rep';
  }

  @override
  String get progressSkillStatesTitle => 'حالات المهارات';

  @override
  String progressConfidencePct(int percent) {
    return 'مستوى الثقة $percent%';
  }

  @override
  String progressDueAt(String date) {
    return 'تاريخ الاستحقاق: $date';
  }

  @override
  String progressDetectedAt(String date) {
    return 'تاريخ الاكتشاف: $date';
  }

  @override
  String progressResolvedAt(String date) {
    return 'تاريخ المعالجة: $date';
  }

  @override
  String progressExpiresAt(String date) {
    return 'تاريخ الانتهاء: $date';
  }

  @override
  String progressGeneratedAt(String date) {
    return 'تاريخ الإنشاء: $date';
  }

  @override
  String progressTargetLesson(String lessonId) {
    return 'الدرس: $lessonId';
  }

  @override
  String progressRankBadge(int rank) {
    return '#$rank';
  }

  @override
  String get billingTitle => 'الاشتراك والفوترة';

  @override
  String get billingSubscription => 'الاشتراك';

  @override
  String get billingCurrentPlan => 'الخطة الحالية';

  @override
  String get billingChangePlan => 'تغيير الخطة';

  @override
  String get billingCancelSubscription => 'إلغاء الاشتراك';

  @override
  String get billingCancelSubscriptionDialogTitle => 'هل تريد إلغاء الاشتراك؟';

  @override
  String get billingCancelSubscriptionDialogMessage =>
      'سيظل اشتراكك نشطاً حتى نهاية فترة الفاتورة الحالية.';

  @override
  String get billingKeepSubscription => 'الاحتفاظ بالاشتراك';

  @override
  String get billingPlansAndPricing => 'الخطط والأسعار';

  @override
  String get billingInvoices => 'الفواتير';

  @override
  String get billingInvoiceDetail => 'تفاصيل الفاتورة';

  @override
  String get billingNoEntitlements => 'لا توجد صلاحيات مفعّلة حالياً.';

  @override
  String get billingTermsAgreement => 'بالمتابعة فإنك توافق على شروط AIM';

  @override
  String get billingCheckout => 'الدفع';

  @override
  String get billingPaymentPending => 'الدفع قيد الانتظار';

  @override
  String get billingPaymentSuccessful => 'تم الدفع بنجاح!';

  @override
  String get billingPaymentFailed => 'فشلت عملية الدفع';

  @override
  String get billingPaymentVerifying => 'يرجى الانتظار بينما نتحقق من دفعتك.';

  @override
  String get billingPaymentFailedMessage =>
      'تعذر معالجة دفعتك. يرجى المحاولة مرة أخرى.';

  @override
  String get billingPaymentProcessingMessage =>
      'جاري معالجة دفعتك. سنخبرك بمجرد اكتمالها.';

  @override
  String get billingGoBack => 'الرجوع';

  @override
  String billingQuantity(int quantity) {
    return 'الكمية: $quantity';
  }

  @override
  String get billingPopularBadge => 'الأكثر شيوعاً';

  @override
  String get supportHelpCenter => 'مركز المساعدة';

  @override
  String get supportNewTicket => 'تذكرة جديدة';

  @override
  String get supportMyTickets => 'تذاكري';

  @override
  String get supportTicket => 'تذكرة';

  @override
  String get supportParentHelp => 'مساعدة أولياء الأمور';

  @override
  String get supportParentTickets => 'تذاكر أولياء الأمور';

  @override
  String get supportFeedback => 'إرسال الملاحظات';

  @override
  String get supportRateAimQuestion => 'كيف تقيّم تطبيق AIM؟';

  @override
  String get supportReleaseNotes => 'ملاحظات الإصدار';

  @override
  String get supportReleaseNote => 'ملاحظة الإصدار';

  @override
  String supportReleasedDate(String date) {
    return 'تاريخ الإصدار $date';
  }

  @override
  String get supportSystemStatus => 'حالة النظام';

  @override
  String get supportWhatNew => 'ما الجديد';

  @override
  String get supportNoTickets => 'لا توجد تذاكر بعد';

  @override
  String get supportNoTicketsSubtitle =>
      'أنشئ تذكرة للحصول على مساعدة من فريق الدعم لدينا.';

  @override
  String get supportNoReleaseNotes => 'لا توجد ملاحظات إصدار';

  @override
  String get supportNoReleaseNotesSubtitle =>
      'ستظهر ملاحظات الإصدار هنا عند نشرها.';

  @override
  String get supportReleaseNoteNotAvailable => 'ملاحظة الإصدار غير متاحة بعد';

  @override
  String get supportReleaseNoteNotAvailableSubtitle =>
      'ستظهر ملاحظة الإصدار هذه هنا بمجرد إطلاق ملاحظات الإصدار.';

  @override
  String get practicePracticeSession => 'جلسة تدريب';

  @override
  String get practicePracticeComplete => 'اكتمل التدريب!';

  @override
  String get practiceGreatJob => 'عمل رائع!';

  @override
  String get practiceAccuracy => 'الدقة';

  @override
  String get practiceXpEarned => 'نقاط XP المكتسبة';

  @override
  String get practiceCheckAnswer => 'تحقق من الإجابة';

  @override
  String get practiceContinueToLesson => 'متابعة إلى الدرس';

  @override
  String practiceQuestionOf(int current, int total) {
    return 'السؤال $current من $total';
  }

  @override
  String practiceSessionCompletedMsg(String lessonTitle) {
    return 'أكملت جلسة التدريب لـ $lessonTitle.';
  }

  @override
  String practiceScoreSummary(int score, int total) {
    return 'حصلت على $score/$total في جلسة التدريب هذه.';
  }

  @override
  String get practicePlacementRequiredTitle => 'مطلوب اختبار تحديد المستوى';

  @override
  String get practicePlacementRequiredBody =>
      'يجب إكمال اختبار تحديد المستوى أولاً لتحديد مستواك المرجعي وبدء الجلسات التعليمية.';

  @override
  String get practiceTakePlacementNow => 'إجراء اختبار تحديد المستوى الآن';

  @override
  String get practiceTryDemoExercises => 'ممارسة التمارين تجريبياً';

  @override
  String get qaAnswerSubmitted => 'تم إرسال الإجابة';

  @override
  String get qaAnalysingResponse => 'يقوم AIM بتحليل إجابتك.';

  @override
  String get qaAnalysingSession => 'يقوم AIM بتحليل جلستك…';

  @override
  String get qaSessionSummary => 'ملخص الجلسة';

  @override
  String get qaSkillsCovered => 'المهارات المغطاة';

  @override
  String get assessmentAssessments => 'التقييمات';

  @override
  String get assessmentDeadlines => 'المواعيد النهائية';

  @override
  String get assessmentBreakdown => 'تفاصيل النقاط';

  @override
  String get assessmentPastResults => 'النتائج السابقة';

  @override
  String get assessmentResultHistory => 'سجل النتائج';

  @override
  String get assessmentSections => 'الأقسام';

  @override
  String get assessmentViewAttemptHistory => 'عرض سجل محاولاتك';

  @override
  String assessmentGradedDate(String date) {
    return 'تم التقييم في $date';
  }

  @override
  String get assessmentLatePenalty => 'تم تطبيق خصم التأخير';

  @override
  String get assessmentReadyToBegin => 'جاهز للبدء؟';

  @override
  String get assessmentSubmitAnswersDialogTitle => 'هل تريد تسليم إجاباتك؟';

  @override
  String get assessmentSubmitAnswersDialogMessage =>
      'هذا الإجراء نهائي ولا يمكن التراجع عنه. لا يمكنك تغيير الإجابات بعد التسليم.';

  @override
  String get placementYourResponse => 'إجابتك';

  @override
  String get placementTargetSentences => 'الهدف: 3-5 جمل';

  @override
  String placementCharactersCount(int count) {
    return '$count حرف';
  }

  @override
  String get placementPressHoldToRecord =>
      'اضغط مع الاستمرار على الميكروفون للتسجيل';

  @override
  String get placementReleaseWhenFinished => 'اترك الزر عند الانتهاء';

  @override
  String get placementRecordingInProgress => 'جاري التسجيل...';

  @override
  String get placementRecordingCompleted => 'اكتمل التسجيل!';

  @override
  String get placementTapSubmitRecording =>
      'اضغط على تسليم بالأسفل لإرسال تسجيلك.';

  @override
  String get placementAiEngineActive => 'محرك الذكاء الاصطناعي نشط';

  @override
  String get placementResultsRecordedSaved =>
      'تم تسجيل نتائج اختبار تحديد المستوى وحفظها بنجاح.';

  @override
  String get reviewsTitle => 'المراجعة';

  @override
  String get reviewsLoadingSemantic => 'جارٍ تحميل جدول المراجعة';

  @override
  String get reviewsNoScheduleTitle => 'لا توجد مراجعات مجدولة';

  @override
  String get reviewsNoScheduleSubtitle =>
      'أكمل جلسات التدريب لتلقي تذكيرات المراجعة.';

  @override
  String get reviewsStatDueNow => 'مستحقة الآن';

  @override
  String get reviewsStatLearned => 'تم تعلمها';

  @override
  String get reviewsStatStreak => 'التتابع';

  @override
  String get reviewsDueToday => 'مستحقة اليوم';

  @override
  String get reviewsDueTomorrow => 'مستحقة غدًا';

  @override
  String get reviewsDueYesterday => 'مستحقة أمس';

  @override
  String reviewsDueInDays(int days) {
    return 'مستحقة خلال $days أيام';
  }

  @override
  String reviewsDueDaysAgo(int days) {
    return 'مستحقة منذ $days أيام';
  }

  @override
  String reviewsDueDate(String date) {
    return 'مستحقة $date';
  }

  @override
  String get reviewsStatusDue => 'مستحقة';

  @override
  String get reviewsStatusPending => 'في الانتظار';

  @override
  String get reviewsSpacedRepetitionDue =>
      'بطاقات التكرار المتباعد المستحقة اليوم';

  @override
  String get reviewsScheduleHeader => 'جدول المراجعة';

  @override
  String get reviewsStartSession => 'بدء جلسة المراجعة';

  @override
  String reviewsIntervalDays(String days) {
    return 'الفاصل $days يوم';
  }

  @override
  String reviewsRepetitionNumber(int rep) {
    return 'تكرار #$rep';
  }

  @override
  String get voiceTeacherPageTitle => 'المعلم الصوتي';

  @override
  String get voiceTeacherPageSubtitle =>
      'مارس نطقك ومحادثتك مع معلم الذكاء الاصطناعي';

  @override
  String get voiceTeacherConnectionErrorTitle => 'خطأ في الاتصال';

  @override
  String get voiceTeacherMicrophoneErrorTitle => 'خطأ في الميكروفون';

  @override
  String get voiceTeacherServerErrorTitle => 'خطأ في الخادم';

  @override
  String get voiceTeacherGenericErrorTitle => 'حدث خطأ';

  @override
  String get voiceTeacherConnectionErrorMsg =>
      'تعذر الاتصال بخادم الصوت. يرجى التحقق من اتصال الإنترنت.';

  @override
  String get voiceTeacherMicrophoneErrorMsg =>
      'تعذر الوصول للميكروفون. يرجى منح الإذن في الإعدادات.';

  @override
  String get voiceTeacherServerErrorMsg =>
      'واجهت خدمة الصوت خطأ في الخادم. يرجى المحاولة لاحقاً.';

  @override
  String get voiceTeacherGenericErrorMsg =>
      'حدث خطأ غير متوقع أثناء الجلسة الصوتية.';

  @override
  String get voiceTeacherTextResponseTitle => 'رد نصي من المعلم';

  @override
  String get voiceTeacherRetryAudio => 'إعادة تحميل الصوت';

  @override
  String get voiceTeacherTryAgain => 'إعادة المحاولة';

  @override
  String get voiceTeacherProcessing => 'جارٍ المعالجة...';

  @override
  String get voiceTeacherTranscribing => 'جارٍ التحويل...';

  @override
  String get voiceTeacherWhatYouSaid => 'ما قلته';

  @override
  String get voiceTeacherTeacherResponse => 'رد المعلم';

  @override
  String get voiceTeacherRecorded => 'تم التسجيل';

  @override
  String get voiceTeacherAudioUnavailable => 'لم يتوفر الصوت — إليك الرد النصي';

  @override
  String get voiceTeacherStop => 'إيقاف';

  @override
  String get voiceTeacherDiscard => 'حذف';

  @override
  String get voiceTeacherSend => 'إرسال';

  @override
  String get voiceTeacherHelpful => 'مفيد';

  @override
  String get voiceTeacherNotHelpful => 'غير مفيد';

  @override
  String get aiTeacherConversations => 'المحادثات';

  @override
  String get aiTeacherSettingsTitle => 'إعدادات معلم الذكاء الاصطناعي';

  @override
  String get aiTeacherCurrentLessonHeader => 'الدرس الحالي';

  @override
  String get aiTeacherWasThisHelpful => 'هل كان هذا مفيداً؟';

  @override
  String get aiTeacherWelcomeBack => 'مرحباً بعودتك';

  @override
  String get aiTeacherAskQuestionsGuidance =>
      'اطرح الأسئلة واحصل على إرشادات حول هذا الدرس.';

  @override
  String get profileAimPlusMember => 'عضوية AIM PLUS';

  @override
  String get profileLearningGapsAlerts =>
      'تنبيهات عند اكتشاف فجوات تعليمية جديدة بالذكاء الاصطناعي';

  @override
  String get profileStudyTimeNotification =>
      'تلقي الإشعارات في وقت دراستك المفضل';

  @override
  String get profileSecurityPassword => 'الأمان وكلمة المرور';

  @override
  String get profilePasswordResetSuccess =>
      'تم إرسال بريد إعادة تعيين كلمة المرور. يرجى التحقق من صندوق الوارد.';

  @override
  String profilePasswordResetFailed(String error) {
    return 'فشل طلب إعادة تعيين كلمة المرور: $error';
  }

  @override
  String profileSaveFailed(String error) {
    return 'فشل حفظ تغييرات الملف الشخصي: $error';
  }

  @override
  String get profileNoProfileLoaded => 'لم يتم تحميل الملف الشخصي.';

  @override
  String get notificationsChannels => 'القنوات';

  @override
  String get notificationsQuietHours => 'ساعات الهدوء';

  @override
  String get notificationsManageReminders => 'إدارة تذكيرات الدروس';

  @override
  String get notificationsDismissed => 'تم تجاهل هذا الإشعار.';

  @override
  String get notificationsPause => 'إيقاف مؤقت';

  @override
  String get notificationsResume => 'استئناف';

  @override
  String get authHappyToSeeYou =>
      'سعداء برؤيتك مجدداً. أدخل بريدك الإلكتروني وكلمة المرور للمتابعة.';

  @override
  String get authSignInToAccount => 'تسجيل الدخول إلى حسابك';

  @override
  String get authTakesLessThanMinute =>
      'يستغرق أقل من دقيقة. أدخل بياناتك أدناه.';

  @override
  String get authCheckEmailTitle => 'تحقق من بريدك الإلكتروني';

  @override
  String authSentConfirmationLink(String email) {
    return 'أرسلنا رابط تأكيد إلى:\n$email';
  }

  @override
  String get authBackToLogin => 'العودة لتسجيل الدخول';

  @override
  String get authDevTestAccounts => 'حسابات التطوير والاختبار';

  @override
  String get authQuickLoginWithTest => 'تسجيل دخول سريع ببيانات اختبار:';

  @override
  String get shellLogOut => 'تسجيل الخروج';

  @override
  String get profileTitle => 'الملف الشخصي';

  @override
  String get profileLoadingProfile => 'جارٍ تحميل الملف الشخصي';

  @override
  String profileCouldNotLoad(String message) {
    return 'تعذّر تحميل الملف الشخصي: $message';
  }

  @override
  String get profileSectionAccount => 'الحساب';

  @override
  String get profileLabelEmail => 'البريد الإلكتروني';

  @override
  String get profileLabelStatus => 'الحالة';

  @override
  String get profileLabelType => 'النوع';

  @override
  String get profileSectionProfile => 'الملف الشخصي';

  @override
  String get profileLabelDisplayName => 'الاسم المعروض';

  @override
  String get profileLabelLanguage => 'اللغة';

  @override
  String get profileLabelTimezone => 'المنطقة الزمنية';

  @override
  String get profileSectionRoles => 'الأدوار';

  @override
  String get profileRolesSubtitle => 'للعرض فقط. يُطبَّق من الخادم.';

  @override
  String get profileSectionQuickLinks => 'روابط سريعة';

  @override
  String get profileLinkLearningPath => 'مسار التعلّم';

  @override
  String get profileLinkSubscriptionBilling => 'الاشتراك والفوترة';

  @override
  String get profileLinkInvoiceHistory => 'سجل الفواتير';

  @override
  String get profileLinkAchievements => 'الإنجازات';

  @override
  String get profileLinkAnalyticsSummary => 'ملخص التحليلات';

  @override
  String get profileLinkApiEndpointTester => 'اختبار نقاط الوصول (مطوّر)';

  @override
  String get profileStatDayStreak => 'أيام متتالية';

  @override
  String get profileStatAchievements => 'إنجازات';

  @override
  String get profileTooltipAccountSettings => 'إعدادات الحساب';

  @override
  String get profileAchievementsCarouselTitle => 'الإنجازات';

  @override
  String get editProfileTitle => 'تعديل الملف الشخصي';

  @override
  String get editProfileSave => 'حفظ';

  @override
  String get editProfileBack => 'رجوع';

  @override
  String get editProfileLabelDisplayName => 'الاسم المعروض';

  @override
  String get editProfilePlaceholderDisplayName => 'اسمك المعروض';

  @override
  String get editProfileLabelPreferredLanguage => 'اللغة المفضّلة';

  @override
  String get editProfilePlaceholderLanguage => 'اختر لغة';

  @override
  String get editProfileLabelTimezone => 'المنطقة الزمنية';

  @override
  String get editProfilePlaceholderTimezone => 'اختر منطقة زمنية';

  @override
  String get editProfileSaveChanges => 'حفظ التغييرات';

  @override
  String get editProfileDisplayNameTooLong =>
      'يجب ألّا يتجاوز الاسم المعروض 80 حرفاً.';

  @override
  String get editProfileSessionExpired =>
      'انتهت جلستك. يرجى تسجيل الدخول مجدداً.';

  @override
  String get editProfileUpdatedSuccess => 'تم تحديث الملف الشخصي.';

  @override
  String get settingsAppThemeDisplay => 'مظهر التطبيق والعرض';

  @override
  String get settingsThemeDarkSubtitle => 'واجهة داكنة للاستخدام الليلي';

  @override
  String get settingsThemeLightSubtitle => 'مظهر نظيف عالي التباين';

  @override
  String get settingsNotificationPreferences => 'تفضيلات الإشعارات';

  @override
  String get settingsEnterFullName => 'أدخل اسمك الكامل';

  @override
  String get achievementsTitle => 'الإنجازات';

  @override
  String get achievementsMilestonesTitle => 'إنجازات AIM';

  @override
  String achievementsBadgesUnlocked(int unlocked, int total) {
    return '$unlocked من $total شارة مفتوحة';
  }

  @override
  String get achievementsLeagueRank => 'الدوري الذهبي #3';

  @override
  String get achievementsTabAll => 'جميع الشارات';

  @override
  String achievementsTabUnlocked(int count) {
    return 'مفتوحة ($count)';
  }

  @override
  String achievementsTabInProgress(int count) {
    return 'قيد التقدم ($count)';
  }

  @override
  String get achievementsBadgeUnlocked => 'مفتوح';

  @override
  String get achievementsFirstStepTitle => 'الخطوة الأولى';

  @override
  String get achievementsFirstStepDesc => 'أكمل أول درس إنجليزي لك';

  @override
  String get achievementsStreakMasterTitle => 'خبير المتابعة';

  @override
  String get achievementsStreakMasterDesc => 'حافظ على سلسلة تعلّم لمدة ٧ أيام';

  @override
  String get achievementsGrammarWizardTitle => 'ساحر القواعد';

  @override
  String get achievementsGrammarWizardDesc => 'احصل على ٩٠٪+ في تقييم القواعد';

  @override
  String get achievementsVoiceChampionTitle => 'بطل الصوت';

  @override
  String get achievementsVoiceChampionDesc =>
      'أكمل ٥ جلسات تدريب صوتي مباشر مع الذكاء الاصطناعي';

  @override
  String get achievementsVocabularyTitanTitle => 'عملاق المفردات';

  @override
  String get achievementsVocabularyTitanDesc => 'أتقن أكثر من ٢٠٠ كلمة نشطة';

  @override
  String get achievementsSpeedLearnerTitle => 'المتعلم السريع';

  @override
  String get achievementsSpeedLearnerDesc => 'أنهِ ٣ دروس في يوم واحد';

  @override
  String get achievementsPerfectQuizTitle => 'دقة الاختبار المثالية';

  @override
  String get achievementsPerfectQuizDesc =>
      'احصل على ١٠٠٪ في ٥ اختبارات تدريبية';

  @override
  String get achievementsPolyglotLegendTitle => 'أسطورة اللغات';

  @override
  String get achievementsPolyglotLegendDesc =>
      'وصول المستوى ٢٠ في اللغة الإنجليزية';

  @override
  String get supportCreateTicketTitle => 'إرسال تذكرة دعم';

  @override
  String get supportCreateTicketButton => 'إنشاء تذكرة';

  @override
  String get supportSubmitTicket => 'إرسال التذكرة';

  @override
  String get supportCategoryLabel => 'الفئة';

  @override
  String get supportSeverityLabel => 'مستوى الأهمية';

  @override
  String get supportSubjectLabel => 'الموضوع';

  @override
  String get supportSubjectPlaceholder => 'صف المشكلة بإيجاز';

  @override
  String get supportDescriptionLabel => 'الوصف';

  @override
  String get supportDescriptionPlaceholder => 'أخبرنا بما حدث، خطوة بخطوة...';

  @override
  String get supportSubjectRequired => 'الموضوع مطلوب';

  @override
  String get supportDescriptionRequired => 'الوصف مطلوب';

  @override
  String get supportCategoryBugReport => 'إبلاغ عن خطأ';

  @override
  String get supportCategoryAccountIssue => 'مشكلة في الحساب';

  @override
  String get supportCategoryLearningIssue => 'مشكلة في التعلم';

  @override
  String get supportCategoryBillingIssue => 'مشكلة في الفوترة';

  @override
  String get supportCategoryGeneral => 'عام';

  @override
  String get supportCategorySuggestion => 'اقتراح';

  @override
  String get supportCategoryCompliment => 'إشادة';

  @override
  String get supportCategoryComplaint => 'شكوى';

  @override
  String get supportCategoryOther => 'أخرى';

  @override
  String get supportSeverityLow => 'منخفض';

  @override
  String get supportSeverityMedium => 'متوسط';

  @override
  String get supportSeverityHigh => 'مرتفع';

  @override
  String get supportSeverityCritical => 'حرج';

  @override
  String get supportFeedbackTitleLabel => 'العنوان';

  @override
  String get supportFeedbackTitlePlaceholder => 'ملخص قصير';

  @override
  String get supportFeedbackBodyLabel => 'ملاحظاتك';

  @override
  String get supportFeedbackBodyPlaceholder => 'أخبرنا برأيك...';

  @override
  String get supportFeedbackTitleRequired => 'العنوان مطلوب';

  @override
  String get supportFeedbackBodyRequired => 'تفاصيل الملاحظات مطلوبة';

  @override
  String get supportTicketAddComment => 'إضافة تعليق';

  @override
  String get supportTicketCommentPlaceholder => 'اكتب رسالة متابعة...';

  @override
  String get supportTicketSendComment => 'إرسال';

  @override
  String get supportStatusAllOperational => 'جميع الأنظمة تعمل بكفاءة';

  @override
  String get supportStatusNoComponents => 'لا توجد مكونات مسجلة';

  @override
  String get supportStatusNothingToShow => 'لا يوجد شيء لعرضه بعد.';

  @override
  String get supportNoParentTickets => 'لا توجد تذاكر دعم';

  @override
  String get supportNoParentTicketsSubtitle =>
      'أنشئ تذكرة إذا كنت بحاجة إلى مساعدة في حسابك.';

  @override
  String get coursesCurrentBadge => 'الحالي';

  @override
  String get voiceTeacherTitle => 'المعلم الصوتي';

  @override
  String get voiceTeacherStartingSession => 'بدء جلسة المعلم الصوتي';

  @override
  String get voiceTeacherBackSemantic => 'رجوع';

  @override
  String get voiceTeacherStatusSpeaking => 'يتحدث';

  @override
  String get voiceTeacherStatusRecording => 'تسجيل';

  @override
  String get voiceTeacherStatusProcessing => 'معالجة';

  @override
  String get voiceTeacherStatusReady => 'جاهز';

  @override
  String get voiceTeacherHeadingSpeaking => 'معلمك يتحدث الآن…';

  @override
  String get voiceTeacherHeadingRecording => 'أستمع إليك الآن…';

  @override
  String get voiceTeacherHeadingProcessing => 'جارٍ معالجة إجابتك…';

  @override
  String get voiceTeacherHeadingListening => 'دورك الآن — اضغط مطولاً للتحدث';

  @override
  String get voiceTeacherPracticeSubtitle => 'مارس نطقك مع المعلم الذكي';

  @override
  String get voiceTeacherMessagesButton => 'الرسائل';

  @override
  String get voiceTeacherBackToCall => 'العودة للمكالمة';

  @override
  String voiceTeacherStatusSemantic(String status) {
    return 'الحالة: $status';
  }

  @override
  String get voiceTeacherPressAndHold => 'اضغط مع الاستمرار للتحدث';

  @override
  String get voiceTeacherRecordingRelease => 'جارٍ التسجيل — حرر للإرسال';

  @override
  String voiceTeacherSaid(String text) {
    return 'قال المعلم الصوتي: $text';
  }

  @override
  String voiceTeacherYouSaid(String text) {
    return 'أنت قلت: $text';
  }

  @override
  String get voiceTeacherEntryTitle => 'المعلم الصوتي';

  @override
  String get voiceTeacherEntrySubtitle =>
      'مارس المحادثة الشفهية مع الذكاء الاصطناعي';

  @override
  String get billingPromoCodeLabel => 'رمز ترويجي (اختياري)';

  @override
  String get billingPromoCodePlaceholder => 'أدخل الرمز';

  @override
  String get billingProceedToPayment => 'المتابعة إلى الدفع';

  @override
  String get billingNoInvoicesTitle => 'لا توجد فواتير بعد';

  @override
  String get billingNoInvoicesSubtitle =>
      'ستظهر فواتيرك هنا بعد أول عملية دفع.';

  @override
  String get billingNoPlansAvailable => 'لا توجد باقات متاحة';

  @override
  String get billingCheckBackLaterPlans =>
      'يرجى التحقق لاحقاً من الباقات المتاحة.';

  @override
  String get billingSubscribe => 'اشتراك';

  @override
  String get assessmentsNoAssessmentsTitle => 'لا توجد تقييمات متاحة';

  @override
  String get assessmentsNoAssessmentsSubtitle =>
      'ستظهر الاختبارات والتقييمات المنشورة هنا.';

  @override
  String get assessmentsStatQuestions => 'الأسئلة';

  @override
  String get assessmentsStatTimeLimit => 'الوقت المحدد';

  @override
  String get assessmentsStatMaxAttempts => 'أقصى عدد محاولات';

  @override
  String get assessmentsStartAttempt => 'بدء المحاولة';

  @override
  String get assessmentsStartAttemptTitle => 'بدء المحاولة';

  @override
  String get assessmentsGoBack => 'الرجوع';

  @override
  String get assessmentsSubmit => 'تسليم';

  @override
  String get assessmentsDone => 'تم';

  @override
  String get assessmentsNoResultsTitle => 'لا توجد نتائج بعد';

  @override
  String get assessmentsNoResultsSubtitle =>
      'ستظهر نتائج محاولاتك السابقة هنا.';

  @override
  String get assessmentsDeadlinesTitle => 'الموعد النهائي';

  @override
  String get assessmentsNoDeadlinesTitle => 'لا توجد مواعيد نهائية';

  @override
  String get assessmentsNoDeadlinesSubtitle =>
      'ستظهر مواعيد تقييماتك النهائية هنا.';

  @override
  String get assessmentsTabActive => 'النشطة';

  @override
  String get assessmentsTabUpcoming => 'القادمة';

  @override
  String get assessmentsTabLate => 'المتأخرة';

  @override
  String get assessmentsTabMissed => 'الفائتة';

  @override
  String get assessmentsTabClosed => 'المغلقة';

  @override
  String get assessmentsOpensLabel => 'يفتح';

  @override
  String get assessmentsClosesLabel => 'يغلق';

  @override
  String get assessmentsExtendedCloseLabel => 'تمديد الإغلاق';

  @override
  String get assessmentsTypeAnswerPlaceholder => 'اكتب إجابتك هنا…';

  @override
  String get assessmentsYourAnswerLabel => 'إجابتك';

  @override
  String get assessmentsQuestionsEmptyTitle => 'الأسئلة';

  @override
  String get assessmentsQuestionsEmptySubtitle =>
      'لم يتم العثور على أسئلة لهذه المحاولة.';

  @override
  String get notificationsNoNotificationsTitle => 'لا توجد إشعارات بعد';

  @override
  String get notificationsNoNotificationsSubtitle =>
      'ستظهر تذكيرات الجلسات وتحديثات التقدم هنا.';

  @override
  String get assessmentsStatusCompleted => 'مكتمل';

  @override
  String get notificationsDismiss => 'تجاهل';

  @override
  String get notificationsDismissedTitle => 'تم التجاهل';

  @override
  String get notificationsEnableQuietHours => 'تفعيل ساعات الهدوء';

  @override
  String get notificationsSaveQuietHours => 'حفظ ساعات الهدوء';

  @override
  String get notificationsNoRemindersTitle => 'لا توجد تذكيرات بعد';

  @override
  String get notificationsNoRemindersSubtitle =>
      'ستظهر التذكيرات التي تفعلها هنا.';

  @override
  String get notificationsCancelReminder => 'إلغاء';

  @override
  String get notificationsUnread => 'غير مقروء';

  @override
  String get progressAvgMastery => 'متوسط الإتقان';

  @override
  String get progressDayStreak => 'أيام التتابع';

  @override
  String get progressSkillStates => 'حالات المهارات';

  @override
  String get progressWeaknesses => 'نقاط الضعف';

  @override
  String get progressRecommendations => 'التوصيات';

  @override
  String get progressReviewSchedule => 'جدول المراجعة';

  @override
  String get progressFocusAreas => 'مجالات التركيز';

  @override
  String get progressNoProgressData => 'لا توجد بيانات تقدم بعد';

  @override
  String get progressNoSkillData => 'لا توجد بيانات مهارات بعد';

  @override
  String get progressNoFocusAreas => 'لا توجد مجالات تركيز بعد';

  @override
  String get progressNoRecommendations => 'لا توجد توصيات بعد';

  @override
  String get progressStatusStrong => 'قوي';

  @override
  String get progressStatusDeveloping => 'قيد التطوير';

  @override
  String get progressStatusNeedsWork => 'يحتاج تدريباً';

  @override
  String get progressTrendImproving => 'في تحسن';

  @override
  String get progressTrendDeclining => 'في تراجع';

  @override
  String get progressTrendStable => 'مستقر';

  @override
  String get progressTrendInsufficient => 'بيانات غير كافية';

  @override
  String get progressStatusSkipped => 'تم التخطي';

  @override
  String get progressStatusOverdue => 'متأخر';

  @override
  String get aiTeacherAskAnythingTitle => 'اسأل معلم الذكاء الاصطناعي أي شيء';

  @override
  String get aiTeacherStartConversationSubtitle =>
      'ابدأ المحادثة بإرسال رسالة.';

  @override
  String get aiTeacherConversationHistory => 'سجل المحادثات';

  @override
  String get aiTeacherNoConversationsTitle => 'لا توجد محادثات بعد';

  @override
  String get aiTeacherNoConversationsSubtitle =>
      'ابدأ المحادثة مع معلم الذكاء الاصطناعي لتظهر هنا.';

  @override
  String get aiTeacherPreferTextLabel => 'تفضيل الردود النصية على الصوتية';

  @override
  String get aiTeacherReduceAnimationsLabel =>
      'تقليل التأثيرات الحركية في المعلم الذكي والصوتي';

  @override
  String get aiTeacherAboutSettingsTitle => 'حول هذه الإعدادات';

  @override
  String get aiTeacherAskAnythingHint => 'اسألني أي شيء...';

  @override
  String get aiTeacherVoiceComingSoon => 'الإدخال الصوتي (قريباً)';

  @override
  String get aiTeacherSendMessage => 'إرسال الرسالة';

  @override
  String get aiTeacherLimitedBannerTitle =>
      'المعلم الذكي محدود الاستخدام حالياً';

  @override
  String get aiTeacherOpenButton => 'فتح المعلم الذكي';

  @override
  String get voiceTeacherStartTalkingTitle => 'ابدأ التحدث مع معلمك الصوتي';

  @override
  String get voiceTeacherTranscriptAppearSubtitle => 'سيظهر النص المنطوق هنا.';

  @override
  String get voiceTeacherMessages => 'الرسائل';

  @override
  String get qaContinueButton => 'متابعة';

  @override
  String get qaYourAnswerLabel => 'إجابتك';

  @override
  String get qaTypeAnswerPlaceholder => 'اكتب إجابتك هنا';

  @override
  String get qaQuestionsAttempted => 'الأسئلة المجابة';

  @override
  String get qaCorrectScore => 'الصحيحة (تقييم الخادم)';

  @override
  String get qaMasteryShift => 'تغير مستوى الإتقان';

  @override
  String get qaLessonCompletedToast => 'تم تحديد الدرس كمكتمل! 🌟';

  @override
  String get qaMarkLessonCompletedButton => 'تحديد الدرس كمكتمل ✨';

  @override
  String get shellNavMore => 'المزيد';

  @override
  String get profileLanguageEnglish => 'الإنجليزية';

  @override
  String get profileLanguageArabic => 'العربية';

  @override
  String get analyticsPageTitle => 'التحليلات';

  @override
  String get analyticsNoReportsTitle => 'لا توجد تقارير متاحة';

  @override
  String get analyticsNoReportsSubtitle => 'لا توجد تقارير تحليلات لك بعد.';

  @override
  String get homeAppName => 'AIM English';

  @override
  String homeGreeting(String name) {
    return 'مرحباً، $name! 👋';
  }

  @override
  String homeXpLevelSubtitle(String course, int level) {
    return '$course · المستوى $level';
  }

  @override
  String get homeLearningRoadmap => 'خريطة التعلم';

  @override
  String get homeNodeMastered => 'متقن';

  @override
  String get homeNodeCurrentLesson => 'الدرس الحالي';

  @override
  String get homeNodeLocked => 'مغلق';

  @override
  String get homeMissionPracticeSpeaking => 'تدرب على التحدث';

  @override
  String get homeMissionWriteParagraph => 'اكتب فقرة قصيرة';

  @override
  String get homeMissionWritingPractice => 'ممارسة الكتابة';

  @override
  String get billingCheckoutTitle => 'الدفع';

  @override
  String get billingBillingLabel => 'الفوترة';

  @override
  String get billingTermsAgreementFull =>
      'بمتابعتك فإنك توافق على شروط خدمة AIM وتفوّض بالخصم المتكرر. يمكنك الإلغاء في أي وقت.';

  @override
  String get billingCouldNotOpenPayment =>
      'تعذر فتح صفحة الدفع. يرجى المحاولة مرة أخرى.';

  @override
  String get billingFailedToStart =>
      'فشل بدء عملية الدفع. يرجى المحاولة مرة أخرى.';

  @override
  String get submitAttemptTitle => 'هل تريد تقديم إجاباتك؟';

  @override
  String get submitAttemptWarning => 'لا يمكنك تغيير الإجابات بعد التقديم.';

  @override
  String get submitAttemptFinalAction =>
      'هذا الإجراء نهائي ولا يمكن التراجع عنه.';

  @override
  String get deadlinesTitle => 'المواعيد النهائية';

  @override
  String get deadlinesLoadingSemantic => 'جارٍ تحميل المواعيد النهائية';

  @override
  String deadlinesDueRelative(String relative, String date) {
    return 'مستحق $relative · $date';
  }

  @override
  String deadlinesOpens(String date) {
    return 'يفتح $date';
  }

  @override
  String deadlinesExtendedTo(String date) {
    return 'ممدد إلى $date';
  }

  @override
  String deadlinesWasDue(String date) {
    return 'كان مستحقاً $date';
  }

  @override
  String deadlinesClosed(String date) {
    return 'أُغلق $date';
  }

  @override
  String get deadlinesRelativeToday => 'اليوم';

  @override
  String get deadlinesRelativeTomorrow => 'غداً';

  @override
  String deadlinesRelativeInDays(int days) {
    return 'خلال $days أيام';
  }

  @override
  String get reviewScheduleTitle => 'جدول المراجعة';

  @override
  String get reviewScheduleLoadingSemantic => 'جارٍ تحميل جدول المراجعة';

  @override
  String get reviewScheduleNoTitle => 'لا توجد مراجعات مجدولة';

  @override
  String get reviewScheduleNoSubtitle =>
      'أكمل جلسات التمرين لتلقي تذكيرات المراجعة.';

  @override
  String reviewScheduleEveryInterval(String days, int rep) {
    return 'كل $days يوم · التكرار #$rep';
  }

  @override
  String lessonsCountChip(int count) {
    return '$count درس';
  }

  @override
  String quizzesCountChip(int count) {
    return '$count اختبار';
  }

  @override
  String examsCountChip(int count) {
    return '$count امتحان';
  }

  @override
  String get lessonsCourseLockedHint => 'أكمل مستواك الحالي لفتح هذه الدورة';

  @override
  String get achievementFirstLessonCompleteTitle => 'الخطوات الأولى';

  @override
  String get achievementFirstLessonCompleteDesc => 'أكمل درسك الأول.';

  @override
  String get achievementFiveLessonsCompleteTitle => 'البداية والانطلاق';

  @override
  String get achievementFiveLessonsCompleteDesc => 'أكمل 5 دروس.';

  @override
  String get achievementThreeDayStreakTitle => 'حماس متواصل';

  @override
  String get achievementThreeDayStreakDesc =>
      'حافظ على سلسلة تعلم لمدة 3 أيام.';

  @override
  String get achievementSevenDayStreakTitle => 'بطل الأسبوع';

  @override
  String get achievementSevenDayStreakDesc =>
      'حافظ على سلسلة تعلم لمدة 7 أيام.';

  @override
  String get achievementFirstAssessmentPassedTitle => 'عبقري الاختبارات';

  @override
  String get achievementFirstAssessmentPassedDesc => 'اجتز تقييمك الأول بنجاح.';
}
