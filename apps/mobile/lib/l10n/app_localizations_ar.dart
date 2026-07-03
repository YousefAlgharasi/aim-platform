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
}
