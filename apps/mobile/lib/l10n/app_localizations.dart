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
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
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

  /// Link back to the login page shown at the bottom of the register page.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Sign in'**
  String get authAlreadyHaveAccount;

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
  /// **'Home'**
  String get shellNavHome;

  /// Accessibility label for the Home bottom-nav tab.
  ///
  /// In en, this message translates to:
  /// **'Home tab'**
  String get shellNavHomeSemantic;

  /// Label for the Learn destination in the bottom nav and drawer.
  ///
  /// In en, this message translates to:
  /// **'Learn'**
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
  /// **'Progress'**
  String get shellNavProgress;

  /// Accessibility label for the Progress bottom-nav tab.
  ///
  /// In en, this message translates to:
  /// **'Progress tab'**
  String get shellNavProgressSemantic;

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

  /// Label for the English option in the drawer's language toggle.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get shellLanguageEnglishLabel;

  /// Label for the Arabic option in the drawer's language toggle. Intentionally shown in Arabic script even in the English locale, matching how language pickers conventionally display each language's own native name.
  ///
  /// In en, this message translates to:
  /// **'العربية'**
  String get shellLanguageArabicLabel;

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

  /// Tagline shown beneath the brand name on the splash screen.
  ///
  /// In en, this message translates to:
  /// **'Adaptive Intelligence for Mastery'**
  String get onboardingTagline;

  /// Static hint text shown alongside the splash screen's progress bar while the session check runs.
  ///
  /// In en, this message translates to:
  /// **'Tap to continue'**
  String get onboardingTapToContinue;

  /// Accessibility label shown while the home screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading home data'**
  String get homeLoadingSemantic;

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

  /// Title in the progress hub screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Your progress'**
  String get progressPageTitle;

  /// Subtitle in the progress hub screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'A snapshot of how you are doing'**
  String get progressPageSubtitle;

  /// Accessibility label shown while the progress hub screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading progress data'**
  String get progressLoadingSemantic;

  /// Empty-state title shown when the student has no AIM progress data yet.
  ///
  /// In en, this message translates to:
  /// **'No progress data yet'**
  String get progressEmptyTitle;

  /// Empty-state subtitle shown when the student has no AIM progress data yet.
  ///
  /// In en, this message translates to:
  /// **'Complete lessons and practice sessions to see your AIM progress.'**
  String get progressEmptySubtitle;

  /// Label under the average-mastery stat card on the progress hub screen.
  ///
  /// In en, this message translates to:
  /// **'Avg mastery'**
  String get progressAvgMasteryLabel;

  /// Label under the day-streak stat card on the progress hub screen.
  ///
  /// In en, this message translates to:
  /// **'Day streak'**
  String get progressDayStreakLabel;

  /// Accessibility label for a stat card on the progress hub screen.
  ///
  /// In en, this message translates to:
  /// **'{value} {label}'**
  String progressStatCardSemantic(String value, String label);

  /// Accessibility label for a tappable navigation row on the progress hub screen.
  ///
  /// In en, this message translates to:
  /// **'{title}, {subtitle}'**
  String progressNavRowSemantic(String title, String subtitle);

  /// Subtitle under the 'Skill States' navigation row showing the tracked-skill count.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{{count} skills tracked} other{{count} skills tracked}}'**
  String progressSkillStatesSubtitle(int count);

  /// Title of the 'Weaknesses' navigation row on the progress hub screen.
  ///
  /// In en, this message translates to:
  /// **'Weaknesses'**
  String get progressWeaknessesNavTitle;

  /// Subtitle under the 'Weaknesses' navigation row showing the focus-area count.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{{count} focus areas} other{{count} focus areas}}'**
  String progressFocusAreasCountLabel(int count);

  /// Title of the 'Recommendations' navigation row on the progress hub screen, and app bar title of RecommendationsPage.
  ///
  /// In en, this message translates to:
  /// **'Recommendations'**
  String get progressRecommendationsNavTitle;

  /// Subtitle under the 'Recommendations' navigation row showing the recommendation count.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{{count} from AIM} other{{count} from AIM}}'**
  String progressRecommendationsFromAimLabel(int count);

  /// Subtitle under the 'Review Schedule' navigation row showing the scheduled-review count.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{{count} reviews scheduled} other{{count} reviews scheduled}}'**
  String progressReviewsScheduledCountLabel(int count);

  /// Accessibility label shown while the weakness summary screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading weakness data'**
  String get progressWeaknessLoadingSemantic;

  /// Empty-state title shown when the student has no weakness records yet.
  ///
  /// In en, this message translates to:
  /// **'No focus areas yet'**
  String get progressNoFocusAreasTitle;

  /// Empty-state subtitle shown when the student has no weakness records yet.
  ///
  /// In en, this message translates to:
  /// **'Complete practice sessions so AIM can identify areas to focus on.'**
  String get progressNoFocusAreasSubtitle;

  /// Accessibility label for a weakness detail card on the weakness summary screen. skillId, severity, and status are backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'{skillId} weakness: {severity}, {status}'**
  String progressWeaknessDetailSemantic(
      String skillId, String severity, String status);

  /// Caption showing when a weakness was detected, on the weakness summary screen.
  ///
  /// In en, this message translates to:
  /// **'Detected: {date}'**
  String progressDetectedLabel(String date);

  /// Caption showing when a weakness was resolved, on the weakness summary screen.
  ///
  /// In en, this message translates to:
  /// **'Resolved: {date}'**
  String progressResolvedLabel(String date);

  /// Accessibility label shown while the recommendations screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading recommendations'**
  String get progressRecommendationsLoadingSemantic;

  /// Empty-state title shown when the student has no AIM recommendations yet.
  ///
  /// In en, this message translates to:
  /// **'No recommendations yet'**
  String get progressNoRecommendationsTitle;

  /// Empty-state subtitle shown when the student has no AIM recommendations yet.
  ///
  /// In en, this message translates to:
  /// **'Complete lessons and practice sessions to receive AIM recommendations.'**
  String get progressNoRecommendationsSubtitle;

  /// Accessibility label for a recommendation detail card on the recommendations screen. rank, kind, and skillId are backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'AIM recommendation rank {rank}: {kind} for {skillId}'**
  String progressRecommendationRankSemantic(
      int rank, String kind, String skillId);

  /// Small rank-number badge on a recommendation card.
  ///
  /// In en, this message translates to:
  /// **'#{rank}'**
  String progressRankBadge(int rank);

  /// Caption showing the target lesson of a recommendation, on the recommendations screen.
  ///
  /// In en, this message translates to:
  /// **'Lesson: {lessonId}'**
  String progressLessonLabel(String lessonId);

  /// Caption showing when a recommendation expires, on the recommendations screen.
  ///
  /// In en, this message translates to:
  /// **'Expires: {date}'**
  String progressExpiresLabel(String date);

  /// Caption showing when a recommendation was generated, on the recommendations screen.
  ///
  /// In en, this message translates to:
  /// **'Generated: {date}'**
  String progressGeneratedLabel(String date);

  /// Accessibility label shown while the skill states screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading skill states'**
  String get progressSkillStatesLoadingSemantic;

  /// Empty-state title shown when the student has no skill state data yet.
  ///
  /// In en, this message translates to:
  /// **'No skill data yet'**
  String get progressNoSkillDataTitle;

  /// Empty-state subtitle shown when the student has no skill state data yet.
  ///
  /// In en, this message translates to:
  /// **'Complete lessons and practice to build your skill profile.'**
  String get progressNoSkillDataSubtitle;

  /// Accessibility label for a skill-state detail card on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'{title} mastery {masteryPct}%, {tierLabel}'**
  String progressSkillMasterySemantic(
      String title, int masteryPct, String tierLabel);

  /// Mastery-tier badge label for a strong skill on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'Strong'**
  String get progressTierStrong;

  /// Mastery-tier badge label for a developing skill on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'Developing'**
  String get progressTierDeveloping;

  /// Mastery-tier badge label for a skill needing work on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'Needs work'**
  String get progressTierNeedsWork;

  /// Trend indicator label for an improving skill on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'Improving'**
  String get progressTrendImproving;

  /// Trend indicator label for a declining skill on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'Declining'**
  String get progressTrendDeclining;

  /// Trend indicator label for a stable skill on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'Stable'**
  String get progressTrendStable;

  /// Trend indicator label shown when there isn't enough data to determine a trend, on the skill states screen.
  ///
  /// In en, this message translates to:
  /// **'Insufficient data'**
  String get progressTrendInsufficientData;

  /// Prefix before the mastery percentage figure on a skill-state card. Includes a trailing space.
  ///
  /// In en, this message translates to:
  /// **'Mastery '**
  String get progressMasteryPrefix;

  /// Suffix showing the previous mastery percentage on a skill-state card, when available. Includes a leading space.
  ///
  /// In en, this message translates to:
  /// **' · was {prevPct}'**
  String progressMasteryWasSuffix(int prevPct);

  /// Caption showing the mastery confidence percentage on a skill-state card.
  ///
  /// In en, this message translates to:
  /// **'Confidence {percent}%'**
  String progressConfidenceLabel(int percent);

  /// Empty-state subtitle shown when the student has no scheduled reviews, on the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'Complete practice sessions to receive AIM-computed review reminders.'**
  String get progressNoReviewsSubtitle;

  /// Status badge label for a review that is due.
  ///
  /// In en, this message translates to:
  /// **'Due'**
  String get progressReviewStatusDue;

  /// Status badge label for a review that is pending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get progressReviewStatusPending;

  /// Status badge label for a completed review.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get progressReviewStatusCompleted;

  /// Status badge label for a skipped review.
  ///
  /// In en, this message translates to:
  /// **'Skipped'**
  String get progressReviewStatusSkipped;

  /// Status badge label for an overdue review.
  ///
  /// In en, this message translates to:
  /// **'Overdue'**
  String get progressReviewStatusOverdue;

  /// Accessibility label for a review-schedule row on the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'{skillId} review due {dueAt} — {statusLabel}'**
  String progressReviewCardSemantic(
      String skillId, String dueAt, String statusLabel);

  /// Compact meta line on a review-schedule row: due label, interval, and repetition count.
  ///
  /// In en, this message translates to:
  /// **'{dueLabel} · {intervalDays}d · rep #{repCount}'**
  String progressReviewMetaLabel(
      String dueLabel, int intervalDays, int repCount);

  /// Fallback due-date label on the dedicated Review Schedule screen when the backend-supplied dueAt timestamp can't be parsed.
  ///
  /// In en, this message translates to:
  /// **'Due {raw}'**
  String progressDueRawLabel(String raw);

  /// Accessibility label for the standalone ProgressReviewScheduleCard widget.
  ///
  /// In en, this message translates to:
  /// **'{skillId} review due {dueAt}'**
  String progressReviewScheduleCardSemantic(String skillId, String dueAt);

  /// Due-date caption on the standalone ProgressReviewScheduleCard widget.
  ///
  /// In en, this message translates to:
  /// **'Due: {dueAt}'**
  String progressDueColonLabel(String dueAt);

  /// Compact interval-days badge, e.g. '7d', on the standalone ProgressReviewScheduleCard widget.
  ///
  /// In en, this message translates to:
  /// **'{days}d'**
  String progressIntervalDaysBadge(int days);

  /// Title in the Review tab's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get reviewsPageTitle;

  /// Subtitle in the Review tab's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Spaced repetition keeps it in memory'**
  String get reviewsPageSubtitle;

  /// Accessibility label shown while a review schedule screen's data is loading. Shared by the Review tab and the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'Loading review schedule'**
  String get reviewsLoadingScheduleSemantic;

  /// Empty-state title shown when the student has no scheduled reviews. Shared by the Review tab and the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'No reviews scheduled'**
  String get reviewsNoReviewsScheduledTitle;

  /// Empty-state subtitle shown when the student has no scheduled reviews, on the Review tab.
  ///
  /// In en, this message translates to:
  /// **'Complete practice sessions to receive review reminders.'**
  String get reviewsNoReviewsSubtitle;

  /// Accessibility label for a review schedule card on the Review tab.
  ///
  /// In en, this message translates to:
  /// **'{title} review due {dueAt} — {status}'**
  String reviewsCardSemantic(String title, String dueAt, String status);

  /// Interval-days pill on a review schedule card, on the Review tab.
  ///
  /// In en, this message translates to:
  /// **'Interval {days}d'**
  String reviewsIntervalDaysLabel(int days);

  /// Repetition-count pill on a review schedule card, on the Review tab.
  ///
  /// In en, this message translates to:
  /// **'rep #{repCount}'**
  String reviewsRepBadge(int repCount);

  /// Relative due-date label for a review due today. Shared by the Review tab and the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'Due Today'**
  String get reviewsDueTodayLabel;

  /// Relative due-date label for a review due tomorrow. Shared by the Review tab and the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'Due Tomorrow'**
  String get reviewsDueTomorrowLabel;

  /// Relative due-date label for a review that was due yesterday, on the Review tab.
  ///
  /// In en, this message translates to:
  /// **'Due Yesterday'**
  String get reviewsDueYesterdayLabel;

  /// Relative due-date label for a review due in the near future. Shared by the Review tab and the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'{days, plural, one{Due in 1 day} other{Due in {days} days}}'**
  String reviewsDueInDaysLabel(int days);

  /// Relative due-date label for a review that was due in the recent past. Shared by the Review tab and the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'{days, plural, one{Due 1 day ago} other{Due {days} days ago}}'**
  String reviewsDueDaysAgoLabel(int days);

  /// Due-date label using a locale-formatted date, for reviews due further in the past or future. Shared by the Review tab and the dedicated Review Schedule screen.
  ///
  /// In en, this message translates to:
  /// **'Due {date}'**
  String reviewsDueFormattedLabel(String date);

  /// Fallback due-date label on the Review tab when the backend-supplied dueAt timestamp can't be parsed.
  ///
  /// In en, this message translates to:
  /// **'Due: {raw}'**
  String reviewsDueRawLabel(String raw);

  /// Title in the analytics summary screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get analyticsSummaryTitle;

  /// Accessibility label shown while the analytics summary screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading analytics summary'**
  String get analyticsSummaryLoadingSemantic;

  /// Empty-state title shown when the student has no visible analytics reports.
  ///
  /// In en, this message translates to:
  /// **'No reports available'**
  String get analyticsSummaryNoReportsTitle;

  /// Empty-state subtitle shown when the student has no visible analytics reports.
  ///
  /// In en, this message translates to:
  /// **'There are no analytics reports for you yet.'**
  String get analyticsSummaryNoReportsSubtitle;

  /// Accessibility label for a report card on the analytics summary screen.
  ///
  /// In en, this message translates to:
  /// **'{name} report'**
  String analyticsSummaryReportSemantic(String name);

  /// App bar title of the notification preferences screen, and accessibility label for the settings-gear button on the notification inbox screen.
  ///
  /// In en, this message translates to:
  /// **'Notification settings'**
  String get notificationsSettingsTitle;

  /// Accessibility label shown while the notification preferences screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading notification preferences'**
  String get notificationsPreferencesLoadingSemantic;

  /// Accessibility label shown while the notification inbox screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading notifications'**
  String get notificationsInboxLoadingSemantic;

  /// Empty-state title shown when the student has no notifications.
  ///
  /// In en, this message translates to:
  /// **'No notifications yet'**
  String get notificationsInboxEmptyTitle;

  /// Empty-state subtitle shown when the student has no notifications.
  ///
  /// In en, this message translates to:
  /// **'Session reminders and progress updates will appear here.'**
  String get notificationsInboxEmptySubtitle;

  /// Accessibility label for the swipe-to-dismiss action revealed behind a notification tile.
  ///
  /// In en, this message translates to:
  /// **'Dismiss notification'**
  String get notificationsDismissSemantic;

  /// Accessibility label for the close button on the notifications bottom sheet.
  ///
  /// In en, this message translates to:
  /// **'Close notifications'**
  String get notificationsCloseSheetSemantic;

  /// Accessibility label for an unread notification tile on the inbox screen.
  ///
  /// In en, this message translates to:
  /// **'Unread notification: {title}'**
  String notificationsUnreadTileSemantic(String title);

  /// Accessibility label for a read notification tile on the inbox screen.
  ///
  /// In en, this message translates to:
  /// **'Notification: {title}'**
  String notificationsTileSemantic(String title);

  /// Label/accessibility label marking a notification as unread, used on the inbox unread dot and the notification detail screen's status badge.
  ///
  /// In en, this message translates to:
  /// **'Unread'**
  String get notificationsUnreadLabel;

  /// Label marking a notification as read, used on the notification detail screen's status badge and its 'Read' action button when there's nothing left to mark.
  ///
  /// In en, this message translates to:
  /// **'Read'**
  String get notificationsReadLabel;

  /// Notification category label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'Learning reminders'**
  String get notificationsCategoryLearningReminder;

  /// Notification category label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'Deadline reminders'**
  String get notificationsCategoryDeadlineReminder;

  /// Notification category label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'Progress updates'**
  String get notificationsCategoryProgressUpdate;

  /// Notification category label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'Assessment results'**
  String get notificationsCategoryAssessmentResult;

  /// Notification category label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'Progress digests'**
  String get notificationsCategoryParentSummary;

  /// Notification category label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'System alerts'**
  String get notificationsCategorySystemAlert;

  /// Notification channel label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'In-app'**
  String get notificationsChannelInApp;

  /// Notification channel label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'Push'**
  String get notificationsChannelPush;

  /// Notification channel label shown on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get notificationsChannelEmail;

  /// Section heading above the channel/category preference toggles on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'CHANNELS'**
  String get notificationsChannelsSectionLabel;

  /// Section heading above the quiet-hours settings on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'QUIET HOURS'**
  String get notificationsQuietHoursSectionLabel;

  /// Accessibility label for a channel/category notification toggle on the notification preferences screen.
  ///
  /// In en, this message translates to:
  /// **'{channel} notifications for {category}'**
  String notificationsChannelToggleSemantic(String channel, String category);

  /// Label and accessibility label for the quiet-hours enable/disable switch.
  ///
  /// In en, this message translates to:
  /// **'Enable quiet hours'**
  String get notificationsEnableQuietHoursLabel;

  /// Label for the quiet-hours start-time row.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get notificationsQuietHoursStartLabel;

  /// Label for the quiet-hours end-time row.
  ///
  /// In en, this message translates to:
  /// **'End'**
  String get notificationsQuietHoursEndLabel;

  /// Label and accessibility label for the quiet-hours save button.
  ///
  /// In en, this message translates to:
  /// **'Save quiet hours'**
  String get notificationsSaveQuietHoursLabel;

  /// Title in the notification detail screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Notification'**
  String get notificationsDetailTitle;

  /// Button label that marks the current notification as read, on the notification detail screen.
  ///
  /// In en, this message translates to:
  /// **'Mark as read'**
  String get notificationsMarkAsReadLabel;

  /// Button label that dismisses the current notification, on the notification detail screen.
  ///
  /// In en, this message translates to:
  /// **'Dismiss'**
  String get notificationsDismissLabel;

  /// Title of the banner shown once a notification has been dismissed.
  ///
  /// In en, this message translates to:
  /// **'Dismissed'**
  String get notificationsDismissedTitle;

  /// Body of the banner shown once a notification has been dismissed.
  ///
  /// In en, this message translates to:
  /// **'This notification has been dismissed.'**
  String get notificationsDismissedBody;

  /// Reminder-type label shown on the reminder settings screen.
  ///
  /// In en, this message translates to:
  /// **'Learning plan'**
  String get notificationsReminderTypeLearningPlan;

  /// Reminder-type label shown on the reminder settings screen.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get notificationsReminderTypeReview;

  /// Reminder-type label shown on the reminder settings screen.
  ///
  /// In en, this message translates to:
  /// **'Deadline'**
  String get notificationsReminderTypeDeadline;

  /// Reminder-type label shown on the reminder settings screen.
  ///
  /// In en, this message translates to:
  /// **'Streak'**
  String get notificationsReminderTypeStreak;

  /// Reminder-type label shown on the reminder settings screen.
  ///
  /// In en, this message translates to:
  /// **'Custom'**
  String get notificationsReminderTypeCustom;

  /// Schedule subtitle for a reminder that fires every day, on the reminder settings screen. time is already locale-formatted.
  ///
  /// In en, this message translates to:
  /// **'Every day · {time}'**
  String notificationsEveryDayLabel(String time);

  /// Schedule subtitle for a reminder that fires on a specific weekday, on the reminder settings screen. weekday and time are already locale-formatted.
  ///
  /// In en, this message translates to:
  /// **'Every {weekday} · {time}'**
  String notificationsEveryWeekdayLabel(String weekday, String time);

  /// Accessibility label for a reminder schedule tile on the reminder settings screen. status is a backend-supplied value.
  ///
  /// In en, this message translates to:
  /// **'{type} reminder, status {status}'**
  String notificationsReminderSemantic(String type, String status);

  /// Empty-state title shown when the student has no reminder schedules.
  ///
  /// In en, this message translates to:
  /// **'No reminders yet'**
  String get notificationsNoRemindersTitle;

  /// Empty-state subtitle shown when the student has no reminder schedules.
  ///
  /// In en, this message translates to:
  /// **'Reminders you enable will appear here.'**
  String get notificationsNoRemindersSubtitle;

  /// Accessibility label for the empty-state shown when the student has no reminder schedules.
  ///
  /// In en, this message translates to:
  /// **'No reminder schedules'**
  String get notificationsNoRemindersSemantic;

  /// Accessibility label shown while the reminder settings screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading reminder schedules'**
  String get notificationsRemindersLoadingSemantic;

  /// Title in the reminder settings screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Reminders'**
  String get notificationsRemindersTitle;

  /// Button label that resumes a paused reminder schedule.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get notificationsResumeLabel;

  /// Accessibility label for the resume-reminder button.
  ///
  /// In en, this message translates to:
  /// **'Resume reminder'**
  String get notificationsResumeSemantic;

  /// Button label that pauses an active reminder schedule.
  ///
  /// In en, this message translates to:
  /// **'Pause'**
  String get notificationsPauseLabel;

  /// Accessibility label for the pause-reminder button.
  ///
  /// In en, this message translates to:
  /// **'Pause reminder'**
  String get notificationsPauseSemantic;

  /// Accessibility label for the cancel-reminder button.
  ///
  /// In en, this message translates to:
  /// **'Cancel reminder'**
  String get notificationsCancelSemantic;

  /// Accessibility label for the notification bell button when there are unread notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications, {count} unread'**
  String notificationsBellUnreadSemantic(int count);

  /// Accessibility label shown while the achievements screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading achievements'**
  String get achievementsLoadingSemantic;

  /// Empty-state title shown when the student has no achievements.
  ///
  /// In en, this message translates to:
  /// **'No achievements yet'**
  String get achievementsEmptyTitle;

  /// Empty-state subtitle shown when the student has no achievements.
  ///
  /// In en, this message translates to:
  /// **'Complete lessons and practice sessions to earn badges and milestones.'**
  String get achievementsEmptySubtitle;

  /// Label and accessibility label for the button that returns to the main shell from the achievements empty state.
  ///
  /// In en, this message translates to:
  /// **'Start learning'**
  String get achievementsStartLearningLabel;

  /// Accessibility label for an unlocked achievement badge card.
  ///
  /// In en, this message translates to:
  /// **'{title}, unlocked'**
  String achievementsUnlockedSemantic(String title);

  /// Accessibility label for a locked achievement badge card.
  ///
  /// In en, this message translates to:
  /// **'{title}, locked'**
  String achievementsLockedSemantic(String title);

  /// Gradient header title on the start-attempt confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'Start attempt'**
  String get assessmentsStartAttemptTitle;

  /// Heading on the start-attempt confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'Ready to begin?'**
  String get assessmentsReadyToBeginTitle;

  /// Body copy on the start-attempt screen when the assessment has a real time limit.
  ///
  /// In en, this message translates to:
  /// **'Once you start, the {minutes}-minute timer runs continuously — even if you leave the app. Make sure you have time to finish.'**
  String assessmentsTimedBodyCopy(String minutes);

  /// Body copy on the start-attempt screen when the assessment has no time limit.
  ///
  /// In en, this message translates to:
  /// **'Once you start, the attempt will be recorded. Make sure you are ready before proceeding.'**
  String get assessmentsUntimedBodyCopy;

  /// Label for the button that starts an assessment attempt, shown on the start-attempt and detail screens.
  ///
  /// In en, this message translates to:
  /// **'Start Attempt'**
  String get assessmentsStartAttemptButton;

  /// Accessibility label for the start-attempt button, shown on the start-attempt and detail screens.
  ///
  /// In en, this message translates to:
  /// **'Start attempt for {title}'**
  String assessmentsStartAttemptSemantic(String title);

  /// Label for the secondary outline button that returns to the previous screen, on the start-attempt and submit-attempt confirmation screens.
  ///
  /// In en, this message translates to:
  /// **'Go Back'**
  String get assessmentsGoBackButton;

  /// Accessibility label shown while the assessment result screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading result'**
  String get assessmentsLoadingResultSemantic;

  /// Status badge label for a passed assessment attempt.
  ///
  /// In en, this message translates to:
  /// **'Passed'**
  String get assessmentsStatusPassed;

  /// Status badge label for a failed assessment attempt.
  ///
  /// In en, this message translates to:
  /// **'Failed'**
  String get assessmentsStatusFailed;

  /// Accessibility label for the score hero badge on the assessment result screen.
  ///
  /// In en, this message translates to:
  /// **'{statusLabel}: {score} of {maxScore} points'**
  String assessmentsScoreSemantic(
      String statusLabel, String score, String maxScore);

  /// Warning label shown when a late penalty was applied to an assessment attempt's score.
  ///
  /// In en, this message translates to:
  /// **'Late penalty applied'**
  String get assessmentsLatePenaltyApplied;

  /// Caption showing when an assessment attempt was graded.
  ///
  /// In en, this message translates to:
  /// **'Graded {date}'**
  String assessmentsGradedLabel(String date);

  /// Section header above the per-item score breakdown on the assessment result screen.
  ///
  /// In en, this message translates to:
  /// **'BREAKDOWN'**
  String get assessmentsBreakdownLabel;

  /// Accessibility label for the Done button on the assessment result screen.
  ///
  /// In en, this message translates to:
  /// **'Done viewing result'**
  String get assessmentsDoneViewingResultSemantic;

  /// Points-awarded-of-possible label on a breakdown item card.
  ///
  /// In en, this message translates to:
  /// **'{awarded} / {possible} pts'**
  String assessmentsPointsFraction(String awarded, String possible);

  /// Accessibility label shown while the result history screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading result history'**
  String get assessmentsLoadingResultHistorySemantic;

  /// Gradient header title on the result history screen.
  ///
  /// In en, this message translates to:
  /// **'Result history'**
  String get assessmentsResultHistoryTitle;

  /// Empty-state title shown when an assessment has no past results.
  ///
  /// In en, this message translates to:
  /// **'No results yet'**
  String get assessmentsNoResultsTitle;

  /// Empty-state subtitle shown when an assessment has no past results.
  ///
  /// In en, this message translates to:
  /// **'Your past attempt results will appear here.'**
  String get assessmentsNoResultsSubtitle;

  /// Accessibility label for a result history row.
  ///
  /// In en, this message translates to:
  /// **'Attempt {attemptNumber}, {scoreLabel}, {statusWord}{lateSuffix}'**
  String assessmentsAttemptResultSemantic(int attemptNumber, String scoreLabel,
      String statusWord, String lateSuffix);

  /// Lowercase 'passed' word used inside the result history row's accessibility label.
  ///
  /// In en, this message translates to:
  /// **'passed'**
  String get assessmentsPassedWord;

  /// Lowercase 'failed' word used inside the result history row's accessibility label.
  ///
  /// In en, this message translates to:
  /// **'failed'**
  String get assessmentsFailedWord;

  /// Suffix appended to the result history row's accessibility label when a late penalty was applied.
  ///
  /// In en, this message translates to:
  /// **', late penalty applied'**
  String get assessmentsLatePenaltySemanticSuffix;

  /// Accessibility label shown while the assessment detail screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading assessment'**
  String get assessmentsLoadingAssessmentSemantic;

  /// Gradient header title on the assessment detail screen when the assessment is an exam.
  ///
  /// In en, this message translates to:
  /// **'Exam details'**
  String get assessmentsExamDetailsTitle;

  /// Gradient header title on the assessment detail screen when the assessment is a quiz.
  ///
  /// In en, this message translates to:
  /// **'Quiz details'**
  String get assessmentsQuizDetailsTitle;

  /// Fallback gradient header title on the assessment detail screen before the assessment type is known.
  ///
  /// In en, this message translates to:
  /// **'Assessment details'**
  String get assessmentsDetailsTitle;

  /// Label for the questions-count stat tile on the assessment detail screen, and the placeholder title in the attempt screen's questions empty state.
  ///
  /// In en, this message translates to:
  /// **'Questions'**
  String get assessmentsQuestionsLabel;

  /// Label for the time-limit stat tile on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'Time limit'**
  String get assessmentsTimeLimitLabel;

  /// Label for the max-attempts stat tile on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'Max attempts'**
  String get assessmentsMaxAttemptsLabel;

  /// Section heading above the deadline card on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'Deadline'**
  String get assessmentsDeadlineHeading;

  /// Section heading above the section list on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'Sections'**
  String get assessmentsSectionsHeading;

  /// Title of the tappable past-results card on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'Past results'**
  String get assessmentsPastResultsTitle;

  /// Subtitle of the tappable past-results card on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'View your attempt history'**
  String get assessmentsViewAttemptHistorySubtitle;

  /// Accessibility label for the tappable past-results card on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'Past results, view your attempt history'**
  String get assessmentsPastResultsSemantic;

  /// Deadline status badge label for an open assessment, shared across the assessments feature.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get assessmentsDeadlineStatusOpen;

  /// Deadline status badge label for an upcoming assessment, shared across the assessments feature.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get assessmentsDeadlineStatusUpcoming;

  /// Deadline status badge label for a closed/expired assessment, shared across the assessments feature.
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get assessmentsDeadlineStatusClosed;

  /// Deadline status badge label for a late assessment, shared across the assessments feature.
  ///
  /// In en, this message translates to:
  /// **'Late'**
  String get assessmentsDeadlineStatusLate;

  /// Deadline status badge label for a missed assessment, shared across the assessments feature.
  ///
  /// In en, this message translates to:
  /// **'Missed'**
  String get assessmentsDeadlineStatusMissed;

  /// Label for the opens-at date row on the assessment detail screen's deadline card.
  ///
  /// In en, this message translates to:
  /// **'Opens'**
  String get assessmentsOpensLabel;

  /// Label for the closes-at date row on the assessment detail screen's deadline card.
  ///
  /// In en, this message translates to:
  /// **'Closes'**
  String get assessmentsClosesLabel;

  /// Label for the extended-close date row on the assessment detail screen's deadline card.
  ///
  /// In en, this message translates to:
  /// **'Extended close'**
  String get assessmentsExtendedCloseLabel;

  /// Duration label with no leftover seconds, on the assessment detail screen's time-limit stat tile.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min'**
  String assessmentsDurationMinutes(int minutes);

  /// Duration label with leftover seconds, on the assessment detail screen's time-limit stat tile.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min {seconds} sec'**
  String assessmentsDurationMinutesSeconds(int minutes, int seconds);

  /// Question count caption on a section tile on the assessment detail screen.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 question} other{{count} questions}}'**
  String assessmentsQuestionCount(int count);

  /// Accessibility label shown while the deadlines screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading deadlines'**
  String get assessmentsLoadingDeadlinesSemantic;

  /// Gradient header title on the deadlines screen, and the link label on the assessment list screen that opens it.
  ///
  /// In en, this message translates to:
  /// **'Deadlines'**
  String get assessmentsDeadlinesTitle;

  /// Empty-state title shown when the student has no assessment deadlines.
  ///
  /// In en, this message translates to:
  /// **'No deadlines'**
  String get assessmentsNoDeadlinesTitle;

  /// Empty-state subtitle shown when the student has no assessment deadlines.
  ///
  /// In en, this message translates to:
  /// **'Your assessment deadlines will appear here.'**
  String get assessmentsNoDeadlinesSubtitle;

  /// Section heading on the deadlines screen for currently-open deadlines.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get assessmentsSectionActiveLabel;

  /// Relative-day word used inside a deadline tile's subtitle when the deadline closes today.
  ///
  /// In en, this message translates to:
  /// **'today'**
  String get assessmentsRelativeToday;

  /// Relative-day word used inside a deadline tile's subtitle when the deadline closes tomorrow.
  ///
  /// In en, this message translates to:
  /// **'tomorrow'**
  String get assessmentsRelativeTomorrow;

  /// Relative-day phrase used inside a deadline tile's subtitle when the deadline closes further in the future.
  ///
  /// In en, this message translates to:
  /// **'{days, plural, one{in 1 day} other{in {days} days}}'**
  String assessmentsRelativeInDays(int days);

  /// Subtitle for an active deadline tile combining a relative-day phrase and a formatted date.
  ///
  /// In en, this message translates to:
  /// **'Due {relative} · {date}'**
  String assessmentsDueRelativeDate(String relative, String date);

  /// Subtitle for an active deadline tile when no relative-day phrase is available.
  ///
  /// In en, this message translates to:
  /// **'Due {date}'**
  String assessmentsDueDate(String date);

  /// Subtitle for an upcoming deadline tile.
  ///
  /// In en, this message translates to:
  /// **'Opens {date}'**
  String assessmentsOpensDate(String date);

  /// Subtitle for a late deadline tile that was granted an extension.
  ///
  /// In en, this message translates to:
  /// **'Extended to {date}'**
  String assessmentsExtendedToDate(String date);

  /// Subtitle for a late deadline tile with no extension.
  ///
  /// In en, this message translates to:
  /// **'Was due {date}'**
  String assessmentsWasDueDate(String date);

  /// Subtitle for a missed or closed deadline tile.
  ///
  /// In en, this message translates to:
  /// **'Closed {date}'**
  String assessmentsClosedDate(String date);

  /// Accessibility label for a deadline tile on the deadlines screen.
  ///
  /// In en, this message translates to:
  /// **'{title}, {subtitle}'**
  String assessmentsDeadlineTileSemantic(String title, String subtitle);

  /// Accessibility label shown while the attempt screen is resuming an in-progress attempt.
  ///
  /// In en, this message translates to:
  /// **'Resuming attempt'**
  String get assessmentsResumingAttemptSemantic;

  /// Label for the status row on the attempt screen's status card.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get assessmentsStatusLabel;

  /// Status badge text shown when an assessment attempt's raw status is 'in_progress'.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get assessmentsInProgressStatus;

  /// Label for the expiry row on the attempt screen's status card.
  ///
  /// In en, this message translates to:
  /// **'Expires'**
  String get assessmentsExpiresLabel;

  /// Accessibility label for the countdown pill on the attempt screen's header.
  ///
  /// In en, this message translates to:
  /// **'Time remaining: {time}'**
  String assessmentsTimeRemainingSemantic(String time);

  /// Empty-state subtitle shown in place of question content on the attempt screen, pending a backend capability.
  ///
  /// In en, this message translates to:
  /// **'Question rendering isn’t available yet for this attempt.'**
  String get assessmentsQuestionRenderingUnavailable;

  /// Accessibility label for the Submit button on the attempt screen.
  ///
  /// In en, this message translates to:
  /// **'Submit attempt'**
  String get assessmentsSubmitAttemptSemantic;

  /// Accessibility label shown while the assessment list screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading assessments'**
  String get assessmentsLoadingListSemantic;

  /// Gradient header title on the assessment list screen.
  ///
  /// In en, this message translates to:
  /// **'Assessments'**
  String get assessmentsListTitle;

  /// Empty-state title shown when there are no published assessments.
  ///
  /// In en, this message translates to:
  /// **'No assessments available'**
  String get assessmentsEmptyTitle;

  /// Empty-state subtitle shown when there are no published assessments.
  ///
  /// In en, this message translates to:
  /// **'Published quizzes and exams will appear here.'**
  String get assessmentsEmptySubtitle;

  /// Heading on the submit-attempt confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'Submit your answers?'**
  String get assessmentsSubmitConfirmTitle;

  /// Body copy on the submit-attempt confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'You cannot change answers after submitting.'**
  String get assessmentsSubmitConfirmBody;

  /// Finality warning banner on the submit-attempt confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'This action is final and cannot be undone.'**
  String get assessmentsFinalWarning;

  /// Accessibility label for the Submit button on the submit-attempt confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'Submit attempt for {title}'**
  String assessmentsSubmitAttemptForSemantic(String title);

  /// Accessibility label for an assessment list tile.
  ///
  /// In en, this message translates to:
  /// **'{typeLabel}: {title}'**
  String assessmentsListTileSemantic(String typeLabel, String title);

  /// Type label for an exam-type assessment, used in accessibility labels.
  ///
  /// In en, this message translates to:
  /// **'Exam'**
  String get assessmentsTypeExam;

  /// Type label for a quiz-type assessment, used in accessibility labels.
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get assessmentsTypeQuiz;

  /// Accessibility label for the standalone DeadlineStatusCard widget.
  ///
  /// In en, this message translates to:
  /// **'{title} — {status}'**
  String assessmentsDeadlineCardSemantic(String title, String status);

  /// Compact opens/closes date line on the standalone DeadlineStatusCard widget.
  ///
  /// In en, this message translates to:
  /// **'Opens: {opensAt}  •  Closes: {closesAt}'**
  String assessmentsOpensClosesLabel(String opensAt, String closesAt);

  /// Compact days-remaining countdown label on the standalone DeadlineCountdownText widget.
  ///
  /// In en, this message translates to:
  /// **'{days}d remaining'**
  String assessmentsDaysRemainingLabel(int days);

  /// Compact hours-remaining countdown label on the standalone DeadlineCountdownText widget.
  ///
  /// In en, this message translates to:
  /// **'{hours}h remaining'**
  String assessmentsHoursRemainingLabel(int hours);

  /// Compact minutes-remaining countdown label on the standalone DeadlineCountdownText widget.
  ///
  /// In en, this message translates to:
  /// **'{minutes}m remaining'**
  String assessmentsMinutesRemainingLabel(int minutes);

  /// Countdown label shown on the standalone DeadlineCountdownText widget when under a minute remains.
  ///
  /// In en, this message translates to:
  /// **'Less than a minute'**
  String get assessmentsLessThanMinuteLabel;

  /// Accessibility label shown while the placement result screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading your result'**
  String get placementLoadingResultSemantic;

  /// Heading shown while the backend is still scoring a placement attempt.
  ///
  /// In en, this message translates to:
  /// **'Scoring in progress…'**
  String get placementScoringInProgressTitle;

  /// Accessibility label for the pending-scoring state on the placement result screen.
  ///
  /// In en, this message translates to:
  /// **'Scoring in progress'**
  String get placementScoringInProgressSemantic;

  /// Subtitle shown while the backend is still scoring a placement attempt.
  ///
  /// In en, this message translates to:
  /// **'The backend is evaluating your answers.'**
  String get placementScoringInProgressSubtitle;

  /// Section header above the per-section breakdown on the placement result screen.
  ///
  /// In en, this message translates to:
  /// **'SECTION BREAKDOWN'**
  String get placementSectionBreakdownLabel;

  /// Label and accessibility label for the button that leaves the placement result screen for the main app.
  ///
  /// In en, this message translates to:
  /// **'Continue to AIM'**
  String get placementContinueButton;

  /// Display name for the backend-supplied 'beginner' placement level.
  ///
  /// In en, this message translates to:
  /// **'Beginner'**
  String get placementLevelBeginner;

  /// Display name for the backend-supplied 'elementary' placement level.
  ///
  /// In en, this message translates to:
  /// **'Elementary'**
  String get placementLevelElementary;

  /// Display name for the backend-supplied 'intermediate' placement level.
  ///
  /// In en, this message translates to:
  /// **'Intermediate'**
  String get placementLevelIntermediate;

  /// Display name for the backend-supplied 'upper_intermediate' placement level.
  ///
  /// In en, this message translates to:
  /// **'Upper Intermediate'**
  String get placementLevelUpperIntermediate;

  /// Display name for the backend-supplied 'advanced' placement level.
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get placementLevelAdvanced;

  /// Display name for the backend-supplied 'grammar' placement skill.
  ///
  /// In en, this message translates to:
  /// **'Grammar'**
  String get placementSkillGrammar;

  /// Display name for the backend-supplied 'vocabulary' placement skill.
  ///
  /// In en, this message translates to:
  /// **'Vocabulary'**
  String get placementSkillVocabulary;

  /// Display name for the backend-supplied 'reading' placement skill.
  ///
  /// In en, this message translates to:
  /// **'Reading'**
  String get placementSkillReading;

  /// Display name for the backend-supplied 'listening' placement skill.
  ///
  /// In en, this message translates to:
  /// **'Listening'**
  String get placementSkillListening;

  /// Accessibility label for the level hero card on the placement result screen.
  ///
  /// In en, this message translates to:
  /// **'Your level: {displayName}, total score {totalScore} out of 100'**
  String placementLevelSemantic(String displayName, int totalScore);

  /// Small eyebrow label above the CEFR code on the placement result screen's level hero card.
  ///
  /// In en, this message translates to:
  /// **'YOUR LEVEL'**
  String get placementYourLevelLabel;

  /// Summary caption on the placement result screen's level hero card.
  ///
  /// In en, this message translates to:
  /// **'{displayName} · Total score {totalScore} / 100'**
  String placementLevelSummary(String displayName, int totalScore);

  /// Accessibility label for a section breakdown row on the placement result screen.
  ///
  /// In en, this message translates to:
  /// **'{name}: {correct} of {total} correct'**
  String placementSectionCorrectSemantic(String name, int correct, int total);

  /// Correct-of-total fraction label on a section breakdown row on the placement result screen.
  ///
  /// In en, this message translates to:
  /// **'{correct} / {total}'**
  String placementFractionLabel(int correct, int total);

  /// Label for the sections info row on the placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'Sections'**
  String get placementSectionsLabel;

  /// Value for the sections info row on the placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 section} other{{count} sections}}'**
  String placementSectionsValue(int count);

  /// Label for the estimated-time info row on the placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'Estimated time'**
  String get placementEstimatedTimeLabel;

  /// Value for the estimated-time info row on the placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'~{minutes} min'**
  String placementEstimatedTimeValue(int minutes);

  /// Boundary note shown on the placement intro and start screens, reassuring that scoring happens server-side.
  ///
  /// In en, this message translates to:
  /// **'Your level is determined by the backend after completion. Results are never calculated on your device.'**
  String get placementBackendNote;

  /// Accessibility label for the Start button on the placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'Start placement test'**
  String get placementStartTestSemantic;

  /// Gradient header title on the placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'General English Placement'**
  String get placementIntroHeaderTitle;

  /// Gradient header subtitle on the placement intro screen.
  ///
  /// In en, this message translates to:
  /// **'A quick check to find your starting level.'**
  String get placementIntroHeaderSubtitle;

  /// Accessibility label shown while the placement start screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading placement test'**
  String get placementLoadingTestSemantic;

  /// Accessibility label shown while a placement attempt is being created, on the placement start screen.
  ///
  /// In en, this message translates to:
  /// **'Starting placement test'**
  String get placementStartingTestSemantic;

  /// Gradient header title on the placement start screen, and fallback title on the placement section screen.
  ///
  /// In en, this message translates to:
  /// **'Placement Test'**
  String get placementTestTitle;

  /// Heading on the placement start screen's gradient info card.
  ///
  /// In en, this message translates to:
  /// **'Find your level'**
  String get placementFindYourLevelTitle;

  /// Subtitle on the placement start screen's gradient info card.
  ///
  /// In en, this message translates to:
  /// **'A short adaptive test places you at the right level so every lesson fits you.'**
  String get placementFindYourLevelSubtitle;

  /// Label under the sections-count stat cell on the placement start screen's gradient info card.
  ///
  /// In en, this message translates to:
  /// **'sections'**
  String get placementSectionsStatLabel;

  /// Label under the estimated-minutes stat cell on the placement start screen's gradient info card.
  ///
  /// In en, this message translates to:
  /// **'minutes'**
  String get placementMinutesStatLabel;

  /// Label and accessibility label for the button that starts a placement attempt, on the placement start screen.
  ///
  /// In en, this message translates to:
  /// **'Start Placement Test'**
  String get placementStartTestButton;

  /// Label for the text button that dismisses the placement start screen without starting.
  ///
  /// In en, this message translates to:
  /// **'Not now'**
  String get placementNotNowButton;

  /// Compact question-counter shown in the placement question screen's header.
  ///
  /// In en, this message translates to:
  /// **'{index} of {total}'**
  String placementQuestionCounter(int index, int total);

  /// Accessibility label shown while the placement question screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading question'**
  String get placementLoadingQuestionSemantic;

  /// Error message shown on the placement question screen when submitting an answer fails with a specific reason.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit answer: {reason}'**
  String placementSubmitAnswerFailedWithReason(String reason);

  /// Generic fallback error message shown on the placement question screen when submitting an answer fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit answer. Please try again.'**
  String get placementSubmitAnswerFailedGeneric;

  /// Label for the button on the last question of a placement section.
  ///
  /// In en, this message translates to:
  /// **'Submit Final Answer'**
  String get placementSubmitFinalAnswerButton;

  /// Label for the button on a non-final question of a placement section.
  ///
  /// In en, this message translates to:
  /// **'Next question'**
  String get placementNextQuestionButton;

  /// Accessibility label for the button on the last question of a placement section.
  ///
  /// In en, this message translates to:
  /// **'Submit final answer'**
  String get placementSubmitFinalAnswerSemantic;

  /// Accessibility label for the button on a non-final question of a placement section.
  ///
  /// In en, this message translates to:
  /// **'Next question'**
  String get placementNextQuestionSemantic;

  /// Fallback message shown when a placement question has an unrecognised type.
  ///
  /// In en, this message translates to:
  /// **'Unknown question type: {type}'**
  String placementUnknownQuestionType(String type);

  /// Accessibility label for a multiple-choice placement answer option with backend-supplied text.
  ///
  /// In en, this message translates to:
  /// **'Option {letter}: {text}'**
  String placementOptionWithTextSemantic(String letter, String text);

  /// Accessibility label for a multiple-choice placement answer option with no backend-supplied text.
  ///
  /// In en, this message translates to:
  /// **'Option {letter}'**
  String placementOptionSemantic(String letter);

  /// Label and accessibility label for the True answer option on a true/false placement question.
  ///
  /// In en, this message translates to:
  /// **'True'**
  String get placementTrueOption;

  /// Label and accessibility label for the False answer option on a true/false placement question.
  ///
  /// In en, this message translates to:
  /// **'False'**
  String get placementFalseOption;

  /// Placeholder text for the fill-in-the-blank answer input on a placement question.
  ///
  /// In en, this message translates to:
  /// **'Type your answer here…'**
  String get placementAnswerPlaceholder;

  /// Accessibility label for the fill-in-the-blank answer input on a placement question.
  ///
  /// In en, this message translates to:
  /// **'Your answer'**
  String get placementYourAnswerSemantic;

  /// Gradient header title on the placement submit confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'Almost done'**
  String get placementAlmostDoneTitle;

  /// Accessibility label shown while a placement attempt is being submitted.
  ///
  /// In en, this message translates to:
  /// **'Submitting your answers'**
  String get placementSubmittingAnswersSemantic;

  /// Retry button label on the placement submit and section screens' error states.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get placementRetryLabel;

  /// Headline on the placement submit confirmation screen when the total section count is known.
  ///
  /// In en, this message translates to:
  /// **'All {count} sections complete'**
  String placementAllSectionsCompleteWithCount(int count);

  /// Headline on the placement submit confirmation screen when the total section count is not known.
  ///
  /// In en, this message translates to:
  /// **'All sections complete'**
  String get placementAllSectionsCompleteGeneric;

  /// Body copy on the placement submit confirmation screen.
  ///
  /// In en, this message translates to:
  /// **'Submit your placement test to see your level and a personalised plan.'**
  String get placementSubmitBody;

  /// Label and accessibility label for the button that submits a completed placement test.
  ///
  /// In en, this message translates to:
  /// **'Submit Placement Test'**
  String get placementSubmitTestButton;

  /// Gradient header title on the placement section screen.
  ///
  /// In en, this message translates to:
  /// **'Section {index} of {total}'**
  String placementSectionCounterTitle(int index, int total);

  /// Meta line on the placement section screen showing the category, question count, and pacing estimate.
  ///
  /// In en, this message translates to:
  /// **'{category} · {count, plural, one{1 question} other{{count} questions}} · about {minutes} minutes'**
  String placementSectionMetaLine(String category, int count, int minutes);

  /// Label and accessibility label for the button that starts the last placement section.
  ///
  /// In en, this message translates to:
  /// **'Begin Final Section'**
  String get placementBeginFinalSectionButton;

  /// Label and accessibility label for the button that starts a non-final placement section.
  ///
  /// In en, this message translates to:
  /// **'Begin Section'**
  String get placementBeginSectionButton;

  /// Accessibility label for the segmented section-progress indicator on the placement section screen.
  ///
  /// In en, this message translates to:
  /// **'Section {index} of {total}'**
  String placementSectionProgressSemantic(int index, int total);

  /// Short category label for a 'vocabulary' placement section.
  ///
  /// In en, this message translates to:
  /// **'Lexis'**
  String get placementCategoryLexis;

  /// Short category label for a 'grammar' placement section.
  ///
  /// In en, this message translates to:
  /// **'Structures'**
  String get placementCategoryStructures;

  /// Short category label for a 'reading' placement section.
  ///
  /// In en, this message translates to:
  /// **'Comprehension'**
  String get placementCategoryComprehension;

  /// Short category label for a 'listening' placement section.
  ///
  /// In en, this message translates to:
  /// **'Audio'**
  String get placementCategoryAudio;

  /// Fallback short category label for a placement section with an empty skill code.
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get placementCategoryGeneral;

  /// Accessibility label shown while the practice question screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading question'**
  String get questionAnswerLoadingQuestionSemantic;

  /// Gradient header title on the practice question screen.
  ///
  /// In en, this message translates to:
  /// **'Practice'**
  String get questionAnswerPracticeTitle;

  /// Pending-state message shown while AIM has not yet produced session feedback.
  ///
  /// In en, this message translates to:
  /// **'AIM is analysing your session…'**
  String get questionAnswerAnalysingSessionText;

  /// Accessibility label for the session feedback card.
  ///
  /// In en, this message translates to:
  /// **'Session feedback from AIM'**
  String get questionAnswerSessionFeedbackSemantic;

  /// Title on the session feedback card.
  ///
  /// In en, this message translates to:
  /// **'Session Summary'**
  String get questionAnswerSessionSummaryTitle;

  /// Label for the questions-attempted row on the session feedback card.
  ///
  /// In en, this message translates to:
  /// **'Questions attempted'**
  String get questionAnswerQuestionsAttemptedLabel;

  /// Label for the backend-scored correct-count row on the session feedback card.
  ///
  /// In en, this message translates to:
  /// **'Correct (backend score)'**
  String get questionAnswerCorrectScoreLabel;

  /// Label for the mastery-shift row on the session feedback card.
  ///
  /// In en, this message translates to:
  /// **'Mastery shift'**
  String get questionAnswerMasteryShiftLabel;

  /// Label above the skill badges on the session feedback card.
  ///
  /// In en, this message translates to:
  /// **'Skills covered'**
  String get questionAnswerSkillsCoveredLabel;

  /// Accessibility label for the attempt-acknowledgement card.
  ///
  /// In en, this message translates to:
  /// **'Answer submitted'**
  String get questionAnswerAnswerSubmittedSemantic;

  /// Title on the attempt-acknowledgement card.
  ///
  /// In en, this message translates to:
  /// **'Answer submitted'**
  String get questionAnswerAnswerSubmittedLabel;

  /// Subtitle on the attempt-acknowledgement card.
  ///
  /// In en, this message translates to:
  /// **'AIM is analysing your response.'**
  String get questionAnswerAnalysingResponseText;

  /// Label for the free-text answer input on a fill-in-the-blank practice question.
  ///
  /// In en, this message translates to:
  /// **'Your answer'**
  String get questionAnswerYourAnswerLabel;

  /// Helper text below the free-text answer input on a fill-in-the-blank practice question.
  ///
  /// In en, this message translates to:
  /// **'Type your response, then tap Continue to submit.'**
  String get questionAnswerAnswerHelperText;

  /// Placeholder text for the free-text answer input on a fill-in-the-blank practice question.
  ///
  /// In en, this message translates to:
  /// **'Type your answer here'**
  String get questionAnswerAnswerPlaceholder;

  /// Accessibility label for the free-text answer input on a fill-in-the-blank practice question.
  ///
  /// In en, this message translates to:
  /// **'Answer input field'**
  String get questionAnswerAnswerInputSemantic;

  /// App bar title on the subscription screen, and fallback plan name shown on the current-plan hero card when no plan data has loaded yet.
  ///
  /// In en, this message translates to:
  /// **'Subscription'**
  String get billingSubscriptionTitle;

  /// Accessibility label shown while the subscription screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading subscription data'**
  String get billingLoadingSubscriptionSemantic;

  /// Accessibility label shown while the pricing plans are loading, on both the Subscription and Pricing screens.
  ///
  /// In en, this message translates to:
  /// **'Loading plans'**
  String get billingLoadingPlansSemantic;

  /// Section header above the entitlement list on the subscription screen.
  ///
  /// In en, this message translates to:
  /// **'WHAT\'S INCLUDED'**
  String get billingWhatsIncludedTitle;

  /// Message shown when the subscriber's plan has no entitlements to display.
  ///
  /// In en, this message translates to:
  /// **'No entitlements yet.'**
  String get billingNoEntitlementsYet;

  /// Label for the 'Invoices' button on the subscription screen, and app bar title of the invoice history screen.
  ///
  /// In en, this message translates to:
  /// **'Invoices'**
  String get billingInvoicesLabel;

  /// Button label that opens the pricing screen to switch plans.
  ///
  /// In en, this message translates to:
  /// **'Change plan'**
  String get billingChangePlanButton;

  /// Button label that opens the cancel-subscription confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'Cancel subscription'**
  String get billingCancelSubscriptionButton;

  /// Title of the cancel-subscription confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'Cancel Subscription?'**
  String get billingCancelDialogTitle;

  /// Body text of the cancel-subscription confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'Your subscription will remain active until the end of the current billing period.'**
  String get billingCancelDialogBody;

  /// Button label that dismisses the cancel-subscription dialog without cancelling.
  ///
  /// In en, this message translates to:
  /// **'Keep Subscription'**
  String get billingKeepSubscriptionButton;

  /// Caption above the plan name on the current-plan hero card, and the disabled button label on a plan card that matches the subscriber's active plan.
  ///
  /// In en, this message translates to:
  /// **'Current plan'**
  String get billingCurrentPlanLabel;

  /// Subtitle on the current-plan hero card showing the renewal date, when the subscription is not set to cancel.
  ///
  /// In en, this message translates to:
  /// **'Renews {date}'**
  String billingRenewsOnLabel(String date);

  /// Subtitle on the current-plan hero card showing the cancellation date, when the subscription is set to cancel at period end.
  ///
  /// In en, this message translates to:
  /// **'Cancels {date}'**
  String billingCancelsOnLabel(String date);

  /// Empty-state title shown when there are no billing plans to display.
  ///
  /// In en, this message translates to:
  /// **'No plans available'**
  String get billingNoPlansTitle;

  /// Empty-state subtitle shown when there are no billing plans to display.
  ///
  /// In en, this message translates to:
  /// **'Check back later for available plans.'**
  String get billingNoPlansSubtitle;

  /// App bar title on the pricing screen.
  ///
  /// In en, this message translates to:
  /// **'Plans & Pricing'**
  String get billingPlansPricingTitle;

  /// Feature bullet shown on a plan card when a numeric feature value is negative, the backend's convention for 'unlimited'.
  ///
  /// In en, this message translates to:
  /// **'{feature} unlimited'**
  String billingUnlimitedFeatureLabel(String feature);

  /// Feature bullet shown on a plan card when a feature's value is a descriptive string rather than a boolean or count.
  ///
  /// In en, this message translates to:
  /// **'{feature}: {value}'**
  String billingFeatureValueLabel(String feature, String value);

  /// Badge shown on the recommended (premium) plan card.
  ///
  /// In en, this message translates to:
  /// **'Popular'**
  String get billingPopularBadge;

  /// Button label to start checkout for a plan.
  ///
  /// In en, this message translates to:
  /// **'Subscribe'**
  String get billingSubscribeButton;

  /// Accessibility label for a plan card's subscribe button.
  ///
  /// In en, this message translates to:
  /// **'Subscribe to {planName}'**
  String billingSubscribeToPlanSemantic(String planName);

  /// Status pill label for a paid invoice.
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get billingInvoiceStatusPaid;

  /// Status pill label for a pending invoice.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get billingInvoiceStatusPending;

  /// Status pill label for a failed invoice.
  ///
  /// In en, this message translates to:
  /// **'Failed'**
  String get billingInvoiceStatusFailed;

  /// Status pill label for a refunded invoice.
  ///
  /// In en, this message translates to:
  /// **'Refunded'**
  String get billingInvoiceStatusRefunded;

  /// Accessibility label shown while the invoice history screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading invoices'**
  String get billingLoadingInvoicesSemantic;

  /// Empty-state title shown when the student has no invoices yet.
  ///
  /// In en, this message translates to:
  /// **'No Invoices Yet'**
  String get billingNoInvoicesTitle;

  /// Empty-state subtitle shown when the student has no invoices yet.
  ///
  /// In en, this message translates to:
  /// **'Your invoices will appear here after your first payment.'**
  String get billingNoInvoicesSubtitle;

  /// App bar title on the invoice detail screen.
  ///
  /// In en, this message translates to:
  /// **'Invoice Detail'**
  String get billingInvoiceDetailTitle;

  /// Quantity subtitle on an invoice line-item row, shown only when quantity is greater than 1.
  ///
  /// In en, this message translates to:
  /// **'Qty: {quantity}'**
  String billingQuantityLabel(int quantity);

  /// Heading shown on the checkout status screen when payment completed successfully.
  ///
  /// In en, this message translates to:
  /// **'Payment successful!'**
  String get billingPaymentSuccessfulTitle;

  /// Body text shown on a successful checkout when the plan name is known.
  ///
  /// In en, this message translates to:
  /// **'Welcome to {planName} — all features are now unlocked.'**
  String billingWelcomeToPlanBody(String planName);

  /// Body text shown on a successful checkout when the plan name is not known.
  ///
  /// In en, this message translates to:
  /// **'Your subscription is now active.'**
  String get billingSubscriptionActiveBody;

  /// Heading shown on the checkout status screen when payment failed.
  ///
  /// In en, this message translates to:
  /// **'Payment failed'**
  String get billingPaymentFailedTitle;

  /// Body text shown on the checkout status screen when payment failed.
  ///
  /// In en, this message translates to:
  /// **'Your payment could not be processed. Please try again.'**
  String get billingPaymentFailedBody;

  /// Accessibility label for the retry-payment button on the checkout failure state.
  ///
  /// In en, this message translates to:
  /// **'Retry payment'**
  String get billingRetryPaymentSemantic;

  /// Button label that returns to the main app shell from the checkout failure state.
  ///
  /// In en, this message translates to:
  /// **'Go back'**
  String get billingGoBackButton;

  /// Heading shown on the checkout status screen when payment is still pending.
  ///
  /// In en, this message translates to:
  /// **'Payment pending'**
  String get billingPaymentPendingTitle;

  /// Body text shown on the checkout status screen when payment is still pending.
  ///
  /// In en, this message translates to:
  /// **'Your payment is being processed. We\'ll notify you when it\'s complete.'**
  String get billingPaymentPendingBody;

  /// Heading shown on the checkout status screen while the payment status is being fetched.
  ///
  /// In en, this message translates to:
  /// **'Checking payment status...'**
  String get billingCheckingStatusTitle;

  /// Body text shown on the checkout status screen while the payment status is being fetched.
  ///
  /// In en, this message translates to:
  /// **'Please wait while we verify your payment.'**
  String get billingVerifyingPaymentBody;

  /// Button label that returns to the main app shell after a successful checkout.
  ///
  /// In en, this message translates to:
  /// **'Go to Home'**
  String get billingGoToHomeButton;

  /// Accessibility label for the 'Go to Home' button.
  ///
  /// In en, this message translates to:
  /// **'Go to home'**
  String get billingGoToHomeSemantic;

  /// App bar title on the checkout start screen.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get billingCheckoutTitle;

  /// Label for the row showing the plan's billing interval (e.g. Monthly) on the checkout start screen.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get billingBillingIntervalLabel;

  /// Notice shown above the promo code field on the checkout start screen.
  ///
  /// In en, this message translates to:
  /// **'By continuing you agree to AIM\'s Terms of Service and authorise a recurring charge. Cancel anytime.'**
  String get billingTermsAgreementNotice;

  /// Label for the promotion code input field on the checkout start screen.
  ///
  /// In en, this message translates to:
  /// **'Promotion code (optional)'**
  String get billingPromoCodeLabel;

  /// Placeholder text for the promotion code input field.
  ///
  /// In en, this message translates to:
  /// **'Enter code'**
  String get billingPromoCodePlaceholder;

  /// Error shown when the external payment page fails to launch.
  ///
  /// In en, this message translates to:
  /// **'Could not open the payment page. Please try again.'**
  String get billingCouldNotOpenPaymentPageError;

  /// Generic fallback error shown when starting checkout fails for an unknown reason.
  ///
  /// In en, this message translates to:
  /// **'Failed to start checkout. Please try again.'**
  String get billingCheckoutFailedGeneric;

  /// Primary button label that starts checkout on the checkout start screen.
  ///
  /// In en, this message translates to:
  /// **'Proceed to Payment'**
  String get billingProceedToPaymentButton;

  /// Accessibility label for the 'Proceed to Payment' button.
  ///
  /// In en, this message translates to:
  /// **'Proceed to payment'**
  String get billingProceedToPaymentSemantic;

  /// Accessibility label shown while the profile screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading profile'**
  String get profileLoadingSemantic;

  /// Error message shown when the profile screen fails to load.
  ///
  /// In en, this message translates to:
  /// **'Could not load profile: {message}'**
  String profileLoadFailedError(String message);

  /// Fallback message shown when the profile screen has no data and is not loading or failed.
  ///
  /// In en, this message translates to:
  /// **'No profile loaded.'**
  String get profileNoProfileLoaded;

  /// Section header for the account-info card on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'ACCOUNT'**
  String get profileAccountSectionTitle;

  /// Section header for the student-profile-fields card on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'PROFILE'**
  String get profileProfileSectionTitle;

  /// Section header for the roles card on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'ROLES'**
  String get profileRolesSectionTitle;

  /// Subtitle under the roles section header on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'Displayed for reference only. Enforced by backend.'**
  String get profileRolesSectionSubtitle;

  /// Section header for the quick-links card on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'QUICK LINKS'**
  String get profileQuickLinksSectionTitle;

  /// Label for the account status row on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get profileStatusLabel;

  /// Label for the account user-type row on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get profileTypeLabel;

  /// Label for the display-name row on the profile screen, and for the display-name input field on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Display Name'**
  String get profileDisplayNameLabel;

  /// Label for the preferred-language row on the profile screen.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get profileLanguageLabel;

  /// Label for the timezone row on the profile screen, and for the timezone select field on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Timezone'**
  String get profileTimezoneLabel;

  /// Quick-link label that opens the subscription screen.
  ///
  /// In en, this message translates to:
  /// **'Subscription & Billing'**
  String get profileSubscriptionBillingLabel;

  /// Quick-link label that opens the invoice history screen.
  ///
  /// In en, this message translates to:
  /// **'Invoice History'**
  String get profileInvoiceHistoryLabel;

  /// Quick-link label that opens the analytics summary screen.
  ///
  /// In en, this message translates to:
  /// **'Analytics Summary'**
  String get profileAnalyticsSummaryLabel;

  /// Quick-link label that opens the developer API endpoint tester.
  ///
  /// In en, this message translates to:
  /// **'API Endpoint Tester (Dev)'**
  String get profileApiEndpointTesterLabel;

  /// Tooltip for the edit-profile icon button on the profile screen, and app bar title on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get profileEditProfileTitle;

  /// Label under the day-streak stat on the profile hero header.
  ///
  /// In en, this message translates to:
  /// **'day streak'**
  String get profileDayStreakLabel;

  /// Label under the achievements-earned stat on the profile hero header.
  ///
  /// In en, this message translates to:
  /// **'achievements'**
  String get profileAchievementsStatLabel;

  /// Validation error shown when the display name exceeds the maximum length.
  ///
  /// In en, this message translates to:
  /// **'Display name must be 80 characters or fewer.'**
  String get profileDisplayNameTooLongError;

  /// Snackbar message shown after successfully saving profile changes.
  ///
  /// In en, this message translates to:
  /// **'Profile updated.'**
  String get profileUpdatedSnackbar;

  /// Placeholder text for the display-name input field on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Your display name'**
  String get profileDisplayNameHint;

  /// Accessibility label for the display-name input field on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Display name field'**
  String get profileDisplayNameFieldSemantic;

  /// Label for the preferred-language select field on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Preferred Language'**
  String get profileEditPreferredLanguageLabel;

  /// Placeholder text for the preferred-language select field.
  ///
  /// In en, this message translates to:
  /// **'Select a language'**
  String get profileSelectLanguagePlaceholder;

  /// Accessibility label for the preferred-language select field on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Preferred language field'**
  String get profilePreferredLanguageFieldSemantic;

  /// Placeholder text for the timezone select field.
  ///
  /// In en, this message translates to:
  /// **'Select a timezone'**
  String get profileSelectTimezonePlaceholder;

  /// Accessibility label for the timezone select field on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Timezone field'**
  String get profileTimezoneFieldSemantic;

  /// Label and accessibility label for the primary save button on the edit-profile screen.
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get profileSaveChangesButton;

  /// Label for the English option in the preferred-language select field.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get profileLanguageEnglishOption;

  /// Label for the Arabic option in the preferred-language select field.
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get profileLanguageArabicOption;

  /// Screen title, entry-card title, and accessibility label for the Voice Teacher feature.
  ///
  /// In en, this message translates to:
  /// **'Voice Teacher'**
  String get voiceTeacherTitle;

  /// Subtitle on the Voice Teacher entry card.
  ///
  /// In en, this message translates to:
  /// **'Talk with your teacher using voice'**
  String get voiceTeacherEntrySubtitle;

  /// Accessibility label shown while the Voice Teacher session is starting.
  ///
  /// In en, this message translates to:
  /// **'Starting Voice Teacher session'**
  String get voiceTeacherStartingSessionSemantic;

  /// Status pill label shown on the Voice Teacher hero when idle.
  ///
  /// In en, this message translates to:
  /// **'Ready'**
  String get voiceTeacherStatusReady;

  /// Status pill label shown on the Voice Teacher hero while recording.
  ///
  /// In en, this message translates to:
  /// **'Recording'**
  String get voiceTeacherStatusRecording;

  /// Status pill label shown on the Voice Teacher hero while processing.
  ///
  /// In en, this message translates to:
  /// **'Processing'**
  String get voiceTeacherStatusProcessing;

  /// Heading shown on the Voice Teacher hero when idle.
  ///
  /// In en, this message translates to:
  /// **'Tap to speak'**
  String get voiceTeacherHeadingTapToSpeak;

  /// Heading shown on the Voice Teacher hero while recording.
  ///
  /// In en, this message translates to:
  /// **'Listening...'**
  String get voiceTeacherHeadingListening;

  /// Heading shown on the Voice Teacher hero while processing, and caption on the record button while processing.
  ///
  /// In en, this message translates to:
  /// **'Processing...'**
  String get voiceTeacherHeadingProcessing;

  /// Accessibility label for the Voice Teacher status pill.
  ///
  /// In en, this message translates to:
  /// **'Status: {label}'**
  String voiceTeacherStatusSemantic(String label);

  /// Static subtitle shown on the Voice Teacher pre-conversation hero.
  ///
  /// In en, this message translates to:
  /// **'Practise your pronunciation with the AI teacher'**
  String get voiceTeacherHeroSubtitle;

  /// Empty-state title shown when the Voice Teacher transcript has no messages yet.
  ///
  /// In en, this message translates to:
  /// **'Start talking with your Voice Teacher'**
  String get voiceTeacherTranscriptEmptyTitle;

  /// Empty-state subtitle shown when the Voice Teacher transcript has no messages yet.
  ///
  /// In en, this message translates to:
  /// **'Your transcript will appear here.'**
  String get voiceTeacherTranscriptEmptySubtitle;

  /// Tooltip for the play-audio button on a Voice Teacher transcript message.
  ///
  /// In en, this message translates to:
  /// **'Play audio'**
  String get voiceTeacherPlayAudioTooltip;

  /// Accessibility label for a teacher transcript message. text is the backend-returned message text.
  ///
  /// In en, this message translates to:
  /// **'Voice Teacher said: {text}'**
  String voiceTeacherTeacherSaidSemantic(String text);

  /// Accessibility label for a student transcript message. text is the backend-returned message text.
  ///
  /// In en, this message translates to:
  /// **'You said: {text}'**
  String voiceTeacherYouSaidSemantic(String text);

  /// Confirmation label shown after selecting 'Helpful' feedback on a Voice Teacher reply.
  ///
  /// In en, this message translates to:
  /// **'Thanks!'**
  String get voiceTeacherFeedbackThanks;

  /// Confirmation label shown after submitting 'Not helpful' feedback on a Voice Teacher reply.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get voiceTeacherFeedbackSubmitted;

  /// Button label for marking a Voice Teacher reply as helpful.
  ///
  /// In en, this message translates to:
  /// **'Helpful'**
  String get voiceTeacherFeedbackHelpful;

  /// Button label for marking a Voice Teacher reply as not helpful.
  ///
  /// In en, this message translates to:
  /// **'Not helpful'**
  String get voiceTeacherFeedbackNotHelpful;

  /// Placeholder text for the optional comment field shown after marking a Voice Teacher reply as not helpful.
  ///
  /// In en, this message translates to:
  /// **'Tell us more (optional)'**
  String get voiceTeacherFeedbackCommentHint;

  /// Label shown next to the animated indicator while the Voice Teacher is speaking.
  ///
  /// In en, this message translates to:
  /// **'Teacher speaking...'**
  String get voiceTeacherSpeakingLabel;

  /// Label shown next to the animated indicator while the Voice Teacher is thinking.
  ///
  /// In en, this message translates to:
  /// **'Teacher thinking...'**
  String get voiceTeacherThinkingLabel;

  /// Tooltip for the replay-audio button on the audio playback controls.
  ///
  /// In en, this message translates to:
  /// **'Replay'**
  String get voiceTeacherReplayTooltip;

  /// Tooltip for the play-audio button on the audio playback controls.
  ///
  /// In en, this message translates to:
  /// **'Play'**
  String get voiceTeacherPlayTooltip;

  /// Tooltip for the pause-audio button on the audio playback controls.
  ///
  /// In en, this message translates to:
  /// **'Pause'**
  String get voiceTeacherPauseTooltip;

  /// Tooltip for the resume-audio button on the audio playback controls.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get voiceTeacherResumeTooltip;

  /// Tooltip for the retry-audio button on the audio playback controls.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get voiceTeacherRetryTooltip;

  /// Message shown on the audio playback controls when playback fails.
  ///
  /// In en, this message translates to:
  /// **'Playback failed'**
  String get voiceTeacherPlaybackFailedLabel;

  /// Title shown on the Voice Teacher error state for a network error.
  ///
  /// In en, this message translates to:
  /// **'Connection Error'**
  String get voiceTeacherErrorTitleNetwork;

  /// Title shown on the Voice Teacher error state for a microphone error.
  ///
  /// In en, this message translates to:
  /// **'Microphone Error'**
  String get voiceTeacherErrorTitleMicrophone;

  /// Title shown on the Voice Teacher error state for a server error.
  ///
  /// In en, this message translates to:
  /// **'Server Error'**
  String get voiceTeacherErrorTitleServer;

  /// Title shown on the Voice Teacher error state for an unknown error.
  ///
  /// In en, this message translates to:
  /// **'Something Went Wrong'**
  String get voiceTeacherErrorTitleUnknown;

  /// Message shown on the Voice Teacher error state for a network error.
  ///
  /// In en, this message translates to:
  /// **'Check your internet connection and try again'**
  String get voiceTeacherErrorMessageNetwork;

  /// Message shown on the Voice Teacher error state for a microphone error.
  ///
  /// In en, this message translates to:
  /// **'Could not access the microphone. Check permissions'**
  String get voiceTeacherErrorMessageMicrophone;

  /// Message shown on the Voice Teacher error state for a server error.
  ///
  /// In en, this message translates to:
  /// **'Server is currently unavailable. Try again later'**
  String get voiceTeacherErrorMessageServer;

  /// Message shown on the Voice Teacher error state for an unknown error.
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred. Please try again'**
  String get voiceTeacherErrorMessageUnknown;

  /// Label above the fallback text response shown on the Voice Teacher error state.
  ///
  /// In en, this message translates to:
  /// **'Teacher response (text):'**
  String get voiceTeacherTeacherResponseTextLabel;

  /// Title shown on the microphone-permission gate screen.
  ///
  /// In en, this message translates to:
  /// **'Voice Teacher needs microphone access'**
  String get voiceTeacherMicPermissionTitle;

  /// Body text shown on the microphone-permission gate screen.
  ///
  /// In en, this message translates to:
  /// **'Please allow microphone access to talk with the teacher'**
  String get voiceTeacherMicPermissionBody;

  /// Button label shown on the microphone-permission gate screen when permission is permanently denied.
  ///
  /// In en, this message translates to:
  /// **'Open Settings'**
  String get voiceTeacherOpenSettingsButton;

  /// Button label shown on the microphone-permission gate screen to request permission.
  ///
  /// In en, this message translates to:
  /// **'Allow Microphone'**
  String get voiceTeacherAllowMicrophoneButton;

  /// Label shown while a Voice Teacher turn's audio is being transcribed.
  ///
  /// In en, this message translates to:
  /// **'Transcribing...'**
  String get voiceTeacherTranscribingLabel;

  /// Label above the student's transcription preview.
  ///
  /// In en, this message translates to:
  /// **'What you said'**
  String get voiceTeacherWhatYouSaidLabel;

  /// Label above the teacher's transcription preview.
  ///
  /// In en, this message translates to:
  /// **'Teacher response'**
  String get voiceTeacherResponseLabel;

  /// Button label to stop an in-progress Voice Teacher recording.
  ///
  /// In en, this message translates to:
  /// **'Stop'**
  String get voiceTeacherStopLabel;

  /// Label shown once a Voice Teacher recording has stopped.
  ///
  /// In en, this message translates to:
  /// **'Recorded'**
  String get voiceTeacherRecordedLabel;

  /// Button label to discard a stopped Voice Teacher recording.
  ///
  /// In en, this message translates to:
  /// **'Discard'**
  String get voiceTeacherDiscardLabel;

  /// Button label to send a stopped Voice Teacher recording.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get voiceTeacherSendLabel;

  /// Label shown above a Voice Teacher text-fallback reply.
  ///
  /// In en, this message translates to:
  /// **'Text response from teacher'**
  String get voiceTeacherTextResponseLabel;

  /// Message shown when a Voice Teacher reply's audio is unavailable and a text fallback is shown instead.
  ///
  /// In en, this message translates to:
  /// **'Audio unavailable — here\'s the text response'**
  String get voiceTeacherAudioUnavailableLabel;

  /// Button label to retry loading a Voice Teacher reply's audio.
  ///
  /// In en, this message translates to:
  /// **'Retry audio'**
  String get voiceTeacherRetryAudioLabel;

  /// Feature name shown as the chat header title and entry-card title.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher'**
  String get aiTeacherName;

  /// Subtitle shown under the AI Teacher name on the chat screen's header.
  ///
  /// In en, this message translates to:
  /// **'Always here to help'**
  String get aiTeacherHeaderSubtitle;

  /// Subtitle on the AI Teacher entry card.
  ///
  /// In en, this message translates to:
  /// **'Ask questions and get guidance on this lesson.'**
  String get aiTeacherEntrySubtitle;

  /// Accessibility label for the AI Teacher entry card.
  ///
  /// In en, this message translates to:
  /// **'Open AI Teacher'**
  String get aiTeacherOpenSemantic;

  /// Accessibility label shown while the AI Teacher chat screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading AI Teacher chat'**
  String get aiTeacherLoadingChatSemantic;

  /// Accessibility label for the button that opens the AI Teacher conversation history screen.
  ///
  /// In en, this message translates to:
  /// **'Conversation history'**
  String get aiTeacherHistorySemantic;

  /// Empty-state title shown when an AI Teacher chat has no messages yet.
  ///
  /// In en, this message translates to:
  /// **'Ask AI Teacher anything'**
  String get aiTeacherAskAnythingTitle;

  /// Empty-state subtitle shown when an AI Teacher chat has no messages yet.
  ///
  /// In en, this message translates to:
  /// **'Start the conversation by sending a message.'**
  String get aiTeacherAskAnythingSubtitle;

  /// Title in the AI Teacher conversation history screen's gradient header.
  ///
  /// In en, this message translates to:
  /// **'Conversations'**
  String get aiTeacherConversationsTitle;

  /// Accessibility label shown while the AI Teacher conversation history screen's data is loading.
  ///
  /// In en, this message translates to:
  /// **'Loading AI Teacher conversations'**
  String get aiTeacherLoadingConversationsSemantic;

  /// Empty-state title shown when the student has no AI Teacher conversations yet.
  ///
  /// In en, this message translates to:
  /// **'No conversations yet'**
  String get aiTeacherNoConversationsTitle;

  /// Empty-state subtitle shown when the student has no AI Teacher conversations yet.
  ///
  /// In en, this message translates to:
  /// **'Start chatting with AI Teacher to see your history here.'**
  String get aiTeacherNoConversationsSubtitle;

  /// Status pill label for an active AI Teacher conversation.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get aiTeacherSessionActiveLabel;

  /// Status pill label for an ended AI Teacher conversation.
  ///
  /// In en, this message translates to:
  /// **'Ended'**
  String get aiTeacherSessionEndedLabel;

  /// Accessibility label for a conversation row on the AI Teacher conversation history screen. status is the localized Active/Ended label.
  ///
  /// In en, this message translates to:
  /// **'{title}, {status}'**
  String aiTeacherSessionSemantic(String title, String status);

  /// App bar title on the AI Teacher settings screen.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher settings'**
  String get aiTeacherSettingsTitle;

  /// Accessibility label for the card wrapping the prefer-text-replies toggle.
  ///
  /// In en, this message translates to:
  /// **'Prefer text replies setting'**
  String get aiTeacherPreferTextSettingSemantic;

  /// Label and accessibility label for the prefer-text-replies toggle on the AI Teacher settings screen.
  ///
  /// In en, this message translates to:
  /// **'Prefer text replies over voice'**
  String get aiTeacherPreferTextLabel;

  /// Accessibility label for the card wrapping the reduced-motion toggle.
  ///
  /// In en, this message translates to:
  /// **'Reduced motion setting'**
  String get aiTeacherReducedMotionSettingSemantic;

  /// Label and accessibility label for the reduced-motion toggle on the AI Teacher settings screen.
  ///
  /// In en, this message translates to:
  /// **'Reduce animations in AI Teacher and Voice Tutor'**
  String get aiTeacherReducedMotionLabel;

  /// Accessibility label for the info banner on the AI Teacher settings screen.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher settings info banner'**
  String get aiTeacherSettingsInfoBannerSemantic;

  /// Title of the info banner on the AI Teacher settings screen.
  ///
  /// In en, this message translates to:
  /// **'About these settings'**
  String get aiTeacherSettingsInfoTitle;

  /// Body text of the info banner on the AI Teacher settings screen.
  ///
  /// In en, this message translates to:
  /// **'These preferences only change how replies are shown on this device. They never change how the AI Teacher is taught, filtered, or graded, and never affect your learning progress or backend-generated suggestions — those stay fully backend-controlled.'**
  String get aiTeacherSettingsInfoBody;

  /// Message shown on the AI Teacher chat error state.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher is temporarily unavailable. Your progress is safe, and you can try again.'**
  String get aiTeacherChatErrorMessage;

  /// Retry button label on the AI Teacher chat error state.
  ///
  /// In en, this message translates to:
  /// **'Retry chat'**
  String get aiTeacherRetryChatLabel;

  /// Accessibility label for the AI Teacher chat error state.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher chat error'**
  String get aiTeacherChatErrorSemantic;

  /// Accessibility label for the AI Teacher chat message input field.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher message input'**
  String get aiTeacherMessageInputSemantic;

  /// Placeholder text for the AI Teacher chat message input field.
  ///
  /// In en, this message translates to:
  /// **'Ask me anything...'**
  String get aiTeacherInputHint;

  /// Accessibility label for the disabled voice-input (mic) button on the AI Teacher chat input bar.
  ///
  /// In en, this message translates to:
  /// **'Voice input (coming soon)'**
  String get aiTeacherVoiceInputComingSoonSemantic;

  /// Accessibility label for the send-message button on the AI Teacher chat input bar.
  ///
  /// In en, this message translates to:
  /// **'Send message'**
  String get aiTeacherSendMessageSemantic;

  /// Accessibility label for a student message bubble. text is the backend-returned message text.
  ///
  /// In en, this message translates to:
  /// **'Your message: {text}'**
  String aiTeacherYourMessageSemantic(String text);

  /// Accessibility label for an AI Teacher message bubble. text is the backend-returned message text.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher: {text}'**
  String aiTeacherReplySemantic(String text);

  /// Accessibility label for the in-progress streaming AI Teacher reply bubble. text is the partial, safety-filtered reply text.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher is replying: {text}'**
  String aiTeacherRepliedSemantic(String text);

  /// Label above the lesson title on the AI Teacher lesson context header.
  ///
  /// In en, this message translates to:
  /// **'Current lesson'**
  String get aiTeacherCurrentLessonLabel;

  /// Accessibility label for the AI Teacher lesson context header. lessonTitle is a caller-provided, backend-approved label.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher lesson context: {lessonTitle}'**
  String aiTeacherLessonContextSemantic(String lessonTitle);

  /// Prompt shown under an AI Teacher reply, above the helpful/not-helpful buttons.
  ///
  /// In en, this message translates to:
  /// **'Was this helpful?'**
  String get aiTeacherWasHelpfulLabel;

  /// Accessibility label for the helpful-feedback button on an AI Teacher reply.
  ///
  /// In en, this message translates to:
  /// **'Mark AI Teacher reply as helpful'**
  String get aiTeacherMarkHelpfulSemantic;

  /// Accessibility label for the not-helpful-feedback button on an AI Teacher reply.
  ///
  /// In en, this message translates to:
  /// **'Mark AI Teacher reply as not helpful'**
  String get aiTeacherMarkNotHelpfulSemantic;

  /// Title of the safety-limited banner shown on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher is limited right now'**
  String get aiTeacherSafetyLimitedTitle;

  /// Accessibility label for the safety-limited banner on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher safety limited banner'**
  String get aiTeacherSafetyLimitedBannerSemantic;

  /// Body text of the safety-limited banner on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'Some responses in this conversation were held back to keep things safe. You can keep chatting, or start a new conversation.'**
  String get aiTeacherSafetyLimitedBody;

  /// Accessibility label for the AI Teacher typing indicator.
  ///
  /// In en, this message translates to:
  /// **'AI Teacher is typing'**
  String get aiTeacherTypingSemantic;

  /// Accessibility label for a suggested-prompt chip on the AI Teacher chat screen. prompt is one of the fixed, app-defined conversation starters.
  ///
  /// In en, this message translates to:
  /// **'Suggested prompt: {prompt}'**
  String aiTeacherSuggestedPromptSemantic(String prompt);

  /// Fixed, app-defined suggested-prompt chip label on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'Explain grammar'**
  String get aiTeacherPromptExplainGrammar;

  /// Fixed, app-defined suggested-prompt chip label on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'Quick quiz'**
  String get aiTeacherPromptQuickQuiz;

  /// Fixed, app-defined suggested-prompt chip label on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'Check my writing'**
  String get aiTeacherPromptCheckWriting;

  /// Fixed, app-defined suggested-prompt chip label on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'Give an example'**
  String get aiTeacherPromptGiveExample;

  /// Fixed, app-defined suggested-prompt chip label on the AI Teacher chat screen.
  ///
  /// In en, this message translates to:
  /// **'Practice speaking'**
  String get aiTeacherPromptPracticeSpeaking;

  /// Label for the category dropdown on the feedback and create-ticket forms.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get supportCategoryLabel;

  /// Category dropdown option shared by the feedback and create-ticket forms.
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get supportCategoryGeneral;

  /// Category dropdown option on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'Feature request'**
  String get supportCategoryFeatureRequest;

  /// Category dropdown option on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'Bug report'**
  String get supportCategoryBugReport;

  /// Category dropdown option shared by the feedback and create-ticket forms.
  ///
  /// In en, this message translates to:
  /// **'Content'**
  String get supportCategoryContent;

  /// Category dropdown option on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'User experience'**
  String get supportCategoryUserExperience;

  /// Label above the star rating control on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'How would you rate AIM?'**
  String get supportRateAimQuestion;

  /// Accessibility label for a single star in the feedback form's star rating control.
  ///
  /// In en, this message translates to:
  /// **'Rate {value} out of 5'**
  String supportRateStarsSemantic(int value);

  /// Label for the title input field on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get supportTitleLabel;

  /// Placeholder text for the title input field on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'A short summary'**
  String get supportTitlePlaceholder;

  /// Label for the feedback body textarea on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'Your feedback'**
  String get supportFeedbackLabel;

  /// Placeholder text for the feedback body textarea on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'Tell us what you think...'**
  String get supportFeedbackPlaceholder;

  /// Accessibility label for the submit button on the feedback form.
  ///
  /// In en, this message translates to:
  /// **'Submit feedback'**
  String get supportSubmitFeedbackSemantic;

  /// Error message shown when submitting feedback since the backend endpoint is not yet live.
  ///
  /// In en, this message translates to:
  /// **'Feedback submission is not available yet. Please try again later.'**
  String get supportFeedbackSubmitUnavailable;

  /// Validation error shown when the feedback form's title field is empty.
  ///
  /// In en, this message translates to:
  /// **'Title is required'**
  String get supportTitleRequired;

  /// Validation error shown when the feedback form's body field is empty.
  ///
  /// In en, this message translates to:
  /// **'Feedback details are required'**
  String get supportFeedbackDetailsRequired;

  /// App bar title on the feedback page.
  ///
  /// In en, this message translates to:
  /// **'Send feedback'**
  String get supportSendFeedbackTitle;

  /// App bar title on the student help center page.
  ///
  /// In en, this message translates to:
  /// **'Help Center'**
  String get supportHelpCenterTitle;

  /// FAQ category section header on the student help center page.
  ///
  /// In en, this message translates to:
  /// **'Lessons & Content'**
  String get supportCategoryLessonsContent;

  /// FAQ category section header on the student help center page.
  ///
  /// In en, this message translates to:
  /// **'Assessments & Grades'**
  String get supportCategoryAssessmentsGrades;

  /// FAQ category section header on the student help center page.
  ///
  /// In en, this message translates to:
  /// **'Account & Profile'**
  String get supportCategoryAccountProfile;

  /// FAQ category section header on the student help center page.
  ///
  /// In en, this message translates to:
  /// **'Billing & Subscription'**
  String get supportCategoryBillingSubscription;

  /// FAQ category section header on the student help center page.
  ///
  /// In en, this message translates to:
  /// **'Technical Issues'**
  String get supportCategoryTechnicalIssues;

  /// FAQ category section header shared by the student and parent help center pages.
  ///
  /// In en, this message translates to:
  /// **'General Help'**
  String get supportCategoryGeneralHelp;

  /// Label for the button that opens the create-ticket form, shown on the help center pages.
  ///
  /// In en, this message translates to:
  /// **'Create Ticket'**
  String get supportCreateTicketButton;

  /// Accessibility label for the create-ticket action, shared by the help center pages and the ticket list pages' floating action button.
  ///
  /// In en, this message translates to:
  /// **'Create a support ticket'**
  String get supportCreateTicketSemantic;

  /// App bar title on the parent help center page.
  ///
  /// In en, this message translates to:
  /// **'Parent Help'**
  String get supportParentHelpTitle;

  /// FAQ category section header on the parent help center page.
  ///
  /// In en, this message translates to:
  /// **'Student Progress'**
  String get supportCategoryStudentProgress;

  /// FAQ category section header on the parent help center page.
  ///
  /// In en, this message translates to:
  /// **'Courses & Content'**
  String get supportCategoryCoursesContent;

  /// FAQ category section header on the parent help center page.
  ///
  /// In en, this message translates to:
  /// **'Billing & Payments'**
  String get supportCategoryBillingPayments;

  /// FAQ category section header on the parent help center page.
  ///
  /// In en, this message translates to:
  /// **'Account Management'**
  String get supportCategoryAccountManagement;

  /// FAQ category section header on the parent help center page.
  ///
  /// In en, this message translates to:
  /// **'Privacy & Safety'**
  String get supportCategoryPrivacySafety;

  /// App bar title on the release note detail page.
  ///
  /// In en, this message translates to:
  /// **'Release note'**
  String get supportReleaseNoteTitle;

  /// Empty-state title shown on the release note detail page since the backend endpoint is not yet live.
  ///
  /// In en, this message translates to:
  /// **'Release note is not available yet'**
  String get supportReleaseNoteUnavailableTitle;

  /// Empty-state subtitle shown on the release note detail page since the backend endpoint is not yet live.
  ///
  /// In en, this message translates to:
  /// **'This release note will appear here once release notes are live.'**
  String get supportReleaseNoteUnavailableSubtitle;

  /// Caption showing a release note's publish date. date is already localized via intl.
  ///
  /// In en, this message translates to:
  /// **'Released {date}'**
  String supportReleasedOnLabel(String date);

  /// App bar title on the system status page.
  ///
  /// In en, this message translates to:
  /// **'System Status'**
  String get supportSystemStatusTitle;

  /// Empty-state title shown on the system status page since the backend endpoint is not yet live.
  ///
  /// In en, this message translates to:
  /// **'Status is not available yet'**
  String get supportStatusUnavailableTitle;

  /// Empty-state subtitle shown on the system status page since the backend endpoint is not yet live.
  ///
  /// In en, this message translates to:
  /// **'Live system status will appear here once status tracking is live.'**
  String get supportStatusUnavailableSubtitle;

  /// Title used for the release-notes navigation card on the system status page and the app bar on the release notes list page.
  ///
  /// In en, this message translates to:
  /// **'Release notes'**
  String get supportReleaseNotesTitle;

  /// Subtitle under the release-notes navigation card on the system status page.
  ///
  /// In en, this message translates to:
  /// **'What\'s new in AIM'**
  String get supportWhatsNewSubtitle;

  /// Accessibility label for the release-notes navigation card on the system status page.
  ///
  /// In en, this message translates to:
  /// **'Release notes, what\'s new in AIM'**
  String get supportReleaseNotesCardSemantic;

  /// Status label for a system component that is fully operational.
  ///
  /// In en, this message translates to:
  /// **'Operational'**
  String get supportStatusOperational;

  /// Status label for a system component with degraded performance.
  ///
  /// In en, this message translates to:
  /// **'Degraded'**
  String get supportStatusDegraded;

  /// Status label for a system component experiencing a partial outage.
  ///
  /// In en, this message translates to:
  /// **'Partial Outage'**
  String get supportStatusPartialOutage;

  /// Status label for a system component experiencing a major outage.
  ///
  /// In en, this message translates to:
  /// **'Major Outage'**
  String get supportStatusMajorOutage;

  /// Status label for a system component currently under maintenance.
  ///
  /// In en, this message translates to:
  /// **'Maintenance'**
  String get supportStatusMaintenanceLabel;

  /// Status label shared by an active maintenance window and an in-progress support ticket.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get supportStatusInProgressLabel;

  /// Status label for an upcoming, not-yet-started maintenance window.
  ///
  /// In en, this message translates to:
  /// **'Scheduled'**
  String get supportStatusScheduledLabel;

  /// Status label for an open support ticket.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get supportStatusOpenLabel;

  /// Status label for a resolved support ticket.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get supportStatusResolvedLabel;

  /// Status label for a closed support ticket.
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get supportStatusClosedLabel;

  /// Title and accessibility label for the all-operational banner on the system status page.
  ///
  /// In en, this message translates to:
  /// **'All Systems Operational'**
  String get supportAllSystemsOperationalTitle;

  /// App bar title on the student ticket list page.
  ///
  /// In en, this message translates to:
  /// **'My tickets'**
  String get supportMyTicketsTitle;

  /// Accessibility label for a ticket list row. subject and status are backend-supplied values.
  ///
  /// In en, this message translates to:
  /// **'{subject}, {status}'**
  String supportTicketTileSemantic(String subject, String status);

  /// Empty-state title shown when the student has no support tickets.
  ///
  /// In en, this message translates to:
  /// **'No Tickets Yet'**
  String get supportNoTicketsTitle;

  /// Empty-state subtitle shown when the student has no support tickets.
  ///
  /// In en, this message translates to:
  /// **'Create a ticket to get help from our support team.'**
  String get supportNoTicketsSubtitle;

  /// App bar title on the parent ticket list page.
  ///
  /// In en, this message translates to:
  /// **'Parent tickets'**
  String get supportParentTicketsTitle;

  /// Empty-state title shown when the parent has no support tickets.
  ///
  /// In en, this message translates to:
  /// **'No Support Tickets'**
  String get supportNoParentTicketsTitle;

  /// Empty-state subtitle shown when the parent has no support tickets.
  ///
  /// In en, this message translates to:
  /// **'Create a ticket if you need help with your account.'**
  String get supportNoParentTicketsSubtitle;

  /// App bar title on the ticket detail page.
  ///
  /// In en, this message translates to:
  /// **'Ticket'**
  String get supportTicketDetailTitle;

  /// Empty-state title shown on the ticket detail page since the backend endpoint is not yet live.
  ///
  /// In en, this message translates to:
  /// **'Ticket details are not available yet'**
  String get supportTicketDetailUnavailableTitle;

  /// Empty-state subtitle shown on the ticket detail page since the backend endpoint is not yet live. ticketId is the real ticket id.
  ///
  /// In en, this message translates to:
  /// **'Ticket #{ticketId} will appear here once support ticket tracking is live.'**
  String supportTicketDetailUnavailableSubtitle(String ticketId);

  /// Empty-state title shown when there are no published release notes.
  ///
  /// In en, this message translates to:
  /// **'No Release Notes'**
  String get supportNoReleaseNotesTitle;

  /// Empty-state subtitle shown when there are no published release notes.
  ///
  /// In en, this message translates to:
  /// **'Release notes will appear here when published.'**
  String get supportNoReleaseNotesSubtitle;

  /// Accessibility label for a release note list row. version, title, and date are backend-supplied values (date already localized via intl).
  ///
  /// In en, this message translates to:
  /// **'{version}, {title}, {date}'**
  String supportReleaseNoteTileSemantic(
      String version, String title, String date);

  /// Label for the severity dropdown on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Severity'**
  String get supportSeverityLabel;

  /// Severity dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get supportSeverityLow;

  /// Severity dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get supportSeverityMedium;

  /// Severity dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get supportSeverityHigh;

  /// Severity dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Critical'**
  String get supportSeverityCritical;

  /// Category dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Technical Issue'**
  String get supportCategoryTechnicalIssue;

  /// Category dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get supportCategoryBilling;

  /// Category dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get supportCategoryAccount;

  /// Category dropdown option on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Feedback'**
  String get supportCategoryFeedback;

  /// Label for the subject input field on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Subject'**
  String get supportSubjectLabel;

  /// Placeholder text for the subject input field on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Briefly describe the issue'**
  String get supportSubjectPlaceholder;

  /// Label for the description textarea on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get supportDescriptionLabel;

  /// Placeholder text for the description textarea on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Tell us what happened, step by step...'**
  String get supportDescriptionPlaceholder;

  /// Label for the submit button on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Submit Ticket'**
  String get supportSubmitTicketButton;

  /// Accessibility label for the submit button on the create-ticket form.
  ///
  /// In en, this message translates to:
  /// **'Submit ticket'**
  String get supportSubmitTicketSemantic;

  /// Validation error shown when the create-ticket form's subject field is empty.
  ///
  /// In en, this message translates to:
  /// **'Subject is required'**
  String get supportSubjectRequired;

  /// Validation error shown when the create-ticket form's description field is empty.
  ///
  /// In en, this message translates to:
  /// **'Description is required'**
  String get supportDescriptionRequired;

  /// Error message shown when submitting a ticket since the backend endpoint is not yet live.
  ///
  /// In en, this message translates to:
  /// **'Ticket submission is not available yet. Please try again later.'**
  String get supportTicketSubmitUnavailable;

  /// App bar title on the create-ticket page.
  ///
  /// In en, this message translates to:
  /// **'New ticket'**
  String get supportNewTicketTitle;

  /// Tooltip for the close button on the internal design-system preview screen.
  ///
  /// In en, this message translates to:
  /// **'Close preview'**
  String get dsPreviewCloseTooltip;

  /// App bar title of the internal design-system preview screen (developer/QA tool).
  ///
  /// In en, this message translates to:
  /// **'⚙ Design System Preview'**
  String get dsPreviewTitle;

  /// Tab label in the design-system preview for the foundations (spacing/radius/shadows) tab.
  ///
  /// In en, this message translates to:
  /// **'Foundations'**
  String get dsPreviewTabFoundations;

  /// Tab label and section title in the design-system preview for the buttons demo.
  ///
  /// In en, this message translates to:
  /// **'Buttons'**
  String get dsPreviewTabButtons;

  /// Tab label in the design-system preview for the form controls demo.
  ///
  /// In en, this message translates to:
  /// **'Forms'**
  String get dsPreviewTabForms;

  /// Tab label in the design-system preview for the feedback components demo.
  ///
  /// In en, this message translates to:
  /// **'Feedback'**
  String get dsPreviewTabFeedback;

  /// Tab label in the design-system preview for the navigation components demo.
  ///
  /// In en, this message translates to:
  /// **'Navigation'**
  String get dsPreviewTabNavigation;

  /// Tab label in the design-system preview for the learning widgets demo.
  ///
  /// In en, this message translates to:
  /// **'Learning'**
  String get dsPreviewTabLearning;

  /// Section title in the design-system preview showing gradient button variants.
  ///
  /// In en, this message translates to:
  /// **'Gradient Button'**
  String get dsPreviewSectionGradientButton;

  /// Generic 'Primary' variant/tone label reused across several demos in the design-system preview (buttons, colors, circular progress).
  ///
  /// In en, this message translates to:
  /// **'Primary'**
  String get dsPreviewWordPrimary;

  /// Generic 'Secondary' variant/tone label reused across several demos in the design-system preview (buttons, colors).
  ///
  /// In en, this message translates to:
  /// **'Secondary'**
  String get dsPreviewWordSecondary;

  /// Generic 'Outline' variant label reused across button and badge demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Outline'**
  String get dsPreviewWordOutline;

  /// Label for the ghost button variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Ghost'**
  String get dsPreviewWordGhost;

  /// Label for the destructive button variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Destructive'**
  String get dsPreviewWordDestructive;

  /// Generic 'Small' size label reused across button and circular progress demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Small'**
  String get dsPreviewWordSmall;

  /// Generic 'Large' size label reused across button and circular progress demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Large'**
  String get dsPreviewWordLarge;

  /// Generic 'Gradient' tone label reused across progress bar and circular progress demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Gradient'**
  String get dsPreviewWordGradient;

  /// Generic 'Success' tone label reused across alert banner and circular progress demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Success'**
  String get dsPreviewWordSuccess;

  /// Title of the warning-tone alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Warning'**
  String get dsPreviewWordWarning;

  /// Title of the error-tone alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get dsPreviewWordError;

  /// Title of the info-tone alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Information'**
  String get dsPreviewWordInformation;

  /// Generic 'Disabled' state label reused across button, chip, checkbox and radio demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Disabled'**
  String get dsPreviewStateDisabled;

  /// Generic 'Loading' state label reused across button demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Loading'**
  String get dsPreviewStateLoading;

  /// Label for the default chip state in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Default'**
  String get dsPreviewStateDefault;

  /// Label for the selected chip state in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Selected'**
  String get dsPreviewStateSelected;

  /// Generic 'With icon' caption reused across badge and chip demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'With icon'**
  String get dsPreviewWithIcon;

  /// Sample button label with a leading icon in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Add item'**
  String get dsPreviewBtnAddItem;

  /// Sample full-width primary button label in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Full Width Primary'**
  String get dsPreviewBtnFullWidthPrimary;

  /// Sample gradient button label with an icon in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Subscribe'**
  String get dsPreviewBtnSubscribe;

  /// Sample full-width gradient button label in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Full Width Gradient'**
  String get dsPreviewBtnFullWidthGradient;

  /// Section title in the design-system preview showing the color palette.
  ///
  /// In en, this message translates to:
  /// **'Colors'**
  String get dsPreviewSectionColors;

  /// Name of the accent color palette in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Accent'**
  String get dsPreviewColorAccent;

  /// Name of the semantic (success/warning/error/info) color palette in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Semantic'**
  String get dsPreviewColorSemantic;

  /// Name of the neutral color palette in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Neutral'**
  String get dsPreviewColorNeutral;

  /// Name of the AI gradient swatch in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'AI Gradient'**
  String get dsPreviewGradientAi;

  /// Name of the growth gradient swatch in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Growth Gradient'**
  String get dsPreviewGradientGrowth;

  /// Name of the soft AI gradient swatch in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'AI Soft'**
  String get dsPreviewGradientAiSoft;

  /// Section title in the design-system preview showing alert banner variants.
  ///
  /// In en, this message translates to:
  /// **'Alert Banners'**
  String get dsPreviewSectionAlertBanners;

  /// Section title in the design-system preview showing badge variants.
  ///
  /// In en, this message translates to:
  /// **'Badges'**
  String get dsPreviewSectionBadges;

  /// Section title in the design-system preview showing chip variants.
  ///
  /// In en, this message translates to:
  /// **'Chips'**
  String get dsPreviewSectionChips;

  /// Section title in the design-system preview showing skeleton loader placeholders.
  ///
  /// In en, this message translates to:
  /// **'Skeleton Loaders'**
  String get dsPreviewSectionSkeletonLoaders;

  /// Body text of the info-tone alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'This is an informational message.'**
  String get dsPreviewAlertInfoBody;

  /// Body text of the success-tone alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Your answer was correct!'**
  String get dsPreviewAlertSuccessBody;

  /// Body text of the warning-tone alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Your session expires in 5 minutes.'**
  String get dsPreviewAlertWarningBody;

  /// Body text of the error-tone alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Could not save your progress.'**
  String get dsPreviewAlertErrorBody;

  /// Body text of the dismissible, title-less alert banner demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Dismissible banner without title.'**
  String get dsPreviewAlertDismissibleBody;

  /// Label for the solid badge variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Solid'**
  String get dsPreviewBadgeSolid;

  /// Label for the pill-shaped badge with a status dot in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Pill + dot'**
  String get dsPreviewBadgePillDot;

  /// Label for the removable chip variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Removable'**
  String get dsPreviewChipRemovable;

  /// Section title in the design-system preview showing form control widgets.
  ///
  /// In en, this message translates to:
  /// **'Form Controls'**
  String get dsPreviewSectionFormControls;

  /// Label for the default text input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Default input'**
  String get dsPreviewInputDefaultLabel;

  /// Placeholder for the default text input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Enter text…'**
  String get dsPreviewInputEnterTextPlaceholder;

  /// Label for the input-with-helper-text demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'With helper text'**
  String get dsPreviewInputHelperLabel;

  /// Helper text under the email input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Use your institutional email.'**
  String get dsPreviewInputInstitutionalEmailHelper;

  /// Label for the input error-state demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Error state'**
  String get dsPreviewInputErrorLabel;

  /// Placeholder for the password input error-state demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Enter password'**
  String get dsPreviewInputEnterPasswordPlaceholder;

  /// Error text under the password input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters.'**
  String get dsPreviewInputPasswordError;

  /// Placeholder for the disabled input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Cannot edit'**
  String get dsPreviewInputCannotEditPlaceholder;

  /// Label for the required-field input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get dsPreviewInputRequiredLabel;

  /// Placeholder for the required-field input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get dsPreviewInputFullNamePlaceholder;

  /// Label for the search input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get dsPreviewInputSearchLabel;

  /// Placeholder for the search input demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Search lessons…'**
  String get dsPreviewInputSearchLessonsPlaceholder;

  /// Label for the unchecked checkbox demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Unchecked'**
  String get dsPreviewCheckboxUnchecked;

  /// Label for the checked checkbox demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Checked'**
  String get dsPreviewCheckboxChecked;

  /// Label shown next to the switch demo in the design-system preview when it is on.
  ///
  /// In en, this message translates to:
  /// **'On'**
  String get dsPreviewSwitchOn;

  /// Label shown next to the switch demo in the design-system preview when it is off.
  ///
  /// In en, this message translates to:
  /// **'Off'**
  String get dsPreviewSwitchOff;

  /// Label for the disabled-and-on switch demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Disabled on'**
  String get dsPreviewSwitchDisabledOn;

  /// Label for the first radio button demo option in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Option A'**
  String get dsPreviewRadioOptionA;

  /// Label for the second radio button demo option in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Option B'**
  String get dsPreviewRadioOptionB;

  /// Label for the third radio button demo option in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Option C'**
  String get dsPreviewRadioOptionC;

  /// Section title in the design-system preview showing the spacing scale.
  ///
  /// In en, this message translates to:
  /// **'Spacing'**
  String get dsPreviewSectionSpacing;

  /// Section title in the design-system preview showing the border-radius scale.
  ///
  /// In en, this message translates to:
  /// **'Border Radius'**
  String get dsPreviewSectionBorderRadius;

  /// Section title in the design-system preview showing the elevation/shadow scale.
  ///
  /// In en, this message translates to:
  /// **'Shadows'**
  String get dsPreviewSectionShadows;

  /// Section title in the design-system preview showing the blob card widget.
  ///
  /// In en, this message translates to:
  /// **'Blob Card'**
  String get dsPreviewSectionBlobCard;

  /// Section title in the design-system preview showing the stat tile widget.
  ///
  /// In en, this message translates to:
  /// **'Stat Tile'**
  String get dsPreviewSectionStatTile;

  /// Section title in the design-system preview showing the skill blob widget.
  ///
  /// In en, this message translates to:
  /// **'Skill Blob'**
  String get dsPreviewSectionSkillBlob;

  /// Section title in the design-system preview showing the AIM card widget.
  ///
  /// In en, this message translates to:
  /// **'AIM Card'**
  String get dsPreviewSectionAimCard;

  /// Section title in the design-system preview showing the progress bar widget.
  ///
  /// In en, this message translates to:
  /// **'Progress Bar'**
  String get dsPreviewSectionProgressBar;

  /// Section title in the design-system preview showing the circular progress widget.
  ///
  /// In en, this message translates to:
  /// **'Circular Progress'**
  String get dsPreviewSectionCircularProgress;

  /// Section title in the design-system preview showing the lesson answer-option widget.
  ///
  /// In en, this message translates to:
  /// **'Answer Options'**
  String get dsPreviewSectionAnswerOptions;

  /// Section title in the design-system preview showing the AI feedback bubble widget.
  ///
  /// In en, this message translates to:
  /// **'AI Feedback Bubble'**
  String get dsPreviewSectionAiFeedbackBubble;

  /// Section title in the design-system preview showing the voice record button widget.
  ///
  /// In en, this message translates to:
  /// **'Record Button'**
  String get dsPreviewSectionRecordButton;

  /// Sample blob card title demonstrating a streak count in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'5-day streak'**
  String get dsPreviewStreakTitle;

  /// Sample blob card subtitle demonstrating a streak nudge in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Keep it going today'**
  String get dsPreviewStreakSubtitle;

  /// Sample blob card title demonstrating a weekly XP count in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'320 XP this week'**
  String get dsPreviewXpWeekTitle;

  /// Label for the day-streak stat tile demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Day streak'**
  String get dsPreviewStatDayStreak;

  /// Label for the XP stat tile demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'XP'**
  String get dsPreviewStatXp;

  /// Label for the lessons-count stat tile demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Lessons'**
  String get dsPreviewStatLessons;

  /// Skill name label reused for the skill blob and tab demos in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Speaking'**
  String get dsPreviewSkillSpeaking;

  /// Sample content for the standard AIM card variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Standard card'**
  String get dsPreviewCardStandard;

  /// Sample content for the elevated AIM card variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Elevated card'**
  String get dsPreviewCardElevated;

  /// Sample content for the AI-gradient-border AIM card variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'AI card (gradient border)'**
  String get dsPreviewCardAiGradientBorder;

  /// Sample content for the gradient AIM card variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Gradient card — AI adaptive content'**
  String get dsPreviewCardGradientAiContent;

  /// Sample content for the interactive AIM card variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Interactive card — tap me'**
  String get dsPreviewCardInteractiveTapMe;

  /// Label for the lesson-progress bar demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Lesson progress'**
  String get dsPreviewProgressLesson;

  /// Label for the XP-to-next-level progress bar demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'XP to next level'**
  String get dsPreviewProgressXpNextLevel;

  /// Label for the grammar-mastery progress bar demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Grammar mastery'**
  String get dsPreviewProgressGrammarMastery;

  /// Label for the vocabulary-retention progress bar demo in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Vocabulary retention'**
  String get dsPreviewProgressVocabRetention;

  /// Custom progress-bar value format demonstrating an XP counter in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'{value}/{max} XP'**
  String dsPreviewXpProgressFormat(int value, int max);

  /// Caption under the circular progress demo for the daily-goal variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'daily goal'**
  String get dsPreviewCircularDailyGoal;

  /// Caption under the circular progress demo for the score variant in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'score'**
  String get dsPreviewCircularScore;

  /// Section title in the design-system preview showing the gradient hero header widget.
  ///
  /// In en, this message translates to:
  /// **'Gradient Hero Header'**
  String get dsPreviewSectionGradientHeroHeader;

  /// Section title in the design-system preview showing the app drawer widget.
  ///
  /// In en, this message translates to:
  /// **'App Drawer'**
  String get dsPreviewSectionAppDrawer;

  /// Section title in the design-system preview showing the notifications sheet widget.
  ///
  /// In en, this message translates to:
  /// **'Notifications Sheet'**
  String get dsPreviewSectionNotificationsSheet;

  /// Section title in the design-system preview showing the top app bar widget.
  ///
  /// In en, this message translates to:
  /// **'Top App Bar'**
  String get dsPreviewSectionTopAppBar;

  /// Section title in the design-system preview showing the segmented control widget.
  ///
  /// In en, this message translates to:
  /// **'Segmented Control'**
  String get dsPreviewSectionSegmentedControl;

  /// Section title in the design-system preview showing the tabs widget.
  ///
  /// In en, this message translates to:
  /// **'Tabs'**
  String get dsPreviewSectionTabs;

  /// Section title in the design-system preview showing the bottom navigation widget.
  ///
  /// In en, this message translates to:
  /// **'Bottom Navigation'**
  String get dsPreviewSectionBottomNavigation;

  /// Sample app-drawer item label in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get dsPreviewNavSettings;

  /// Button label that opens the demo app drawer in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Open drawer'**
  String get dsPreviewOpenDrawerButton;

  /// Button label that opens the demo notifications sheet in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Show notifications'**
  String get dsPreviewShowNotificationsButton;

  /// Sample top app bar title demonstrating the centered-title layout in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'Centered Title'**
  String get dsPreviewCenteredTitleDemo;

  /// Label for the 'all' segmented control option in the design-system preview.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get dsPreviewSegAll;

  /// Section title in the design-system preview showing the type scale.
  ///
  /// In en, this message translates to:
  /// **'Typography'**
  String get dsPreviewSectionTypography;
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
      return AppLocalizationsEn();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
