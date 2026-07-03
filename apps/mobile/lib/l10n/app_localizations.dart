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
