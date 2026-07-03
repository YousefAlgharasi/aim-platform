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
