// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'AIM Mobile';

  @override
  String get commonBack => 'Back';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonSave => 'Save';

  @override
  String get commonSubmit => 'Submit';

  @override
  String get commonRetry => 'Try again';

  @override
  String get commonClose => 'Close';

  @override
  String get commonContinue => 'Continue';

  @override
  String get commonStart => 'Start';

  @override
  String get commonDone => 'Done';

  @override
  String get commonLoading => 'Loading…';

  @override
  String get commonError => 'Something went wrong';

  @override
  String get commonYes => 'Yes';

  @override
  String get commonNo => 'No';

  @override
  String get commonOk => 'OK';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonSeeAll => 'See all';

  @override
  String get commonJustNow => 'Just now';

  @override
  String get commonYesterday => 'Yesterday';

  @override
  String get authEmailLabel => 'Email';

  @override
  String get authEmailPlaceholder => 'you@example.com';

  @override
  String get authEmailSemantic => 'Email address';

  @override
  String get authPasswordLabel => 'Password';

  @override
  String get authPasswordSemantic => 'Password';

  @override
  String get authForgotPassword => 'Forgot password?';

  @override
  String get authSignInButton => 'Sign In';

  @override
  String get authSignInSemantic => 'Sign in';

  @override
  String get authNoAccountPrompt => 'Don\'t have an account? ';

  @override
  String get authCreateOneLink => 'Create one';

  @override
  String get authOpenEndpointTester => 'Open API Endpoint Tester';

  @override
  String get authWelcomeBackTitle => 'Welcome back';

  @override
  String get authWelcomeBackSubtitle => 'Sign in to keep your streak alive';

  @override
  String get authOrContinueWith => 'OR CONTINUE WITH';

  @override
  String get authContinueWithGoogle => 'Continue with Google';

  @override
  String get authContinueWithGoogleSemantic =>
      'Continue with Google (coming soon)';

  @override
  String get authAppleButton => 'Apple';

  @override
  String get authFacebookButton => 'Facebook';

  @override
  String get authContinueWithAppleSemantic =>
      'Continue with Apple (coming soon)';

  @override
  String get authContinueWithFacebookSemantic =>
      'Continue with Facebook (coming soon)';

  @override
  String get authTestModeLabel => 'Test mode';

  @override
  String get authEnterAsTestStudentSemantic => 'Enter as test student';

  @override
  String get authStudentButton => 'Student';

  @override
  String get authEnterAsTestParentSemantic => 'Enter as test parent';

  @override
  String get authParentButton => 'Parent';

  @override
  String get authEnterAsTestAdminSemantic => 'Enter as test admin';

  @override
  String get authAdminButton => 'Admin';

  @override
  String get authCreateAccount => 'Create account';

  @override
  String get authStartLearningTagline => 'Start learning English the fun way';

  @override
  String get authConfirmPasswordLabel => 'Confirm Password';

  @override
  String get authConfirmPasswordSemantic => 'Confirm password';

  @override
  String get authPasswordsDoNotMatch => 'Passwords do not match';

  @override
  String get authOrSignUpWith => 'OR SIGN UP WITH';

  @override
  String get authSignUpWithGoogle => 'Sign up with Google';

  @override
  String get authSignUpWithGoogleSemantic =>
      'Sign up with Google (coming soon)';

  @override
  String get authSignUpWithAppleSemantic => 'Sign up with Apple (coming soon)';

  @override
  String get authSignUpWithFacebookSemantic =>
      'Sign up with Facebook (coming soon)';

  @override
  String get authAgreeToTermsPrefix => 'By signing up you agree to AIM\'s ';

  @override
  String get authTermsLink => 'Terms';

  @override
  String get authAndConnector => ' and ';

  @override
  String get authPrivacyPolicyLink => 'Privacy Policy';

  @override
  String get authAlreadyHaveAccount => 'Already have an account? Sign in';

  @override
  String get authCheckYourEmailTitle => 'Check Your Email';

  @override
  String get authConfirmationEmailSentTitle => 'Confirmation email sent';

  @override
  String authConfirmationEmailBody(String email) {
    return 'We sent a confirmation link to:\n$email\n\nOpen the link to activate your account, then sign in.';
  }

  @override
  String get authGoToSignInButton => 'Go to Sign In';

  @override
  String get authGoToSignInSemantic => 'Go to sign in';

  @override
  String get authPasswordStrengthWeak => 'Weak';

  @override
  String get authPasswordStrengthMedium => 'Medium';

  @override
  String get authPasswordStrengthStrong => 'Strong';

  @override
  String authPasswordStrengthSemantic(String strength) {
    return 'Password strength: $strength';
  }

  @override
  String get authSignOutSemantic => 'Sign out';

  @override
  String get authSignOutButton => 'Sign Out';

  @override
  String get authFailedToLoadUser => 'Failed to load user';

  @override
  String get authFailedToSyncUser => 'Failed to sync and load user';

  @override
  String get authSessionExpiredError =>
      'Your session has expired. Please sign in again.';

  @override
  String get authSignInFailedGeneric => 'Sign in failed. Please try again.';

  @override
  String get authTestLoginFailedGeneric =>
      'Test login failed. Please try again.';

  @override
  String get authRegistrationFailedGeneric =>
      'Registration failed. Please try again.';

  @override
  String get devToolsEndpointTesterTitle => 'API Endpoint Tester';

  @override
  String get devToolsBodyLabel => 'Body:';

  @override
  String get devToolsSendRequestButton => 'Send Request';

  @override
  String get devToolsNoAuthTokenError =>
      'Error: No auth token found. Please login first.';

  @override
  String get shellOpenMenuTooltip => 'Open menu';

  @override
  String get shellNavHome => 'Home';

  @override
  String get shellNavHomeSemantic => 'Home tab';

  @override
  String get shellNavLearn => 'Learn';

  @override
  String get shellNavLearnSemantic => 'Learn tab';

  @override
  String get shellNavReview => 'Review';

  @override
  String get shellNavReviewSemantic => 'Review tab';

  @override
  String get shellNavProgress => 'Progress';

  @override
  String get shellNavProgressSemantic => 'Progress tab';

  @override
  String get shellNavProfile => 'Profile';

  @override
  String get shellNavProfileSemantic => 'Profile tab';

  @override
  String get shellMenuSectionLabel => 'MENU';

  @override
  String get shellMoreSectionLabel => 'MORE';

  @override
  String get shellNotifications => 'Notifications';

  @override
  String get shellAchievements => 'Achievements';

  @override
  String get shellAimPlus => 'AIM Plus';

  @override
  String get shellSupport => 'Support';

  @override
  String shellUnreadNotificationsSemantic(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count unread notifications',
      many: '$count unread notifications',
      few: '$count unread notifications',
      two: '$count unread notifications',
      one: '$count unread notification',
      zero: 'No unread notifications',
    );
    return '$_temp0';
  }

  @override
  String get shellBrandName => 'AIM Learning';

  @override
  String get shellBrandTagline => 'English, smarter';

  @override
  String get shellThemeLight => 'Light';

  @override
  String get shellThemeDark => 'Dark';

  @override
  String shellThemeSemantic(String theme) {
    return '$theme theme';
  }

  @override
  String get onboardingBrandName => 'AIM';

  @override
  String get onboardingTagline => 'Adaptive Intelligence for Mastery';

  @override
  String get onboardingTapToContinue => 'Tap to continue';
}
