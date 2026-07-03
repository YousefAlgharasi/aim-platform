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
  String get onboardingBrandName => 'AIM';

  @override
  String get onboardingTagline => 'ذكاء تكيّفي من أجل الإتقان';

  @override
  String get onboardingTapToContinue => 'اضغط للمتابعة';

  @override
  String get homeLoadingSemantic => 'جارٍ تحميل بيانات الرئيسية';

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
  String lessonsLevelBadge(String level) {
    return 'المستوى $level';
  }

  @override
  String get lessonsCoursesSubtitle => 'طوّر لغتك الإنجليزية خطوة بخطوة';

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
  String get progressPageTitle => 'تقدّمك';

  @override
  String get progressPageSubtitle => 'لمحة سريعة عن أدائك';

  @override
  String get progressLoadingSemantic => 'جارٍ تحميل بيانات التقدم';

  @override
  String get progressEmptyTitle => 'لا توجد بيانات تقدم بعد';

  @override
  String get progressEmptySubtitle =>
      'أكمل الدروس وجلسات التدريب لرؤية تقدمك في AIM.';

  @override
  String get progressAvgMasteryLabel => 'متوسط الإتقان';

  @override
  String get progressDayStreakLabel => 'سلسلة الأيام';

  @override
  String progressStatCardSemantic(String value, String label) {
    return '$value $label';
  }

  @override
  String progressNavRowSemantic(String title, String subtitle) {
    return '$title، $subtitle';
  }

  @override
  String progressSkillStatesSubtitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count مهارة مسجلة',
      many: '$count مهارة مسجلة',
      few: '$count مهارات مسجلة',
      two: 'مهارتان مسجلتان',
      one: 'مهارة واحدة مسجلة',
      zero: 'لا مهارات مسجلة',
    );
    return '$_temp0';
  }

  @override
  String get progressWeaknessesNavTitle => 'نقاط الضعف';

  @override
  String progressFocusAreasCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count مجال تركيز',
      many: '$count مجال تركيز',
      few: '$count مجالات تركيز',
      two: 'مجالا تركيز',
      one: 'مجال تركيز واحد',
      zero: 'لا مجالات تركيز',
    );
    return '$_temp0';
  }

  @override
  String get progressRecommendationsNavTitle => 'التوصيات';

  @override
  String progressRecommendationsFromAimLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count توصية من AIM',
      many: '$count توصية من AIM',
      few: '$count توصيات من AIM',
      two: 'توصيتان من AIM',
      one: 'توصية واحدة من AIM',
      zero: 'لا توصيات من AIM',
    );
    return '$_temp0';
  }

  @override
  String progressReviewsScheduledCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count مراجعة مجدولة',
      many: '$count مراجعة مجدولة',
      few: '$count مراجعات مجدولة',
      two: 'مراجعتان مجدولتان',
      one: 'مراجعة واحدة مجدولة',
      zero: 'لا مراجعات مجدولة',
    );
    return '$_temp0';
  }

  @override
  String get progressWeaknessLoadingSemantic => 'جارٍ تحميل بيانات نقاط الضعف';

  @override
  String get progressNoFocusAreasTitle => 'لا توجد مجالات تركيز بعد';

  @override
  String get progressNoFocusAreasSubtitle =>
      'أكمل جلسات التدريب حتى يتمكن AIM من تحديد المجالات التي تحتاج إلى تركيز.';

  @override
  String progressWeaknessDetailSemantic(
      String skillId, String severity, String status) {
    return 'ضعف في $skillId: $severity، $status';
  }

  @override
  String progressDetectedLabel(String date) {
    return 'تم الرصد: $date';
  }

  @override
  String progressResolvedLabel(String date) {
    return 'تم الحل: $date';
  }

  @override
  String get progressRecommendationsLoadingSemantic => 'جارٍ تحميل التوصيات';

  @override
  String get progressNoRecommendationsTitle => 'لا توجد توصيات بعد';

  @override
  String get progressNoRecommendationsSubtitle =>
      'أكمل الدروس وجلسات التدريب لتلقي توصيات AIM.';

  @override
  String progressRecommendationRankSemantic(
      int rank, String kind, String skillId) {
    return 'توصية AIM رقم $rank: $kind لمهارة $skillId';
  }

  @override
  String progressRankBadge(int rank) {
    return '#$rank';
  }

  @override
  String progressLessonLabel(String lessonId) {
    return 'الدرس: $lessonId';
  }

  @override
  String progressExpiresLabel(String date) {
    return 'تنتهي: $date';
  }

  @override
  String progressGeneratedLabel(String date) {
    return 'أُنشئت: $date';
  }

  @override
  String get progressSkillStatesLoadingSemantic => 'جارٍ تحميل حالات المهارات';

  @override
  String get progressNoSkillDataTitle => 'لا توجد بيانات مهارات بعد';

  @override
  String get progressNoSkillDataSubtitle =>
      'أكمل الدروس والتدريب لبناء ملف مهاراتك.';

  @override
  String progressSkillMasterySemantic(
      String title, int masteryPct, String tierLabel) {
    return 'إتقان $title: $masteryPct%، $tierLabel';
  }

  @override
  String get progressTierStrong => 'قوي';

  @override
  String get progressTierDeveloping => 'قيد التطور';

  @override
  String get progressTierNeedsWork => 'يحتاج إلى عمل';

  @override
  String get progressTrendImproving => 'في تحسّن';

  @override
  String get progressTrendDeclining => 'في تراجع';

  @override
  String get progressTrendStable => 'مستقر';

  @override
  String get progressTrendInsufficientData => 'بيانات غير كافية';

  @override
  String get progressMasteryPrefix => 'الإتقان ';

  @override
  String progressMasteryWasSuffix(int prevPct) {
    return ' · كان $prevPct';
  }

  @override
  String progressConfidenceLabel(int percent) {
    return 'الثقة $percent%';
  }

  @override
  String get progressNoReviewsSubtitle =>
      'أكمل جلسات التدريب لتلقي تذكيرات مراجعة يحسبها AIM.';

  @override
  String get progressReviewStatusDue => 'مستحقة';

  @override
  String get progressReviewStatusPending => 'قيد الانتظار';

  @override
  String get progressReviewStatusCompleted => 'مكتملة';

  @override
  String get progressReviewStatusSkipped => 'متجاوَزة';

  @override
  String get progressReviewStatusOverdue => 'متأخرة';

  @override
  String progressReviewCardSemantic(
      String skillId, String dueAt, String statusLabel) {
    return 'مراجعة $skillId مستحقة في $dueAt — $statusLabel';
  }

  @override
  String progressReviewMetaLabel(
      String dueLabel, int intervalDays, int repCount) {
    return '$dueLabel · $intervalDays يوم · تكرار #$repCount';
  }

  @override
  String progressDueRawLabel(String raw) {
    return 'مستحقة $raw';
  }

  @override
  String progressReviewScheduleCardSemantic(String skillId, String dueAt) {
    return 'مراجعة $skillId مستحقة في $dueAt';
  }

  @override
  String progressDueColonLabel(String dueAt) {
    return 'الاستحقاق: $dueAt';
  }

  @override
  String progressIntervalDaysBadge(int days) {
    return '$days يوم';
  }

  @override
  String get reviewsPageTitle => 'المراجعة';

  @override
  String get reviewsPageSubtitle => 'التكرار المتباعد يحفظها في الذاكرة';

  @override
  String get reviewsLoadingScheduleSemantic => 'جارٍ تحميل جدول المراجعة';

  @override
  String get reviewsNoReviewsScheduledTitle => 'لا توجد مراجعات مجدولة';

  @override
  String get reviewsNoReviewsSubtitle =>
      'أكمل جلسات التدريب لتلقي تذكيرات المراجعة.';

  @override
  String reviewsCardSemantic(String title, String dueAt, String status) {
    return 'مراجعة $title مستحقة في $dueAt — $status';
  }

  @override
  String reviewsIntervalDaysLabel(int days) {
    return 'الفاصل $days يوم';
  }

  @override
  String reviewsRepBadge(int repCount) {
    return 'تكرار #$repCount';
  }

  @override
  String get reviewsDueTodayLabel => 'مستحقة اليوم';

  @override
  String get reviewsDueTomorrowLabel => 'مستحقة غدًا';

  @override
  String get reviewsDueYesterdayLabel => 'كانت مستحقة أمس';

  @override
  String reviewsDueInDaysLabel(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'مستحقة خلال $days يوم',
      many: 'مستحقة خلال $days يومًا',
      few: 'مستحقة خلال $days أيام',
      two: 'مستحقة خلال يومين',
      one: 'مستحقة خلال يوم واحد',
    );
    return '$_temp0';
  }

  @override
  String reviewsDueDaysAgoLabel(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'كانت مستحقة قبل $days يوم',
      many: 'كانت مستحقة قبل $days يومًا',
      few: 'كانت مستحقة قبل $days أيام',
      two: 'كانت مستحقة قبل يومين',
      one: 'كانت مستحقة قبل يوم واحد',
    );
    return '$_temp0';
  }

  @override
  String reviewsDueFormattedLabel(String date) {
    return 'مستحقة في $date';
  }

  @override
  String reviewsDueRawLabel(String raw) {
    return 'مستحقة: $raw';
  }

  @override
  String get analyticsSummaryTitle => 'التحليلات';

  @override
  String get analyticsSummaryLoadingSemantic => 'جارٍ تحميل ملخص التحليلات';

  @override
  String get analyticsSummaryNoReportsTitle => 'لا تقارير متاحة';

  @override
  String get analyticsSummaryNoReportsSubtitle =>
      'لا توجد تقارير تحليلات لك بعد.';

  @override
  String analyticsSummaryReportSemantic(String name) {
    return 'تقرير $name';
  }

  @override
  String get notificationsSettingsTitle => 'إعدادات الإشعارات';

  @override
  String get notificationsPreferencesLoadingSemantic =>
      'جارٍ تحميل تفضيلات الإشعارات';

  @override
  String get notificationsInboxLoadingSemantic => 'جارٍ تحميل الإشعارات';

  @override
  String get notificationsInboxEmptyTitle => 'لا توجد إشعارات بعد';

  @override
  String get notificationsInboxEmptySubtitle =>
      'ستظهر هنا تذكيرات الجلسات وتحديثات التقدم.';

  @override
  String get notificationsDismissSemantic => 'تجاهل الإشعار';

  @override
  String notificationsUnreadTileSemantic(String title) {
    return 'إشعار غير مقروء: $title';
  }

  @override
  String notificationsTileSemantic(String title) {
    return 'إشعار: $title';
  }

  @override
  String get notificationsUnreadLabel => 'غير مقروء';

  @override
  String get notificationsReadLabel => 'مقروء';

  @override
  String get notificationsCategoryLearningReminder => 'تذكيرات التعلم';

  @override
  String get notificationsCategoryDeadlineReminder =>
      'تذكيرات المواعيد النهائية';

  @override
  String get notificationsCategoryProgressUpdate => 'تحديثات التقدم';

  @override
  String get notificationsCategoryAssessmentResult => 'نتائج التقييمات';

  @override
  String get notificationsCategoryParentSummary => 'ملخصات التقدم';

  @override
  String get notificationsCategorySystemAlert => 'تنبيهات النظام';

  @override
  String get notificationsChannelInApp => 'داخل التطبيق';

  @override
  String get notificationsChannelPush => 'إشعارات الدفع';

  @override
  String get notificationsChannelEmail => 'البريد الإلكتروني';

  @override
  String get notificationsChannelsSectionLabel => 'القنوات';

  @override
  String get notificationsQuietHoursSectionLabel => 'ساعات الهدوء';

  @override
  String notificationsChannelToggleSemantic(String channel, String category) {
    return 'إشعارات $channel لِـ $category';
  }

  @override
  String get notificationsEnableQuietHoursLabel => 'تفعيل ساعات الهدوء';

  @override
  String get notificationsQuietHoursStartLabel => 'البداية';

  @override
  String get notificationsQuietHoursEndLabel => 'النهاية';

  @override
  String get notificationsSaveQuietHoursLabel => 'حفظ ساعات الهدوء';

  @override
  String get notificationsDetailTitle => 'الإشعار';

  @override
  String get notificationsMarkAsReadLabel => 'وضع علامة كمقروء';

  @override
  String get notificationsDismissLabel => 'تجاهل';

  @override
  String get notificationsDismissedTitle => 'تم التجاهل';

  @override
  String get notificationsDismissedBody => 'تم تجاهل هذا الإشعار.';

  @override
  String get notificationsReminderTypeLearningPlan => 'خطة التعلم';

  @override
  String get notificationsReminderTypeReview => 'المراجعة';

  @override
  String get notificationsReminderTypeDeadline => 'الموعد النهائي';

  @override
  String get notificationsReminderTypeStreak => 'سلسلة الإنجاز';

  @override
  String get notificationsReminderTypeCustom => 'مخصص';

  @override
  String notificationsEveryDayLabel(String time) {
    return 'كل يوم · $time';
  }

  @override
  String notificationsEveryWeekdayLabel(String weekday, String time) {
    return 'كل $weekday · $time';
  }

  @override
  String notificationsReminderSemantic(String type, String status) {
    return 'تذكير $type، الحالة $status';
  }

  @override
  String get notificationsNoRemindersTitle => 'لا توجد تذكيرات بعد';

  @override
  String get notificationsNoRemindersSubtitle =>
      'ستظهر هنا التذكيرات التي تفعّلها.';

  @override
  String get notificationsNoRemindersSemantic => 'لا توجد جداول تذكير';

  @override
  String get notificationsRemindersLoadingSemantic =>
      'جارٍ تحميل جداول التذكير';

  @override
  String get notificationsRemindersTitle => 'التذكيرات';

  @override
  String get notificationsResumeLabel => 'استئناف';

  @override
  String get notificationsResumeSemantic => 'استئناف التذكير';

  @override
  String get notificationsPauseLabel => 'إيقاف مؤقت';

  @override
  String get notificationsPauseSemantic => 'إيقاف التذكير مؤقتًا';

  @override
  String get notificationsCancelSemantic => 'إلغاء التذكير';

  @override
  String notificationsBellUnreadSemantic(int count) {
    return 'الإشعارات، $count غير مقروء';
  }

  @override
  String get achievementsLoadingSemantic => 'جارٍ تحميل الإنجازات';

  @override
  String get achievementsEmptyTitle => 'لا توجد إنجازات بعد';

  @override
  String get achievementsEmptySubtitle =>
      'أكمل الدروس وجلسات التدريب لكسب الأوسمة والإنجازات.';

  @override
  String get achievementsStartLearningLabel => 'ابدأ التعلم';

  @override
  String achievementsUnlockedSemantic(String title) {
    return '$title، مفتوح';
  }

  @override
  String achievementsLockedSemantic(String title) {
    return '$title، مقفل';
  }

  @override
  String get assessmentsStartAttemptTitle => 'بدء المحاولة';

  @override
  String get assessmentsReadyToBeginTitle => 'هل أنت مستعد للبدء؟';

  @override
  String assessmentsTimedBodyCopy(String minutes) {
    return 'بمجرد أن تبدأ، سيعمل مؤقت الـ $minutes دقيقة بشكل متواصل — حتى لو غادرت التطبيق. تأكد من أن لديك الوقت الكافي لإنهاء المحاولة.';
  }

  @override
  String get assessmentsUntimedBodyCopy =>
      'بمجرد أن تبدأ، سيتم تسجيل المحاولة. تأكد من استعدادك قبل المتابعة.';

  @override
  String get assessmentsStartAttemptButton => 'بدء المحاولة';

  @override
  String assessmentsStartAttemptSemantic(String title) {
    return 'بدء محاولة لـ $title';
  }

  @override
  String get assessmentsGoBackButton => 'رجوع';

  @override
  String get assessmentsLoadingResultSemantic => 'جارٍ تحميل النتيجة';

  @override
  String get assessmentsStatusPassed => 'ناجح';

  @override
  String get assessmentsStatusFailed => 'راسب';

  @override
  String assessmentsScoreSemantic(
      String statusLabel, String score, String maxScore) {
    return '$statusLabel: $score من $maxScore نقطة';
  }

  @override
  String get assessmentsLatePenaltyApplied => 'تم تطبيق غرامة التأخير';

  @override
  String assessmentsGradedLabel(String date) {
    return 'تم التصحيح في $date';
  }

  @override
  String get assessmentsBreakdownLabel => 'التفصيل';

  @override
  String get assessmentsDoneViewingResultSemantic =>
      'تم الانتهاء من عرض النتيجة';

  @override
  String assessmentsPointsFraction(String awarded, String possible) {
    return '$awarded / $possible نقطة';
  }

  @override
  String get assessmentsLoadingResultHistorySemantic =>
      'جارٍ تحميل سجل النتائج';

  @override
  String get assessmentsResultHistoryTitle => 'سجل النتائج';

  @override
  String get assessmentsNoResultsTitle => 'لا توجد نتائج بعد';

  @override
  String get assessmentsNoResultsSubtitle =>
      'ستظهر هنا نتائج محاولاتك السابقة.';

  @override
  String assessmentsAttemptResultSemantic(int attemptNumber, String scoreLabel,
      String statusWord, String lateSuffix) {
    return 'المحاولة $attemptNumber، $scoreLabel، $statusWord$lateSuffix';
  }

  @override
  String get assessmentsPassedWord => 'ناجح';

  @override
  String get assessmentsFailedWord => 'راسب';

  @override
  String get assessmentsLatePenaltySemanticSuffix => '، مع تطبيق غرامة التأخير';

  @override
  String get assessmentsLoadingAssessmentSemantic => 'جارٍ تحميل التقييم';

  @override
  String get assessmentsExamDetailsTitle => 'تفاصيل الاختبار';

  @override
  String get assessmentsQuizDetailsTitle => 'تفاصيل الاختبار القصير';

  @override
  String get assessmentsDetailsTitle => 'تفاصيل التقييم';

  @override
  String get assessmentsQuestionsLabel => 'الأسئلة';

  @override
  String get assessmentsTimeLimitLabel => 'الوقت المحدد';

  @override
  String get assessmentsMaxAttemptsLabel => 'الحد الأقصى للمحاولات';

  @override
  String get assessmentsDeadlineHeading => 'الموعد النهائي';

  @override
  String get assessmentsSectionsHeading => 'الأقسام';

  @override
  String get assessmentsPastResultsTitle => 'النتائج السابقة';

  @override
  String get assessmentsViewAttemptHistorySubtitle => 'عرض سجل محاولاتك';

  @override
  String get assessmentsPastResultsSemantic =>
      'النتائج السابقة، عرض سجل محاولاتك';

  @override
  String get assessmentsDeadlineStatusOpen => 'مفتوح';

  @override
  String get assessmentsDeadlineStatusUpcoming => 'قادم';

  @override
  String get assessmentsDeadlineStatusClosed => 'مغلق';

  @override
  String get assessmentsDeadlineStatusLate => 'متأخر';

  @override
  String get assessmentsDeadlineStatusMissed => 'فائت';

  @override
  String get assessmentsOpensLabel => 'يفتح';

  @override
  String get assessmentsClosesLabel => 'يغلق';

  @override
  String get assessmentsExtendedCloseLabel => 'الإغلاق الممدد';

  @override
  String assessmentsDurationMinutes(int minutes) {
    return '$minutes دقيقة';
  }

  @override
  String assessmentsDurationMinutesSeconds(int minutes, int seconds) {
    return '$minutes دقيقة و$seconds ثانية';
  }

  @override
  String assessmentsQuestionCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count سؤال',
      many: '$count سؤالًا',
      few: '$count أسئلة',
      two: 'سؤالان',
      one: 'سؤال واحد',
    );
    return '$_temp0';
  }

  @override
  String get assessmentsLoadingDeadlinesSemantic =>
      'جارٍ تحميل المواعيد النهائية';

  @override
  String get assessmentsDeadlinesTitle => 'المواعيد النهائية';

  @override
  String get assessmentsNoDeadlinesTitle => 'لا توجد مواعيد نهائية';

  @override
  String get assessmentsNoDeadlinesSubtitle =>
      'ستظهر هنا مواعيد التقييمات النهائية.';

  @override
  String get assessmentsSectionActiveLabel => 'نشط';

  @override
  String get assessmentsRelativeToday => 'اليوم';

  @override
  String get assessmentsRelativeTomorrow => 'غدًا';

  @override
  String assessmentsRelativeInDays(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'خلال $days يوم',
      many: 'خلال $days يومًا',
      few: 'خلال $days أيام',
      two: 'خلال يومين',
      one: 'خلال يوم واحد',
    );
    return '$_temp0';
  }

  @override
  String assessmentsDueRelativeDate(String relative, String date) {
    return 'يستحق $relative · $date';
  }

  @override
  String assessmentsDueDate(String date) {
    return 'يستحق في $date';
  }

  @override
  String assessmentsOpensDate(String date) {
    return 'يفتح في $date';
  }

  @override
  String assessmentsExtendedToDate(String date) {
    return 'تم التمديد إلى $date';
  }

  @override
  String assessmentsWasDueDate(String date) {
    return 'كان يستحق في $date';
  }

  @override
  String assessmentsClosedDate(String date) {
    return 'أُغلق في $date';
  }

  @override
  String assessmentsDeadlineTileSemantic(String title, String subtitle) {
    return '$title، $subtitle';
  }

  @override
  String get assessmentsResumingAttemptSemantic => 'جارٍ استئناف المحاولة';

  @override
  String get assessmentsStatusLabel => 'الحالة';

  @override
  String get assessmentsInProgressStatus => 'قيد التنفيذ';

  @override
  String get assessmentsExpiresLabel => 'تنتهي الصلاحية';

  @override
  String assessmentsTimeRemainingSemantic(String time) {
    return 'الوقت المتبقي: $time';
  }

  @override
  String get assessmentsQuestionRenderingUnavailable =>
      'عرض الأسئلة غير متاح بعد لهذه المحاولة.';

  @override
  String get assessmentsSubmitAttemptSemantic => 'إرسال المحاولة';

  @override
  String get assessmentsLoadingListSemantic => 'جارٍ تحميل التقييمات';

  @override
  String get assessmentsListTitle => 'التقييمات';

  @override
  String get assessmentsEmptyTitle => 'لا توجد تقييمات متاحة';

  @override
  String get assessmentsEmptySubtitle =>
      'ستظهر هنا الاختبارات القصيرة والاختبارات المنشورة.';

  @override
  String get assessmentsSubmitConfirmTitle => 'هل تريد إرسال إجاباتك؟';

  @override
  String get assessmentsSubmitConfirmBody =>
      'لا يمكنك تغيير إجاباتك بعد الإرسال.';

  @override
  String get assessmentsFinalWarning =>
      'هذا الإجراء نهائي ولا يمكن التراجع عنه.';

  @override
  String assessmentsSubmitAttemptForSemantic(String title) {
    return 'إرسال محاولة لـ $title';
  }

  @override
  String assessmentsListTileSemantic(String typeLabel, String title) {
    return '$typeLabel: $title';
  }

  @override
  String get assessmentsTypeExam => 'اختبار';

  @override
  String get assessmentsTypeQuiz => 'اختبار قصير';

  @override
  String assessmentsDeadlineCardSemantic(String title, String status) {
    return '$title — $status';
  }

  @override
  String assessmentsOpensClosesLabel(String opensAt, String closesAt) {
    return 'يفتح: $opensAt  •  يغلق: $closesAt';
  }

  @override
  String assessmentsDaysRemainingLabel(int days) {
    return 'متبقٍ $days يوم';
  }

  @override
  String assessmentsHoursRemainingLabel(int hours) {
    return 'متبقٍ $hours ساعة';
  }

  @override
  String assessmentsMinutesRemainingLabel(int minutes) {
    return 'متبقٍ $minutes دقيقة';
  }

  @override
  String get assessmentsLessThanMinuteLabel => 'أقل من دقيقة';

  @override
  String get placementLoadingResultSemantic => 'جارٍ تحميل نتيجتك';

  @override
  String get placementScoringInProgressTitle => 'التصحيح قيد التنفيذ…';

  @override
  String get placementScoringInProgressSemantic => 'التصحيح قيد التنفيذ';

  @override
  String get placementScoringInProgressSubtitle =>
      'الخادم يقوم بتقييم إجاباتك.';

  @override
  String get placementSectionBreakdownLabel => 'تفصيل الأقسام';

  @override
  String get placementContinueButton => 'المتابعة إلى AIM';

  @override
  String get placementLevelBeginner => 'مبتدئ';

  @override
  String get placementLevelElementary => 'أساسي';

  @override
  String get placementLevelIntermediate => 'متوسط';

  @override
  String get placementLevelUpperIntermediate => 'فوق المتوسط';

  @override
  String get placementLevelAdvanced => 'متقدم';

  @override
  String get placementSkillGrammar => 'القواعد';

  @override
  String get placementSkillVocabulary => 'المفردات';

  @override
  String get placementSkillReading => 'القراءة';

  @override
  String get placementSkillListening => 'الاستماع';

  @override
  String placementLevelSemantic(String displayName, int totalScore) {
    return 'مستواك: $displayName، مجموع النقاط $totalScore من 100';
  }

  @override
  String get placementYourLevelLabel => 'مستواك';

  @override
  String placementLevelSummary(String displayName, int totalScore) {
    return '$displayName · مجموع النقاط $totalScore / 100';
  }

  @override
  String placementSectionCorrectSemantic(String name, int correct, int total) {
    return '$name: $correct من $total إجابة صحيحة';
  }

  @override
  String placementFractionLabel(int correct, int total) {
    return '$correct / $total';
  }

  @override
  String get placementSectionsLabel => 'الأقسام';

  @override
  String placementSectionsValue(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count قسم',
      many: '$count قسمًا',
      few: '$count أقسام',
      two: 'قسمان',
      one: 'قسم واحد',
    );
    return '$_temp0';
  }

  @override
  String get placementEstimatedTimeLabel => 'الوقت المقدر';

  @override
  String placementEstimatedTimeValue(int minutes) {
    return '~$minutes دقيقة';
  }

  @override
  String get placementBackendNote =>
      'يتم تحديد مستواك بواسطة الخادم بعد الانتهاء. لا يتم احتساب النتائج على جهازك أبدًا.';

  @override
  String get placementStartTestSemantic => 'بدء اختبار تحديد المستوى';

  @override
  String get placementIntroHeaderTitle => 'تحديد مستوى اللغة الإنجليزية العامة';

  @override
  String get placementIntroHeaderSubtitle => 'فحص سريع لتحديد مستواك الأولي.';

  @override
  String get placementLoadingTestSemantic => 'جارٍ تحميل اختبار تحديد المستوى';

  @override
  String get placementStartingTestSemantic => 'جارٍ بدء اختبار تحديد المستوى';

  @override
  String get placementTestTitle => 'اختبار تحديد المستوى';

  @override
  String get placementFindYourLevelTitle => 'اكتشف مستواك';

  @override
  String get placementFindYourLevelSubtitle =>
      'اختبار تكيفي قصير يحدد مستواك المناسب حتى يلائمك كل درس.';

  @override
  String get placementSectionsStatLabel => 'أقسام';

  @override
  String get placementMinutesStatLabel => 'دقائق';

  @override
  String get placementStartTestButton => 'بدء اختبار تحديد المستوى';

  @override
  String get placementNotNowButton => 'ليس الآن';

  @override
  String placementQuestionCounter(int index, int total) {
    return '$index من $total';
  }

  @override
  String get placementLoadingQuestionSemantic => 'جارٍ تحميل السؤال';

  @override
  String placementSubmitAnswerFailedWithReason(String reason) {
    return 'فشل إرسال الإجابة: $reason';
  }

  @override
  String get placementSubmitAnswerFailedGeneric =>
      'فشل إرسال الإجابة. يرجى المحاولة مرة أخرى.';

  @override
  String get placementSubmitFinalAnswerButton => 'إرسال الإجابة الأخيرة';

  @override
  String get placementNextQuestionButton => 'السؤال التالي';

  @override
  String get placementSubmitFinalAnswerSemantic => 'إرسال الإجابة الأخيرة';

  @override
  String get placementNextQuestionSemantic => 'السؤال التالي';

  @override
  String placementUnknownQuestionType(String type) {
    return 'نوع سؤال غير معروف: $type';
  }

  @override
  String placementOptionWithTextSemantic(String letter, String text) {
    return 'الخيار $letter: $text';
  }

  @override
  String placementOptionSemantic(String letter) {
    return 'الخيار $letter';
  }

  @override
  String get placementTrueOption => 'صح';

  @override
  String get placementFalseOption => 'خطأ';

  @override
  String get placementAnswerPlaceholder => 'اكتب إجابتك هنا…';

  @override
  String get placementYourAnswerSemantic => 'إجابتك';

  @override
  String get placementAlmostDoneTitle => 'أوشكت على الانتهاء';

  @override
  String get placementSubmittingAnswersSemantic => 'جارٍ إرسال إجاباتك';

  @override
  String get placementRetryLabel => 'إعادة المحاولة';

  @override
  String placementAllSectionsCompleteWithCount(int count) {
    return 'اكتملت جميع الأقسام الـ $count';
  }

  @override
  String get placementAllSectionsCompleteGeneric => 'اكتملت جميع الأقسام';

  @override
  String get placementSubmitBody =>
      'أرسل اختبار تحديد المستوى لمعرفة مستواك والحصول على خطة مخصصة.';

  @override
  String get placementSubmitTestButton => 'إرسال اختبار تحديد المستوى';

  @override
  String placementSectionCounterTitle(int index, int total) {
    return 'القسم $index من $total';
  }

  @override
  String placementSectionMetaLine(String category, int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count سؤال',
      many: '$count سؤالًا',
      few: '$count أسئلة',
      two: 'سؤالان',
      one: 'سؤال واحد',
    );
    return '$category · $_temp0 · حوالي $minutes دقيقة';
  }

  @override
  String get placementBeginFinalSectionButton => 'بدء القسم الأخير';

  @override
  String get placementBeginSectionButton => 'بدء القسم';

  @override
  String placementSectionProgressSemantic(int index, int total) {
    return 'القسم $index من $total';
  }

  @override
  String get placementCategoryLexis => 'المفردات';

  @override
  String get placementCategoryStructures => 'التراكيب';

  @override
  String get placementCategoryComprehension => 'الاستيعاب';

  @override
  String get placementCategoryAudio => 'الصوتيات';

  @override
  String get placementCategoryGeneral => 'عام';

  @override
  String get questionAnswerLoadingQuestionSemantic => 'جارٍ تحميل السؤال';

  @override
  String get questionAnswerPracticeTitle => 'تدريب';

  @override
  String get questionAnswerAnalysingSessionText => 'AIM يقوم بتحليل جلستك…';

  @override
  String get questionAnswerSessionFeedbackSemantic => 'ملاحظات الجلسة من AIM';

  @override
  String get questionAnswerSessionSummaryTitle => 'ملخص الجلسة';

  @override
  String get questionAnswerQuestionsAttemptedLabel => 'الأسئلة المُجابة';

  @override
  String get questionAnswerCorrectScoreLabel =>
      'الإجابات الصحيحة (نتيجة الخادم)';

  @override
  String get questionAnswerMasteryShiftLabel => 'تغيّر الإتقان';

  @override
  String get questionAnswerSkillsCoveredLabel => 'المهارات المشمولة';

  @override
  String get questionAnswerAnswerSubmittedSemantic => 'تم إرسال الإجابة';

  @override
  String get questionAnswerAnswerSubmittedLabel => 'تم إرسال الإجابة';

  @override
  String get questionAnswerAnalysingResponseText => 'AIM يقوم بتحليل إجابتك.';

  @override
  String get questionAnswerYourAnswerLabel => 'إجابتك';

  @override
  String get questionAnswerAnswerHelperText =>
      'اكتب إجابتك، ثم اضغط متابعة للإرسال.';

  @override
  String get questionAnswerAnswerPlaceholder => 'اكتب إجابتك هنا';

  @override
  String get questionAnswerAnswerInputSemantic => 'حقل إدخال الإجابة';
}
