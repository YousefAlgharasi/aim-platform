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
}
