import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        lookupAppLocalizations(const Locale('en'));
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en')
  ];

  /// The application title.
  ///
  /// In en, this message translates to:
  /// **'AIM Mobile'**
  String get appTitle;

  /// No description provided for @commonBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get commonBack;

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonResume.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get commonResume;

  /// No description provided for @commonPause.
  ///
  /// In en, this message translates to:
  /// **'Pause'**
  String get commonPause;

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// No description provided for @commonSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get commonSubmit;

  /// No description provided for @commonRetry.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get commonRetry;

  /// No description provided for @commonClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get commonClose;

  /// No description provided for @commonContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get commonContinue;

  /// No description provided for @commonStart.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get commonStart;

  /// No description provided for @commonDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get commonDone;

  /// No description provided for @commonLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get commonLoading;

  /// No description provided for @commonError.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get commonError;

  /// No description provided for @commonYes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get commonYes;

  /// No description provided for @commonNo.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get commonNo;

  /// No description provided for @commonOk.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get commonOk;

  /// No description provided for @commonDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// No description provided for @commonEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// No description provided for @commonSeeAll.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get commonSeeAll;

  /// No description provided for @commonJustNow.
  ///
  /// In en, this message translates to:
  /// **'Just now'**
  String get commonJustNow;

  /// No description provided for @commonYesterday.
  ///
  /// In en, this message translates to:
  /// **'Yesterday'**
  String get commonYesterday;

  /// Section header for the weakness/focus-areas list, shown on both the Home and Learning Path screens.
  ///
  /// In en, this message translates to:
  /// **'Focus Areas'**
  String get commonFocusAreas;

  /// Compact 'x/y done' progress label with no surrounding spaces, e.g. for a progress bar's value text.
  ///
  /// In en, this message translates to:
  /// **'{done}/{total} done'**
  String commonDoneProgress(int done, int total);

  /// Accessibility label for a weakness chip, shared by Home and Learning Path. skillId and severity are backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'{skillId} weakness: {severity}'**
  String commonWeaknessSemantic(String skillId, String severity);

  /// Label for the email input field on the login/register forms.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authEmailLabel;

  /// Example placeholder text shown inside the empty email field.
  ///
  /// In en, this message translates to:
  /// **'you@example.com'**
  String get authEmailPlaceholder;

  /// Accessibility label for the email input field.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get authEmailSemantic;

  /// Label for the password input field.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPasswordLabel;

  /// Accessibility label for the password input field.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPasswordSemantic;

  /// Non-interactive 'forgot password' link text shown on the login form.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get authForgotPassword;

  /// Label for the primary sign-in submit button.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authSignInButton;

  /// Accessibility label for the sign-in submit button.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authSignInSemantic;

  /// Prompt shown before the 'Create one' link on the login page.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? '**
  String get authNoAccountPrompt;

  /// Link back to the login page shown at the bottom of the register page.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Sign in'**
  String get authAlreadyHaveAccount;

  /// Link text that opens the registration page.
  ///
  /// In en, this message translates to:
  /// **'Create one'**
  String get authCreateOneLink;

  /// Developer-only button on the login page that opens the API endpoint tester.
  ///
  /// In en, this message translates to:
  /// **'Open API Endpoint Tester'**
  String get authOpenEndpointTester;

  /// Heading shown in the login page's gradient hero header.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get authWelcomeBackTitle;

  /// Subtitle shown beneath the welcome-back heading on the login page.
  ///
  /// In en, this message translates to:
  /// **'Sign in to keep your streak alive'**
  String get authWelcomeBackSubtitle;

  /// Divider label above the social sign-in buttons on the login page.
  ///
  /// In en, this message translates to:
  /// **'OR CONTINUE WITH'**
  String get authOrContinueWith;

  /// Label for the (visual-only) Google sign-in button on the login page.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get authContinueWithGoogle;

  /// Accessibility label for the disabled Google sign-in button on the login page.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google (coming soon)'**
  String get authContinueWithGoogleSemantic;

  /// Label for the (visual-only) Apple sign-in/sign-up button.
  ///
  /// In en, this message translates to:
  /// **'Apple'**
  String get authAppleButton;

  /// Label for the (visual-only) Facebook sign-in/sign-up button.
  ///
  /// In en, this message translates to:
  /// **'Facebook'**
  String get authFacebookButton;

  /// Accessibility label for the disabled Apple sign-in button on the login page.
  ///
  /// In en, this message translates to:
  /// **'Continue with Apple (coming soon)'**
  String get authContinueWithAppleSemantic;

  /// Accessibility label for the disabled Facebook sign-in button on the login page.
  ///
  /// In en, this message translates to:
  /// **'Continue with Facebook (coming soon)'**
  String get authContinueWithFacebookSemantic;

  /// Divider label above the developer test-mode shortcuts on the login page.
  ///
  /// In en, this message translates to:
  /// **'Test mode'**
  String get authTestModeLabel;

  /// Accessibility label for the developer test-mode 'Student' shortcut button.
  ///
  /// In en, this message translates to:
  /// **'Enter as test student'**
  String get authEnterAsTestStudentSemantic;

  /// Label for the developer test-mode 'Student' shortcut button.
  ///
  /// In en, this message translates to:
  /// **'Student'**
  String get authStudentButton;

  /// Accessibility label for the developer test-mode 'Parent' shortcut button.
  ///
  /// In en, this message translates to:
  /// **'Enter as test parent'**
  String get authEnterAsTestParentSemantic;

  /// Label for the developer test-mode 'Parent' shortcut button.
  ///
  /// In en, this message translates to:
  /// **'Parent'**
  String get authParentButton;

  /// Accessibility label for the developer test-mode 'Admin' shortcut button.
  ///
  /// In en, this message translates to:
  /// **'Enter as test admin'**
  String get authEnterAsTestAdminSemantic;

  /// Label for the developer test-mode 'Admin' shortcut button.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get authAdminButton;

  /// Register page heading, submit button label, and its accessibility label.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get authCreateAccount;

  /// Subtitle shown beneath the create-account heading on the register page.
  ///
  /// In en, this message translates to:
  /// **'Start learning English the fun way'**
  String get authStartLearningTagline;

  /// Label for the confirm-password input field on the register page.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get authConfirmPasswordLabel;

  /// Accessibility label for the confirm-password input field.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get authConfirmPasswordSemantic;

  /// Validation error shown when password and confirm-password fields differ.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get authPasswordsDoNotMatch;

  /// Divider label above the social sign-up buttons on the register page.
  ///
  /// In en, this message translates to:
  /// **'OR SIGN UP WITH'**
  String get authOrSignUpWith;

  /// Label for the (visual-only) Google sign-up button on the register page.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Google'**
  String get authSignUpWithGoogle;

  /// Accessibility label for the disabled Google sign-up button on the register page.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Google (coming soon)'**
  String get authSignUpWithGoogleSemantic;

  /// Accessibility label for the disabled Apple sign-up button on the register page.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Apple (coming soon)'**
  String get authSignUpWithAppleSemantic;

  /// Accessibility label for the disabled Facebook sign-up button on the register page.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Facebook (coming soon)'**
  String get authSignUpWithFacebookSemantic;

  /// Prefix of the terms/privacy-policy notice on the register page.
  ///
  /// In en, this message translates to:
  /// **'By signing up you agree to AIM\'s '**
  String get authAgreeToTermsPrefix;

  /// Non-interactive 'Terms' link text on the register page's terms notice.
  ///
  /// In en, this message translates to:
  /// **'Terms'**
  String get authTermsLink;

  /// Connector word between the Terms and Privacy Policy links.
  ///
  /// In en, this message translates to:
  /// **' and '**
  String get authAndConnector;

  /// Non-interactive 'Privacy Policy' link text on the register page's terms notice.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get authPrivacyPolicyLink;

  /// App bar title for the email-confirmation-sent screen.
  ///
  /// In en, this message translates to:
  /// **'Check Your Email'**
  String get authCheckYourEmailTitle;

  /// Heading on the email-confirmation-sent screen.
  ///
  /// In en, this message translates to:
  /// **'Confirmation email sent'**
  String get authConfirmationEmailSentTitle;

  /// Body text on the email-confirmation-sent screen, includes the address the link was sent to.
  ///
  /// In en, this message translates to:
  /// **'We sent a confirmation link to:\n{email}\n\nOpen the link to activate your account, then sign in.'**
  String authConfirmationEmailBody(String email);

  /// Button label that returns the user to the login page after registering.
  ///
  /// In en, this message translates to:
  /// **'Go to Sign In'**
  String get authGoToSignInButton;

  /// Accessibility label for the 'Go to Sign In' button.
  ///
  /// In en, this message translates to:
  /// **'Go to sign in'**
  String get authGoToSignInSemantic;

  /// Password-strength meter label for a weak password.
  ///
  /// In en, this message translates to:
  /// **'Weak'**
  String get authPasswordStrengthWeak;

  /// Password-strength meter label for a medium-strength password.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get authPasswordStrengthMedium;

  /// Password-strength meter label for a strong password.
  ///
  /// In en, this message translates to:
  /// **'Strong'**
  String get authPasswordStrengthStrong;

  /// Accessibility label announcing the current password strength.
  ///
  /// In en, this message translates to:
  /// **'Password strength: {strength}'**
  String authPasswordStrengthSemantic(String strength);

  /// Accessibility label for the sign-out button.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get authSignOutSemantic;

  /// Label for the sign-out button.
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get authSignOutButton;

  /// Fallback error message shown when the current user's profile fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load user'**
  String get authFailedToLoadUser;

  /// Fallback error message shown when syncing and loading the current user fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to sync and load user'**
  String get authFailedToSyncUser;

  /// Error message shown when the user's session has expired and they must sign in again.
  ///
  /// In en, this message translates to:
  /// **'Your session has expired. Please sign in again.'**
  String get authSessionExpiredError;

  /// Generic fallback error message shown when sign-in fails for an unknown reason.
  ///
  /// In en, this message translates to:
  /// **'Sign in failed. Please try again.'**
  String get authSignInFailedGeneric;

  /// Generic fallback error message shown when the developer test-login shortcut fails.
  ///
  /// In en, this message translates to:
  /// **'Test login failed. Please try again.'**
  String get authTestLoginFailedGeneric;

  /// Generic fallback error message shown when registration fails for an unknown reason.
  ///
  /// In en, this message translates to:
  /// **'Registration failed. Please try again.'**
  String get authRegistrationFailedGeneric;

  /// App bar title for the developer API endpoint tester screen.
  ///
  /// In en, this message translates to:
  /// **'API Endpoint Tester'**
  String get devToolsEndpointTesterTitle;

  /// Label above a request's default JSON body preview in the endpoint tester.
  ///
  /// In en, this message translates to:
  /// **'Body:'**
  String get devToolsBodyLabel;

  /// Button label that sends the selected API request in the endpoint tester.
  ///
  /// In en, this message translates to:
  /// **'Send Request'**
  String get devToolsSendRequestButton;

  /// Error shown in the endpoint tester when an authenticated request is attempted without a signed-in session.
  ///
  /// In en, this message translates to:
  /// **'Error: No auth token found. Please login first.'**
  String get devToolsNoAuthTokenError;

  /// Tooltip for the floating action button that opens the navigation drawer.
  ///
  /// In en, this message translates to:
  /// **'Open menu'**
  String get shellOpenMenuTooltip;

  /// Label for the Home destination in the bottom nav and drawer.
  ///
  /// In en, this message translates to:
  /// **'Home Feed'**
  String get shellNavHome;

  /// Accessibility label for the Home bottom-nav tab.
  ///
  /// In en, this message translates to:
  /// **'Home tab'**
  String get shellNavHomeSemantic;

  /// Label for the Learn destination in the bottom nav and drawer.
  ///
  /// In en, this message translates to:
  /// **'Chapters & Course'**
  String get shellNavLearn;

  /// Accessibility label for the Learn bottom-nav tab.
  ///
  /// In en, this message translates to:
  /// **'Learn tab'**
  String get shellNavLearnSemantic;

  /// Label for the Review destination in the bottom nav and drawer.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get shellNavReview;

  /// Accessibility label for the Review bottom-nav tab.
  ///
  /// In en, this message translates to:
  /// **'Review tab'**
  String get shellNavReviewSemantic;

  /// Label for the Progress destination in the bottom nav and drawer.
  ///
  /// In en, this message translates to:
  /// **'Analytics & Progress'**
  String get shellNavProgress;

  /// Accessibility label for the Progress bottom-nav tab.
  ///
  /// In en, this message translates to:
  /// **'Progress tab'**
  String get shellNavProgressSemantic;

  /// Log out button text in drawer
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get drawerLogOut;

  /// Label for the Profile destination in the bottom nav and drawer.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get shellNavProfile;

  /// Accessibility label for the Profile bottom-nav tab.
  ///
  /// In en, this message translates to:
  /// **'Profile tab'**
  String get shellNavProfileSemantic;

  /// Section heading above the primary navigation items in the drawer.
  ///
  /// In en, this message translates to:
  /// **'MENU'**
  String get shellMenuSectionLabel;

  /// Section heading above the secondary navigation items in the drawer.
  ///
  /// In en, this message translates to:
  /// **'MORE'**
  String get shellMoreSectionLabel;

  /// Drawer item label for the notifications inbox.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get shellNotifications;

  /// Drawer item label for the achievements screen.
  ///
  /// In en, this message translates to:
  /// **'Achievements'**
  String get shellAchievements;

  /// Drawer item label for the premium subscription / pricing screen.
  ///
  /// In en, this message translates to:
  /// **'AIM Plus'**
  String get shellAimPlus;

  /// Label for the Placement Test entry in the navigation drawer's MORE section.
  ///
  /// In en, this message translates to:
  /// **'Placement Test'**
  String get shellPlacementTest;

  /// Label for the Assessments entry in the navigation drawer's MORE section.
  ///
  /// In en, this message translates to:
  /// **'Assessments'**
  String get shellAssessments;

  /// Drawer item label for the help center.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get shellSupport;

  /// Accessibility label announcing the number of unread notifications on the drawer's Notifications badge.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, zero{No unread notifications} one{{count} unread notification} two{{count} unread notifications} few{{count} unread notifications} many{{count} unread notifications} other{{count} unread notifications}}'**
  String shellUnreadNotificationsSemantic(int count);

  /// App brand name shown in the navigation drawer header.
  ///
  /// In en, this message translates to:
  /// **'AIM Learning'**
  String get shellBrandName;

  /// Tagline shown beneath the brand name in the navigation drawer header.
  ///
  /// In en, this message translates to:
  /// **'English, smarter'**
  String get shellBrandTagline;

  /// Label for the light-theme toggle option in the drawer.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get shellThemeLight;

  /// Label for the dark-theme toggle option in the drawer.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get shellThemeDark;

  /// Accessibility label for a theme toggle option, e.g. 'Light theme'.
  ///
  /// In en, this message translates to:
  /// **'{theme} theme'**
  String shellThemeSemantic(String theme);

  /// Label for the English language toggle option in the drawer.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get shellLanguageEnglish;

  /// Label for the Arabic language toggle option in the drawer.
  ///
  /// In en, this message translates to:
  /// **'العربية'**
  String get shellLanguageArabic;

  /// Accessibility label for a language toggle option, e.g. 'English language'.
  ///
  /// In en, this message translates to:
  /// **'{language} language'**
  String shellLanguageSemantic(String language);

  /// App brand name shown on the splash screen.
  ///
  /// In en, this message translates to:
  /// **'AIM'**
  String get onboardingBrandName;

  /// Tagline shown beneath the brand name on the splash screen. Full expansion of the AIM acronym.
  ///
  /// In en, this message translates to:
  /// **'Academy of Intelligent Minds'**
  String get onboardingTagline;

  /// Static hint text shown alongside the splash screen's progress bar while the session check runs.
  ///
  /// In en, this message translates to:
  /// **'Tap to continue'**
  String get onboardingTapToContinue;

  /// Title of the first-time walkthrough's welcome slide.
  ///
  /// In en, this message translates to:
  /// **'Welcome to AIM'**
  String get onboardingWalkthroughWelcomeTitle;

  /// Body copy of the first-time walkthrough's welcome slide.
  ///
  /// In en, this message translates to:
  /// **'Your adaptive English learning companion. Let\'s take a quick look around.'**
  String get onboardingWalkthroughWelcomeBody;

  /// Title of the first-time walkthrough's placement test slide.
  ///
  /// In en, this message translates to:
  /// **'Find your level'**
  String get onboardingWalkthroughPlacementTitle;

  /// Body copy of the first-time walkthrough's placement test slide.
  ///
  /// In en, this message translates to:
  /// **'Take the Placement Test from the menu to get lessons matched to your real level.'**
  String get onboardingWalkthroughPlacementBody;

  /// Title of the first-time walkthrough's lessons slide.
  ///
  /// In en, this message translates to:
  /// **'Learn at your pace'**
  String get onboardingWalkthroughLessonsTitle;

  /// Body copy of the first-time walkthrough's lessons slide.
  ///
  /// In en, this message translates to:
  /// **'Browse courses and lessons in the Learn tab — each one unlocks as you make progress.'**
  String get onboardingWalkthroughLessonsBody;

  /// Title of the first-time walkthrough's streak slide.
  ///
  /// In en, this message translates to:
  /// **'Keep your streak going'**
  String get onboardingWalkthroughStreakTitle;

  /// Body copy of the first-time walkthrough's streak slide.
  ///
  /// In en, this message translates to:
  /// **'Practice a little every day — your Home screen tracks your streak and progress.'**
  String get onboardingWalkthroughStreakBody;

  /// Button label to skip the first-time walkthrough.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get onboardingWalkthroughSkip;

  /// Button label to advance to the next walkthrough slide.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get onboardingWalkthroughNext;

  /// Button label on the last walkthrough slide to dismiss it.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get onboardingWalkthroughGetStarted;

  /// Accessibility label shown while the home screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading home data'**
  String get homeLoadingSemantic;

  /// Shown under the home greeting when the data was refreshed less than a minute ago.
  ///
  /// In en, this message translates to:
  /// **'Updated just now'**
  String get homeLastUpdatedJustNow;

  /// Shown under the home greeting with how many minutes since the last successful refresh.
  ///
  /// In en, this message translates to:
  /// **'Updated {minutes, plural, one{1 minute ago} other{{minutes} minutes ago}}'**
  String homeLastUpdatedMinutesAgo(int minutes);

  /// Shown under the home greeting with how many hours since the last successful refresh.
  ///
  /// In en, this message translates to:
  /// **'Updated {hours, plural, one{1 hour ago} other{{hours} hours ago}}'**
  String homeLastUpdatedHoursAgo(int hours);

  /// Subtitle in the notifications sheet summarizing the number of unread, non-dismissed notifications.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, zero{No new notifications} one{1 new notification} other{{count} new notifications}}'**
  String homeUnreadNotificationsSubtitle(int count);

  /// Compact relative-time label for a notification created less than an hour ago.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1m ago} other{{count}m ago}}'**
  String homeMinutesAgoLabel(int count);

  /// Compact relative-time label for a notification created less than a day ago.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1h ago} other{{count}h ago}}'**
  String homeHoursAgoLabel(int count);

  /// Compact relative-time label for a notification created a few days ago.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1d ago} other{{count}d ago}}'**
  String homeDaysAgoLabel(int count);

  /// Compact relative-time label for a notification created a week or more ago.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1w ago} other{{count}w ago}}'**
  String homeWeeksAgoLabel(int count);

  /// Section header above the continue-learning hero card on the home screen.
  ///
  /// In en, this message translates to:
  /// **'Continue learning'**
  String get homeContinueLearningTitle;

  /// Link button next to 'Continue learning' that switches to the Learn tab.
  ///
  /// In en, this message translates to:
  /// **'Library'**
  String get homeLibraryLink;

  /// Section header above the daily challenge row on the home screen.
  ///
  /// In en, this message translates to:
  /// **'Daily challenges'**
  String get homeDailyChallengesTitle;

  /// Count of daily challenges completed, shown next to the 'Daily challenges' section header.
  ///
  /// In en, this message translates to:
  /// **'{done} / {total} done'**
  String homeDailyChallengeCountLabel(int done, int total);

  /// Section header above the quick-start lesson card on the home screen.
  ///
  /// In en, this message translates to:
  /// **'Quick Start'**
  String get homeQuickStartTitle;

  /// Label under the chapter-quiz node in the home course path.
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get homeCoursePathChapterQuizLabel;

  /// Label under the final-exam node in the home course path, and subtitle once the course's chapters are all complete.
  ///
  /// In en, this message translates to:
  /// **'Final Exam'**
  String get homeCoursePathFinalExamLabel;

  /// Subtitle shown under the course title in the home course path once every chapter and the final exam are complete.
  ///
  /// In en, this message translates to:
  /// **'Course complete'**
  String get homeCoursePathCompletedSubtitle;

  /// Section header above the recommended-course card on the home screen.
  ///
  /// In en, this message translates to:
  /// **'Recommended Course'**
  String get homeRecommendedCourseTitle;

  /// Section header above the daily-goal card on the home screen.
  ///
  /// In en, this message translates to:
  /// **'Goal'**
  String get homeGoalTitle;

  /// Section header above the skill-state cards on the home screen.
  ///
  /// In en, this message translates to:
  /// **'Skill States'**
  String get homeSkillStatesTitle;

  /// Section header above the review-schedule cards on the home screen.
  ///
  /// In en, this message translates to:
  /// **'Review Schedule'**
  String get homeReviewScheduleTitle;

  /// Section header above the AIM recommendation cards on the home screen.
  ///
  /// In en, this message translates to:
  /// **'AIM Recommendations'**
  String get homeRecommendationsTitle;

  /// Section header shown above the getting-started promo cards for students with no AIM data yet.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get homeGetStartedTitle;

  /// Title of the getting-started promo card that opens the placement test.
  ///
  /// In en, this message translates to:
  /// **'Placement Test'**
  String get homePlacementTestTitle;

  /// Subtitle of the getting-started promo card that opens the placement test.
  ///
  /// In en, this message translates to:
  /// **'Find your level and get personalised recommendations.'**
  String get homePlacementTestSubtitle;

  /// Title of the getting-started promo card that switches to the Learn tab.
  ///
  /// In en, this message translates to:
  /// **'Browse Courses'**
  String get homeBrowseCoursesTitle;

  /// Subtitle of the getting-started promo card that switches to the Learn tab.
  ///
  /// In en, this message translates to:
  /// **'Explore available courses and start learning.'**
  String get homeBrowseCoursesSubtitle;

  /// Title of the getting-started promo card that opens the assessments list.
  ///
  /// In en, this message translates to:
  /// **'Assessments'**
  String get homeAssessmentsTitle;

  /// Subtitle of the getting-started promo card that opens the assessments list.
  ///
  /// In en, this message translates to:
  /// **'View and take available assessments.'**
  String get homeAssessmentsSubtitle;

  /// Small caption above the greeting, e.g. 'Monday · let's go'. weekday is already localized via intl.
  ///
  /// In en, this message translates to:
  /// **'{weekday} · let\'s go'**
  String homeGreetingWeekdayLine(String weekday);

  /// Main greeting line on the home screen showing the student's first name.
  ///
  /// In en, this message translates to:
  /// **'Hey {name} ✦'**
  String homeGreetingHey(String name);

  /// Accessibility label for the streak pill in the home screen's greeting header.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 day streak} other{{count} day streak}}'**
  String homeStreakDaysSemantic(int count);

  /// Encouraging caption at the top of the level hero card on the home screen.
  ///
  /// In en, this message translates to:
  /// **'You\'re crushing your goals 🚀'**
  String get homeCrushingGoalsTitle;

  /// Small eyebrow label above the student's level number on the home screen's level hero card.
  ///
  /// In en, this message translates to:
  /// **'LEVEL'**
  String get homeLevelLabel;

  /// Small label under the XP-earned-today figure on the home screen's level hero card.
  ///
  /// In en, this message translates to:
  /// **'XP TODAY'**
  String get homeXpTodayLabel;

  /// Accessibility label for the level hero card when the student has not yet reached the max level.
  ///
  /// In en, this message translates to:
  /// **'Level {level}, {xp} XP, {nextXp} XP to level {nextLevel}'**
  String homeLevelHeroSemanticNext(
      int level, int xp, int nextXp, int nextLevel);

  /// Accessibility label for the level hero card when the student is at the max level.
  ///
  /// In en, this message translates to:
  /// **'Level {level}, {xp} XP (max level)'**
  String homeLevelHeroSemanticMax(int level, int xp);

  /// XP progress text shown on the level hero card when a next level exists. xp/nextXp are already thousands-separator formatted.
  ///
  /// In en, this message translates to:
  /// **'{xp} / {nextXp} XP'**
  String homeXpProgressWithNext(String xp, String nextXp);

  /// XP progress text shown on the level hero card when the student is at the max level. xp is already thousands-separator formatted.
  ///
  /// In en, this message translates to:
  /// **'{xp} XP'**
  String homeXpProgressMax(String xp);

  /// Label pointing to the next level on the level hero card.
  ///
  /// In en, this message translates to:
  /// **'Level {level} →'**
  String homeNextLevelCta(int level);

  /// Label shown instead of a next-level pointer once the student is at the max level.
  ///
  /// In en, this message translates to:
  /// **'Max level'**
  String get homeMaxLevelLabel;

  /// Badge-count pill on the home screen's level hero card.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 badge} other{{count} badges}}'**
  String homeBadgeCountLabel(int count);

  /// Rank-percentile pill on the home screen's level hero card.
  ///
  /// In en, this message translates to:
  /// **'Top {percent}%'**
  String homeTopPercentLabel(int percent);

  /// Button label that resumes the in-progress lesson from the continue-learning hero card.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get homeResumeButton;

  /// Percent-complete caption shown under a lesson title on continue-learning cards.
  ///
  /// In en, this message translates to:
  /// **'{percent}% complete'**
  String homePercentCompleteLabel(int percent);

  /// Accessibility label for the home screen's continue-learning hero card.
  ///
  /// In en, this message translates to:
  /// **'Continue {title}, {percent} percent complete'**
  String homeContinueSemanticLabel(String title, int percent);

  /// Accessibility label for a daily challenge row/card.
  ///
  /// In en, this message translates to:
  /// **'Daily challenge: {title}, {progress} of {target}'**
  String homeDailyChallengeSemantic(String title, int progress, int target);

  /// Accessibility label for the quick-start lesson card.
  ///
  /// In en, this message translates to:
  /// **'Quick Start: {title}'**
  String homeQuickStartSemantic(String title);

  /// Accessibility label for the recommended-course card.
  ///
  /// In en, this message translates to:
  /// **'Recommended course: {title}'**
  String homeRecommendedCourseSemantic(String title);

  /// Accessibility label for an AIM recommendation card on the home screen. kind and skillId are backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'AIM recommendation: {kind} {skillId}'**
  String homeRecommendationSemantic(String kind, String skillId);

  /// Accessibility label for the standalone HomeContinueLearningCard widget.
  ///
  /// In en, this message translates to:
  /// **'Continue learning: {title}, {percent}% complete'**
  String homeContinueLearningCardSemantic(String title, int percent);

  /// Accessibility label for a review-schedule card. skillId and dueAt are backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'Review {skillId} due {dueAt}'**
  String homeReviewScheduleSemantic(String skillId, String dueAt);

  /// Accessibility label for a skill-state card. skillId is a backend-supplied value.
  ///
  /// In en, this message translates to:
  /// **'{skillId} mastery: {percent}%'**
  String homeSkillMasterySemantic(String skillId, String percent);

  /// Mastery-percent caption shown on a skill-state card.
  ///
  /// In en, this message translates to:
  /// **'{percent}% mastery'**
  String homeMasteryPercentLabel(String percent);

  /// Accessibility label for the daily-goal card.
  ///
  /// In en, this message translates to:
  /// **'Daily goal: {completed} of {target} lessons, {streak} day streak'**
  String homeGoalSemantic(int completed, int target, int streak);

  /// Title on the daily-goal card.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Goal'**
  String get homeTodaysGoalTitle;

  /// Progress caption on the daily-goal card.
  ///
  /// In en, this message translates to:
  /// **'{completed} of {target} lessons completed today'**
  String homeGoalProgressLabel(int completed, int target);

  /// Accessibility label shown while the learning path screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading learning path data'**
  String get learningPathLoadingSemantic;

  /// Title in the learning path screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Learning Path'**
  String get learningPathHeaderTitle;

  /// Subtitle in the learning path screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Your personalized roadmap'**
  String get learningPathHeaderSubtitle;

  /// Title shown when the student has no learning path data yet.
  ///
  /// In en, this message translates to:
  /// **'Your learning path is empty'**
  String get learningPathEmptyTitle;

  /// Subtitle shown when the student has no learning path data yet.
  ///
  /// In en, this message translates to:
  /// **'Complete your placement test to generate a personalised learning path.'**
  String get learningPathEmptySubtitle;

  /// Section header above the skill-state cards on the learning path screen.
  ///
  /// In en, this message translates to:
  /// **'Skill coverage'**
  String get learningPathSkillCoverageTitle;

  /// Section header above the AIM recommendation cards on the learning path screen.
  ///
  /// In en, this message translates to:
  /// **'Next up'**
  String get learningPathNextUpTitle;

  /// Badge shown next to the 'Next up' section header.
  ///
  /// In en, this message translates to:
  /// **'AI picked'**
  String get learningPathAiPickedBadge;

  /// Accessibility label for an AIM recommendation card on the learning path screen. kind and skillId are backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'AIM recommendation: {kind} for {skillId}'**
  String learningPathRecommendationSemantic(String kind, String skillId);

  /// Accessibility label for a skill-state card on the learning path screen. title and trend are derived from backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'{title} mastery: {percent}%, {trend}'**
  String learningPathSkillMasterySemantic(
      String title, String percent, String trend);

  /// Accessibility label shown while the chapter list is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading chapters'**
  String get lessonsLoadingChaptersSemantic;

  /// Chapter count subtitle shown under the course title on the chapter list header.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 chapter} other{{count} chapters}}'**
  String lessonsChapterCountLabel(int count);

  /// Accessibility label for the overall-percent-done badge on the chapter list header.
  ///
  /// In en, this message translates to:
  /// **'{percent} percent done'**
  String lessonsPercentDoneSemantic(int percent);

  /// Small eyebrow label under the percent-done figure on the chapter list header.
  ///
  /// In en, this message translates to:
  /// **'DONE'**
  String get lessonsDoneBadge;

  /// Filter chip label showing every chapter.
  ///
  /// In en, this message translates to:
  /// **'All chapters'**
  String get lessonsFilterAllChapters;

  /// Filter chip and status badge label for in-progress chapters/courses.
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get lessonsInProgressLabel;

  /// Filter chip and status badge label for completed chapters/courses/lessons.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get lessonsCompletedLabel;

  /// Status badge label for a course the student has not started yet.
  ///
  /// In en, this message translates to:
  /// **'Not started'**
  String get lessonsNotStartedLabel;

  /// Empty-state title shown when a course has no published chapters.
  ///
  /// In en, this message translates to:
  /// **'No chapters available'**
  String get lessonsNoChaptersTitle;

  /// Empty-state subtitle shown when a course has no published chapters.
  ///
  /// In en, this message translates to:
  /// **'Published chapters will appear here.'**
  String get lessonsNoChaptersSubtitle;

  /// Empty-state title shown when the selected chapter filter has no matches.
  ///
  /// In en, this message translates to:
  /// **'No chapters in this filter'**
  String get lessonsNoChaptersFilterTitle;

  /// Empty-state subtitle shown when the selected chapter filter has no matches.
  ///
  /// In en, this message translates to:
  /// **'Try a different filter above.'**
  String get lessonsTryDifferentFilterSubtitle;

  /// Accessibility label shown while the course list is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading courses'**
  String get lessonsLoadingCoursesSemantic;

  /// Empty-state title shown when there are no published courses.
  ///
  /// In en, this message translates to:
  /// **'No courses available'**
  String get lessonsNoCoursesTitle;

  /// Empty-state subtitle shown when there are no published courses.
  ///
  /// In en, this message translates to:
  /// **'Published courses will appear here.'**
  String get lessonsNoCoursesSubtitle;

  /// Heading at the top of the course list screen.
  ///
  /// In en, this message translates to:
  /// **'Courses'**
  String get lessonsCoursesPageTitle;

  /// Snackbar message shown when a student taps a locked course tile.
  ///
  /// In en, this message translates to:
  /// **'Finish your current level to unlock this course'**
  String get lessonsCourseLockedMessage;

  /// Accessibility label for the lock icon/badge shown on a locked course tile.
  ///
  /// In en, this message translates to:
  /// **'Locked'**
  String get lessonsCourseLockedSemantic;

  /// Level badge shown next to the course list heading.
  ///
  /// In en, this message translates to:
  /// **'Level {level}'**
  String lessonsLevelBadge(String level);

  /// Subtitle shown under the course list heading.
  ///
  /// In en, this message translates to:
  /// **'Level up your English, step by step'**
  String get lessonsCoursesSubtitle;

  /// Badge on the course tile that is the student's current active enrollment.
  ///
  /// In en, this message translates to:
  /// **'Current'**
  String get lessonsCurrentCourseBadge;

  /// Title of the confirmation dialog shown before enrolling in a course.
  ///
  /// In en, this message translates to:
  /// **'Start this course?'**
  String get lessonsStartCourseDialogTitle;

  /// Body of the start-course confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'{courseTitle} will become your active course.'**
  String lessonsStartCourseDialogMessage(String courseTitle);

  /// Body of the confirmation dialog shown when switching from one active course to a different one.
  ///
  /// In en, this message translates to:
  /// **'You\'re currently in {currentCourseTitle}. Switching to {courseTitle} will make it your active course instead.'**
  String lessonsSwitchCourseDialogMessage(
      String currentCourseTitle, String courseTitle);

  /// Confirm button on the start-course dialog.
  ///
  /// In en, this message translates to:
  /// **'Start course'**
  String get lessonsStartCourseConfirmButton;

  /// Cancel button on the start-course dialog.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get lessonsStartCourseCancelButton;

  /// Snackbar shown when the enroll request fails.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t start this course. Please check your connection and try again.'**
  String get lessonsStartCourseFailedMessage;

  /// Filter chip label showing every course.
  ///
  /// In en, this message translates to:
  /// **'All courses'**
  String get lessonsFilterAllCourses;

  /// Message shown when the selected course filter has no matches.
  ///
  /// In en, this message translates to:
  /// **'No courses match this filter yet.'**
  String get lessonsNoCoursesFilterMessage;

  /// Accessibility label shown while the lesson list is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading lessons'**
  String get lessonsLoadingLessonsSemantic;

  /// Small eyebrow label above the chapter title on the lesson list header.
  ///
  /// In en, this message translates to:
  /// **'CHAPTER {number}'**
  String lessonsChapterEyebrowLabel(int number);

  /// Empty-state title shown when a chapter has no published lessons.
  ///
  /// In en, this message translates to:
  /// **'No lessons available'**
  String get lessonsNoLessonsTitle;

  /// Empty-state subtitle shown when a chapter has no published lessons.
  ///
  /// In en, this message translates to:
  /// **'Published lessons will appear here.'**
  String get lessonsNoLessonsSubtitle;

  /// Accessibility label shown while a single lesson's detail is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading lesson'**
  String get lessonsLoadingLessonSemantic;

  /// App bar title on the lesson detail screen.
  ///
  /// In en, this message translates to:
  /// **'Lesson'**
  String get lessonsLessonAppBarTitle;

  /// Accessibility label for the disabled bookmark/save-lesson action on the lesson detail screen.
  ///
  /// In en, this message translates to:
  /// **'Save lesson (coming soon)'**
  String get lessonsSaveLessonComingSoonSemantic;

  /// Section header above the step list on the lesson detail screen.
  ///
  /// In en, this message translates to:
  /// **'What\'s inside'**
  String get lessonsWhatsInsideTitle;

  /// Step count shown next to the 'What's inside' section header.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 step} other{{count} steps}}'**
  String lessonsStepsCountLabel(int count);

  /// Empty-state title shown when a lesson has no published assets.
  ///
  /// In en, this message translates to:
  /// **'No content yet'**
  String get lessonsNoContentTitle;

  /// Empty-state subtitle shown when a lesson has no published assets.
  ///
  /// In en, this message translates to:
  /// **'Published lesson content will appear here.'**
  String get lessonsNoContentSubtitle;

  /// Button label that opens the AI Teacher chat for this lesson.
  ///
  /// In en, this message translates to:
  /// **'Start practice'**
  String get lessonsStartPracticeButton;

  /// Context label passed along to the AI Teacher chat screen when starting practice from a lesson.
  ///
  /// In en, this message translates to:
  /// **'Lesson practice'**
  String get lessonsPracticeContextLabel;

  /// Pill on the lesson detail hero banner showing the lesson's position within its chapter.
  ///
  /// In en, this message translates to:
  /// **'Lesson {number}'**
  String lessonsLessonNumberPill(int number);

  /// Total duration pill on the lesson detail hero banner.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 min} other{{count} min}}'**
  String lessonsMinutesLabel(int count);

  /// Content-block count pill on the lesson detail hero banner.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 block} other{{count} blocks}}'**
  String lessonsBlocksCountLabel(int count);

  /// XP-earned badge on the lesson detail hero banner.
  ///
  /// In en, this message translates to:
  /// **'+{xp} XP'**
  String lessonsXpBadge(int xp);

  /// Title of the bottom sheet shown when a lesson step is tapped.
  ///
  /// In en, this message translates to:
  /// **'Step {number}'**
  String lessonsStepTitleLabel(int number);

  /// Accessibility label for a step row on the lesson detail screen.
  ///
  /// In en, this message translates to:
  /// **'Step {number}: {title}'**
  String lessonsStepSemantic(int number, String title);

  /// Accessibility label for a lesson asset entry. type is a backend-supplied value (e.g. image, audio, video).
  ///
  /// In en, this message translates to:
  /// **'{type} asset: {title}'**
  String lessonsAssetSemantic(String type, String title);

  /// Accessibility label for a course card when the course has no level code.
  ///
  /// In en, this message translates to:
  /// **'Course: {title}, {percent} percent complete'**
  String lessonsCourseSemanticBase(String title, int percent);

  /// Accessibility label for a course card when the course has a level code.
  ///
  /// In en, this message translates to:
  /// **'Course: {title}, level {level}, {percent} percent complete'**
  String lessonsCourseSemanticWithLevel(
      String title, String level, int percent);

  /// Lesson count caption shown on course and chapter cards.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 lesson} other{{count} lessons}}'**
  String lessonsLessonsCountLabel(int count);

  /// Quiz count caption shown on course and chapter cards.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 quiz} other{{count} quizzes}}'**
  String lessonsQuizzesCountLabel(int count);

  /// Final exam count caption shown on course cards.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 exam} other{{count} exams}}'**
  String lessonsExamsCountLabel(int count);

  /// Title of the always-shown Final Exam card at the end of the chapter list.
  ///
  /// In en, this message translates to:
  /// **'Final Exam'**
  String get lessonsFinalExamTitle;

  /// Subtitle on the Final Exam card while it is locked.
  ///
  /// In en, this message translates to:
  /// **'Complete every chapter to unlock'**
  String get lessonsFinalExamLockedSubtitle;

  /// Label for the tappable quiz row at the end of the lesson list.
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get lessonsQuizRowLabel;

  /// Accessibility label for a lesson card.
  ///
  /// In en, this message translates to:
  /// **'Lesson: {title}'**
  String lessonsLessonSemantic(String title);

  /// XP-value badge shown on a lesson card.
  ///
  /// In en, this message translates to:
  /// **'{xp} XP'**
  String lessonsXpValueLabel(int xp);

  /// Accessibility label for the trailing play button on the current lesson's card.
  ///
  /// In en, this message translates to:
  /// **'Start lesson'**
  String get lessonsStartLessonSemantic;

  /// Accessibility label for a chapter card.
  ///
  /// In en, this message translates to:
  /// **'Chapter: {title}'**
  String lessonsChapterSemantic(String title);

  /// Error card message shown when an image lesson asset has no URL.
  ///
  /// In en, this message translates to:
  /// **'Image URL is missing for asset: {title}'**
  String lessonsImageUrlMissingError(String title);

  /// Error card message shown when an image lesson asset fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load image: {title}'**
  String lessonsImageLoadFailedError(String title);

  /// Word-count subtitle shown on a vocabulary lesson asset card.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 new word} other{{count} new words}}'**
  String lessonsNewWordsCountLabel(int count);

  /// Item-count subtitle shown on an exercise lesson asset card.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 item} other{{count} items}}'**
  String lessonsItemsCountLabel(int count);

  /// Button on the lesson detail screen that starts a real question practice session (learning session).
  ///
  /// In en, this message translates to:
  /// **'Practice questions'**
  String get lessonsPracticeQuestionsButton;

  /// Caption shown under the disabled Practice questions button until the AI Teacher marks this lesson complete.
  ///
  /// In en, this message translates to:
  /// **'Finish the lesson with your AI teacher first to unlock practice.'**
  String get lessonsPracticeLockedHint;

  /// Button shown after an answer is acknowledged, advancing to the next delivered question.
  ///
  /// In en, this message translates to:
  /// **'Next question'**
  String get practiceNextQuestionButton;

  /// Semantic label for the loading state while the practice session starts.
  ///
  /// In en, this message translates to:
  /// **'Starting practice session'**
  String get practiceSessionLoadingSemantic;

  /// Fallback error message when starting a practice session fails.
  ///
  /// In en, this message translates to:
  /// **'Could not start the practice session'**
  String get practiceSessionFailedMessage;

  /// Empty-state title when a lesson has no published practice questions.
  ///
  /// In en, this message translates to:
  /// **'No questions yet'**
  String get practiceSessionEmptyTitle;

  /// Empty-state subtitle when a lesson has no published practice questions.
  ///
  /// In en, this message translates to:
  /// **'This lesson has no practice questions yet. Check back soon.'**
  String get practiceSessionEmptySubtitle;

  /// Title shown when all delivered questions have been answered.
  ///
  /// In en, this message translates to:
  /// **'Practice complete!'**
  String get practiceSessionCompleteTitle;

  /// Button that closes the completed practice session.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get practiceSessionDoneButton;

  /// Subtitle on the practice-complete screen.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{You answered 1 question. AIM is analysing your responses.} other{You answered {count} questions. AIM is analysing your responses.}}'**
  String practiceSessionCompleteSubtitle(int count);

  /// Shown on the practice-complete screen when saving lesson progress/completion to the backend failed.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t save your progress. The next lesson may stay locked until this is saved — check your connection and try again.'**
  String get practiceSessionCompletionNotSavedMessage;

  /// Button to retry saving lesson progress/completion after a failure.
  ///
  /// In en, this message translates to:
  /// **'Retry saving progress'**
  String get practiceSessionRetrySaveButton;

  /// Label for full name input field on registration form.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get authFullNameLabel;

  /// Subtitle text on the login screen.
  ///
  /// In en, this message translates to:
  /// **'We are happy to see you here again. Enter your email address and password'**
  String get authWelcomeSubtitle;

  /// Snackbar message shown when clicking forgot password.
  ///
  /// In en, this message translates to:
  /// **'Password reset — coming soon'**
  String get authPasswordResetComingSoon;

  /// Subtitle text on the registration screen.
  ///
  /// In en, this message translates to:
  /// **'Create your account, it takes less than a minute. Enter your email and password'**
  String get authRegisterSubtitle;

  /// Or divider connector in sign in / sign up forms.
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get authOrConnector;

  /// Badge label on the placement gate vision step.
  ///
  /// In en, this message translates to:
  /// **'AI Adaptive'**
  String get placementGateAiAdaptive;

  /// Stat pill text on the placement gate vision step.
  ///
  /// In en, this message translates to:
  /// **'94% retention'**
  String get placementGateRetention;

  /// Title on the placement gate vision step.
  ///
  /// In en, this message translates to:
  /// **'Your personal AI\nTutor, built for you.'**
  String get placementGateVisionTitle;

  /// Subtitle on the placement gate vision step.
  ///
  /// In en, this message translates to:
  /// **'Adaptive AI learning paths that evolve with your progress — lessons, quizzes, and mentorship shaped around you.'**
  String get placementGateVisionSubtitle;

  /// Title on the placement gate goal focus step.
  ///
  /// In en, this message translates to:
  /// **'What is your\nprimary focus?'**
  String get placementGateFocusTitle;

  /// Subtitle on the placement gate goal focus step.
  ///
  /// In en, this message translates to:
  /// **'Select the goal that matches your current target.'**
  String get placementGateFocusSubtitle;

  /// Focus option label for Career & Work.
  ///
  /// In en, this message translates to:
  /// **'Career & Work'**
  String get placementGateFocusCareer;

  /// Focus option label for Exams & School.
  ///
  /// In en, this message translates to:
  /// **'Exams & School'**
  String get placementGateFocusExams;

  /// Focus option label for Real-life Speaking.
  ///
  /// In en, this message translates to:
  /// **'Real-life Speaking'**
  String get placementGateFocusSpeaking;

  /// Focus option label for Media & Culture.
  ///
  /// In en, this message translates to:
  /// **'Media & Culture'**
  String get placementGateFocusMedia;

  /// Title on the placement gate habit step.
  ///
  /// In en, this message translates to:
  /// **'Set your daily goal'**
  String get placementGateHabitTitle;

  /// Subtitle on the placement gate habit step.
  ///
  /// In en, this message translates to:
  /// **'How much time will you commit to learning each day?'**
  String get placementGateHabitSubtitle;

  /// Habit option label for 5 minutes.
  ///
  /// In en, this message translates to:
  /// **'5 mins / day'**
  String get placementGateHabit5Min;

  /// Habit option subtitle for 5 minutes.
  ///
  /// In en, this message translates to:
  /// **'Light — great for staying consistent'**
  String get placementGateHabit5MinSub;

  /// Habit option label for 15 minutes.
  ///
  /// In en, this message translates to:
  /// **'15 mins / day'**
  String get placementGateHabit15Min;

  /// Habit option subtitle for 15 minutes.
  ///
  /// In en, this message translates to:
  /// **'Balanced — recommended for most learners'**
  String get placementGateHabit15MinSub;

  /// Habit option label for 30 minutes.
  ///
  /// In en, this message translates to:
  /// **'30 mins / day'**
  String get placementGateHabit30Min;

  /// Habit option subtitle for 30 minutes.
  ///
  /// In en, this message translates to:
  /// **'Intensive — fastest path to fluency'**
  String get placementGateHabit30MinSub;

  /// Title on the placement gate start mode step.
  ///
  /// In en, this message translates to:
  /// **'How would you\nlike to start?'**
  String get placementGateStartTitle;

  /// Subtitle on the placement gate start mode step.
  ///
  /// In en, this message translates to:
  /// **'Choose carefully! The placement test can only be taken once to accurately calibrate your AI tutor.'**
  String get placementGateStartSubtitle;

  /// Title for start from zero option on placement gate.
  ///
  /// In en, this message translates to:
  /// **'Start from Zero'**
  String get placementGateStartFromZeroTitle;

  /// Subtitle for start from zero option on placement gate.
  ///
  /// In en, this message translates to:
  /// **'Skip the test and start from the absolute basics.'**
  String get placementGateStartFromZeroSub;

  /// Title for test knowledge option on placement gate.
  ///
  /// In en, this message translates to:
  /// **'Test My Knowledge'**
  String get placementGateTestKnowledgeTitle;

  /// Subtitle for test knowledge option on placement gate.
  ///
  /// In en, this message translates to:
  /// **'Test your skills to let the AI find your level.'**
  String get placementGateTestKnowledgeSub;

  /// Progress step label on the placement gate onboarding slides.
  ///
  /// In en, this message translates to:
  /// **'Step {current} of {total}'**
  String placementGateStepLabel(int current, int total);

  /// Subtitle description for Career Focus option.
  ///
  /// In en, this message translates to:
  /// **'Professional vocabulary & business English'**
  String get placementGateFocusCareerSub;

  /// Subtitle description for Exams Focus option.
  ///
  /// In en, this message translates to:
  /// **'IELTS, TOEFL, and academic prep'**
  String get placementGateFocusExamsSub;

  /// Subtitle description for Speaking Focus option.
  ///
  /// In en, this message translates to:
  /// **'Fluency in everyday conversations'**
  String get placementGateFocusSpeakingSub;

  /// Subtitle description for Media Focus option.
  ///
  /// In en, this message translates to:
  /// **'Movies, podcasts, and casual slang'**
  String get placementGateFocusMediaSub;

  /// Recommended badge text on the placement gate start step.
  ///
  /// In en, this message translates to:
  /// **'Recommended'**
  String get placementGateRecommendedBadge;

  /// Label for sections info row in placement intro.
  ///
  /// In en, this message translates to:
  /// **'Sections'**
  String get placementIntroSectionsLabel;

  /// Value format for sections count in placement intro.
  ///
  /// In en, this message translates to:
  /// **'{count} sections'**
  String placementIntroSectionsValue(int count);

  /// Label for estimated time info row in placement intro.
  ///
  /// In en, this message translates to:
  /// **'Estimated time'**
  String get placementIntroEstimatedTimeLabel;

  /// Value format for estimated time in placement intro.
  ///
  /// In en, this message translates to:
  /// **'~{minutes} min'**
  String placementIntroEstimatedTimeValue(int minutes);

  /// Notice text on placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'Your level is determined by the backend after completion. Results are never calculated on your device.'**
  String get placementIntroNote;

  /// Header title on placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'General English Placement'**
  String get placementIntroTitle;

  /// Header subtitle on placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'A quick check to find your starting level.'**
  String get placementIntroSubtitle;

  /// Dialog title for retaking placement test.
  ///
  /// In en, this message translates to:
  /// **'Retake the placement test?'**
  String get placementMenuRetakeTitle;

  /// Dialog message for retaking placement test.
  ///
  /// In en, this message translates to:
  /// **'Your current result will stay on record, but a new attempt will replace it as your latest placement result.'**
  String get placementMenuRetakeMessage;

  /// Button label to confirm retaking placement test.
  ///
  /// In en, this message translates to:
  /// **'Retake'**
  String get placementMenuRetakeButton;

  /// Accessibility label while checking placement status.
  ///
  /// In en, this message translates to:
  /// **'Checking placement test status'**
  String get placementMenuCheckingStatusSemantic;

  /// Display name for Beginner level.
  ///
  /// In en, this message translates to:
  /// **'Beginner'**
  String get placementMenuLevelBeginner;

  /// Display name for Elementary level.
  ///
  /// In en, this message translates to:
  /// **'Elementary'**
  String get placementMenuLevelElementary;

  /// Display name for Intermediate level.
  ///
  /// In en, this message translates to:
  /// **'Intermediate'**
  String get placementMenuLevelIntermediate;

  /// Display name for Upper Intermediate level.
  ///
  /// In en, this message translates to:
  /// **'Upper Intermediate'**
  String get placementMenuLevelUpperIntermediate;

  /// Display name for Advanced level.
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get placementMenuLevelAdvanced;

  /// Loading semantic label on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Loading placement test guidelines'**
  String get placementStartLoadingGuidelines;

  /// Starting attempt semantic label on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Starting placement test'**
  String get placementStartStartingTest;

  /// Top section label on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Test Overview'**
  String get placementStartTestOverview;

  /// Header title on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Level Assessment'**
  String get placementStartAssessmentTitle;

  /// Header subtitle on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Calibrate your AI tutor to find your optimal starting point.'**
  String get placementStartAssessmentSubtitle;

  /// Timed limit title on placement start page.
  ///
  /// In en, this message translates to:
  /// **'{minutes} Minutes'**
  String placementStartLimitTitle(int minutes);

  /// Timed limit description on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Estimated duration for a full calibrated assessment.'**
  String get placementStartLimitDesc;

  /// Questions count title on placement start page.
  ///
  /// In en, this message translates to:
  /// **'{count} Adaptive Questions'**
  String placementStartQuestionsTitle(int count);

  /// Questions count description on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Questions dynamically adapt to your skill level.'**
  String get placementStartQuestionsDesc;

  /// AI calibration title on placement start page.
  ///
  /// In en, this message translates to:
  /// **'Helpful Tip'**
  String get placementStartCalibrationTitle;

  /// AI calibration description on placement start page.
  ///
  /// In en, this message translates to:
  /// **'If you don\'t know an answer, it is okay to skip and let the AI adjust.'**
  String get placementStartCalibrationDesc;

  /// Default title for placement question page.
  ///
  /// In en, this message translates to:
  /// **'Placement Question'**
  String get placementQuestionDefaultTitle;

  /// Header title on placement section page.
  ///
  /// In en, this message translates to:
  /// **'Section {index} of {total}'**
  String placementSectionHeaderTitle(int index, int total);

  /// Semantic loading label on placement result page.
  ///
  /// In en, this message translates to:
  /// **'Loading your result'**
  String get placementResultLoadingSemantic;

  /// Scoring in progress title.
  ///
  /// In en, this message translates to:
  /// **'Scoring in progress…'**
  String get placementResultScoringTitle;

  /// Scoring in progress subtitle.
  ///
  /// In en, this message translates to:
  /// **'The backend is evaluating your answers.'**
  String get placementResultScoringSubtitle;

  /// Scoring in progress semantic label.
  ///
  /// In en, this message translates to:
  /// **'Scoring in progress'**
  String get placementResultScoringSemantic;

  /// Submission successful title.
  ///
  /// In en, this message translates to:
  /// **'Submission Successful'**
  String get placementSubmitSuccessfulTitle;

  /// Evaluating message on placement submit page.
  ///
  /// In en, this message translates to:
  /// **'Your responses have been uploaded. The AI engine is calibrating your level.'**
  String get placementSubmitEvaluatingMessage;

  /// Great job header on placement result page.
  ///
  /// In en, this message translates to:
  /// **'Great Job! 🎉'**
  String get placementResultGreatJob;

  /// Skills detected subtitle on placement result page.
  ///
  /// In en, this message translates to:
  /// **'Strong listening and grammar skills detected. Start here for the best experience.'**
  String get placementResultDetectedSubtitle;

  /// Start from zero card title.
  ///
  /// In en, this message translates to:
  /// **'Start from zero (A1)'**
  String get placementResultStartFromZeroTitle;

  /// Start from zero card subtitle.
  ///
  /// In en, this message translates to:
  /// **'Build your foundation from scratch.'**
  String get placementResultStartFromZeroSubtitle;

  /// Start from level card title.
  ///
  /// In en, this message translates to:
  /// **'Start from level ({level})'**
  String placementResultStartFromLevelTitle(String level);

  /// Start from level card subtitle.
  ///
  /// In en, this message translates to:
  /// **'Jump straight to advanced tracks'**
  String get placementResultStartFromLevelSubtitle;

  /// Select plan header.
  ///
  /// In en, this message translates to:
  /// **'Select your plan'**
  String get placementResultSelectPlan;

  /// Free plan card title.
  ///
  /// In en, this message translates to:
  /// **'Free plan'**
  String get placementResultFreePlan;

  /// Free plan card subtitle.
  ///
  /// In en, this message translates to:
  /// **'Standard lessons, daily limits'**
  String get placementResultFreePlanSub;

  /// Plus plan card title.
  ///
  /// In en, this message translates to:
  /// **'AIM plus'**
  String get placementResultPlusPlan;

  /// Plus plan card subtitle.
  ///
  /// In en, this message translates to:
  /// **'Unlimited AI tutor, advanced tracks'**
  String get placementResultPlusPlanSub;

  /// Unlock course button label.
  ///
  /// In en, this message translates to:
  /// **'Unlock My Course'**
  String get placementResultUnlockCourse;

  /// Placement menu top bar header.
  ///
  /// In en, this message translates to:
  /// **'Placement Test'**
  String get placementMenuHeaderTitle;

  /// Not taken title.
  ///
  /// In en, this message translates to:
  /// **'You haven\'t taken the placement test yet'**
  String get placementMenuNotTakenTitle;

  /// Not taken subtitle.
  ///
  /// In en, this message translates to:
  /// **'A short adaptive test places you at the right level so every lesson fits you.'**
  String get placementMenuNotTakenSub;

  /// Take placement test button.
  ///
  /// In en, this message translates to:
  /// **'Take the Placement Test'**
  String get placementMenuTakeTestBtn;

  /// In scoring status title.
  ///
  /// In en, this message translates to:
  /// **'Your placement test is being scored'**
  String get placementMenuInScoringTitle;

  /// In progress status title.
  ///
  /// In en, this message translates to:
  /// **'You have a placement test in progress'**
  String get placementMenuInProgressTitle;

  /// In scoring status subtitle.
  ///
  /// In en, this message translates to:
  /// **'This usually only takes a moment. Check again shortly.'**
  String get placementMenuInScoringSub;

  /// In progress status subtitle.
  ///
  /// In en, this message translates to:
  /// **'Pick up your placement test, or start over — your progress in this attempt is not saved section by section.'**
  String get placementMenuInProgressSub;

  /// Check again button.
  ///
  /// In en, this message translates to:
  /// **'Check Again'**
  String get placementMenuCheckAgainBtn;

  /// Continue test button.
  ///
  /// In en, this message translates to:
  /// **'Continue Placement Test'**
  String get placementMenuContinueBtn;

  /// Your level label.
  ///
  /// In en, this message translates to:
  /// **'YOUR LEVEL'**
  String get placementMenuYourLevelLabel;

  /// Score summary line.
  ///
  /// In en, this message translates to:
  /// **'{displayName} · Total score {score} / 100'**
  String placementMenuScoreSummary(String displayName, int score);

  /// View full result button.
  ///
  /// In en, this message translates to:
  /// **'View Full Result'**
  String get placementMenuViewFullResult;

  /// Begin final section button.
  ///
  /// In en, this message translates to:
  /// **'Begin Final Section'**
  String get placementSectionBeginFinal;

  /// Begin section button.
  ///
  /// In en, this message translates to:
  /// **'Begin Section'**
  String get placementSectionBegin;

  /// Questions count label.
  ///
  /// In en, this message translates to:
  /// **'{count} questions'**
  String placementSectionQuestionsCount(int count);

  /// About minutes label.
  ///
  /// In en, this message translates to:
  /// **'about {minutes} minutes'**
  String placementSectionAboutMinutes(int minutes);

  /// Section progress semantic label.
  ///
  /// In en, this message translates to:
  /// **'Section {current} of {total}'**
  String placementSectionProgressSemantic(int current, int total);

  /// Honor code agreement note.
  ///
  /// In en, this message translates to:
  /// **'By starting, you agree to our Assessment Honor Code'**
  String get placementStartHonorCodeAgreement;

  /// Button label to start the assessment.
  ///
  /// In en, this message translates to:
  /// **'Start Assessment'**
  String get placementStartBtnLabel;

  /// Completed questions stat row label.
  ///
  /// In en, this message translates to:
  /// **'Completed Questions'**
  String get placementSubmitCompletedQuestions;

  /// Skipped questions stat row label.
  ///
  /// In en, this message translates to:
  /// **'Skipped Questions'**
  String get placementSubmitSkippedQuestions;

  /// Analyzing answers header.
  ///
  /// In en, this message translates to:
  /// **'Analyzing your answers'**
  String get placementSubmitAnalyzingAnswers;

  /// Calibrating level body copy.
  ///
  /// In en, this message translates to:
  /// **'Our AI is calibrating your optimal starting level to ensure your learning path is perfectly paced.'**
  String get placementSubmitCalibratingBody;

  /// Loading question semantic label.
  ///
  /// In en, this message translates to:
  /// **'Loading question'**
  String get placementQuestionLoadingSemantic;

  /// Timer expired error banner.
  ///
  /// In en, this message translates to:
  /// **'Time is up — this attempt has been submitted.'**
  String get placementQuestionTimerExpiredError;

  /// Submit speaking error banner.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit speaking response. Please try again.'**
  String get placementQuestionSubmitSpeakingError;

  /// Submit answer error banner.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit answer. Please try again.'**
  String get placementQuestionSubmitAnswerError;

  /// Daily missions section title
  ///
  /// In en, this message translates to:
  /// **'Daily Missions'**
  String get homeDailyMissionsTitle;

  /// Daily missions reset time label
  ///
  /// In en, this message translates to:
  /// **'Reset in {hours}h'**
  String homeMissionsResetIn(int hours);

  /// Next up badge label
  ///
  /// In en, this message translates to:
  /// **'NEXT UP'**
  String get homeNextUp;

  /// Overall progress section label
  ///
  /// In en, this message translates to:
  /// **'Overall Progress'**
  String get homeOverallProgress;

  /// Streak days counter text
  ///
  /// In en, this message translates to:
  /// **'{days} Days'**
  String homeStreakDaysText(int days);

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Account Settings'**
  String get settingsTitle;

  /// No description provided for @settingsSaveSuccess.
  ///
  /// In en, this message translates to:
  /// **'Profile Saved successfully!'**
  String get settingsSaveSuccess;

  /// No description provided for @settingsPasswordSuccess.
  ///
  /// In en, this message translates to:
  /// **'Password Updated successfully!'**
  String get settingsPasswordSuccess;

  /// No description provided for @settingsLogoutTitle.
  ///
  /// In en, this message translates to:
  /// **'Confirm Logout'**
  String get settingsLogoutTitle;

  /// No description provided for @settingsLogoutMessage.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to log out of your AIM account?'**
  String get settingsLogoutMessage;

  /// No description provided for @settingsFullName.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get settingsFullName;

  /// No description provided for @settingsEmailAddress.
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get settingsEmailAddress;

  /// No description provided for @settingsVerifiedEmail.
  ///
  /// In en, this message translates to:
  /// **'Verified Email'**
  String get settingsVerifiedEmail;

  /// No description provided for @settingsDailyCommitment.
  ///
  /// In en, this message translates to:
  /// **'Daily Learning Commitment'**
  String get settingsDailyCommitment;

  /// No description provided for @settingsCommitmentCasual.
  ///
  /// In en, this message translates to:
  /// **'5 Mins/Day (Casual)'**
  String get settingsCommitmentCasual;

  /// No description provided for @settingsCommitmentRecommended.
  ///
  /// In en, this message translates to:
  /// **'15 Mins/Day (Recommended)'**
  String get settingsCommitmentRecommended;

  /// No description provided for @settingsCommitmentIntensive.
  ///
  /// In en, this message translates to:
  /// **'30 Mins/Day (Intensive)'**
  String get settingsCommitmentIntensive;

  /// No description provided for @settingsSaveButton.
  ///
  /// In en, this message translates to:
  /// **'Save Profile Changes'**
  String get settingsSaveButton;

  /// No description provided for @settingsSavingButton.
  ///
  /// In en, this message translates to:
  /// **'Saving Changes...'**
  String get settingsSavingButton;

  /// No description provided for @settingsAppThemeHeader.
  ///
  /// In en, this message translates to:
  /// **'APP THEME & DISPLAY'**
  String get settingsAppThemeHeader;

  /// No description provided for @settingsThemeDark.
  ///
  /// In en, this message translates to:
  /// **'Dark Theme'**
  String get settingsThemeDark;

  /// No description provided for @settingsThemeLight.
  ///
  /// In en, this message translates to:
  /// **'Light Theme'**
  String get settingsThemeLight;

  /// No description provided for @settingsThemeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Toggle to switch between light and dark backgrounds'**
  String get settingsThemeSubtitle;

  /// No description provided for @settingsNotificationsHeader.
  ///
  /// In en, this message translates to:
  /// **'NOTIFICATION PREFERENCES'**
  String get settingsNotificationsHeader;

  /// No description provided for @settingsReminders.
  ///
  /// In en, this message translates to:
  /// **'Daily Study Reminders'**
  String get settingsReminders;

  /// No description provided for @settingsRemindersSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Keep your learning streak active with daily push notices'**
  String get settingsRemindersSubtitle;

  /// No description provided for @settingsDiagnostics.
  ///
  /// In en, this message translates to:
  /// **'Weakness Diagnostic Alerts'**
  String get settingsDiagnostics;

  /// No description provided for @settingsDiagnosticsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Get notified when AIM engine detects a gap to review'**
  String get settingsDiagnosticsSubtitle;

  /// No description provided for @settingsSecurityHeader.
  ///
  /// In en, this message translates to:
  /// **'SECURITY & PASSWORD'**
  String get settingsSecurityHeader;

  /// No description provided for @settingsCurrentPassword.
  ///
  /// In en, this message translates to:
  /// **'Current Password'**
  String get settingsCurrentPassword;

  /// No description provided for @settingsNewPassword.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get settingsNewPassword;

  /// No description provided for @settingsUpdatePassword.
  ///
  /// In en, this message translates to:
  /// **'Update Password'**
  String get settingsUpdatePassword;

  /// No description provided for @settingsUpdatingPassword.
  ///
  /// In en, this message translates to:
  /// **'Updating...'**
  String get settingsUpdatingPassword;

  /// No description provided for @settingsLogoutButton.
  ///
  /// In en, this message translates to:
  /// **'Log Out of AIM Account'**
  String get settingsLogoutButton;

  /// No description provided for @voiceAiTitle.
  ///
  /// In en, this message translates to:
  /// **'LIVE VOICE AI'**
  String get voiceAiTitle;

  /// No description provided for @voiceAiStep.
  ///
  /// In en, this message translates to:
  /// **'Step {current}/3'**
  String voiceAiStep(int current);

  /// No description provided for @voiceAiAudio.
  ///
  /// In en, this message translates to:
  /// **'Audio {time}'**
  String voiceAiAudio(String time);

  /// No description provided for @voiceAiStatusAiSpeaking.
  ///
  /// In en, this message translates to:
  /// **'AI Tutor Speaking...'**
  String get voiceAiStatusAiSpeaking;

  /// No description provided for @voiceAiStatusListening.
  ///
  /// In en, this message translates to:
  /// **'Listening to your voice (00:{secs})'**
  String voiceAiStatusListening(String secs);

  /// No description provided for @voiceAiStatusEvaluating.
  ///
  /// In en, this message translates to:
  /// **'AI Evaluating Pronunciation...'**
  String get voiceAiStatusEvaluating;

  /// No description provided for @voiceAiFinishHint.
  ///
  /// In en, this message translates to:
  /// **'Tap mic when finished speaking'**
  String get voiceAiFinishHint;

  /// No description provided for @voiceAiStartHint.
  ///
  /// In en, this message translates to:
  /// **'Tap mic to interrupt or speak'**
  String get voiceAiStartHint;

  /// No description provided for @voiceAiCompletedBadge.
  ///
  /// In en, this message translates to:
  /// **'LIVE VOICE SESSION COMPLETED!'**
  String get voiceAiCompletedBadge;

  /// No description provided for @voiceAiMasteredTitle.
  ///
  /// In en, this message translates to:
  /// **'Lesson Mastered!'**
  String get voiceAiMasteredTitle;

  /// No description provided for @voiceAiCompletedSubtitle.
  ///
  /// In en, this message translates to:
  /// **'You completed the live AI voice lesson for \"{title}\".'**
  String voiceAiCompletedSubtitle(String title);

  /// No description provided for @voiceAiXpEarned.
  ///
  /// In en, this message translates to:
  /// **'XP EARNED'**
  String get voiceAiXpEarned;

  /// No description provided for @voiceAiAccuracy.
  ///
  /// In en, this message translates to:
  /// **'VOICE ACCURACY'**
  String get voiceAiAccuracy;

  /// No description provided for @voiceAiAccuracyScore.
  ///
  /// In en, this message translates to:
  /// **'98% Score'**
  String get voiceAiAccuracyScore;

  /// No description provided for @voiceAiReturnButton.
  ///
  /// In en, this message translates to:
  /// **'Return to Lesson Detail'**
  String get voiceAiReturnButton;

  /// Section title for course overview card.
  ///
  /// In en, this message translates to:
  /// **'COURSE OVERVIEW'**
  String get lessonsCourseOverviewHeader;

  /// Label for course progress header.
  ///
  /// In en, this message translates to:
  /// **'Course Progress'**
  String get lessonsCourseProgressHeader;

  /// Label for course chapters list header.
  ///
  /// In en, this message translates to:
  /// **'Course Chapters'**
  String get lessonsCourseChaptersHeader;

  /// Badge for next locked course level.
  ///
  /// In en, this message translates to:
  /// **'NEXT UP · LOCKED COURSE'**
  String get lessonsNextUpLockedCourse;

  /// Title for next course level card.
  ///
  /// In en, this message translates to:
  /// **'Next Course Level'**
  String get lessonsNextCourseLevel;

  /// Description for course unlocking requirement.
  ///
  /// In en, this message translates to:
  /// **'Unlocks automatically once you complete all chapters in this course.'**
  String get lessonsUnlockCourseCondition;

  /// Description for unlocking next course based on current course.
  ///
  /// In en, this message translates to:
  /// **'Unlocks automatically once you complete all chapters in {activeCourse}.'**
  String lessonsUnlockNextCourseCondition(String activeCourse);

  /// Eyebrow header for learning path.
  ///
  /// In en, this message translates to:
  /// **'LEARNING PATH'**
  String get lessonsLearningPathHeader;

  /// Title for structured curriculum section.
  ///
  /// In en, this message translates to:
  /// **'Structured Curriculum'**
  String get lessonsStructuredCurriculumHeader;

  /// Subtitle for course sequence.
  ///
  /// In en, this message translates to:
  /// **'Follow your personalized sequence from CEFR Starter to Advanced mastery.'**
  String get lessonsPersonalizedSequenceSubtitle;

  /// Header for vocabulary list in lesson detail.
  ///
  /// In en, this message translates to:
  /// **'Key Vocabulary & Phrases'**
  String get lessonsKeyVocabularyHeader;

  /// Hint to tap audio icon in vocabulary list.
  ///
  /// In en, this message translates to:
  /// **'TAP 🔊 TO LISTEN'**
  String get lessonsTapToListenHeader;

  /// Card title to chat with AI tutor.
  ///
  /// In en, this message translates to:
  /// **'Ask AI Tutor'**
  String get lessonsAskAiTutorHeader;

  /// Card description to chat with AI tutor.
  ///
  /// In en, this message translates to:
  /// **'Chat with your AI tutor to clarify rules or ask questions.'**
  String get lessonsAskAiTutorSubtitle;

  /// Practice exercises section header.
  ///
  /// In en, this message translates to:
  /// **'Practice Now'**
  String get lessonsPracticeNowHeader;

  /// Practice exercises section description.
  ///
  /// In en, this message translates to:
  /// **'Reinforce your knowledge or practice with quick exercises.'**
  String get lessonsPracticeNowSubtitle;

  /// Quiz badge header.
  ///
  /// In en, this message translates to:
  /// **'QUIZ'**
  String get lessonsQuizHeader;

  /// Quiz section description.
  ///
  /// In en, this message translates to:
  /// **'Test your comprehension with quick interactive exercises.'**
  String get lessonsQuizSubtitle;

  /// Title when lesson is mastered.
  ///
  /// In en, this message translates to:
  /// **'Lesson Mastered! 🌟'**
  String get lessonsLessonMasteredTitle;

  /// Snackbar text when lesson is completed.
  ///
  /// In en, this message translates to:
  /// **'Lesson marked as completed! 🌟'**
  String get lessonsLessonMasteredSnackbar;

  /// Error message when marking lesson complete fails.
  ///
  /// In en, this message translates to:
  /// **'Could not mark lesson complete: {error}'**
  String lessonsMarkCompleteFailed(String error);

  /// Section header for lessons list in chapter.
  ///
  /// In en, this message translates to:
  /// **'LESSONS IN THIS CHAPTER'**
  String get lessonsInThisChapterHeader;

  /// Chapter quiz section header.
  ///
  /// In en, this message translates to:
  /// **'CHAPTER QUIZ'**
  String get lessonsChapterQuizHeader;

  /// Passed status badge text.
  ///
  /// In en, this message translates to:
  /// **'PASSED'**
  String get lessonsPassedStatus;

  /// Locked status badge text.
  ///
  /// In en, this message translates to:
  /// **'LOCKED'**
  String get lessonsLockedStatus;

  /// Overview summary with chapter and lesson counts.
  ///
  /// In en, this message translates to:
  /// **'{chaptersCount} chapters · {totalLessons} Total Lessons'**
  String lessonsTotalLessonsCount(int chaptersCount, int totalLessons);

  /// Title for progress & analytics screen.
  ///
  /// In en, this message translates to:
  /// **'Progress & Analytics'**
  String get progressTitle;

  /// Subtitle for progress screen.
  ///
  /// In en, this message translates to:
  /// **'Track your language proficiency and study stats'**
  String get progressSubtitle;

  /// Header for weekly activity chart.
  ///
  /// In en, this message translates to:
  /// **'Weekly Activity'**
  String get progressWeeklyActivity;

  /// Average daily study time in minutes.
  ///
  /// In en, this message translates to:
  /// **'{minutes} mins / day average'**
  String progressDailyAverageMins(int minutes);

  /// Total study time in minutes.
  ///
  /// In en, this message translates to:
  /// **'{minutes} mins total'**
  String progressTotalMins(int minutes);

  /// Section header for tracked skills list.
  ///
  /// In en, this message translates to:
  /// **'TRACKED SKILLS ({count})'**
  String progressTrackedSkillsHeader(int count);

  /// Section header for review schedule.
  ///
  /// In en, this message translates to:
  /// **'REVIEW SCHEDULE ({count})'**
  String progressReviewScheduleHeader(int count);

  /// Section header for weakness records.
  ///
  /// In en, this message translates to:
  /// **'WEAKNESS RECORDS ({count})'**
  String progressWeaknessRecordsHeader(int count);

  /// Card text describing an identified weakness.
  ///
  /// In en, this message translates to:
  /// **'Identified weak spot from recent responses.'**
  String get progressWeakSpotIdentified;

  /// Message when there are no weaknesses.
  ///
  /// In en, this message translates to:
  /// **'No active weaknesses recorded! Great work!'**
  String get progressNoWeaknesses;

  /// Button to view all items.
  ///
  /// In en, this message translates to:
  /// **'View All →'**
  String get progressViewAll;

  /// Button to view full review schedule.
  ///
  /// In en, this message translates to:
  /// **'View Full Schedule →'**
  String get progressViewFullSchedule;

  /// Button to view full skill table.
  ///
  /// In en, this message translates to:
  /// **'View Full Table →'**
  String get progressViewFullTable;

  /// Priority level indicator.
  ///
  /// In en, this message translates to:
  /// **'{severity} Priority'**
  String progressPriorityLabel(String severity);

  /// Review interval and repetition number.
  ///
  /// In en, this message translates to:
  /// **'Interval: {interval}d · Rep #{rep}'**
  String progressIntervalAndRep(int interval, int rep);

  /// Screen title for skill states table.
  ///
  /// In en, this message translates to:
  /// **'Skill States'**
  String get progressSkillStatesTitle;

  /// Skill confidence score percentage.
  ///
  /// In en, this message translates to:
  /// **'Confidence {percent}%'**
  String progressConfidencePct(int percent);

  /// Schedule due date label.
  ///
  /// In en, this message translates to:
  /// **'Due: {date}'**
  String progressDueAt(String date);

  /// Weakness detected date label.
  ///
  /// In en, this message translates to:
  /// **'Detected: {date}'**
  String progressDetectedAt(String date);

  /// Weakness resolved date label.
  ///
  /// In en, this message translates to:
  /// **'Resolved: {date}'**
  String progressResolvedAt(String date);

  /// Recommendation expiry date label.
  ///
  /// In en, this message translates to:
  /// **'Expires: {date}'**
  String progressExpiresAt(String date);

  /// Recommendation generated date label.
  ///
  /// In en, this message translates to:
  /// **'Generated: {date}'**
  String progressGeneratedAt(String date);

  /// Target lesson id label.
  ///
  /// In en, this message translates to:
  /// **'Lesson: {lessonId}'**
  String progressTargetLesson(String lessonId);

  /// Rank badge label.
  ///
  /// In en, this message translates to:
  /// **'#{rank}'**
  String progressRankBadge(int rank);

  /// Title for billing page.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get billingTitle;

  /// Header for subscription section.
  ///
  /// In en, this message translates to:
  /// **'Subscription'**
  String get billingSubscription;

  /// Current plan badge or label.
  ///
  /// In en, this message translates to:
  /// **'Current plan'**
  String get billingCurrentPlan;

  /// Button to change current plan.
  ///
  /// In en, this message translates to:
  /// **'Change plan'**
  String get billingChangePlan;

  /// Button to cancel subscription.
  ///
  /// In en, this message translates to:
  /// **'Cancel subscription'**
  String get billingCancelSubscription;

  /// Dialog title for canceling subscription.
  ///
  /// In en, this message translates to:
  /// **'Cancel Subscription?'**
  String get billingCancelSubscriptionDialogTitle;

  /// Dialog message for cancellation.
  ///
  /// In en, this message translates to:
  /// **'Your subscription will remain active until the end of the current billing period.'**
  String get billingCancelSubscriptionDialogMessage;

  /// Button to keep subscription.
  ///
  /// In en, this message translates to:
  /// **'Keep Subscription'**
  String get billingKeepSubscription;

  /// Screen title for plans & pricing.
  ///
  /// In en, this message translates to:
  /// **'Plans & Pricing'**
  String get billingPlansAndPricing;

  /// Title/tab for invoices.
  ///
  /// In en, this message translates to:
  /// **'Invoices'**
  String get billingInvoices;

  /// Screen title for invoice detail.
  ///
  /// In en, this message translates to:
  /// **'Invoice Detail'**
  String get billingInvoiceDetail;

  /// Empty state for entitlements list.
  ///
  /// In en, this message translates to:
  /// **'No entitlements yet.'**
  String get billingNoEntitlements;

  /// Agreement text before checkout.
  ///
  /// In en, this message translates to:
  /// **'By continuing you agree to AIM Terms'**
  String get billingTermsAgreement;

  /// Checkout button text.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get billingCheckout;

  /// Status message when payment is pending.
  ///
  /// In en, this message translates to:
  /// **'Payment pending'**
  String get billingPaymentPending;

  /// Status message when payment succeeded.
  ///
  /// In en, this message translates to:
  /// **'Payment successful!'**
  String get billingPaymentSuccessful;

  /// Status message when payment failed.
  ///
  /// In en, this message translates to:
  /// **'Payment failed'**
  String get billingPaymentFailed;

  /// Helper text during payment verification.
  ///
  /// In en, this message translates to:
  /// **'Please wait while we verify your payment.'**
  String get billingPaymentVerifying;

  /// Error message for payment failure.
  ///
  /// In en, this message translates to:
  /// **'Your payment could not be processed. Please try again.'**
  String get billingPaymentFailedMessage;

  /// Processing message for checkout.
  ///
  /// In en, this message translates to:
  /// **'Your payment is being processed. We will notify you once completed.'**
  String get billingPaymentProcessingMessage;

  /// Button to go back from checkout status.
  ///
  /// In en, this message translates to:
  /// **'Go back'**
  String get billingGoBack;

  /// Invoice line item quantity.
  ///
  /// In en, this message translates to:
  /// **'Qty: {quantity}'**
  String billingQuantity(int quantity);

  /// Badge for popular subscription plan.
  ///
  /// In en, this message translates to:
  /// **'Popular'**
  String get billingPopularBadge;

  /// Title for help center page.
  ///
  /// In en, this message translates to:
  /// **'Help Center'**
  String get supportHelpCenter;

  /// Button or screen title for new support ticket.
  ///
  /// In en, this message translates to:
  /// **'New ticket'**
  String get supportNewTicket;

  /// Tab or title for user's support tickets.
  ///
  /// In en, this message translates to:
  /// **'My tickets'**
  String get supportMyTickets;

  /// Screen title for single ticket.
  ///
  /// In en, this message translates to:
  /// **'Ticket'**
  String get supportTicket;

  /// Title for parent help center.
  ///
  /// In en, this message translates to:
  /// **'Parent Help'**
  String get supportParentHelp;

  /// Title for parent tickets list.
  ///
  /// In en, this message translates to:
  /// **'Parent tickets'**
  String get supportParentTickets;

  /// Button to submit feedback.
  ///
  /// In en, this message translates to:
  /// **'Send feedback'**
  String get supportFeedback;

  /// Question prompt for rating AIM.
  ///
  /// In en, this message translates to:
  /// **'How would you rate AIM?'**
  String get supportRateAimQuestion;

  /// Title for release notes page.
  ///
  /// In en, this message translates to:
  /// **'Release notes'**
  String get supportReleaseNotes;

  /// Title for single release note.
  ///
  /// In en, this message translates to:
  /// **'Release note'**
  String get supportReleaseNote;

  /// Release date label.
  ///
  /// In en, this message translates to:
  /// **'Released {date}'**
  String supportReleasedDate(String date);

  /// Title for system status page.
  ///
  /// In en, this message translates to:
  /// **'System Status'**
  String get supportSystemStatus;

  /// Header for what's new section.
  ///
  /// In en, this message translates to:
  /// **'What\'s new'**
  String get supportWhatNew;

  /// Empty state title for student support tickets
  ///
  /// In en, this message translates to:
  /// **'No Tickets Yet'**
  String get supportNoTickets;

  /// Empty state subtitle for student support tickets
  ///
  /// In en, this message translates to:
  /// **'Create a ticket to get help from our support team.'**
  String get supportNoTicketsSubtitle;

  /// Title when no release notes exist.
  ///
  /// In en, this message translates to:
  /// **'No Release Notes'**
  String get supportNoReleaseNotes;

  /// Subtitle when no release notes exist.
  ///
  /// In en, this message translates to:
  /// **'Release notes will appear here when published.'**
  String get supportNoReleaseNotesSubtitle;

  /// Title when a release note detail is not ready.
  ///
  /// In en, this message translates to:
  /// **'Release note is not available yet'**
  String get supportReleaseNoteNotAvailable;

  /// Subtitle when a release note detail is not ready.
  ///
  /// In en, this message translates to:
  /// **'This release note will appear here once release notes are live.'**
  String get supportReleaseNoteNotAvailableSubtitle;

  /// Practice session header.
  ///
  /// In en, this message translates to:
  /// **'PRACTICE SESSION'**
  String get practicePracticeSession;

  /// Practice completed title.
  ///
  /// In en, this message translates to:
  /// **'PRACTICE COMPLETE!'**
  String get practicePracticeComplete;

  /// Congratulatory message.
  ///
  /// In en, this message translates to:
  /// **'Great Job!'**
  String get practiceGreatJob;

  /// Accuracy metric header.
  ///
  /// In en, this message translates to:
  /// **'ACCURACY'**
  String get practiceAccuracy;

  /// XP earned metric header.
  ///
  /// In en, this message translates to:
  /// **'XP EARNED'**
  String get practiceXpEarned;

  /// Button to check answer.
  ///
  /// In en, this message translates to:
  /// **'Check Answer'**
  String get practiceCheckAnswer;

  /// Button to proceed back to lesson.
  ///
  /// In en, this message translates to:
  /// **'Continue to Lesson'**
  String get practiceContinueToLesson;

  /// Question progress counter.
  ///
  /// In en, this message translates to:
  /// **'QUESTION {current} OF {total}'**
  String practiceQuestionOf(int current, int total);

  /// Summary message after practice.
  ///
  /// In en, this message translates to:
  /// **'You finished this practice session for {lessonTitle}.'**
  String practiceSessionCompletedMsg(String lessonTitle);

  /// Score summary for practice.
  ///
  /// In en, this message translates to:
  /// **'You scored {score}/{total} on this practice session.'**
  String practiceScoreSummary(int score, int total);

  /// Title when placement test is required before practice.
  ///
  /// In en, this message translates to:
  /// **'Placement Test Required'**
  String get practicePlacementRequiredTitle;

  /// Description why placement test is required.
  ///
  /// In en, this message translates to:
  /// **'You must complete the placement test first to determine your starting level and begin learning sessions.'**
  String get practicePlacementRequiredBody;

  /// Button to start placement test.
  ///
  /// In en, this message translates to:
  /// **'Take Placement Test Now'**
  String get practiceTakePlacementNow;

  /// Button to try demo practice questions.
  ///
  /// In en, this message translates to:
  /// **'Try Demo Exercises'**
  String get practiceTryDemoExercises;

  /// Title when question answer is submitted.
  ///
  /// In en, this message translates to:
  /// **'Answer submitted'**
  String get qaAnswerSubmitted;

  /// Status message when AI evaluates answer.
  ///
  /// In en, this message translates to:
  /// **'AIM is analysing your response.'**
  String get qaAnalysingResponse;

  /// Status message when AI summarizes session.
  ///
  /// In en, this message translates to:
  /// **'AIM is analysing your session…'**
  String get qaAnalysingSession;

  /// Session summary card title.
  ///
  /// In en, this message translates to:
  /// **'Session Summary'**
  String get qaSessionSummary;

  /// Skills covered list title.
  ///
  /// In en, this message translates to:
  /// **'Skills covered'**
  String get qaSkillsCovered;

  /// Assessments screen title.
  ///
  /// In en, this message translates to:
  /// **'Assessments'**
  String get assessmentAssessments;

  /// Assessment deadlines screen title.
  ///
  /// In en, this message translates to:
  /// **'Deadlines'**
  String get assessmentDeadlines;

  /// Assessment points breakdown header.
  ///
  /// In en, this message translates to:
  /// **'BREAKDOWN'**
  String get assessmentBreakdown;

  /// Past assessment results section.
  ///
  /// In en, this message translates to:
  /// **'Past results'**
  String get assessmentPastResults;

  /// Result history screen title.
  ///
  /// In en, this message translates to:
  /// **'Result history'**
  String get assessmentResultHistory;

  /// Assessment sections list title.
  ///
  /// In en, this message translates to:
  /// **'Sections'**
  String get assessmentSections;

  /// Action to view assessment history.
  ///
  /// In en, this message translates to:
  /// **'View your attempt history'**
  String get assessmentViewAttemptHistory;

  /// Graded timestamp.
  ///
  /// In en, this message translates to:
  /// **'Graded {date}'**
  String assessmentGradedDate(String date);

  /// Late penalty badge.
  ///
  /// In en, this message translates to:
  /// **'Late penalty applied'**
  String get assessmentLatePenalty;

  /// Assessment start prompt.
  ///
  /// In en, this message translates to:
  /// **'Ready to begin?'**
  String get assessmentReadyToBegin;

  /// Confirmation dialog title for submitting assessment.
  ///
  /// In en, this message translates to:
  /// **'Submit your answers?'**
  String get assessmentSubmitAnswersDialogTitle;

  /// Confirmation dialog message for submitting assessment.
  ///
  /// In en, this message translates to:
  /// **'This action is final and cannot be undone. You cannot change answers after submitting.'**
  String get assessmentSubmitAnswersDialogMessage;

  /// Placement test response input label.
  ///
  /// In en, this message translates to:
  /// **'Your Response'**
  String get placementYourResponse;

  /// Guideline for placement open-response.
  ///
  /// In en, this message translates to:
  /// **'Target: 3-5 sentences'**
  String get placementTargetSentences;

  /// Character count for placement response.
  ///
  /// In en, this message translates to:
  /// **'{count} characters'**
  String placementCharactersCount(int count);

  /// Speaking question instruction.
  ///
  /// In en, this message translates to:
  /// **'Press & hold the mic to record'**
  String get placementPressHoldToRecord;

  /// Speaking question release instruction.
  ///
  /// In en, this message translates to:
  /// **'Release when finished'**
  String get placementReleaseWhenFinished;

  /// Speaking question recording state.
  ///
  /// In en, this message translates to:
  /// **'Recording in progress...'**
  String get placementRecordingInProgress;

  /// Speaking question recorded state.
  ///
  /// In en, this message translates to:
  /// **'Recording completed!'**
  String get placementRecordingCompleted;

  /// Instruction to submit recorded answer.
  ///
  /// In en, this message translates to:
  /// **'Tap Submit below to submit your recording.'**
  String get placementTapSubmitRecording;

  /// Placement submission AI indicator.
  ///
  /// In en, this message translates to:
  /// **'AI Engine Active'**
  String get placementAiEngineActive;

  /// Placement completion message.
  ///
  /// In en, this message translates to:
  /// **'Your placement test results have been recorded and saved.'**
  String get placementResultsRecordedSaved;

  /// App bar title for the review schedule screen.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get reviewsTitle;

  /// Accessibility label shown while the review schedule is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading review schedule'**
  String get reviewsLoadingSemantic;

  /// Empty-state title when no review items exist.
  ///
  /// In en, this message translates to:
  /// **'No reviews scheduled'**
  String get reviewsNoScheduleTitle;

  /// Empty-state subtitle when no review items exist.
  ///
  /// In en, this message translates to:
  /// **'Complete practice sessions to receive review reminders.'**
  String get reviewsNoScheduleSubtitle;

  /// Label for the due-now stat card on the review screen.
  ///
  /// In en, this message translates to:
  /// **'Due now'**
  String get reviewsStatDueNow;

  /// Label for the learned-count stat card on the review screen.
  ///
  /// In en, this message translates to:
  /// **'Learned'**
  String get reviewsStatLearned;

  /// Label for the streak stat card on the review screen.
  ///
  /// In en, this message translates to:
  /// **'Streak'**
  String get reviewsStatStreak;

  /// Relative due-date label when the item is due today.
  ///
  /// In en, this message translates to:
  /// **'Due Today'**
  String get reviewsDueToday;

  /// Relative due-date label when the item is due tomorrow.
  ///
  /// In en, this message translates to:
  /// **'Due Tomorrow'**
  String get reviewsDueTomorrow;

  /// Relative due-date label when the item was due yesterday.
  ///
  /// In en, this message translates to:
  /// **'Due Yesterday'**
  String get reviewsDueYesterday;

  /// Relative due-date label when the item is due in 2-6 days.
  ///
  /// In en, this message translates to:
  /// **'Due in {days} days'**
  String reviewsDueInDays(int days);

  /// Relative due-date label when the item was due 2-6 days ago.
  ///
  /// In en, this message translates to:
  /// **'Due {days} days ago'**
  String reviewsDueDaysAgo(int days);

  /// Absolute due-date label for items more than a week away.
  ///
  /// In en, this message translates to:
  /// **'Due {date}'**
  String reviewsDueDate(String date);

  /// Status badge label for a due review item.
  ///
  /// In en, this message translates to:
  /// **'Due'**
  String get reviewsStatusDue;

  /// Status badge label for a pending review item.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get reviewsStatusPending;

  /// Subtitle for reviews screen.
  ///
  /// In en, this message translates to:
  /// **'Spaced-repetition flashcards due today'**
  String get reviewsSpacedRepetitionDue;

  /// Section header for review schedule.
  ///
  /// In en, this message translates to:
  /// **'REVIEW SCHEDULE'**
  String get reviewsScheduleHeader;

  /// Button to start reviews.
  ///
  /// In en, this message translates to:
  /// **'Start Review Session'**
  String get reviewsStartSession;

  /// Interval days badge.
  ///
  /// In en, this message translates to:
  /// **'Interval {days}d'**
  String reviewsIntervalDays(String days);

  /// Repetition count badge.
  ///
  /// In en, this message translates to:
  /// **'rep #{rep}'**
  String reviewsRepetitionNumber(int rep);

  /// Voice teacher page title.
  ///
  /// In en, this message translates to:
  /// **'Voice Teacher'**
  String get voiceTeacherPageTitle;

  /// Voice teacher page subtitle.
  ///
  /// In en, this message translates to:
  /// **'Practise your pronunciation with the AI teacher'**
  String get voiceTeacherPageSubtitle;

  /// Voice error title.
  ///
  /// In en, this message translates to:
  /// **'Connection Error'**
  String get voiceTeacherConnectionErrorTitle;

  /// Voice error title.
  ///
  /// In en, this message translates to:
  /// **'Microphone Error'**
  String get voiceTeacherMicrophoneErrorTitle;

  /// Voice error title.
  ///
  /// In en, this message translates to:
  /// **'Server Error'**
  String get voiceTeacherServerErrorTitle;

  /// Voice error title.
  ///
  /// In en, this message translates to:
  /// **'Something Went Wrong'**
  String get voiceTeacherGenericErrorTitle;

  /// Voice connection error details.
  ///
  /// In en, this message translates to:
  /// **'Could not connect to voice server. Please check your internet.'**
  String get voiceTeacherConnectionErrorMsg;

  /// Voice mic error details.
  ///
  /// In en, this message translates to:
  /// **'Could not access microphone. Please grant permission.'**
  String get voiceTeacherMicrophoneErrorMsg;

  /// Voice server error details.
  ///
  /// In en, this message translates to:
  /// **'Voice service encountered an error. Please try again later.'**
  String get voiceTeacherServerErrorMsg;

  /// Voice generic error details.
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred during the voice session.'**
  String get voiceTeacherGenericErrorMsg;

  /// Fallback title when audio is text-only.
  ///
  /// In en, this message translates to:
  /// **'Text response from teacher'**
  String get voiceTeacherTextResponseTitle;

  /// Button to retry fetching audio.
  ///
  /// In en, this message translates to:
  /// **'Retry audio'**
  String get voiceTeacherRetryAudio;

  /// Button to retry voice action.
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get voiceTeacherTryAgain;

  /// Push to talk button processing text
  ///
  /// In en, this message translates to:
  /// **'Processing...'**
  String get voiceTeacherProcessing;

  /// Transcribing user speech status.
  ///
  /// In en, this message translates to:
  /// **'Transcribing...'**
  String get voiceTeacherTranscribing;

  /// Transcript preview user header.
  ///
  /// In en, this message translates to:
  /// **'What you said'**
  String get voiceTeacherWhatYouSaid;

  /// Transcript preview teacher header.
  ///
  /// In en, this message translates to:
  /// **'Teacher response'**
  String get voiceTeacherTeacherResponse;

  /// State bar recorded label.
  ///
  /// In en, this message translates to:
  /// **'Recorded'**
  String get voiceTeacherRecorded;

  /// Notice when audio fails and text fallback is shown.
  ///
  /// In en, this message translates to:
  /// **'Audio unavailable — here\'s the text response'**
  String get voiceTeacherAudioUnavailable;

  /// Stop voice recording.
  ///
  /// In en, this message translates to:
  /// **'Stop'**
  String get voiceTeacherStop;

  /// Discard voice recording.
  ///
  /// In en, this message translates to:
  /// **'Discard'**
  String get voiceTeacherDiscard;

  /// Send voice recording.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get voiceTeacherSend;

  /// Feedback helpful button.
  ///
  /// In en, this message translates to:
  /// **'Helpful'**
  String get voiceTeacherHelpful;

  /// Feedback not helpful button.
  ///
  /// In en, this message translates to:
  /// **'Not helpful'**
  String get voiceTeacherNotHelpful;

  /// AI Teacher session history title.
  ///
  /// In en, this message translates to:
  /// **'Conversations'**
  String get aiTeacherConversations;

  /// AI Teacher settings page title.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher settings'**
  String get aiTeacherSettingsTitle;

  /// Current lesson context chip.
  ///
  /// In en, this message translates to:
  /// **'Current lesson'**
  String get aiTeacherCurrentLessonHeader;

  /// AI Teacher message feedback prompt.
  ///
  /// In en, this message translates to:
  /// **'Was this helpful?'**
  String get aiTeacherWasThisHelpful;

  /// AI Teacher session recap welcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get aiTeacherWelcomeBack;

  /// AI Teacher entry card description.
  ///
  /// In en, this message translates to:
  /// **'Ask questions and get guidance on this lesson.'**
  String get aiTeacherAskQuestionsGuidance;

  /// Badge for active AIM Plus membership.
  ///
  /// In en, this message translates to:
  /// **'AIM PLUS MEMBER'**
  String get profileAimPlusMember;

  /// Setting toggle description for learning gap alerts.
  ///
  /// In en, this message translates to:
  /// **'Alerts when AI detects new learning gaps'**
  String get profileLearningGapsAlerts;

  /// Setting toggle description for daily study time.
  ///
  /// In en, this message translates to:
  /// **'Get notified at your preferred study time'**
  String get profileStudyTimeNotification;

  /// Settings section header for password.
  ///
  /// In en, this message translates to:
  /// **'Security & Password'**
  String get profileSecurityPassword;

  /// Success message for password reset request.
  ///
  /// In en, this message translates to:
  /// **'Password reset email sent. Please check your inbox.'**
  String get profilePasswordResetSuccess;

  /// Error message for password reset request.
  ///
  /// In en, this message translates to:
  /// **'Failed to request password reset: {error}'**
  String profilePasswordResetFailed(String error);

  /// Error message for saving profile.
  ///
  /// In en, this message translates to:
  /// **'Failed to save profile changes: {error}'**
  String profileSaveFailed(String error);

  /// Empty state when profile data is null.
  ///
  /// In en, this message translates to:
  /// **'No profile loaded.'**
  String get profileNoProfileLoaded;

  /// Notification settings section header.
  ///
  /// In en, this message translates to:
  /// **'CHANNELS'**
  String get notificationsChannels;

  /// Notification quiet hours header.
  ///
  /// In en, this message translates to:
  /// **'QUIET HOURS'**
  String get notificationsQuietHours;

  /// Subtitle for notification preferences.
  ///
  /// In en, this message translates to:
  /// **'Manage lesson reminders'**
  String get notificationsManageReminders;

  /// Status text for dismissed notification.
  ///
  /// In en, this message translates to:
  /// **'This notification has been dismissed.'**
  String get notificationsDismissed;

  /// Button to pause reminder.
  ///
  /// In en, this message translates to:
  /// **'Pause'**
  String get notificationsPause;

  /// Button to resume reminder.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get notificationsResume;

  /// Subtitle on login screen.
  ///
  /// In en, this message translates to:
  /// **'Happy to see you again. Enter your email and password to continue.'**
  String get authHappyToSeeYou;

  /// Header on login screen.
  ///
  /// In en, this message translates to:
  /// **'Sign in to your account'**
  String get authSignInToAccount;

  /// Subtitle on register screen.
  ///
  /// In en, this message translates to:
  /// **'Takes less than a minute. Enter your details below.'**
  String get authTakesLessThanMinute;

  /// Title on email confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'Check your email'**
  String get authCheckEmailTitle;

  /// Body on email confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'We sent a confirmation link to:\n{email}'**
  String authSentConfirmationLink(String email);

  /// Button to return to login screen.
  ///
  /// In en, this message translates to:
  /// **'Back to Login'**
  String get authBackToLogin;

  /// Dev tools test accounts section header on login.
  ///
  /// In en, this message translates to:
  /// **'DEV / TEST ACCOUNTS'**
  String get authDevTestAccounts;

  /// Helper label for test accounts buttons.
  ///
  /// In en, this message translates to:
  /// **'Quick-login with test credentials:'**
  String get authQuickLoginWithTest;

  /// Button to log out of the app.
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get shellLogOut;

  /// Title for the profile page hero header.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileTitle;

  /// Semantic label shown while profile is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading profile'**
  String get profileLoadingProfile;

  /// Error message when profile fails to load.
  ///
  /// In en, this message translates to:
  /// **'Could not load profile: {message}'**
  String profileCouldNotLoad(String message);

  /// Section heading for account info on profile page.
  ///
  /// In en, this message translates to:
  /// **'ACCOUNT'**
  String get profileSectionAccount;

  /// Label for the email row on profile page.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get profileLabelEmail;

  /// Label for the status row on profile page.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get profileLabelStatus;

  /// Label for the user type row on profile page.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get profileLabelType;

  /// Section heading for student profile details.
  ///
  /// In en, this message translates to:
  /// **'PROFILE'**
  String get profileSectionProfile;

  /// Label for display name on profile page.
  ///
  /// In en, this message translates to:
  /// **'Display Name'**
  String get profileLabelDisplayName;

  /// Label for preferred language on profile page.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get profileLabelLanguage;

  /// Label for timezone on profile page.
  ///
  /// In en, this message translates to:
  /// **'Timezone'**
  String get profileLabelTimezone;

  /// Section heading for user roles.
  ///
  /// In en, this message translates to:
  /// **'ROLES'**
  String get profileSectionRoles;

  /// Subtitle under the roles section header.
  ///
  /// In en, this message translates to:
  /// **'Displayed for reference only. Enforced by backend.'**
  String get profileRolesSubtitle;

  /// Section heading for quick navigation links.
  ///
  /// In en, this message translates to:
  /// **'QUICK LINKS'**
  String get profileSectionQuickLinks;

  /// Quick link label for Learning Path.
  ///
  /// In en, this message translates to:
  /// **'Learning Path'**
  String get profileLinkLearningPath;

  /// Quick link label for Subscription & Billing.
  ///
  /// In en, this message translates to:
  /// **'Subscription & Billing'**
  String get profileLinkSubscriptionBilling;

  /// Quick link label for Invoice History.
  ///
  /// In en, this message translates to:
  /// **'Invoice History'**
  String get profileLinkInvoiceHistory;

  /// Quick link label for Achievements.
  ///
  /// In en, this message translates to:
  /// **'Achievements'**
  String get profileLinkAchievements;

  /// Quick link label for Analytics Summary.
  ///
  /// In en, this message translates to:
  /// **'Analytics Summary'**
  String get profileLinkAnalyticsSummary;

  /// Quick link label for developer API endpoint tester.
  ///
  /// In en, this message translates to:
  /// **'API Endpoint Tester (Dev)'**
  String get profileLinkApiEndpointTester;

  /// Label under the day streak stat card on profile.
  ///
  /// In en, this message translates to:
  /// **'day streak'**
  String get profileStatDayStreak;

  /// Label under the achievements stat card on profile.
  ///
  /// In en, this message translates to:
  /// **'achievements'**
  String get profileStatAchievements;

  /// Tooltip for the settings icon button on profile.
  ///
  /// In en, this message translates to:
  /// **'Account Settings'**
  String get profileTooltipAccountSettings;

  /// Title above the achievements carousel on profile.
  ///
  /// In en, this message translates to:
  /// **'Achievements'**
  String get profileAchievementsCarouselTitle;

  /// Header title on the edit profile screen.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get editProfileTitle;

  /// Save text button on the edit profile header.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get editProfileSave;

  /// Semantic label for the back button on edit profile.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get editProfileBack;

  /// Label for the display name field on edit profile.
  ///
  /// In en, this message translates to:
  /// **'Display Name'**
  String get editProfileLabelDisplayName;

  /// Placeholder for the display name field.
  ///
  /// In en, this message translates to:
  /// **'Your display name'**
  String get editProfilePlaceholderDisplayName;

  /// Label for the preferred language selector.
  ///
  /// In en, this message translates to:
  /// **'Preferred Language'**
  String get editProfileLabelPreferredLanguage;

  /// Placeholder for the preferred language selector.
  ///
  /// In en, this message translates to:
  /// **'Select a language'**
  String get editProfilePlaceholderLanguage;

  /// Label for the timezone selector.
  ///
  /// In en, this message translates to:
  /// **'Timezone'**
  String get editProfileLabelTimezone;

  /// Placeholder for the timezone selector.
  ///
  /// In en, this message translates to:
  /// **'Select a timezone'**
  String get editProfilePlaceholderTimezone;

  /// Label for the save changes gradient button.
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get editProfileSaveChanges;

  /// Validation error when display name exceeds 80 chars.
  ///
  /// In en, this message translates to:
  /// **'Display name must be 80 characters or fewer.'**
  String get editProfileDisplayNameTooLong;

  /// Toast shown when the session is expired on edit profile.
  ///
  /// In en, this message translates to:
  /// **'Your session has expired. Please sign in again.'**
  String get editProfileSessionExpired;

  /// Toast shown on successful profile update.
  ///
  /// In en, this message translates to:
  /// **'Profile updated.'**
  String get editProfileUpdatedSuccess;

  /// Section header for app theme settings.
  ///
  /// In en, this message translates to:
  /// **'App Theme & Display'**
  String get settingsAppThemeDisplay;

  /// Subtitle when dark mode is active.
  ///
  /// In en, this message translates to:
  /// **'Darker UI option for night use'**
  String get settingsThemeDarkSubtitle;

  /// Subtitle when light mode is active.
  ///
  /// In en, this message translates to:
  /// **'Clean, high contrast appearance'**
  String get settingsThemeLightSubtitle;

  /// Section header for notification settings.
  ///
  /// In en, this message translates to:
  /// **'Notification Preferences'**
  String get settingsNotificationPreferences;

  /// Placeholder text for the name input on settings.
  ///
  /// In en, this message translates to:
  /// **'Enter your full name'**
  String get settingsEnterFullName;

  /// Title on the achievements page header.
  ///
  /// In en, this message translates to:
  /// **'Achievements'**
  String get achievementsTitle;

  /// Title on the milestones banner card.
  ///
  /// In en, this message translates to:
  /// **'AIM Milestones'**
  String get achievementsMilestonesTitle;

  /// Subtitle showing how many badges are unlocked.
  ///
  /// In en, this message translates to:
  /// **'{unlocked} of {total} badges unlocked'**
  String achievementsBadgesUnlocked(int unlocked, int total);

  /// League rank pill on the milestones card.
  ///
  /// In en, this message translates to:
  /// **'Gold League #3'**
  String get achievementsLeagueRank;

  /// Label for the All Badges filter tab.
  ///
  /// In en, this message translates to:
  /// **'All Badges'**
  String get achievementsTabAll;

  /// Label for the Unlocked filter tab with count.
  ///
  /// In en, this message translates to:
  /// **'Unlocked ({count})'**
  String achievementsTabUnlocked(int count);

  /// Label for the In Progress filter tab with count.
  ///
  /// In en, this message translates to:
  /// **'In Progress ({count})'**
  String achievementsTabInProgress(int count);

  /// Tag text on an unlocked badge card.
  ///
  /// In en, this message translates to:
  /// **'Unlocked'**
  String get achievementsBadgeUnlocked;

  /// Default badge title: First Step.
  ///
  /// In en, this message translates to:
  /// **'First Step'**
  String get achievementsFirstStepTitle;

  /// Default badge description: First Step.
  ///
  /// In en, this message translates to:
  /// **'Complete your first English lesson'**
  String get achievementsFirstStepDesc;

  /// Default badge title: Streak Master.
  ///
  /// In en, this message translates to:
  /// **'Streak Master'**
  String get achievementsStreakMasterTitle;

  /// Default badge description: Streak Master.
  ///
  /// In en, this message translates to:
  /// **'Maintain a 7-day learning streak'**
  String get achievementsStreakMasterDesc;

  /// Default badge title: Grammar Wizard.
  ///
  /// In en, this message translates to:
  /// **'Grammar Wizard'**
  String get achievementsGrammarWizardTitle;

  /// Default badge description: Grammar Wizard.
  ///
  /// In en, this message translates to:
  /// **'Score 90%+ in Grammar assessment'**
  String get achievementsGrammarWizardDesc;

  /// Default badge title: Voice Champion.
  ///
  /// In en, this message translates to:
  /// **'Voice Champion'**
  String get achievementsVoiceChampionTitle;

  /// Default badge description: Voice Champion.
  ///
  /// In en, this message translates to:
  /// **'Complete 5 Live AI Voice practice sessions'**
  String get achievementsVoiceChampionDesc;

  /// Default badge title: Vocabulary Titan.
  ///
  /// In en, this message translates to:
  /// **'Vocabulary Titan'**
  String get achievementsVocabularyTitanTitle;

  /// Default badge description: Vocabulary Titan.
  ///
  /// In en, this message translates to:
  /// **'Master 200+ active words'**
  String get achievementsVocabularyTitanDesc;

  /// Default badge title: Speed Learner.
  ///
  /// In en, this message translates to:
  /// **'Speed Learner'**
  String get achievementsSpeedLearnerTitle;

  /// Default badge description: Speed Learner.
  ///
  /// In en, this message translates to:
  /// **'Finish 3 lessons in a single day'**
  String get achievementsSpeedLearnerDesc;

  /// Default badge title: Perfect Quiz Accuracy.
  ///
  /// In en, this message translates to:
  /// **'Perfect Quiz Accuracy'**
  String get achievementsPerfectQuizTitle;

  /// Default badge description: Perfect Quiz Accuracy.
  ///
  /// In en, this message translates to:
  /// **'Score 100% on 5 practice quizzes'**
  String get achievementsPerfectQuizDesc;

  /// Default badge title: Polyglot Legend.
  ///
  /// In en, this message translates to:
  /// **'Polyglot Legend'**
  String get achievementsPolyglotLegendTitle;

  /// Default badge description: Polyglot Legend.
  ///
  /// In en, this message translates to:
  /// **'Reach Level 20 in English'**
  String get achievementsPolyglotLegendDesc;

  /// Title for create ticket screen
  ///
  /// In en, this message translates to:
  /// **'Submit a ticket'**
  String get supportCreateTicketTitle;

  /// Button label to create a new support ticket
  ///
  /// In en, this message translates to:
  /// **'Create Ticket'**
  String get supportCreateTicketButton;

  /// Button to submit support ticket
  ///
  /// In en, this message translates to:
  /// **'Submit Ticket'**
  String get supportSubmitTicket;

  /// Label for ticket category dropdown
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get supportCategoryLabel;

  /// Label for ticket severity dropdown
  ///
  /// In en, this message translates to:
  /// **'Severity'**
  String get supportSeverityLabel;

  /// Label for ticket subject input
  ///
  /// In en, this message translates to:
  /// **'Subject'**
  String get supportSubjectLabel;

  /// Placeholder for ticket subject
  ///
  /// In en, this message translates to:
  /// **'Briefly describe the issue'**
  String get supportSubjectPlaceholder;

  /// Label for ticket description textarea
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get supportDescriptionLabel;

  /// Placeholder for ticket description
  ///
  /// In en, this message translates to:
  /// **'Tell us what happened, step by step...'**
  String get supportDescriptionPlaceholder;

  /// Validation error for empty subject
  ///
  /// In en, this message translates to:
  /// **'Subject is required'**
  String get supportSubjectRequired;

  /// Validation error for empty description
  ///
  /// In en, this message translates to:
  /// **'Description is required'**
  String get supportDescriptionRequired;

  /// Category option: Bug report
  ///
  /// In en, this message translates to:
  /// **'Bug Report'**
  String get supportCategoryBugReport;

  /// Category option: Account issue
  ///
  /// In en, this message translates to:
  /// **'Account Issue'**
  String get supportCategoryAccountIssue;

  /// Category option: Learning issue
  ///
  /// In en, this message translates to:
  /// **'Learning Issue'**
  String get supportCategoryLearningIssue;

  /// Category option: Billing issue
  ///
  /// In en, this message translates to:
  /// **'Billing Issue'**
  String get supportCategoryBillingIssue;

  /// Category option: General
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get supportCategoryGeneral;

  /// Feedback category: Suggestion
  ///
  /// In en, this message translates to:
  /// **'Suggestion'**
  String get supportCategorySuggestion;

  /// Feedback category: Compliment
  ///
  /// In en, this message translates to:
  /// **'Compliment'**
  String get supportCategoryCompliment;

  /// Feedback category: Complaint
  ///
  /// In en, this message translates to:
  /// **'Complaint'**
  String get supportCategoryComplaint;

  /// Category option: Other
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get supportCategoryOther;

  /// Severity option: Low
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get supportSeverityLow;

  /// Severity option: Medium
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get supportSeverityMedium;

  /// Severity option: High
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get supportSeverityHigh;

  /// Severity option: Critical
  ///
  /// In en, this message translates to:
  /// **'Critical'**
  String get supportSeverityCritical;

  /// Feedback title input label
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get supportFeedbackTitleLabel;

  /// Feedback title placeholder
  ///
  /// In en, this message translates to:
  /// **'A short summary'**
  String get supportFeedbackTitlePlaceholder;

  /// Feedback body input label
  ///
  /// In en, this message translates to:
  /// **'Your feedback'**
  String get supportFeedbackBodyLabel;

  /// Feedback body placeholder
  ///
  /// In en, this message translates to:
  /// **'Tell us what you think...'**
  String get supportFeedbackBodyPlaceholder;

  /// Validation error when feedback title is empty
  ///
  /// In en, this message translates to:
  /// **'Title is required'**
  String get supportFeedbackTitleRequired;

  /// Validation error when feedback body is empty
  ///
  /// In en, this message translates to:
  /// **'Feedback details are required'**
  String get supportFeedbackBodyRequired;

  /// Label for ticket comment input
  ///
  /// In en, this message translates to:
  /// **'Add a comment'**
  String get supportTicketAddComment;

  /// Placeholder for ticket follow-up comment
  ///
  /// In en, this message translates to:
  /// **'Write a follow-up message...'**
  String get supportTicketCommentPlaceholder;

  /// Button to send comment
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get supportTicketSendComment;

  /// System status banner title
  ///
  /// In en, this message translates to:
  /// **'All Systems Operational'**
  String get supportStatusAllOperational;

  /// Empty state title for status components
  ///
  /// In en, this message translates to:
  /// **'No components reported'**
  String get supportStatusNoComponents;

  /// Empty state subtitle for status components
  ///
  /// In en, this message translates to:
  /// **'Nothing to show yet.'**
  String get supportStatusNothingToShow;

  /// Empty state title for parent support tickets
  ///
  /// In en, this message translates to:
  /// **'No Support Tickets'**
  String get supportNoParentTickets;

  /// Empty state subtitle for parent support tickets
  ///
  /// In en, this message translates to:
  /// **'Create a ticket if you need help with your account.'**
  String get supportNoParentTicketsSubtitle;

  /// Badge text for current enrolled course
  ///
  /// In en, this message translates to:
  /// **'Current'**
  String get coursesCurrentBadge;

  /// App bar title and screen header for the AI Voice Teacher
  ///
  /// In en, this message translates to:
  /// **'Voice Teacher'**
  String get voiceTeacherTitle;

  /// Loading state accessibility label when initializing voice teacher
  ///
  /// In en, this message translates to:
  /// **'Starting Voice Teacher session'**
  String get voiceTeacherStartingSession;

  /// Accessibility label for voice teacher back button
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get voiceTeacherBackSemantic;

  /// Status pill label when voice teacher is speaking
  ///
  /// In en, this message translates to:
  /// **'Speaking'**
  String get voiceTeacherStatusSpeaking;

  /// Status pill label when recording user voice
  ///
  /// In en, this message translates to:
  /// **'Recording'**
  String get voiceTeacherStatusRecording;

  /// Status pill label when processing user response
  ///
  /// In en, this message translates to:
  /// **'Processing'**
  String get voiceTeacherStatusProcessing;

  /// Status pill label when ready for user input
  ///
  /// In en, this message translates to:
  /// **'Ready'**
  String get voiceTeacherStatusReady;

  /// Main heading when voice teacher is speaking
  ///
  /// In en, this message translates to:
  /// **'Your teacher is speaking…'**
  String get voiceTeacherHeadingSpeaking;

  /// Main heading when recording user speech
  ///
  /// In en, this message translates to:
  /// **'Listening to you…'**
  String get voiceTeacherHeadingRecording;

  /// Main heading when processing user speech
  ///
  /// In en, this message translates to:
  /// **'Processing your answer…'**
  String get voiceTeacherHeadingProcessing;

  /// Main heading when awaiting student push-to-talk press
  ///
  /// In en, this message translates to:
  /// **'Your turn — press and hold to speak'**
  String get voiceTeacherHeadingListening;

  /// Subtitle text below push-to-talk button
  ///
  /// In en, this message translates to:
  /// **'Practise your pronunciation with the AI teacher'**
  String get voiceTeacherPracticeSubtitle;

  /// Button label to toggle chat transcript view
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get voiceTeacherMessagesButton;

  /// Voice error back to call button
  ///
  /// In en, this message translates to:
  /// **'Back to call'**
  String get voiceTeacherBackToCall;

  /// Accessibility label for voice status pill
  ///
  /// In en, this message translates to:
  /// **'Status: {status}'**
  String voiceTeacherStatusSemantic(String status);

  /// Push to talk button instruction text
  ///
  /// In en, this message translates to:
  /// **'Press and hold to speak'**
  String get voiceTeacherPressAndHold;

  /// Accessibility label while recording voice
  ///
  /// In en, this message translates to:
  /// **'Recording — release to send'**
  String get voiceTeacherRecordingRelease;

  /// Accessibility label for voice teacher message in transcript
  ///
  /// In en, this message translates to:
  /// **'Voice Teacher said: {text}'**
  String voiceTeacherSaid(String text);

  /// Accessibility label for user message in transcript
  ///
  /// In en, this message translates to:
  /// **'You said: {text}'**
  String voiceTeacherYouSaid(String text);

  /// Card title for Voice Teacher entry widget
  ///
  /// In en, this message translates to:
  /// **'Voice Teacher'**
  String get voiceTeacherEntryTitle;

  /// Card subtitle for Voice Teacher entry widget
  ///
  /// In en, this message translates to:
  /// **'Practice conversational speaking with AI'**
  String get voiceTeacherEntrySubtitle;

  /// Promo code input label
  ///
  /// In en, this message translates to:
  /// **'Promotion code (optional)'**
  String get billingPromoCodeLabel;

  /// Promo code placeholder
  ///
  /// In en, this message translates to:
  /// **'Enter code'**
  String get billingPromoCodePlaceholder;

  /// Button to proceed to payment
  ///
  /// In en, this message translates to:
  /// **'Proceed to Payment'**
  String get billingProceedToPayment;

  /// Title for empty invoices
  ///
  /// In en, this message translates to:
  /// **'No Invoices Yet'**
  String get billingNoInvoicesTitle;

  /// Subtitle for empty invoices
  ///
  /// In en, this message translates to:
  /// **'Your invoices will appear here after your first payment.'**
  String get billingNoInvoicesSubtitle;

  /// Title when no subscription plans exist
  ///
  /// In en, this message translates to:
  /// **'No plans available'**
  String get billingNoPlansAvailable;

  /// Subtitle when no subscription plans exist
  ///
  /// In en, this message translates to:
  /// **'Check back later for available plans.'**
  String get billingCheckBackLaterPlans;

  /// Button to subscribe to plan
  ///
  /// In en, this message translates to:
  /// **'Subscribe'**
  String get billingSubscribe;

  /// Empty assessments title
  ///
  /// In en, this message translates to:
  /// **'No assessments available'**
  String get assessmentsNoAssessmentsTitle;

  /// Empty assessments subtitle
  ///
  /// In en, this message translates to:
  /// **'Published quizzes and exams will appear here.'**
  String get assessmentsNoAssessmentsSubtitle;

  /// Assessment detail questions stat
  ///
  /// In en, this message translates to:
  /// **'Questions'**
  String get assessmentsStatQuestions;

  /// Assessment detail time limit stat
  ///
  /// In en, this message translates to:
  /// **'Time limit'**
  String get assessmentsStatTimeLimit;

  /// Assessment detail max attempts stat
  ///
  /// In en, this message translates to:
  /// **'Max attempts'**
  String get assessmentsStatMaxAttempts;

  /// Button to start assessment attempt
  ///
  /// In en, this message translates to:
  /// **'Start Attempt'**
  String get assessmentsStartAttempt;

  /// Start attempt screen title
  ///
  /// In en, this message translates to:
  /// **'Start attempt'**
  String get assessmentsStartAttemptTitle;

  /// Button to go back
  ///
  /// In en, this message translates to:
  /// **'Go Back'**
  String get assessmentsGoBack;

  /// Button to submit assessment attempt
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get assessmentsSubmit;

  /// Button to finish viewing results
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get assessmentsDone;

  /// Empty results history title
  ///
  /// In en, this message translates to:
  /// **'No results yet'**
  String get assessmentsNoResultsTitle;

  /// Empty results history subtitle
  ///
  /// In en, this message translates to:
  /// **'Your past attempt results will appear here.'**
  String get assessmentsNoResultsSubtitle;

  /// Assessment deadline section title
  ///
  /// In en, this message translates to:
  /// **'Deadline'**
  String get assessmentsDeadlinesTitle;

  /// Empty deadlines title
  ///
  /// In en, this message translates to:
  /// **'No deadlines'**
  String get assessmentsNoDeadlinesTitle;

  /// Empty deadlines subtitle
  ///
  /// In en, this message translates to:
  /// **'Your assessment deadlines will appear here.'**
  String get assessmentsNoDeadlinesSubtitle;

  /// Deadlines tab active
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get assessmentsTabActive;

  /// Deadlines tab upcoming
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get assessmentsTabUpcoming;

  /// Deadlines tab late
  ///
  /// In en, this message translates to:
  /// **'Late'**
  String get assessmentsTabLate;

  /// Deadlines tab missed
  ///
  /// In en, this message translates to:
  /// **'Missed'**
  String get assessmentsTabMissed;

  /// Deadlines tab closed
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get assessmentsTabClosed;

  /// Deadline opens date label
  ///
  /// In en, this message translates to:
  /// **'Opens'**
  String get assessmentsOpensLabel;

  /// Deadline closes date label
  ///
  /// In en, this message translates to:
  /// **'Closes'**
  String get assessmentsClosesLabel;

  /// Deadline extended close label
  ///
  /// In en, this message translates to:
  /// **'Extended close'**
  String get assessmentsExtendedCloseLabel;

  /// Question answer placeholder
  ///
  /// In en, this message translates to:
  /// **'Type your answer here…'**
  String get assessmentsTypeAnswerPlaceholder;

  /// Question answer label
  ///
  /// In en, this message translates to:
  /// **'Your answer'**
  String get assessmentsYourAnswerLabel;

  /// Empty questions list title
  ///
  /// In en, this message translates to:
  /// **'Questions'**
  String get assessmentsQuestionsEmptyTitle;

  /// Empty questions list subtitle
  ///
  /// In en, this message translates to:
  /// **'No questions found for this attempt.'**
  String get assessmentsQuestionsEmptySubtitle;

  /// Empty notifications title
  ///
  /// In en, this message translates to:
  /// **'No notifications yet'**
  String get notificationsNoNotificationsTitle;

  /// Empty notifications subtitle
  ///
  /// In en, this message translates to:
  /// **'Session reminders and progress updates will appear here.'**
  String get notificationsNoNotificationsSubtitle;

  /// Status completed for assessments and reviews
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get assessmentsStatusCompleted;

  /// Button to dismiss notification
  ///
  /// In en, this message translates to:
  /// **'Dismiss'**
  String get notificationsDismiss;

  /// Notification dismissed state title
  ///
  /// In en, this message translates to:
  /// **'Dismissed'**
  String get notificationsDismissedTitle;

  /// Quiet hours toggle switch label
  ///
  /// In en, this message translates to:
  /// **'Enable quiet hours'**
  String get notificationsEnableQuietHours;

  /// Button to save quiet hours
  ///
  /// In en, this message translates to:
  /// **'Save quiet hours'**
  String get notificationsSaveQuietHours;

  /// Empty reminders title
  ///
  /// In en, this message translates to:
  /// **'No reminders yet'**
  String get notificationsNoRemindersTitle;

  /// Empty reminders subtitle
  ///
  /// In en, this message translates to:
  /// **'Reminders you enable will appear here.'**
  String get notificationsNoRemindersSubtitle;

  /// Button to cancel reminder
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get notificationsCancelReminder;

  /// Badge for unread notification
  ///
  /// In en, this message translates to:
  /// **'Unread'**
  String get notificationsUnread;

  /// Average mastery stat label
  ///
  /// In en, this message translates to:
  /// **'Avg mastery'**
  String get progressAvgMastery;

  /// Day streak stat label
  ///
  /// In en, this message translates to:
  /// **'Day streak'**
  String get progressDayStreak;

  /// Hub link title for skill states
  ///
  /// In en, this message translates to:
  /// **'Skill States'**
  String get progressSkillStates;

  /// Hub link title for weaknesses
  ///
  /// In en, this message translates to:
  /// **'Weaknesses'**
  String get progressWeaknesses;

  /// Hub link title for recommendations
  ///
  /// In en, this message translates to:
  /// **'Recommendations'**
  String get progressRecommendations;

  /// Hub link title for review schedule
  ///
  /// In en, this message translates to:
  /// **'Review Schedule'**
  String get progressReviewSchedule;

  /// Weakness summary title
  ///
  /// In en, this message translates to:
  /// **'Focus Areas'**
  String get progressFocusAreas;

  /// Empty progress state title
  ///
  /// In en, this message translates to:
  /// **'No progress data yet'**
  String get progressNoProgressData;

  /// Empty skill state title
  ///
  /// In en, this message translates to:
  /// **'No skill data yet'**
  String get progressNoSkillData;

  /// Empty weakness summary title
  ///
  /// In en, this message translates to:
  /// **'No focus areas yet'**
  String get progressNoFocusAreas;

  /// Empty recommendations title
  ///
  /// In en, this message translates to:
  /// **'No recommendations yet'**
  String get progressNoRecommendations;

  /// Skill status strong
  ///
  /// In en, this message translates to:
  /// **'Strong'**
  String get progressStatusStrong;

  /// Skill status developing
  ///
  /// In en, this message translates to:
  /// **'Developing'**
  String get progressStatusDeveloping;

  /// Skill status needs work
  ///
  /// In en, this message translates to:
  /// **'Needs work'**
  String get progressStatusNeedsWork;

  /// Skill trend improving
  ///
  /// In en, this message translates to:
  /// **'Improving'**
  String get progressTrendImproving;

  /// Skill trend declining
  ///
  /// In en, this message translates to:
  /// **'Declining'**
  String get progressTrendDeclining;

  /// Skill trend stable
  ///
  /// In en, this message translates to:
  /// **'Stable'**
  String get progressTrendStable;

  /// Skill trend insufficient data
  ///
  /// In en, this message translates to:
  /// **'Insufficient data'**
  String get progressTrendInsufficient;

  /// Review status skipped
  ///
  /// In en, this message translates to:
  /// **'Skipped'**
  String get progressStatusSkipped;

  /// Review status overdue
  ///
  /// In en, this message translates to:
  /// **'Overdue'**
  String get progressStatusOverdue;

  /// Empty AI chat prompt title
  ///
  /// In en, this message translates to:
  /// **'Ask AI Teacher anything'**
  String get aiTeacherAskAnythingTitle;

  /// Empty AI chat prompt subtitle
  ///
  /// In en, this message translates to:
  /// **'Start the conversation by sending a message.'**
  String get aiTeacherStartConversationSubtitle;

  /// Session history button tooltip
  ///
  /// In en, this message translates to:
  /// **'Conversation history'**
  String get aiTeacherConversationHistory;

  /// Empty AI history title
  ///
  /// In en, this message translates to:
  /// **'No conversations yet'**
  String get aiTeacherNoConversationsTitle;

  /// Empty AI history subtitle
  ///
  /// In en, this message translates to:
  /// **'Start chatting with AI Teacher to see your history here.'**
  String get aiTeacherNoConversationsSubtitle;

  /// AI Teacher setting text toggle
  ///
  /// In en, this message translates to:
  /// **'Prefer text replies over voice'**
  String get aiTeacherPreferTextLabel;

  /// AI Teacher setting animations toggle
  ///
  /// In en, this message translates to:
  /// **'Reduce animations in AI Teacher and Voice Tutor'**
  String get aiTeacherReduceAnimationsLabel;

  /// AI Teacher settings info banner title
  ///
  /// In en, this message translates to:
  /// **'About these settings'**
  String get aiTeacherAboutSettingsTitle;

  /// AI chat message input placeholder
  ///
  /// In en, this message translates to:
  /// **'Ask me anything...'**
  String get aiTeacherAskAnythingHint;

  /// Voice mic tooltip
  ///
  /// In en, this message translates to:
  /// **'Voice input (coming soon)'**
  String get aiTeacherVoiceComingSoon;

  /// AI chat send button label
  ///
  /// In en, this message translates to:
  /// **'Send message'**
  String get aiTeacherSendMessage;

  /// AI safety block title
  ///
  /// In en, this message translates to:
  /// **'AI Teacher is limited right now'**
  String get aiTeacherLimitedBannerTitle;

  /// AI Teacher entry card button
  ///
  /// In en, this message translates to:
  /// **'Open AI Teacher'**
  String get aiTeacherOpenButton;

  /// Voice transcript empty title
  ///
  /// In en, this message translates to:
  /// **'Start talking with your Voice Teacher'**
  String get voiceTeacherStartTalkingTitle;

  /// Voice transcript empty subtitle
  ///
  /// In en, this message translates to:
  /// **'Your transcript will appear here.'**
  String get voiceTeacherTranscriptAppearSubtitle;

  /// Voice transcript title
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get voiceTeacherMessages;

  /// QA continue button
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get qaContinueButton;

  /// QA fill-in-blank label
  ///
  /// In en, this message translates to:
  /// **'Your answer'**
  String get qaYourAnswerLabel;

  /// QA fill-in-blank placeholder
  ///
  /// In en, this message translates to:
  /// **'Type your answer here'**
  String get qaTypeAnswerPlaceholder;

  /// Session feedback questions attempted stat
  ///
  /// In en, this message translates to:
  /// **'Questions attempted'**
  String get qaQuestionsAttempted;

  /// Session feedback correct score stat
  ///
  /// In en, this message translates to:
  /// **'Correct (backend score)'**
  String get qaCorrectScore;

  /// Session feedback mastery shift stat
  ///
  /// In en, this message translates to:
  /// **'Mastery shift'**
  String get qaMasteryShift;

  /// Lesson completed toast message
  ///
  /// In en, this message translates to:
  /// **'Lesson marked as completed! 🌟'**
  String get qaLessonCompletedToast;

  /// Mark lesson completed button
  ///
  /// In en, this message translates to:
  /// **'Mark Lesson as Completed ✨'**
  String get qaMarkLessonCompletedButton;

  /// Drawer more item label
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get shellNavMore;

  /// Language option English
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get profileLanguageEnglish;

  /// Language option Arabic
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get profileLanguageArabic;

  /// Title for the analytics summary page
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get analyticsPageTitle;

  /// Empty state title for analytics summary
  ///
  /// In en, this message translates to:
  /// **'No reports available'**
  String get analyticsNoReportsTitle;

  /// Empty state subtitle for analytics summary
  ///
  /// In en, this message translates to:
  /// **'There are no analytics reports for you yet.'**
  String get analyticsNoReportsSubtitle;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
    default:
      return AppLocalizationsEn();
  }
}
