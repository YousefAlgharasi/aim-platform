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
  String get commonFocusAreas => 'Focus Areas';

  @override
  String commonDoneProgress(int done, int total) {
    return '$done/$total done';
  }

  @override
  String commonWeaknessSemantic(String skillId, String severity) {
    return '$skillId weakness: $severity';
  }

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

  @override
  String get homeLoadingSemantic => 'Loading home data';

  @override
  String homeUnreadNotificationsSubtitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count new notifications',
      one: '1 new notification',
      zero: 'No new notifications',
    );
    return '$_temp0';
  }

  @override
  String homeMinutesAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '${count}m ago',
      one: '1m ago',
    );
    return '$_temp0';
  }

  @override
  String homeHoursAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '${count}h ago',
      one: '1h ago',
    );
    return '$_temp0';
  }

  @override
  String homeDaysAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '${count}d ago',
      one: '1d ago',
    );
    return '$_temp0';
  }

  @override
  String homeWeeksAgoLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '${count}w ago',
      one: '1w ago',
    );
    return '$_temp0';
  }

  @override
  String get homeContinueLearningTitle => 'Continue learning';

  @override
  String get homeLibraryLink => 'Library';

  @override
  String get homeDailyChallengesTitle => 'Daily challenges';

  @override
  String homeDailyChallengeCountLabel(int done, int total) {
    return '$done / $total done';
  }

  @override
  String get homeQuickStartTitle => 'Quick Start';

  @override
  String get homeRecommendedCourseTitle => 'Recommended Course';

  @override
  String get homeGoalTitle => 'Goal';

  @override
  String get homeSkillStatesTitle => 'Skill States';

  @override
  String get homeReviewScheduleTitle => 'Review Schedule';

  @override
  String get homeRecommendationsTitle => 'AIM Recommendations';

  @override
  String get homeGetStartedTitle => 'Get Started';

  @override
  String get homePlacementTestTitle => 'Placement Test';

  @override
  String get homePlacementTestSubtitle =>
      'Find your level and get personalised recommendations.';

  @override
  String get homeBrowseCoursesTitle => 'Browse Courses';

  @override
  String get homeBrowseCoursesSubtitle =>
      'Explore available courses and start learning.';

  @override
  String get homeAssessmentsTitle => 'Assessments';

  @override
  String get homeAssessmentsSubtitle => 'View and take available assessments.';

  @override
  String homeGreetingWeekdayLine(String weekday) {
    return '$weekday · let\'s go';
  }

  @override
  String homeGreetingHey(String name) {
    return 'Hey $name ✦';
  }

  @override
  String homeStreakDaysSemantic(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count day streak',
      one: '1 day streak',
    );
    return '$_temp0';
  }

  @override
  String get homeCrushingGoalsTitle => 'You\'re crushing your goals 🚀';

  @override
  String get homeLevelLabel => 'LEVEL';

  @override
  String get homeXpTodayLabel => 'XP TODAY';

  @override
  String homeLevelHeroSemanticNext(
      int level, int xp, int nextXp, int nextLevel) {
    return 'Level $level, $xp XP, $nextXp XP to level $nextLevel';
  }

  @override
  String homeLevelHeroSemanticMax(int level, int xp) {
    return 'Level $level, $xp XP (max level)';
  }

  @override
  String homeXpProgressWithNext(String xp, String nextXp) {
    return '$xp / $nextXp XP';
  }

  @override
  String homeXpProgressMax(String xp) {
    return '$xp XP';
  }

  @override
  String homeNextLevelCta(int level) {
    return 'Level $level →';
  }

  @override
  String get homeMaxLevelLabel => 'Max level';

  @override
  String homeBadgeCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count badges',
      one: '1 badge',
    );
    return '$_temp0';
  }

  @override
  String homeTopPercentLabel(int percent) {
    return 'Top $percent%';
  }

  @override
  String get homeResumeButton => 'Resume';

  @override
  String homePercentCompleteLabel(int percent) {
    return '$percent% complete';
  }

  @override
  String homeContinueSemanticLabel(String title, int percent) {
    return 'Continue $title, $percent percent complete';
  }

  @override
  String homeDailyChallengeSemantic(String title, int progress, int target) {
    return 'Daily challenge: $title, $progress of $target';
  }

  @override
  String homeQuickStartSemantic(String title) {
    return 'Quick Start: $title';
  }

  @override
  String homeRecommendedCourseSemantic(String title) {
    return 'Recommended course: $title';
  }

  @override
  String homeRecommendationSemantic(String kind, String skillId) {
    return 'AIM recommendation: $kind $skillId';
  }

  @override
  String homeContinueLearningCardSemantic(String title, int percent) {
    return 'Continue learning: $title, $percent% complete';
  }

  @override
  String homeReviewScheduleSemantic(String skillId, String dueAt) {
    return 'Review $skillId due $dueAt';
  }

  @override
  String homeSkillMasterySemantic(String skillId, String percent) {
    return '$skillId mastery: $percent%';
  }

  @override
  String homeMasteryPercentLabel(String percent) {
    return '$percent% mastery';
  }

  @override
  String homeGoalSemantic(int completed, int target, int streak) {
    return 'Daily goal: $completed of $target lessons, $streak day streak';
  }

  @override
  String get homeTodaysGoalTitle => 'Today\'s Goal';

  @override
  String homeGoalProgressLabel(int completed, int target) {
    return '$completed of $target lessons completed today';
  }

  @override
  String get learningPathLoadingSemantic => 'Loading learning path data';

  @override
  String get learningPathHeaderTitle => 'Learning Path';

  @override
  String get learningPathHeaderSubtitle => 'Your personalized roadmap';

  @override
  String get learningPathEmptyTitle => 'Your learning path is empty';

  @override
  String get learningPathEmptySubtitle =>
      'Complete your placement test to generate a personalised learning path.';

  @override
  String get learningPathSkillCoverageTitle => 'Skill coverage';

  @override
  String get learningPathNextUpTitle => 'Next up';

  @override
  String get learningPathAiPickedBadge => 'AI picked';

  @override
  String learningPathRecommendationSemantic(String kind, String skillId) {
    return 'AIM recommendation: $kind for $skillId';
  }

  @override
  String learningPathSkillMasterySemantic(
      String title, String percent, String trend) {
    return '$title mastery: $percent%, $trend';
  }

  @override
  String get lessonsLoadingChaptersSemantic => 'Loading chapters';

  @override
  String lessonsChapterCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count chapters',
      one: '1 chapter',
    );
    return '$_temp0';
  }

  @override
  String lessonsPercentDoneSemantic(int percent) {
    return '$percent percent done';
  }

  @override
  String get lessonsDoneBadge => 'DONE';

  @override
  String get lessonsFilterAllChapters => 'All chapters';

  @override
  String get lessonsInProgressLabel => 'In progress';

  @override
  String get lessonsCompletedLabel => 'Completed';

  @override
  String get lessonsNotStartedLabel => 'Not started';

  @override
  String get lessonsNoChaptersTitle => 'No chapters available';

  @override
  String get lessonsNoChaptersSubtitle =>
      'Published chapters will appear here.';

  @override
  String get lessonsNoChaptersFilterTitle => 'No chapters in this filter';

  @override
  String get lessonsTryDifferentFilterSubtitle =>
      'Try a different filter above.';

  @override
  String get lessonsLoadingCoursesSemantic => 'Loading courses';

  @override
  String get lessonsNoCoursesTitle => 'No courses available';

  @override
  String get lessonsNoCoursesSubtitle => 'Published courses will appear here.';

  @override
  String get lessonsCoursesPageTitle => 'Courses';

  @override
  String lessonsLevelBadge(String level) {
    return 'Level $level';
  }

  @override
  String get lessonsCoursesSubtitle => 'Level up your English, step by step';

  @override
  String get lessonsFilterAllCourses => 'All courses';

  @override
  String get lessonsNoCoursesFilterMessage =>
      'No courses match this filter yet.';

  @override
  String get lessonsLoadingLessonsSemantic => 'Loading lessons';

  @override
  String lessonsChapterEyebrowLabel(int number) {
    return 'CHAPTER $number';
  }

  @override
  String get lessonsNoLessonsTitle => 'No lessons available';

  @override
  String get lessonsNoLessonsSubtitle => 'Published lessons will appear here.';

  @override
  String get lessonsLoadingLessonSemantic => 'Loading lesson';

  @override
  String get lessonsLessonAppBarTitle => 'Lesson';

  @override
  String get lessonsSaveLessonComingSoonSemantic => 'Save lesson (coming soon)';

  @override
  String get lessonsWhatsInsideTitle => 'What\'s inside';

  @override
  String lessonsStepsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count steps',
      one: '1 step',
    );
    return '$_temp0';
  }

  @override
  String get lessonsNoContentTitle => 'No content yet';

  @override
  String get lessonsNoContentSubtitle =>
      'Published lesson content will appear here.';

  @override
  String get lessonsStartPracticeButton => 'Start practice';

  @override
  String get lessonsPracticeContextLabel => 'Lesson practice';

  @override
  String lessonsLessonNumberPill(int number) {
    return 'Lesson $number';
  }

  @override
  String lessonsMinutesLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count min',
      one: '1 min',
    );
    return '$_temp0';
  }

  @override
  String lessonsBlocksCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count blocks',
      one: '1 block',
    );
    return '$_temp0';
  }

  @override
  String lessonsXpBadge(int xp) {
    return '+$xp XP';
  }

  @override
  String lessonsStepTitleLabel(int number) {
    return 'Step $number';
  }

  @override
  String lessonsStepSemantic(int number, String title) {
    return 'Step $number: $title';
  }

  @override
  String lessonsAssetSemantic(String type, String title) {
    return '$type asset: $title';
  }

  @override
  String lessonsCourseSemanticBase(String title, int percent) {
    return 'Course: $title, $percent percent complete';
  }

  @override
  String lessonsCourseSemanticWithLevel(
      String title, String level, int percent) {
    return 'Course: $title, level $level, $percent percent complete';
  }

  @override
  String lessonsLessonsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count lessons',
      one: '1 lesson',
    );
    return '$_temp0';
  }

  @override
  String lessonsLessonSemantic(String title) {
    return 'Lesson: $title';
  }

  @override
  String lessonsXpValueLabel(int xp) {
    return '$xp XP';
  }

  @override
  String get lessonsStartLessonSemantic => 'Start lesson';

  @override
  String lessonsChapterSemantic(String title) {
    return 'Chapter: $title';
  }

  @override
  String lessonsImageUrlMissingError(String title) {
    return 'Image URL is missing for asset: $title';
  }

  @override
  String lessonsImageLoadFailedError(String title) {
    return 'Failed to load image: $title';
  }

  @override
  String lessonsNewWordsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count new words',
      one: '1 new word',
    );
    return '$_temp0';
  }

  @override
  String lessonsItemsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count items',
      one: '1 item',
    );
    return '$_temp0';
  }

  @override
  String get progressPageTitle => 'Your progress';

  @override
  String get progressPageSubtitle => 'A snapshot of how you are doing';

  @override
  String get progressLoadingSemantic => 'Loading progress data';

  @override
  String get progressEmptyTitle => 'No progress data yet';

  @override
  String get progressEmptySubtitle =>
      'Complete lessons and practice sessions to see your AIM progress.';

  @override
  String get progressAvgMasteryLabel => 'Avg mastery';

  @override
  String get progressDayStreakLabel => 'Day streak';

  @override
  String progressStatCardSemantic(String value, String label) {
    return '$value $label';
  }

  @override
  String progressNavRowSemantic(String title, String subtitle) {
    return '$title, $subtitle';
  }

  @override
  String progressSkillStatesSubtitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count skills tracked',
      one: '$count skills tracked',
    );
    return '$_temp0';
  }

  @override
  String get progressWeaknessesNavTitle => 'Weaknesses';

  @override
  String progressFocusAreasCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count focus areas',
      one: '$count focus areas',
    );
    return '$_temp0';
  }

  @override
  String get progressRecommendationsNavTitle => 'Recommendations';

  @override
  String progressRecommendationsFromAimLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count from AIM',
      one: '$count from AIM',
    );
    return '$_temp0';
  }

  @override
  String progressReviewsScheduledCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count reviews scheduled',
      one: '$count reviews scheduled',
    );
    return '$_temp0';
  }

  @override
  String get progressWeaknessLoadingSemantic => 'Loading weakness data';

  @override
  String get progressNoFocusAreasTitle => 'No focus areas yet';

  @override
  String get progressNoFocusAreasSubtitle =>
      'Complete practice sessions so AIM can identify areas to focus on.';

  @override
  String progressWeaknessDetailSemantic(
      String skillId, String severity, String status) {
    return '$skillId weakness: $severity, $status';
  }

  @override
  String progressDetectedLabel(String date) {
    return 'Detected: $date';
  }

  @override
  String progressResolvedLabel(String date) {
    return 'Resolved: $date';
  }

  @override
  String get progressRecommendationsLoadingSemantic =>
      'Loading recommendations';

  @override
  String get progressNoRecommendationsTitle => 'No recommendations yet';

  @override
  String get progressNoRecommendationsSubtitle =>
      'Complete lessons and practice sessions to receive AIM recommendations.';

  @override
  String progressRecommendationRankSemantic(
      int rank, String kind, String skillId) {
    return 'AIM recommendation rank $rank: $kind for $skillId';
  }

  @override
  String progressRankBadge(int rank) {
    return '#$rank';
  }

  @override
  String progressLessonLabel(String lessonId) {
    return 'Lesson: $lessonId';
  }

  @override
  String progressExpiresLabel(String date) {
    return 'Expires: $date';
  }

  @override
  String progressGeneratedLabel(String date) {
    return 'Generated: $date';
  }

  @override
  String get progressSkillStatesLoadingSemantic => 'Loading skill states';

  @override
  String get progressNoSkillDataTitle => 'No skill data yet';

  @override
  String get progressNoSkillDataSubtitle =>
      'Complete lessons and practice to build your skill profile.';

  @override
  String progressSkillMasterySemantic(
      String title, int masteryPct, String tierLabel) {
    return '$title mastery $masteryPct%, $tierLabel';
  }

  @override
  String get progressTierStrong => 'Strong';

  @override
  String get progressTierDeveloping => 'Developing';

  @override
  String get progressTierNeedsWork => 'Needs work';

  @override
  String get progressTrendImproving => 'Improving';

  @override
  String get progressTrendDeclining => 'Declining';

  @override
  String get progressTrendStable => 'Stable';

  @override
  String get progressTrendInsufficientData => 'Insufficient data';

  @override
  String get progressMasteryPrefix => 'Mastery ';

  @override
  String progressMasteryWasSuffix(int prevPct) {
    return ' · was $prevPct';
  }

  @override
  String progressConfidenceLabel(int percent) {
    return 'Confidence $percent%';
  }

  @override
  String get progressNoReviewsSubtitle =>
      'Complete practice sessions to receive AIM-computed review reminders.';

  @override
  String get progressReviewStatusDue => 'Due';

  @override
  String get progressReviewStatusPending => 'Pending';

  @override
  String get progressReviewStatusCompleted => 'Completed';

  @override
  String get progressReviewStatusSkipped => 'Skipped';

  @override
  String get progressReviewStatusOverdue => 'Overdue';

  @override
  String progressReviewCardSemantic(
      String skillId, String dueAt, String statusLabel) {
    return '$skillId review due $dueAt — $statusLabel';
  }

  @override
  String progressReviewMetaLabel(
      String dueLabel, int intervalDays, int repCount) {
    return '$dueLabel · ${intervalDays}d · rep #$repCount';
  }

  @override
  String progressDueRawLabel(String raw) {
    return 'Due $raw';
  }

  @override
  String progressReviewScheduleCardSemantic(String skillId, String dueAt) {
    return '$skillId review due $dueAt';
  }

  @override
  String progressDueColonLabel(String dueAt) {
    return 'Due: $dueAt';
  }

  @override
  String progressIntervalDaysBadge(int days) {
    return '${days}d';
  }

  @override
  String get reviewsPageTitle => 'Review';

  @override
  String get reviewsPageSubtitle => 'Spaced repetition keeps it in memory';

  @override
  String get reviewsLoadingScheduleSemantic => 'Loading review schedule';

  @override
  String get reviewsNoReviewsScheduledTitle => 'No reviews scheduled';

  @override
  String get reviewsNoReviewsSubtitle =>
      'Complete practice sessions to receive review reminders.';

  @override
  String reviewsCardSemantic(String title, String dueAt, String status) {
    return '$title review due $dueAt — $status';
  }

  @override
  String reviewsIntervalDaysLabel(int days) {
    return 'Interval ${days}d';
  }

  @override
  String reviewsRepBadge(int repCount) {
    return 'rep #$repCount';
  }

  @override
  String get reviewsDueTodayLabel => 'Due Today';

  @override
  String get reviewsDueTomorrowLabel => 'Due Tomorrow';

  @override
  String get reviewsDueYesterdayLabel => 'Due Yesterday';

  @override
  String reviewsDueInDaysLabel(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'Due in $days days',
      one: 'Due in 1 day',
    );
    return '$_temp0';
  }

  @override
  String reviewsDueDaysAgoLabel(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'Due $days days ago',
      one: 'Due 1 day ago',
    );
    return '$_temp0';
  }

  @override
  String reviewsDueFormattedLabel(String date) {
    return 'Due $date';
  }

  @override
  String reviewsDueRawLabel(String raw) {
    return 'Due: $raw';
  }

  @override
  String get analyticsSummaryTitle => 'Analytics';

  @override
  String get analyticsSummaryLoadingSemantic => 'Loading analytics summary';

  @override
  String get analyticsSummaryNoReportsTitle => 'No reports available';

  @override
  String get analyticsSummaryNoReportsSubtitle =>
      'There are no analytics reports for you yet.';

  @override
  String analyticsSummaryReportSemantic(String name) {
    return '$name report';
  }

  @override
  String get notificationsSettingsTitle => 'Notification settings';

  @override
  String get notificationsPreferencesLoadingSemantic =>
      'Loading notification preferences';

  @override
  String get notificationsInboxLoadingSemantic => 'Loading notifications';

  @override
  String get notificationsInboxEmptyTitle => 'No notifications yet';

  @override
  String get notificationsInboxEmptySubtitle =>
      'Session reminders and progress updates will appear here.';

  @override
  String get notificationsDismissSemantic => 'Dismiss notification';

  @override
  String get notificationsCloseSheetSemantic => 'Close notifications';

  @override
  String notificationsUnreadTileSemantic(String title) {
    return 'Unread notification: $title';
  }

  @override
  String notificationsTileSemantic(String title) {
    return 'Notification: $title';
  }

  @override
  String get notificationsUnreadLabel => 'Unread';

  @override
  String get notificationsReadLabel => 'Read';

  @override
  String get notificationsCategoryLearningReminder => 'Learning reminders';

  @override
  String get notificationsCategoryDeadlineReminder => 'Deadline reminders';

  @override
  String get notificationsCategoryProgressUpdate => 'Progress updates';

  @override
  String get notificationsCategoryAssessmentResult => 'Assessment results';

  @override
  String get notificationsCategoryParentSummary => 'Progress digests';

  @override
  String get notificationsCategorySystemAlert => 'System alerts';

  @override
  String get notificationsChannelInApp => 'In-app';

  @override
  String get notificationsChannelPush => 'Push';

  @override
  String get notificationsChannelEmail => 'Email';

  @override
  String get notificationsChannelsSectionLabel => 'CHANNELS';

  @override
  String get notificationsQuietHoursSectionLabel => 'QUIET HOURS';

  @override
  String notificationsChannelToggleSemantic(String channel, String category) {
    return '$channel notifications for $category';
  }

  @override
  String get notificationsEnableQuietHoursLabel => 'Enable quiet hours';

  @override
  String get notificationsQuietHoursStartLabel => 'Start';

  @override
  String get notificationsQuietHoursEndLabel => 'End';

  @override
  String get notificationsSaveQuietHoursLabel => 'Save quiet hours';

  @override
  String get notificationsDetailTitle => 'Notification';

  @override
  String get notificationsMarkAsReadLabel => 'Mark as read';

  @override
  String get notificationsDismissLabel => 'Dismiss';

  @override
  String get notificationsDismissedTitle => 'Dismissed';

  @override
  String get notificationsDismissedBody =>
      'This notification has been dismissed.';

  @override
  String get notificationsReminderTypeLearningPlan => 'Learning plan';

  @override
  String get notificationsReminderTypeReview => 'Review';

  @override
  String get notificationsReminderTypeDeadline => 'Deadline';

  @override
  String get notificationsReminderTypeStreak => 'Streak';

  @override
  String get notificationsReminderTypeCustom => 'Custom';

  @override
  String notificationsEveryDayLabel(String time) {
    return 'Every day · $time';
  }

  @override
  String notificationsEveryWeekdayLabel(String weekday, String time) {
    return 'Every $weekday · $time';
  }

  @override
  String notificationsReminderSemantic(String type, String status) {
    return '$type reminder, status $status';
  }

  @override
  String get notificationsNoRemindersTitle => 'No reminders yet';

  @override
  String get notificationsNoRemindersSubtitle =>
      'Reminders you enable will appear here.';

  @override
  String get notificationsNoRemindersSemantic => 'No reminder schedules';

  @override
  String get notificationsRemindersLoadingSemantic =>
      'Loading reminder schedules';

  @override
  String get notificationsRemindersTitle => 'Reminders';

  @override
  String get notificationsResumeLabel => 'Resume';

  @override
  String get notificationsResumeSemantic => 'Resume reminder';

  @override
  String get notificationsPauseLabel => 'Pause';

  @override
  String get notificationsPauseSemantic => 'Pause reminder';

  @override
  String get notificationsCancelSemantic => 'Cancel reminder';

  @override
  String notificationsBellUnreadSemantic(int count) {
    return 'Notifications, $count unread';
  }

  @override
  String get achievementsLoadingSemantic => 'Loading achievements';

  @override
  String get achievementsEmptyTitle => 'No achievements yet';

  @override
  String get achievementsEmptySubtitle =>
      'Complete lessons and practice sessions to earn badges and milestones.';

  @override
  String get achievementsStartLearningLabel => 'Start learning';

  @override
  String achievementsUnlockedSemantic(String title) {
    return '$title, unlocked';
  }

  @override
  String achievementsLockedSemantic(String title) {
    return '$title, locked';
  }

  @override
  String get assessmentsStartAttemptTitle => 'Start attempt';

  @override
  String get assessmentsReadyToBeginTitle => 'Ready to begin?';

  @override
  String assessmentsTimedBodyCopy(String minutes) {
    return 'Once you start, the $minutes-minute timer runs continuously — even if you leave the app. Make sure you have time to finish.';
  }

  @override
  String get assessmentsUntimedBodyCopy =>
      'Once you start, the attempt will be recorded. Make sure you are ready before proceeding.';

  @override
  String get assessmentsStartAttemptButton => 'Start Attempt';

  @override
  String assessmentsStartAttemptSemantic(String title) {
    return 'Start attempt for $title';
  }

  @override
  String get assessmentsGoBackButton => 'Go Back';

  @override
  String get assessmentsLoadingResultSemantic => 'Loading result';

  @override
  String get assessmentsStatusPassed => 'Passed';

  @override
  String get assessmentsStatusFailed => 'Failed';

  @override
  String assessmentsScoreSemantic(
      String statusLabel, String score, String maxScore) {
    return '$statusLabel: $score of $maxScore points';
  }

  @override
  String get assessmentsLatePenaltyApplied => 'Late penalty applied';

  @override
  String assessmentsGradedLabel(String date) {
    return 'Graded $date';
  }

  @override
  String get assessmentsBreakdownLabel => 'BREAKDOWN';

  @override
  String get assessmentsDoneViewingResultSemantic => 'Done viewing result';

  @override
  String assessmentsPointsFraction(String awarded, String possible) {
    return '$awarded / $possible pts';
  }

  @override
  String get assessmentsLoadingResultHistorySemantic =>
      'Loading result history';

  @override
  String get assessmentsResultHistoryTitle => 'Result history';

  @override
  String get assessmentsNoResultsTitle => 'No results yet';

  @override
  String get assessmentsNoResultsSubtitle =>
      'Your past attempt results will appear here.';

  @override
  String assessmentsAttemptResultSemantic(int attemptNumber, String scoreLabel,
      String statusWord, String lateSuffix) {
    return 'Attempt $attemptNumber, $scoreLabel, $statusWord$lateSuffix';
  }

  @override
  String get assessmentsPassedWord => 'passed';

  @override
  String get assessmentsFailedWord => 'failed';

  @override
  String get assessmentsLatePenaltySemanticSuffix => ', late penalty applied';

  @override
  String get assessmentsLoadingAssessmentSemantic => 'Loading assessment';

  @override
  String get assessmentsExamDetailsTitle => 'Exam details';

  @override
  String get assessmentsQuizDetailsTitle => 'Quiz details';

  @override
  String get assessmentsDetailsTitle => 'Assessment details';

  @override
  String get assessmentsQuestionsLabel => 'Questions';

  @override
  String get assessmentsTimeLimitLabel => 'Time limit';

  @override
  String get assessmentsMaxAttemptsLabel => 'Max attempts';

  @override
  String get assessmentsDeadlineHeading => 'Deadline';

  @override
  String get assessmentsSectionsHeading => 'Sections';

  @override
  String get assessmentsPastResultsTitle => 'Past results';

  @override
  String get assessmentsViewAttemptHistorySubtitle =>
      'View your attempt history';

  @override
  String get assessmentsPastResultsSemantic =>
      'Past results, view your attempt history';

  @override
  String get assessmentsDeadlineStatusOpen => 'Open';

  @override
  String get assessmentsDeadlineStatusUpcoming => 'Upcoming';

  @override
  String get assessmentsDeadlineStatusClosed => 'Closed';

  @override
  String get assessmentsDeadlineStatusLate => 'Late';

  @override
  String get assessmentsDeadlineStatusMissed => 'Missed';

  @override
  String get assessmentsOpensLabel => 'Opens';

  @override
  String get assessmentsClosesLabel => 'Closes';

  @override
  String get assessmentsExtendedCloseLabel => 'Extended close';

  @override
  String assessmentsDurationMinutes(int minutes) {
    return '$minutes min';
  }

  @override
  String assessmentsDurationMinutesSeconds(int minutes, int seconds) {
    return '$minutes min $seconds sec';
  }

  @override
  String assessmentsQuestionCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count questions',
      one: '1 question',
    );
    return '$_temp0';
  }

  @override
  String get assessmentsLoadingDeadlinesSemantic => 'Loading deadlines';

  @override
  String get assessmentsDeadlinesTitle => 'Deadlines';

  @override
  String get assessmentsNoDeadlinesTitle => 'No deadlines';

  @override
  String get assessmentsNoDeadlinesSubtitle =>
      'Your assessment deadlines will appear here.';

  @override
  String get assessmentsSectionActiveLabel => 'Active';

  @override
  String get assessmentsRelativeToday => 'today';

  @override
  String get assessmentsRelativeTomorrow => 'tomorrow';

  @override
  String assessmentsRelativeInDays(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'in $days days',
      one: 'in 1 day',
    );
    return '$_temp0';
  }

  @override
  String assessmentsDueRelativeDate(String relative, String date) {
    return 'Due $relative · $date';
  }

  @override
  String assessmentsDueDate(String date) {
    return 'Due $date';
  }

  @override
  String assessmentsOpensDate(String date) {
    return 'Opens $date';
  }

  @override
  String assessmentsExtendedToDate(String date) {
    return 'Extended to $date';
  }

  @override
  String assessmentsWasDueDate(String date) {
    return 'Was due $date';
  }

  @override
  String assessmentsClosedDate(String date) {
    return 'Closed $date';
  }

  @override
  String assessmentsDeadlineTileSemantic(String title, String subtitle) {
    return '$title, $subtitle';
  }

  @override
  String get assessmentsResumingAttemptSemantic => 'Resuming attempt';

  @override
  String get assessmentsStatusLabel => 'Status';

  @override
  String get assessmentsInProgressStatus => 'In Progress';

  @override
  String get assessmentsExpiresLabel => 'Expires';

  @override
  String assessmentsTimeRemainingSemantic(String time) {
    return 'Time remaining: $time';
  }

  @override
  String get assessmentsQuestionRenderingUnavailable =>
      'Question rendering isn’t available yet for this attempt.';

  @override
  String get assessmentsSubmitAttemptSemantic => 'Submit attempt';

  @override
  String get assessmentsLoadingListSemantic => 'Loading assessments';

  @override
  String get assessmentsListTitle => 'Assessments';

  @override
  String get assessmentsEmptyTitle => 'No assessments available';

  @override
  String get assessmentsEmptySubtitle =>
      'Published quizzes and exams will appear here.';

  @override
  String get assessmentsSubmitConfirmTitle => 'Submit your answers?';

  @override
  String get assessmentsSubmitConfirmBody =>
      'You cannot change answers after submitting.';

  @override
  String get assessmentsFinalWarning =>
      'This action is final and cannot be undone.';

  @override
  String assessmentsSubmitAttemptForSemantic(String title) {
    return 'Submit attempt for $title';
  }

  @override
  String assessmentsListTileSemantic(String typeLabel, String title) {
    return '$typeLabel: $title';
  }

  @override
  String get assessmentsTypeExam => 'Exam';

  @override
  String get assessmentsTypeQuiz => 'Quiz';

  @override
  String assessmentsDeadlineCardSemantic(String title, String status) {
    return '$title — $status';
  }

  @override
  String assessmentsOpensClosesLabel(String opensAt, String closesAt) {
    return 'Opens: $opensAt  •  Closes: $closesAt';
  }

  @override
  String assessmentsDaysRemainingLabel(int days) {
    return '${days}d remaining';
  }

  @override
  String assessmentsHoursRemainingLabel(int hours) {
    return '${hours}h remaining';
  }

  @override
  String assessmentsMinutesRemainingLabel(int minutes) {
    return '${minutes}m remaining';
  }

  @override
  String get assessmentsLessThanMinuteLabel => 'Less than a minute';

  @override
  String get placementLoadingResultSemantic => 'Loading your result';

  @override
  String get placementScoringInProgressTitle => 'Scoring in progress…';

  @override
  String get placementScoringInProgressSemantic => 'Scoring in progress';

  @override
  String get placementScoringInProgressSubtitle =>
      'The backend is evaluating your answers.';

  @override
  String get placementSectionBreakdownLabel => 'SECTION BREAKDOWN';

  @override
  String get placementContinueButton => 'Continue to AIM';

  @override
  String get placementLevelBeginner => 'Beginner';

  @override
  String get placementLevelElementary => 'Elementary';

  @override
  String get placementLevelIntermediate => 'Intermediate';

  @override
  String get placementLevelUpperIntermediate => 'Upper Intermediate';

  @override
  String get placementLevelAdvanced => 'Advanced';

  @override
  String get placementSkillGrammar => 'Grammar';

  @override
  String get placementSkillVocabulary => 'Vocabulary';

  @override
  String get placementSkillReading => 'Reading';

  @override
  String get placementSkillListening => 'Listening';

  @override
  String placementLevelSemantic(String displayName, int totalScore) {
    return 'Your level: $displayName, total score $totalScore out of 100';
  }

  @override
  String get placementYourLevelLabel => 'YOUR LEVEL';

  @override
  String placementLevelSummary(String displayName, int totalScore) {
    return '$displayName · Total score $totalScore / 100';
  }

  @override
  String placementSectionCorrectSemantic(String name, int correct, int total) {
    return '$name: $correct of $total correct';
  }

  @override
  String placementFractionLabel(int correct, int total) {
    return '$correct / $total';
  }

  @override
  String get placementSectionsLabel => 'Sections';

  @override
  String placementSectionsValue(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count sections',
      one: '1 section',
    );
    return '$_temp0';
  }

  @override
  String get placementEstimatedTimeLabel => 'Estimated time';

  @override
  String placementEstimatedTimeValue(int minutes) {
    return '~$minutes min';
  }

  @override
  String get placementBackendNote =>
      'Your level is determined by the backend after completion. Results are never calculated on your device.';

  @override
  String get placementStartTestSemantic => 'Start placement test';

  @override
  String get placementIntroHeaderTitle => 'General English Placement';

  @override
  String get placementIntroHeaderSubtitle =>
      'A quick check to find your starting level.';

  @override
  String get placementLoadingTestSemantic => 'Loading placement test';

  @override
  String get placementStartingTestSemantic => 'Starting placement test';

  @override
  String get placementTestTitle => 'Placement Test';

  @override
  String get placementFindYourLevelTitle => 'Find your level';

  @override
  String get placementFindYourLevelSubtitle =>
      'A short adaptive test places you at the right level so every lesson fits you.';

  @override
  String get placementSectionsStatLabel => 'sections';

  @override
  String get placementMinutesStatLabel => 'minutes';

  @override
  String get placementStartTestButton => 'Start Placement Test';

  @override
  String get placementNotNowButton => 'Not now';

  @override
  String placementQuestionCounter(int index, int total) {
    return '$index of $total';
  }

  @override
  String get placementLoadingQuestionSemantic => 'Loading question';

  @override
  String placementSubmitAnswerFailedWithReason(String reason) {
    return 'Failed to submit answer: $reason';
  }

  @override
  String get placementSubmitAnswerFailedGeneric =>
      'Failed to submit answer. Please try again.';

  @override
  String get placementSubmitFinalAnswerButton => 'Submit Final Answer';

  @override
  String get placementNextQuestionButton => 'Next question';

  @override
  String get placementSubmitFinalAnswerSemantic => 'Submit final answer';

  @override
  String get placementNextQuestionSemantic => 'Next question';

  @override
  String placementUnknownQuestionType(String type) {
    return 'Unknown question type: $type';
  }

  @override
  String placementOptionWithTextSemantic(String letter, String text) {
    return 'Option $letter: $text';
  }

  @override
  String placementOptionSemantic(String letter) {
    return 'Option $letter';
  }

  @override
  String get placementTrueOption => 'True';

  @override
  String get placementFalseOption => 'False';

  @override
  String get placementAnswerPlaceholder => 'Type your answer here…';

  @override
  String get placementYourAnswerSemantic => 'Your answer';

  @override
  String get placementAlmostDoneTitle => 'Almost done';

  @override
  String get placementSubmittingAnswersSemantic => 'Submitting your answers';

  @override
  String get placementRetryLabel => 'Retry';

  @override
  String placementAllSectionsCompleteWithCount(int count) {
    return 'All $count sections complete';
  }

  @override
  String get placementAllSectionsCompleteGeneric => 'All sections complete';

  @override
  String get placementSubmitBody =>
      'Submit your placement test to see your level and a personalised plan.';

  @override
  String get placementSubmitTestButton => 'Submit Placement Test';

  @override
  String placementSectionCounterTitle(int index, int total) {
    return 'Section $index of $total';
  }

  @override
  String placementSectionMetaLine(String category, int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count questions',
      one: '1 question',
    );
    return '$category · $_temp0 · about $minutes minutes';
  }

  @override
  String get placementBeginFinalSectionButton => 'Begin Final Section';

  @override
  String get placementBeginSectionButton => 'Begin Section';

  @override
  String placementSectionProgressSemantic(int index, int total) {
    return 'Section $index of $total';
  }

  @override
  String get placementCategoryLexis => 'Lexis';

  @override
  String get placementCategoryStructures => 'Structures';

  @override
  String get placementCategoryComprehension => 'Comprehension';

  @override
  String get placementCategoryAudio => 'Audio';

  @override
  String get placementCategoryGeneral => 'General';

  @override
  String get questionAnswerLoadingQuestionSemantic => 'Loading question';

  @override
  String get questionAnswerPracticeTitle => 'Practice';

  @override
  String get questionAnswerAnalysingSessionText =>
      'AIM is analysing your session…';

  @override
  String get questionAnswerSessionFeedbackSemantic =>
      'Session feedback from AIM';

  @override
  String get questionAnswerSessionSummaryTitle => 'Session Summary';

  @override
  String get questionAnswerQuestionsAttemptedLabel => 'Questions attempted';

  @override
  String get questionAnswerCorrectScoreLabel => 'Correct (backend score)';

  @override
  String get questionAnswerMasteryShiftLabel => 'Mastery shift';

  @override
  String get questionAnswerSkillsCoveredLabel => 'Skills covered';

  @override
  String get questionAnswerAnswerSubmittedSemantic => 'Answer submitted';

  @override
  String get questionAnswerAnswerSubmittedLabel => 'Answer submitted';

  @override
  String get questionAnswerAnalysingResponseText =>
      'AIM is analysing your response.';

  @override
  String get questionAnswerYourAnswerLabel => 'Your answer';

  @override
  String get questionAnswerAnswerHelperText =>
      'Type your response, then tap Continue to submit.';

  @override
  String get questionAnswerAnswerPlaceholder => 'Type your answer here';

  @override
  String get questionAnswerAnswerInputSemantic => 'Answer input field';

  @override
  String get billingSubscriptionTitle => 'Subscription';

  @override
  String get billingLoadingSubscriptionSemantic => 'Loading subscription data';

  @override
  String get billingLoadingPlansSemantic => 'Loading plans';

  @override
  String get billingWhatsIncludedTitle => 'WHAT\'S INCLUDED';

  @override
  String get billingNoEntitlementsYet => 'No entitlements yet.';

  @override
  String get billingInvoicesLabel => 'Invoices';

  @override
  String get billingChangePlanButton => 'Change plan';

  @override
  String get billingCancelSubscriptionButton => 'Cancel subscription';

  @override
  String get billingCancelDialogTitle => 'Cancel Subscription?';

  @override
  String get billingCancelDialogBody =>
      'Your subscription will remain active until the end of the current billing period.';

  @override
  String get billingKeepSubscriptionButton => 'Keep Subscription';

  @override
  String get billingCurrentPlanLabel => 'Current plan';

  @override
  String billingRenewsOnLabel(String date) {
    return 'Renews $date';
  }

  @override
  String billingCancelsOnLabel(String date) {
    return 'Cancels $date';
  }

  @override
  String get billingNoPlansTitle => 'No plans available';

  @override
  String get billingNoPlansSubtitle => 'Check back later for available plans.';

  @override
  String get billingPlansPricingTitle => 'Plans & Pricing';

  @override
  String billingUnlimitedFeatureLabel(String feature) {
    return '$feature unlimited';
  }

  @override
  String billingFeatureValueLabel(String feature, String value) {
    return '$feature: $value';
  }

  @override
  String get billingPopularBadge => 'Popular';

  @override
  String get billingSubscribeButton => 'Subscribe';

  @override
  String billingSubscribeToPlanSemantic(String planName) {
    return 'Subscribe to $planName';
  }

  @override
  String get billingInvoiceStatusPaid => 'Paid';

  @override
  String get billingInvoiceStatusPending => 'Pending';

  @override
  String get billingInvoiceStatusFailed => 'Failed';

  @override
  String get billingInvoiceStatusRefunded => 'Refunded';

  @override
  String get billingLoadingInvoicesSemantic => 'Loading invoices';

  @override
  String get billingNoInvoicesTitle => 'No Invoices Yet';

  @override
  String get billingNoInvoicesSubtitle =>
      'Your invoices will appear here after your first payment.';

  @override
  String get billingInvoiceDetailTitle => 'Invoice Detail';

  @override
  String billingQuantityLabel(int quantity) {
    return 'Qty: $quantity';
  }

  @override
  String get billingPaymentSuccessfulTitle => 'Payment successful!';

  @override
  String billingWelcomeToPlanBody(String planName) {
    return 'Welcome to $planName — all features are now unlocked.';
  }

  @override
  String get billingSubscriptionActiveBody =>
      'Your subscription is now active.';

  @override
  String get billingPaymentFailedTitle => 'Payment failed';

  @override
  String get billingPaymentFailedBody =>
      'Your payment could not be processed. Please try again.';

  @override
  String get billingRetryPaymentSemantic => 'Retry payment';

  @override
  String get billingGoBackButton => 'Go back';

  @override
  String get billingPaymentPendingTitle => 'Payment pending';

  @override
  String get billingPaymentPendingBody =>
      'Your payment is being processed. We\'ll notify you when it\'s complete.';

  @override
  String get billingCheckingStatusTitle => 'Checking payment status...';

  @override
  String get billingVerifyingPaymentBody =>
      'Please wait while we verify your payment.';

  @override
  String get billingGoToHomeButton => 'Go to Home';

  @override
  String get billingGoToHomeSemantic => 'Go to home';

  @override
  String get billingCheckoutTitle => 'Checkout';

  @override
  String get billingBillingIntervalLabel => 'Billing';

  @override
  String get billingTermsAgreementNotice =>
      'By continuing you agree to AIM\'s Terms of Service and authorise a recurring charge. Cancel anytime.';

  @override
  String get billingPromoCodeLabel => 'Promotion code (optional)';

  @override
  String get billingPromoCodePlaceholder => 'Enter code';

  @override
  String get billingCouldNotOpenPaymentPageError =>
      'Could not open the payment page. Please try again.';

  @override
  String get billingCheckoutFailedGeneric =>
      'Failed to start checkout. Please try again.';

  @override
  String get billingProceedToPaymentButton => 'Proceed to Payment';

  @override
  String get billingProceedToPaymentSemantic => 'Proceed to payment';

  @override
  String get profileLoadingSemantic => 'Loading profile';

  @override
  String profileLoadFailedError(String message) {
    return 'Could not load profile: $message';
  }

  @override
  String get profileNoProfileLoaded => 'No profile loaded.';

  @override
  String get profileAccountSectionTitle => 'ACCOUNT';

  @override
  String get profileProfileSectionTitle => 'PROFILE';

  @override
  String get profileRolesSectionTitle => 'ROLES';

  @override
  String get profileRolesSectionSubtitle =>
      'Displayed for reference only. Enforced by backend.';

  @override
  String get profileQuickLinksSectionTitle => 'QUICK LINKS';

  @override
  String get profileStatusLabel => 'Status';

  @override
  String get profileTypeLabel => 'Type';

  @override
  String get profileDisplayNameLabel => 'Display Name';

  @override
  String get profileLanguageLabel => 'Language';

  @override
  String get profileTimezoneLabel => 'Timezone';

  @override
  String get profileSubscriptionBillingLabel => 'Subscription & Billing';

  @override
  String get profileInvoiceHistoryLabel => 'Invoice History';

  @override
  String get profileAnalyticsSummaryLabel => 'Analytics Summary';

  @override
  String get profileApiEndpointTesterLabel => 'API Endpoint Tester (Dev)';

  @override
  String get profileEditProfileTitle => 'Edit profile';

  @override
  String get profileDayStreakLabel => 'day streak';

  @override
  String get profileAchievementsStatLabel => 'achievements';

  @override
  String get profileDisplayNameTooLongError =>
      'Display name must be 80 characters or fewer.';

  @override
  String get profileUpdatedSnackbar => 'Profile updated.';

  @override
  String get profileDisplayNameHint => 'Your display name';

  @override
  String get profileDisplayNameFieldSemantic => 'Display name field';

  @override
  String get profileEditPreferredLanguageLabel => 'Preferred Language';

  @override
  String get profileSelectLanguagePlaceholder => 'Select a language';

  @override
  String get profilePreferredLanguageFieldSemantic =>
      'Preferred language field';

  @override
  String get profileSelectTimezonePlaceholder => 'Select a timezone';

  @override
  String get profileTimezoneFieldSemantic => 'Timezone field';

  @override
  String get profileSaveChangesButton => 'Save changes';

  @override
  String get profileLanguageEnglishOption => 'English';

  @override
  String get profileLanguageArabicOption => 'Arabic';

  @override
  String get voiceTeacherTitle => 'Voice Teacher';

  @override
  String get voiceTeacherEntrySubtitle => 'Talk with your teacher using voice';

  @override
  String get voiceTeacherStartingSessionSemantic =>
      'Starting Voice Teacher session';

  @override
  String get voiceTeacherStatusReady => 'Ready';

  @override
  String get voiceTeacherStatusRecording => 'Recording';

  @override
  String get voiceTeacherStatusProcessing => 'Processing';

  @override
  String get voiceTeacherHeadingTapToSpeak => 'Tap to speak';

  @override
  String get voiceTeacherHeadingListening => 'Listening...';

  @override
  String get voiceTeacherHeadingProcessing => 'Processing...';

  @override
  String voiceTeacherStatusSemantic(String label) {
    return 'Status: $label';
  }

  @override
  String get voiceTeacherHeroSubtitle =>
      'Practise your pronunciation with the AI teacher';

  @override
  String get voiceTeacherTranscriptEmptyTitle =>
      'Start talking with your Voice Teacher';

  @override
  String get voiceTeacherTranscriptEmptySubtitle =>
      'Your transcript will appear here.';

  @override
  String get voiceTeacherPlayAudioTooltip => 'Play audio';

  @override
  String voiceTeacherTeacherSaidSemantic(String text) {
    return 'Voice Teacher said: $text';
  }

  @override
  String voiceTeacherYouSaidSemantic(String text) {
    return 'You said: $text';
  }

  @override
  String get voiceTeacherFeedbackThanks => 'Thanks!';

  @override
  String get voiceTeacherFeedbackSubmitted => 'Submitted';

  @override
  String get voiceTeacherFeedbackHelpful => 'Helpful';

  @override
  String get voiceTeacherFeedbackNotHelpful => 'Not helpful';

  @override
  String get voiceTeacherFeedbackCommentHint => 'Tell us more (optional)';

  @override
  String get voiceTeacherSpeakingLabel => 'Teacher speaking...';

  @override
  String get voiceTeacherThinkingLabel => 'Teacher thinking...';

  @override
  String get voiceTeacherReplayTooltip => 'Replay';

  @override
  String get voiceTeacherPlayTooltip => 'Play';

  @override
  String get voiceTeacherPauseTooltip => 'Pause';

  @override
  String get voiceTeacherResumeTooltip => 'Resume';

  @override
  String get voiceTeacherRetryTooltip => 'Retry';

  @override
  String get voiceTeacherPlaybackFailedLabel => 'Playback failed';

  @override
  String get voiceTeacherErrorTitleNetwork => 'Connection Error';

  @override
  String get voiceTeacherErrorTitleMicrophone => 'Microphone Error';

  @override
  String get voiceTeacherErrorTitleServer => 'Server Error';

  @override
  String get voiceTeacherErrorTitleUnknown => 'Something Went Wrong';

  @override
  String get voiceTeacherErrorMessageNetwork =>
      'Check your internet connection and try again';

  @override
  String get voiceTeacherErrorMessageMicrophone =>
      'Could not access the microphone. Check permissions';

  @override
  String get voiceTeacherErrorMessageServer =>
      'Server is currently unavailable. Try again later';

  @override
  String get voiceTeacherErrorMessageUnknown =>
      'An unexpected error occurred. Please try again';

  @override
  String get voiceTeacherTeacherResponseTextLabel => 'Teacher response (text):';

  @override
  String get voiceTeacherMicPermissionTitle =>
      'Voice Teacher needs microphone access';

  @override
  String get voiceTeacherMicPermissionBody =>
      'Please allow microphone access to talk with the teacher';

  @override
  String get voiceTeacherOpenSettingsButton => 'Open Settings';

  @override
  String get voiceTeacherAllowMicrophoneButton => 'Allow Microphone';

  @override
  String get voiceTeacherTranscribingLabel => 'Transcribing...';

  @override
  String get voiceTeacherWhatYouSaidLabel => 'What you said';

  @override
  String get voiceTeacherResponseLabel => 'Teacher response';

  @override
  String get voiceTeacherStopLabel => 'Stop';

  @override
  String get voiceTeacherRecordedLabel => 'Recorded';

  @override
  String get voiceTeacherDiscardLabel => 'Discard';

  @override
  String get voiceTeacherSendLabel => 'Send';

  @override
  String get voiceTeacherTextResponseLabel => 'Text response from teacher';

  @override
  String get voiceTeacherAudioUnavailableLabel =>
      'Audio unavailable — here\'s the text response';

  @override
  String get voiceTeacherRetryAudioLabel => 'Retry audio';

  @override
  String get aiTeacherName => 'AI Teacher';

  @override
  String get aiTeacherHeaderSubtitle => 'Always here to help';

  @override
  String get aiTeacherEntrySubtitle =>
      'Ask questions and get guidance on this lesson.';

  @override
  String get aiTeacherOpenSemantic => 'Open AI Teacher';

  @override
  String get aiTeacherLoadingChatSemantic => 'Loading AI Teacher chat';

  @override
  String get aiTeacherHistorySemantic => 'Conversation history';

  @override
  String get aiTeacherAskAnythingTitle => 'Ask AI Teacher anything';

  @override
  String get aiTeacherAskAnythingSubtitle =>
      'Start the conversation by sending a message.';

  @override
  String get aiTeacherConversationsTitle => 'Conversations';

  @override
  String get aiTeacherLoadingConversationsSemantic =>
      'Loading AI Teacher conversations';

  @override
  String get aiTeacherNoConversationsTitle => 'No conversations yet';

  @override
  String get aiTeacherNoConversationsSubtitle =>
      'Start chatting with AI Teacher to see your history here.';

  @override
  String get aiTeacherSessionActiveLabel => 'Active';

  @override
  String get aiTeacherSessionEndedLabel => 'Ended';

  @override
  String aiTeacherSessionSemantic(String title, String status) {
    return '$title, $status';
  }

  @override
  String get aiTeacherSettingsTitle => 'AI Teacher settings';

  @override
  String get aiTeacherPreferTextSettingSemantic =>
      'Prefer text replies setting';

  @override
  String get aiTeacherPreferTextLabel => 'Prefer text replies over voice';

  @override
  String get aiTeacherReducedMotionSettingSemantic => 'Reduced motion setting';

  @override
  String get aiTeacherReducedMotionLabel =>
      'Reduce animations in AI Teacher and Voice Tutor';

  @override
  String get aiTeacherSettingsInfoBannerSemantic =>
      'AI Teacher settings info banner';

  @override
  String get aiTeacherSettingsInfoTitle => 'About these settings';

  @override
  String get aiTeacherSettingsInfoBody =>
      'These preferences only change how replies are shown on this device. They never change how the AI Teacher is taught, filtered, or graded, and never affect your learning progress or backend-generated suggestions — those stay fully backend-controlled.';

  @override
  String get aiTeacherChatErrorMessage =>
      'AI Teacher is temporarily unavailable. Your progress is safe, and you can try again.';

  @override
  String get aiTeacherRetryChatLabel => 'Retry chat';

  @override
  String get aiTeacherChatErrorSemantic => 'AI Teacher chat error';

  @override
  String get aiTeacherMessageInputSemantic => 'AI Teacher message input';

  @override
  String get aiTeacherInputHint => 'Ask me anything...';

  @override
  String get aiTeacherVoiceInputComingSoonSemantic =>
      'Voice input (coming soon)';

  @override
  String get aiTeacherSendMessageSemantic => 'Send message';

  @override
  String aiTeacherYourMessageSemantic(String text) {
    return 'Your message: $text';
  }

  @override
  String aiTeacherReplySemantic(String text) {
    return 'AI Teacher: $text';
  }

  @override
  String aiTeacherRepliedSemantic(String text) {
    return 'AI Teacher is replying: $text';
  }

  @override
  String get aiTeacherCurrentLessonLabel => 'Current lesson';

  @override
  String aiTeacherLessonContextSemantic(String lessonTitle) {
    return 'AI Teacher lesson context: $lessonTitle';
  }

  @override
  String get aiTeacherWasHelpfulLabel => 'Was this helpful?';

  @override
  String get aiTeacherMarkHelpfulSemantic => 'Mark AI Teacher reply as helpful';

  @override
  String get aiTeacherMarkNotHelpfulSemantic =>
      'Mark AI Teacher reply as not helpful';

  @override
  String get aiTeacherSafetyLimitedTitle => 'AI Teacher is limited right now';

  @override
  String get aiTeacherSafetyLimitedBannerSemantic =>
      'AI Teacher safety limited banner';

  @override
  String get aiTeacherSafetyLimitedBody =>
      'Some responses in this conversation were held back to keep things safe. You can keep chatting, or start a new conversation.';

  @override
  String get aiTeacherTypingSemantic => 'AI Teacher is typing';

  @override
  String aiTeacherSuggestedPromptSemantic(String prompt) {
    return 'Suggested prompt: $prompt';
  }

  @override
  String get aiTeacherPromptExplainGrammar => 'Explain grammar';

  @override
  String get aiTeacherPromptQuickQuiz => 'Quick quiz';

  @override
  String get aiTeacherPromptCheckWriting => 'Check my writing';

  @override
  String get aiTeacherPromptGiveExample => 'Give an example';

  @override
  String get aiTeacherPromptPracticeSpeaking => 'Practice speaking';

  @override
  String get supportCategoryLabel => 'Category';

  @override
  String get supportCategoryGeneral => 'General';

  @override
  String get supportCategoryFeatureRequest => 'Feature request';

  @override
  String get supportCategoryBugReport => 'Bug report';

  @override
  String get supportCategoryContent => 'Content';

  @override
  String get supportCategoryUserExperience => 'User experience';

  @override
  String get supportRateAimQuestion => 'How would you rate AIM?';

  @override
  String supportRateStarsSemantic(int value) {
    return 'Rate $value out of 5';
  }

  @override
  String get supportTitleLabel => 'Title';

  @override
  String get supportTitlePlaceholder => 'A short summary';

  @override
  String get supportFeedbackLabel => 'Your feedback';

  @override
  String get supportFeedbackPlaceholder => 'Tell us what you think...';

  @override
  String get supportSubmitFeedbackSemantic => 'Submit feedback';

  @override
  String get supportFeedbackSubmitUnavailable =>
      'Feedback submission is not available yet. Please try again later.';

  @override
  String get supportTitleRequired => 'Title is required';

  @override
  String get supportFeedbackDetailsRequired => 'Feedback details are required';

  @override
  String get supportSendFeedbackTitle => 'Send feedback';

  @override
  String get supportHelpCenterTitle => 'Help Center';

  @override
  String get supportCategoryLessonsContent => 'Lessons & Content';

  @override
  String get supportCategoryAssessmentsGrades => 'Assessments & Grades';

  @override
  String get supportCategoryAccountProfile => 'Account & Profile';

  @override
  String get supportCategoryBillingSubscription => 'Billing & Subscription';

  @override
  String get supportCategoryTechnicalIssues => 'Technical Issues';

  @override
  String get supportCategoryGeneralHelp => 'General Help';

  @override
  String get supportCreateTicketButton => 'Create Ticket';

  @override
  String get supportCreateTicketSemantic => 'Create a support ticket';

  @override
  String get supportParentHelpTitle => 'Parent Help';

  @override
  String get supportCategoryStudentProgress => 'Student Progress';

  @override
  String get supportCategoryCoursesContent => 'Courses & Content';

  @override
  String get supportCategoryBillingPayments => 'Billing & Payments';

  @override
  String get supportCategoryAccountManagement => 'Account Management';

  @override
  String get supportCategoryPrivacySafety => 'Privacy & Safety';

  @override
  String get supportReleaseNoteTitle => 'Release note';

  @override
  String get supportReleaseNoteUnavailableTitle =>
      'Release note is not available yet';

  @override
  String get supportReleaseNoteUnavailableSubtitle =>
      'This release note will appear here once release notes are live.';

  @override
  String supportReleasedOnLabel(String date) {
    return 'Released $date';
  }

  @override
  String get supportSystemStatusTitle => 'System Status';

  @override
  String get supportStatusUnavailableTitle => 'Status is not available yet';

  @override
  String get supportStatusUnavailableSubtitle =>
      'Live system status will appear here once status tracking is live.';

  @override
  String get supportReleaseNotesTitle => 'Release notes';

  @override
  String get supportWhatsNewSubtitle => 'What\'s new in AIM';

  @override
  String get supportReleaseNotesCardSemantic =>
      'Release notes, what\'s new in AIM';

  @override
  String get supportStatusOperational => 'Operational';

  @override
  String get supportStatusDegraded => 'Degraded';

  @override
  String get supportStatusPartialOutage => 'Partial Outage';

  @override
  String get supportStatusMajorOutage => 'Major Outage';

  @override
  String get supportStatusMaintenanceLabel => 'Maintenance';

  @override
  String get supportStatusInProgressLabel => 'In Progress';

  @override
  String get supportStatusScheduledLabel => 'Scheduled';

  @override
  String get supportStatusOpenLabel => 'Open';

  @override
  String get supportStatusResolvedLabel => 'Resolved';

  @override
  String get supportStatusClosedLabel => 'Closed';

  @override
  String get supportAllSystemsOperationalTitle => 'All Systems Operational';

  @override
  String get supportMyTicketsTitle => 'My tickets';

  @override
  String supportTicketTileSemantic(String subject, String status) {
    return '$subject, $status';
  }

  @override
  String get supportNoTicketsTitle => 'No Tickets Yet';

  @override
  String get supportNoTicketsSubtitle =>
      'Create a ticket to get help from our support team.';

  @override
  String get supportParentTicketsTitle => 'Parent tickets';

  @override
  String get supportNoParentTicketsTitle => 'No Support Tickets';

  @override
  String get supportNoParentTicketsSubtitle =>
      'Create a ticket if you need help with your account.';

  @override
  String get supportTicketDetailTitle => 'Ticket';

  @override
  String get supportTicketDetailUnavailableTitle =>
      'Ticket details are not available yet';

  @override
  String supportTicketDetailUnavailableSubtitle(String ticketId) {
    return 'Ticket #$ticketId will appear here once support ticket tracking is live.';
  }

  @override
  String get supportNoReleaseNotesTitle => 'No Release Notes';

  @override
  String get supportNoReleaseNotesSubtitle =>
      'Release notes will appear here when published.';

  @override
  String supportReleaseNoteTileSemantic(
      String version, String title, String date) {
    return '$version, $title, $date';
  }

  @override
  String get supportSeverityLabel => 'Severity';

  @override
  String get supportSeverityLow => 'Low';

  @override
  String get supportSeverityMedium => 'Medium';

  @override
  String get supportSeverityHigh => 'High';

  @override
  String get supportSeverityCritical => 'Critical';

  @override
  String get supportCategoryTechnicalIssue => 'Technical Issue';

  @override
  String get supportCategoryBilling => 'Billing';

  @override
  String get supportCategoryAccount => 'Account';

  @override
  String get supportCategoryFeedback => 'Feedback';

  @override
  String get supportSubjectLabel => 'Subject';

  @override
  String get supportSubjectPlaceholder => 'Briefly describe the issue';

  @override
  String get supportDescriptionLabel => 'Description';

  @override
  String get supportDescriptionPlaceholder =>
      'Tell us what happened, step by step...';

  @override
  String get supportSubmitTicketButton => 'Submit Ticket';

  @override
  String get supportSubmitTicketSemantic => 'Submit ticket';

  @override
  String get supportSubjectRequired => 'Subject is required';

  @override
  String get supportDescriptionRequired => 'Description is required';

  @override
  String get supportTicketSubmitUnavailable =>
      'Ticket submission is not available yet. Please try again later.';

  @override
  String get supportNewTicketTitle => 'New ticket';
}
