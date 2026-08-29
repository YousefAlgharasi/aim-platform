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
  String get commonResume => 'Resume';

  @override
  String get commonPause => 'Pause';

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
  String get authAlreadyHaveAccount => 'Already have an account? Sign in';

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
  String get shellNavHome => 'Home Feed';

  @override
  String get shellNavHomeSemantic => 'Home tab';

  @override
  String get shellNavLearn => 'Chapters & Course';

  @override
  String get shellNavLearnSemantic => 'Learn tab';

  @override
  String get shellNavReview => 'Review';

  @override
  String get shellNavReviewSemantic => 'Review tab';

  @override
  String get shellNavProgress => 'Analytics & Progress';

  @override
  String get shellNavProgressSemantic => 'Progress tab';

  @override
  String get drawerLogOut => 'Log Out';

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
  String get shellPlacementTest => 'Placement Test';

  @override
  String get shellAssessments => 'Assessments';

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
  String get shellLanguageEnglish => 'English';

  @override
  String get shellLanguageArabic => 'العربية';

  @override
  String shellLanguageSemantic(String language) {
    return '$language language';
  }

  @override
  String get onboardingBrandName => 'AIM';

  @override
  String get onboardingTagline => 'Academy of Intelligent Minds';

  @override
  String get onboardingTapToContinue => 'Tap to continue';

  @override
  String get onboardingWalkthroughWelcomeTitle => 'Welcome to AIM';

  @override
  String get onboardingWalkthroughWelcomeBody =>
      'Your adaptive English learning companion. Let\'s take a quick look around.';

  @override
  String get onboardingWalkthroughPlacementTitle => 'Find your level';

  @override
  String get onboardingWalkthroughPlacementBody =>
      'Take the Placement Test from the menu to get lessons matched to your real level.';

  @override
  String get onboardingWalkthroughLessonsTitle => 'Learn at your pace';

  @override
  String get onboardingWalkthroughLessonsBody =>
      'Browse courses and lessons in the Learn tab — each one unlocks as you make progress.';

  @override
  String get onboardingWalkthroughStreakTitle => 'Keep your streak going';

  @override
  String get onboardingWalkthroughStreakBody =>
      'Practice a little every day — your Home screen tracks your streak and progress.';

  @override
  String get onboardingWalkthroughSkip => 'Skip';

  @override
  String get onboardingWalkthroughNext => 'Next';

  @override
  String get onboardingWalkthroughGetStarted => 'Get Started';

  @override
  String get homeLoadingSemantic => 'Loading home data';

  @override
  String get homeLastUpdatedJustNow => 'Updated just now';

  @override
  String homeLastUpdatedMinutesAgo(int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      minutes,
      locale: localeName,
      other: '$minutes minutes ago',
      one: '1 minute ago',
    );
    return 'Updated $_temp0';
  }

  @override
  String homeLastUpdatedHoursAgo(int hours) {
    String _temp0 = intl.Intl.pluralLogic(
      hours,
      locale: localeName,
      other: '$hours hours ago',
      one: '1 hour ago',
    );
    return 'Updated $_temp0';
  }

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
  String get homeCoursePathChapterQuizLabel => 'Quiz';

  @override
  String get homeCoursePathFinalExamLabel => 'Final Exam';

  @override
  String get homeCoursePathCompletedSubtitle => 'Course complete';

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
  String get lessonsCourseLockedMessage =>
      'Finish your current level to unlock this course';

  @override
  String get lessonsCourseLockedSemantic => 'Locked';

  @override
  String lessonsLevelBadge(String level) {
    return 'Level $level';
  }

  @override
  String get lessonsCoursesSubtitle => 'Level up your English, step by step';

  @override
  String get lessonsCurrentCourseBadge => 'Current';

  @override
  String get lessonsStartCourseDialogTitle => 'Start this course?';

  @override
  String lessonsStartCourseDialogMessage(String courseTitle) {
    return '$courseTitle will become your active course.';
  }

  @override
  String lessonsSwitchCourseDialogMessage(
      String currentCourseTitle, String courseTitle) {
    return 'You\'re currently in $currentCourseTitle. Switching to $courseTitle will make it your active course instead.';
  }

  @override
  String get lessonsStartCourseConfirmButton => 'Start course';

  @override
  String get lessonsStartCourseCancelButton => 'Cancel';

  @override
  String get lessonsStartCourseFailedMessage =>
      'Couldn\'t start this course. Please check your connection and try again.';

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
  String lessonsQuizzesCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count quizzes',
      one: '1 quiz',
    );
    return '$_temp0';
  }

  @override
  String lessonsExamsCountLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count exams',
      one: '1 exam',
    );
    return '$_temp0';
  }

  @override
  String get lessonsFinalExamTitle => 'Final Exam';

  @override
  String get lessonsFinalExamLockedSubtitle =>
      'Complete every chapter to unlock';

  @override
  String get lessonsQuizRowLabel => 'Quiz';

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
  String get lessonsPracticeQuestionsButton => 'Practice questions';

  @override
  String get lessonsPracticeLockedHint =>
      'Finish the lesson with your AI teacher first to unlock practice.';

  @override
  String get practiceNextQuestionButton => 'Next question';

  @override
  String get practiceSessionLoadingSemantic => 'Starting practice session';

  @override
  String get practiceSessionFailedMessage =>
      'Could not start the practice session';

  @override
  String get practiceSessionEmptyTitle => 'No questions yet';

  @override
  String get practiceSessionEmptySubtitle =>
      'This lesson has no practice questions yet. Check back soon.';

  @override
  String get practiceSessionCompleteTitle => 'Practice complete!';

  @override
  String get practiceSessionDoneButton => 'Done';

  @override
  String practiceSessionCompleteSubtitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'You answered $count questions. AIM is analysing your responses.',
      one: 'You answered 1 question. AIM is analysing your responses.',
    );
    return '$_temp0';
  }

  @override
  String get practiceSessionCompletionNotSavedMessage =>
      'We couldn\'t save your progress. The next lesson may stay locked until this is saved — check your connection and try again.';

  @override
  String get practiceSessionRetrySaveButton => 'Retry saving progress';

  @override
  String get authFullNameLabel => 'Full name';

  @override
  String get authWelcomeSubtitle =>
      'We are happy to see you here again. Enter your email address and password';

  @override
  String get authPasswordResetComingSoon => 'Password reset — coming soon';

  @override
  String get authRegisterSubtitle =>
      'Create your account, it takes less than a minute. Enter your email and password';

  @override
  String get authOrConnector => 'or';

  @override
  String get placementGateAiAdaptive => 'AI Adaptive';

  @override
  String get placementGateRetention => '94% retention';

  @override
  String get placementGateVisionTitle =>
      'Your personal AI\nTutor, built for you.';

  @override
  String get placementGateVisionSubtitle =>
      'Adaptive AI learning paths that evolve with your progress — lessons, quizzes, and mentorship shaped around you.';

  @override
  String get placementGateFocusTitle => 'What is your\nprimary focus?';

  @override
  String get placementGateFocusSubtitle =>
      'Select the goal that matches your current target.';

  @override
  String get placementGateFocusCareer => 'Career & Work';

  @override
  String get placementGateFocusExams => 'Exams & School';

  @override
  String get placementGateFocusSpeaking => 'Real-life Speaking';

  @override
  String get placementGateFocusMedia => 'Media & Culture';

  @override
  String get placementGateHabitTitle => 'Set your daily goal';

  @override
  String get placementGateHabitSubtitle =>
      'How much time will you commit to learning each day?';

  @override
  String get placementGateHabit5Min => '5 mins / day';

  @override
  String get placementGateHabit5MinSub =>
      'Light — great for staying consistent';

  @override
  String get placementGateHabit15Min => '15 mins / day';

  @override
  String get placementGateHabit15MinSub =>
      'Balanced — recommended for most learners';

  @override
  String get placementGateHabit30Min => '30 mins / day';

  @override
  String get placementGateHabit30MinSub =>
      'Intensive — fastest path to fluency';

  @override
  String get placementGateStartTitle => 'How would you\nlike to start?';

  @override
  String get placementGateStartSubtitle =>
      'Choose carefully! The placement test can only be taken once to accurately calibrate your AI tutor.';

  @override
  String get placementGateStartFromZeroTitle => 'Start from Zero';

  @override
  String get placementGateStartFromZeroSub =>
      'Skip the test and start from the absolute basics.';

  @override
  String get placementGateTestKnowledgeTitle => 'Test My Knowledge';

  @override
  String get placementGateTestKnowledgeSub =>
      'Test your skills to let the AI find your level.';

  @override
  String placementGateStepLabel(int current, int total) {
    return 'Step $current of $total';
  }

  @override
  String get placementGateFocusCareerSub =>
      'Professional vocabulary & business English';

  @override
  String get placementGateFocusExamsSub => 'IELTS, TOEFL, and academic prep';

  @override
  String get placementGateFocusSpeakingSub =>
      'Fluency in everyday conversations';

  @override
  String get placementGateFocusMediaSub => 'Movies, podcasts, and casual slang';

  @override
  String get placementGateRecommendedBadge => 'Recommended';

  @override
  String get placementIntroSectionsLabel => 'Sections';

  @override
  String placementIntroSectionsValue(int count) {
    return '$count sections';
  }

  @override
  String get placementIntroEstimatedTimeLabel => 'Estimated time';

  @override
  String placementIntroEstimatedTimeValue(int minutes) {
    return '~$minutes min';
  }

  @override
  String get placementIntroNote =>
      'Your level is determined by the backend after completion. Results are never calculated on your device.';

  @override
  String get placementIntroTitle => 'General English Placement';

  @override
  String get placementIntroSubtitle =>
      'A quick check to find your starting level.';

  @override
  String get placementMenuRetakeTitle => 'Retake the placement test?';

  @override
  String get placementMenuRetakeMessage =>
      'Your current result will stay on record, but a new attempt will replace it as your latest placement result.';

  @override
  String get placementMenuRetakeButton => 'Retake';

  @override
  String get placementMenuCheckingStatusSemantic =>
      'Checking placement test status';

  @override
  String get placementMenuLevelBeginner => 'Beginner';

  @override
  String get placementMenuLevelElementary => 'Elementary';

  @override
  String get placementMenuLevelIntermediate => 'Intermediate';

  @override
  String get placementMenuLevelUpperIntermediate => 'Upper Intermediate';

  @override
  String get placementMenuLevelAdvanced => 'Advanced';

  @override
  String get placementStartLoadingGuidelines =>
      'Loading placement test guidelines';

  @override
  String get placementStartStartingTest => 'Starting placement test';

  @override
  String get placementStartTestOverview => 'Test Overview';

  @override
  String get placementStartAssessmentTitle => 'Level Assessment';

  @override
  String get placementStartAssessmentSubtitle =>
      'Calibrate your AI tutor to find your optimal starting point.';

  @override
  String placementStartLimitTitle(int minutes) {
    return '$minutes Minutes';
  }

  @override
  String get placementStartLimitDesc =>
      'Estimated duration for a full calibrated assessment.';

  @override
  String placementStartQuestionsTitle(int count) {
    return '$count Adaptive Questions';
  }

  @override
  String get placementStartQuestionsDesc =>
      'Questions dynamically adapt to your skill level.';

  @override
  String get placementStartCalibrationTitle => 'Helpful Tip';

  @override
  String get placementStartCalibrationDesc =>
      'If you don\'t know an answer, it is okay to skip and let the AI adjust.';

  @override
  String get placementQuestionDefaultTitle => 'Placement Question';

  @override
  String placementSectionHeaderTitle(int index, int total) {
    return 'Section $index of $total';
  }

  @override
  String get placementResultLoadingSemantic => 'Loading your result';

  @override
  String get placementResultScoringTitle => 'Scoring in progress…';

  @override
  String get placementResultScoringSubtitle =>
      'The backend is evaluating your answers.';

  @override
  String get placementResultScoringSemantic => 'Scoring in progress';

  @override
  String get placementSubmitSuccessfulTitle => 'Submission Successful';

  @override
  String get placementSubmitEvaluatingMessage =>
      'Your responses have been uploaded. The AI engine is calibrating your level.';

  @override
  String get placementResultGreatJob => 'Great Job! 🎉';

  @override
  String get placementResultDetectedSubtitle =>
      'Strong listening and grammar skills detected. Start here for the best experience.';

  @override
  String get placementResultStartFromZeroTitle => 'Start from zero (A1)';

  @override
  String get placementResultStartFromZeroSubtitle =>
      'Build your foundation from scratch.';

  @override
  String placementResultStartFromLevelTitle(String level) {
    return 'Start from level ($level)';
  }

  @override
  String get placementResultStartFromLevelSubtitle =>
      'Jump straight to advanced tracks';

  @override
  String get placementResultSelectPlan => 'Select your plan';

  @override
  String get placementResultFreePlan => 'Free plan';

  @override
  String get placementResultFreePlanSub => 'Standard lessons, daily limits';

  @override
  String get placementResultPlusPlan => 'AIM plus';

  @override
  String get placementResultPlusPlanSub =>
      'Unlimited AI tutor, advanced tracks';

  @override
  String get placementResultUnlockCourse => 'Unlock My Course';

  @override
  String get placementMenuHeaderTitle => 'Placement Test';

  @override
  String get placementMenuNotTakenTitle =>
      'You haven\'t taken the placement test yet';

  @override
  String get placementMenuNotTakenSub =>
      'A short adaptive test places you at the right level so every lesson fits you.';

  @override
  String get placementMenuTakeTestBtn => 'Take the Placement Test';

  @override
  String get placementMenuInScoringTitle =>
      'Your placement test is being scored';

  @override
  String get placementMenuInProgressTitle =>
      'You have a placement test in progress';

  @override
  String get placementMenuInScoringSub =>
      'This usually only takes a moment. Check again shortly.';

  @override
  String get placementMenuInProgressSub =>
      'Pick up your placement test, or start over — your progress in this attempt is not saved section by section.';

  @override
  String get placementMenuCheckAgainBtn => 'Check Again';

  @override
  String get placementMenuContinueBtn => 'Continue Placement Test';

  @override
  String get placementMenuYourLevelLabel => 'YOUR LEVEL';

  @override
  String placementMenuScoreSummary(String displayName, int score) {
    return '$displayName · Total score $score / 100';
  }

  @override
  String get placementMenuViewFullResult => 'View Full Result';

  @override
  String get placementSectionBeginFinal => 'Begin Final Section';

  @override
  String get placementSectionBegin => 'Begin Section';

  @override
  String placementSectionQuestionsCount(int count) {
    return '$count questions';
  }

  @override
  String placementSectionAboutMinutes(int minutes) {
    return 'about $minutes minutes';
  }

  @override
  String placementSectionProgressSemantic(int current, int total) {
    return 'Section $current of $total';
  }

  @override
  String get placementStartHonorCodeAgreement =>
      'By starting, you agree to our Assessment Honor Code';

  @override
  String get placementStartBtnLabel => 'Start Assessment';

  @override
  String get placementSubmitCompletedQuestions => 'Completed Questions';

  @override
  String get placementSubmitSkippedQuestions => 'Skipped Questions';

  @override
  String get placementSubmitAnalyzingAnswers => 'Analyzing your answers';

  @override
  String get placementSubmitCalibratingBody =>
      'Our AI is calibrating your optimal starting level to ensure your learning path is perfectly paced.';

  @override
  String get placementQuestionLoadingSemantic => 'Loading question';

  @override
  String get placementQuestionTimerExpiredError =>
      'Time is up — this attempt has been submitted.';

  @override
  String get placementQuestionSubmitSpeakingError =>
      'Failed to submit speaking response. Please try again.';

  @override
  String get placementQuestionSubmitAnswerError =>
      'Failed to submit answer. Please try again.';

  @override
  String get homeDailyMissionsTitle => 'Daily Missions';

  @override
  String homeMissionsResetIn(int hours) {
    return 'Reset in ${hours}h';
  }

  @override
  String get homeNextUp => 'NEXT UP';

  @override
  String get homeOverallProgress => 'Overall Progress';

  @override
  String homeStreakDaysText(int days) {
    return '$days Days';
  }

  @override
  String get settingsTitle => 'Account Settings';

  @override
  String get settingsSaveSuccess => 'Profile Saved successfully!';

  @override
  String get settingsPasswordSuccess => 'Password Updated successfully!';

  @override
  String get settingsLogoutTitle => 'Confirm Logout';

  @override
  String get settingsLogoutMessage =>
      'Are you sure you want to log out of your AIM account?';

  @override
  String get settingsFullName => 'Full Name';

  @override
  String get settingsEmailAddress => 'Email Address';

  @override
  String get settingsVerifiedEmail => 'Verified Email';

  @override
  String get settingsDailyCommitment => 'Daily Learning Commitment';

  @override
  String get settingsCommitmentCasual => '5 Mins/Day (Casual)';

  @override
  String get settingsCommitmentRecommended => '15 Mins/Day (Recommended)';

  @override
  String get settingsCommitmentIntensive => '30 Mins/Day (Intensive)';

  @override
  String get settingsSaveButton => 'Save Profile Changes';

  @override
  String get settingsSavingButton => 'Saving Changes...';

  @override
  String get settingsAppThemeHeader => 'APP THEME & DISPLAY';

  @override
  String get settingsThemeDark => 'Dark Theme';

  @override
  String get settingsThemeLight => 'Light Theme';

  @override
  String get settingsThemeSubtitle =>
      'Toggle to switch between light and dark backgrounds';

  @override
  String get settingsNotificationsHeader => 'NOTIFICATION PREFERENCES';

  @override
  String get settingsReminders => 'Daily Study Reminders';

  @override
  String get settingsRemindersSubtitle =>
      'Keep your learning streak active with daily push notices';

  @override
  String get settingsDiagnostics => 'Weakness Diagnostic Alerts';

  @override
  String get settingsDiagnosticsSubtitle =>
      'Get notified when AIM engine detects a gap to review';

  @override
  String get settingsSecurityHeader => 'SECURITY & PASSWORD';

  @override
  String get settingsCurrentPassword => 'Current Password';

  @override
  String get settingsNewPassword => 'New Password';

  @override
  String get settingsUpdatePassword => 'Update Password';

  @override
  String get settingsUpdatingPassword => 'Updating...';

  @override
  String get settingsLogoutButton => 'Log Out of AIM Account';

  @override
  String get voiceAiTitle => 'LIVE VOICE AI';

  @override
  String voiceAiStep(int current) {
    return 'Step $current/3';
  }

  @override
  String voiceAiAudio(String time) {
    return 'Audio $time';
  }

  @override
  String get voiceAiStatusAiSpeaking => 'AI Tutor Speaking...';

  @override
  String voiceAiStatusListening(String secs) {
    return 'Listening to your voice (00:$secs)';
  }

  @override
  String get voiceAiStatusEvaluating => 'AI Evaluating Pronunciation...';

  @override
  String get voiceAiFinishHint => 'Tap mic when finished speaking';

  @override
  String get voiceAiStartHint => 'Tap mic to interrupt or speak';

  @override
  String get voiceAiCompletedBadge => 'LIVE VOICE SESSION COMPLETED!';

  @override
  String get voiceAiMasteredTitle => 'Lesson Mastered!';

  @override
  String voiceAiCompletedSubtitle(String title) {
    return 'You completed the live AI voice lesson for \"$title\".';
  }

  @override
  String get voiceAiXpEarned => 'XP EARNED';

  @override
  String get voiceAiAccuracy => 'VOICE ACCURACY';

  @override
  String get voiceAiAccuracyScore => '98% Score';

  @override
  String get voiceAiReturnButton => 'Return to Lesson Detail';

  @override
  String get lessonsCourseOverviewHeader => 'COURSE OVERVIEW';

  @override
  String get lessonsCourseProgressHeader => 'Course Progress';

  @override
  String get lessonsCourseChaptersHeader => 'Course Chapters';

  @override
  String get lessonsNextUpLockedCourse => 'NEXT UP · LOCKED COURSE';

  @override
  String get lessonsNextCourseLevel => 'Next Course Level';

  @override
  String get lessonsUnlockCourseCondition =>
      'Unlocks automatically once you complete all chapters in this course.';

  @override
  String lessonsUnlockNextCourseCondition(String activeCourse) {
    return 'Unlocks automatically once you complete all chapters in $activeCourse.';
  }

  @override
  String get lessonsLearningPathHeader => 'LEARNING PATH';

  @override
  String get lessonsStructuredCurriculumHeader => 'Structured Curriculum';

  @override
  String get lessonsPersonalizedSequenceSubtitle =>
      'Follow your personalized sequence from CEFR Starter to Advanced mastery.';

  @override
  String get lessonsKeyVocabularyHeader => 'Key Vocabulary & Phrases';

  @override
  String get lessonsTapToListenHeader => 'TAP 🔊 TO LISTEN';

  @override
  String get lessonsAskAiTutorHeader => 'Ask AI Tutor';

  @override
  String get lessonsAskAiTutorSubtitle =>
      'Chat with your AI tutor to clarify rules or ask questions.';

  @override
  String get lessonsPracticeNowHeader => 'Practice Now';

  @override
  String get lessonsPracticeNowSubtitle =>
      'Reinforce your knowledge or practice with quick exercises.';

  @override
  String get lessonsQuizHeader => 'QUIZ';

  @override
  String get lessonsQuizSubtitle =>
      'Test your comprehension with quick interactive exercises.';

  @override
  String get lessonsLessonMasteredTitle => 'Lesson Mastered! 🌟';

  @override
  String get lessonsLessonMasteredSnackbar => 'Lesson marked as completed! 🌟';

  @override
  String lessonsMarkCompleteFailed(String error) {
    return 'Could not mark lesson complete: $error';
  }

  @override
  String get lessonsInThisChapterHeader => 'LESSONS IN THIS CHAPTER';

  @override
  String get lessonsChapterQuizHeader => 'CHAPTER QUIZ';

  @override
  String get lessonsPassedStatus => 'PASSED';

  @override
  String get lessonsLockedStatus => 'LOCKED';

  @override
  String lessonsTotalLessonsCount(int chaptersCount, int totalLessons) {
    return '$chaptersCount chapters · $totalLessons Total Lessons';
  }

  @override
  String get progressTitle => 'Progress & Analytics';

  @override
  String get progressSubtitle =>
      'Track your language proficiency and study stats';

  @override
  String get progressWeeklyActivity => 'Weekly Activity';

  @override
  String progressDailyAverageMins(int minutes) {
    return '$minutes mins / day average';
  }

  @override
  String progressTotalMins(int minutes) {
    return '$minutes mins total';
  }

  @override
  String progressTrackedSkillsHeader(int count) {
    return 'TRACKED SKILLS ($count)';
  }

  @override
  String progressReviewScheduleHeader(int count) {
    return 'REVIEW SCHEDULE ($count)';
  }

  @override
  String progressWeaknessRecordsHeader(int count) {
    return 'WEAKNESS RECORDS ($count)';
  }

  @override
  String get progressWeakSpotIdentified =>
      'Identified weak spot from recent responses.';

  @override
  String get progressNoWeaknesses =>
      'No active weaknesses recorded! Great work!';

  @override
  String get progressViewAll => 'View All →';

  @override
  String get progressViewFullSchedule => 'View Full Schedule →';

  @override
  String get progressViewFullTable => 'View Full Table →';

  @override
  String progressPriorityLabel(String severity) {
    return '$severity Priority';
  }

  @override
  String progressIntervalAndRep(int interval, int rep) {
    return 'Interval: ${interval}d · Rep #$rep';
  }

  @override
  String get progressSkillStatesTitle => 'Skill States';

  @override
  String progressConfidencePct(int percent) {
    return 'Confidence $percent%';
  }

  @override
  String progressDueAt(String date) {
    return 'Due: $date';
  }

  @override
  String progressDetectedAt(String date) {
    return 'Detected: $date';
  }

  @override
  String progressResolvedAt(String date) {
    return 'Resolved: $date';
  }

  @override
  String progressExpiresAt(String date) {
    return 'Expires: $date';
  }

  @override
  String progressGeneratedAt(String date) {
    return 'Generated: $date';
  }

  @override
  String progressTargetLesson(String lessonId) {
    return 'Lesson: $lessonId';
  }

  @override
  String progressRankBadge(int rank) {
    return '#$rank';
  }

  @override
  String get billingTitle => 'Billing';

  @override
  String get billingSubscription => 'Subscription';

  @override
  String get billingCurrentPlan => 'Current plan';

  @override
  String get billingChangePlan => 'Change plan';

  @override
  String get billingCancelSubscription => 'Cancel subscription';

  @override
  String get billingCancelSubscriptionDialogTitle => 'Cancel Subscription?';

  @override
  String get billingCancelSubscriptionDialogMessage =>
      'Your subscription will remain active until the end of the current billing period.';

  @override
  String get billingKeepSubscription => 'Keep Subscription';

  @override
  String get billingPlansAndPricing => 'Plans & Pricing';

  @override
  String get billingInvoices => 'Invoices';

  @override
  String get billingInvoiceDetail => 'Invoice Detail';

  @override
  String get billingNoEntitlements => 'No entitlements yet.';

  @override
  String get billingTermsAgreement => 'By continuing you agree to AIM Terms';

  @override
  String get billingCheckout => 'Checkout';

  @override
  String get billingPaymentPending => 'Payment pending';

  @override
  String get billingPaymentSuccessful => 'Payment successful!';

  @override
  String get billingPaymentFailed => 'Payment failed';

  @override
  String get billingPaymentVerifying =>
      'Please wait while we verify your payment.';

  @override
  String get billingPaymentFailedMessage =>
      'Your payment could not be processed. Please try again.';

  @override
  String get billingPaymentProcessingMessage =>
      'Your payment is being processed. We will notify you once completed.';

  @override
  String get billingGoBack => 'Go back';

  @override
  String billingQuantity(int quantity) {
    return 'Qty: $quantity';
  }

  @override
  String get billingPopularBadge => 'Popular';

  @override
  String get supportHelpCenter => 'Help Center';

  @override
  String get supportNewTicket => 'New ticket';

  @override
  String get supportMyTickets => 'My tickets';

  @override
  String get supportTicket => 'Ticket';

  @override
  String get supportParentHelp => 'Parent Help';

  @override
  String get supportParentTickets => 'Parent tickets';

  @override
  String get supportFeedback => 'Send feedback';

  @override
  String get supportRateAimQuestion => 'How would you rate AIM?';

  @override
  String get supportReleaseNotes => 'Release notes';

  @override
  String get supportReleaseNote => 'Release note';

  @override
  String supportReleasedDate(String date) {
    return 'Released $date';
  }

  @override
  String get supportSystemStatus => 'System Status';

  @override
  String get supportWhatNew => 'What\'s new';

  @override
  String get supportNoTickets => 'No Tickets Yet';

  @override
  String get supportNoTicketsSubtitle =>
      'Create a ticket to get help from our support team.';

  @override
  String get supportNoReleaseNotes => 'No Release Notes';

  @override
  String get supportNoReleaseNotesSubtitle =>
      'Release notes will appear here when published.';

  @override
  String get supportReleaseNoteNotAvailable =>
      'Release note is not available yet';

  @override
  String get supportReleaseNoteNotAvailableSubtitle =>
      'This release note will appear here once release notes are live.';

  @override
  String get practicePracticeSession => 'PRACTICE SESSION';

  @override
  String get practicePracticeComplete => 'PRACTICE COMPLETE!';

  @override
  String get practiceGreatJob => 'Great Job!';

  @override
  String get practiceAccuracy => 'ACCURACY';

  @override
  String get practiceXpEarned => 'XP EARNED';

  @override
  String get practiceCheckAnswer => 'Check Answer';

  @override
  String get practiceContinueToLesson => 'Continue to Lesson';

  @override
  String practiceQuestionOf(int current, int total) {
    return 'QUESTION $current OF $total';
  }

  @override
  String practiceSessionCompletedMsg(String lessonTitle) {
    return 'You finished this practice session for $lessonTitle.';
  }

  @override
  String practiceScoreSummary(int score, int total) {
    return 'You scored $score/$total on this practice session.';
  }

  @override
  String get practicePlacementRequiredTitle => 'Placement Test Required';

  @override
  String get practicePlacementRequiredBody =>
      'You must complete the placement test first to determine your starting level and begin learning sessions.';

  @override
  String get practiceTakePlacementNow => 'Take Placement Test Now';

  @override
  String get practiceTryDemoExercises => 'Try Demo Exercises';

  @override
  String get qaAnswerSubmitted => 'Answer submitted';

  @override
  String get qaAnalysingResponse => 'AIM is analysing your response.';

  @override
  String get qaAnalysingSession => 'AIM is analysing your session…';

  @override
  String get qaSessionSummary => 'Session Summary';

  @override
  String get qaSkillsCovered => 'Skills covered';

  @override
  String get assessmentAssessments => 'Assessments';

  @override
  String get assessmentDeadlines => 'Deadlines';

  @override
  String get assessmentBreakdown => 'BREAKDOWN';

  @override
  String get assessmentPastResults => 'Past results';

  @override
  String get assessmentResultHistory => 'Result history';

  @override
  String get assessmentSections => 'Sections';

  @override
  String get assessmentViewAttemptHistory => 'View your attempt history';

  @override
  String assessmentGradedDate(String date) {
    return 'Graded $date';
  }

  @override
  String get assessmentLatePenalty => 'Late penalty applied';

  @override
  String get assessmentReadyToBegin => 'Ready to begin?';

  @override
  String get assessmentSubmitAnswersDialogTitle => 'Submit your answers?';

  @override
  String get assessmentSubmitAnswersDialogMessage =>
      'This action is final and cannot be undone. You cannot change answers after submitting.';

  @override
  String get placementYourResponse => 'Your Response';

  @override
  String get placementTargetSentences => 'Target: 3-5 sentences';

  @override
  String placementCharactersCount(int count) {
    return '$count characters';
  }

  @override
  String get placementPressHoldToRecord => 'Press & hold the mic to record';

  @override
  String get placementReleaseWhenFinished => 'Release when finished';

  @override
  String get placementRecordingInProgress => 'Recording in progress...';

  @override
  String get placementRecordingCompleted => 'Recording completed!';

  @override
  String get placementTapSubmitRecording =>
      'Tap Submit below to submit your recording.';

  @override
  String get placementAiEngineActive => 'AI Engine Active';

  @override
  String get placementResultsRecordedSaved =>
      'Your placement test results have been recorded and saved.';

  @override
  String get reviewsTitle => 'Review';

  @override
  String get reviewsLoadingSemantic => 'Loading review schedule';

  @override
  String get reviewsNoScheduleTitle => 'No reviews scheduled';

  @override
  String get reviewsNoScheduleSubtitle =>
      'Complete practice sessions to receive review reminders.';

  @override
  String get reviewsStatDueNow => 'Due now';

  @override
  String get reviewsStatLearned => 'Learned';

  @override
  String get reviewsStatStreak => 'Streak';

  @override
  String get reviewsDueToday => 'Due Today';

  @override
  String get reviewsDueTomorrow => 'Due Tomorrow';

  @override
  String get reviewsDueYesterday => 'Due Yesterday';

  @override
  String reviewsDueInDays(int days) {
    return 'Due in $days days';
  }

  @override
  String reviewsDueDaysAgo(int days) {
    return 'Due $days days ago';
  }

  @override
  String reviewsDueDate(String date) {
    return 'Due $date';
  }

  @override
  String get reviewsStatusDue => 'Due';

  @override
  String get reviewsStatusPending => 'Pending';

  @override
  String get reviewsSpacedRepetitionDue =>
      'Spaced-repetition flashcards due today';

  @override
  String get reviewsScheduleHeader => 'REVIEW SCHEDULE';

  @override
  String get reviewsStartSession => 'Start Review Session';

  @override
  String reviewsIntervalDays(String days) {
    return 'Interval ${days}d';
  }

  @override
  String reviewsRepetitionNumber(int rep) {
    return 'rep #$rep';
  }

  @override
  String get voiceTeacherPageTitle => 'Voice Teacher';

  @override
  String get voiceTeacherPageSubtitle =>
      'Practise your pronunciation with the AI teacher';

  @override
  String get voiceTeacherConnectionErrorTitle => 'Connection Error';

  @override
  String get voiceTeacherMicrophoneErrorTitle => 'Microphone Error';

  @override
  String get voiceTeacherServerErrorTitle => 'Server Error';

  @override
  String get voiceTeacherGenericErrorTitle => 'Something Went Wrong';

  @override
  String get voiceTeacherConnectionErrorMsg =>
      'Could not connect to voice server. Please check your internet.';

  @override
  String get voiceTeacherMicrophoneErrorMsg =>
      'Could not access microphone. Please grant permission.';

  @override
  String get voiceTeacherServerErrorMsg =>
      'Voice service encountered an error. Please try again later.';

  @override
  String get voiceTeacherGenericErrorMsg =>
      'An unexpected error occurred during the voice session.';

  @override
  String get voiceTeacherTextResponseTitle => 'Text response from teacher';

  @override
  String get voiceTeacherRetryAudio => 'Retry audio';

  @override
  String get voiceTeacherTryAgain => 'Try Again';

  @override
  String get voiceTeacherProcessing => 'Processing...';

  @override
  String get voiceTeacherTranscribing => 'Transcribing...';

  @override
  String get voiceTeacherWhatYouSaid => 'What you said';

  @override
  String get voiceTeacherTeacherResponse => 'Teacher response';

  @override
  String get voiceTeacherRecorded => 'Recorded';

  @override
  String get voiceTeacherAudioUnavailable =>
      'Audio unavailable — here\'s the text response';

  @override
  String get voiceTeacherStop => 'Stop';

  @override
  String get voiceTeacherDiscard => 'Discard';

  @override
  String get voiceTeacherSend => 'Send';

  @override
  String get voiceTeacherHelpful => 'Helpful';

  @override
  String get voiceTeacherNotHelpful => 'Not helpful';

  @override
  String get aiTeacherConversations => 'Conversations';

  @override
  String get aiTeacherSettingsTitle => 'AI Teacher settings';

  @override
  String get aiTeacherCurrentLessonHeader => 'Current lesson';

  @override
  String get aiTeacherWasThisHelpful => 'Was this helpful?';

  @override
  String get aiTeacherWelcomeBack => 'Welcome back';

  @override
  String get aiTeacherAskQuestionsGuidance =>
      'Ask questions and get guidance on this lesson.';

  @override
  String get profileAimPlusMember => 'AIM PLUS MEMBER';

  @override
  String get profileLearningGapsAlerts =>
      'Alerts when AI detects new learning gaps';

  @override
  String get profileStudyTimeNotification =>
      'Get notified at your preferred study time';

  @override
  String get profileSecurityPassword => 'Security & Password';

  @override
  String get profilePasswordResetSuccess =>
      'Password reset email sent. Please check your inbox.';

  @override
  String profilePasswordResetFailed(String error) {
    return 'Failed to request password reset: $error';
  }

  @override
  String profileSaveFailed(String error) {
    return 'Failed to save profile changes: $error';
  }

  @override
  String get profileNoProfileLoaded => 'No profile loaded.';

  @override
  String get notificationsChannels => 'CHANNELS';

  @override
  String get notificationsQuietHours => 'QUIET HOURS';

  @override
  String get notificationsManageReminders => 'Manage lesson reminders';

  @override
  String get notificationsDismissed => 'This notification has been dismissed.';

  @override
  String get notificationsPause => 'Pause';

  @override
  String get notificationsResume => 'Resume';

  @override
  String get authHappyToSeeYou =>
      'Happy to see you again. Enter your email and password to continue.';

  @override
  String get authSignInToAccount => 'Sign in to your account';

  @override
  String get authTakesLessThanMinute =>
      'Takes less than a minute. Enter your details below.';

  @override
  String get authCheckEmailTitle => 'Check your email';

  @override
  String authSentConfirmationLink(String email) {
    return 'We sent a confirmation link to:\n$email';
  }

  @override
  String get authBackToLogin => 'Back to Login';

  @override
  String get authDevTestAccounts => 'DEV / TEST ACCOUNTS';

  @override
  String get authQuickLoginWithTest => 'Quick-login with test credentials:';

  @override
  String get shellLogOut => 'Log Out';

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileLoadingProfile => 'Loading profile';

  @override
  String profileCouldNotLoad(String message) {
    return 'Could not load profile: $message';
  }

  @override
  String get profileSectionAccount => 'ACCOUNT';

  @override
  String get profileLabelEmail => 'Email';

  @override
  String get profileLabelStatus => 'Status';

  @override
  String get profileLabelType => 'Type';

  @override
  String get profileSectionProfile => 'PROFILE';

  @override
  String get profileLabelDisplayName => 'Display Name';

  @override
  String get profileLabelLanguage => 'Language';

  @override
  String get profileLabelTimezone => 'Timezone';

  @override
  String get profileSectionRoles => 'ROLES';

  @override
  String get profileRolesSubtitle =>
      'Displayed for reference only. Enforced by backend.';

  @override
  String get profileSectionQuickLinks => 'QUICK LINKS';

  @override
  String get profileLinkLearningPath => 'Learning Path';

  @override
  String get profileLinkSubscriptionBilling => 'Subscription & Billing';

  @override
  String get profileLinkInvoiceHistory => 'Invoice History';

  @override
  String get profileLinkAchievements => 'Achievements';

  @override
  String get profileLinkAnalyticsSummary => 'Analytics Summary';

  @override
  String get profileLinkApiEndpointTester => 'API Endpoint Tester (Dev)';

  @override
  String get profileStatDayStreak => 'day streak';

  @override
  String get profileStatAchievements => 'achievements';

  @override
  String get profileTooltipAccountSettings => 'Account Settings';

  @override
  String get profileAchievementsCarouselTitle => 'Achievements';

  @override
  String get editProfileTitle => 'Edit profile';

  @override
  String get editProfileSave => 'Save';

  @override
  String get editProfileBack => 'Back';

  @override
  String get editProfileLabelDisplayName => 'Display Name';

  @override
  String get editProfilePlaceholderDisplayName => 'Your display name';

  @override
  String get editProfileLabelPreferredLanguage => 'Preferred Language';

  @override
  String get editProfilePlaceholderLanguage => 'Select a language';

  @override
  String get editProfileLabelTimezone => 'Timezone';

  @override
  String get editProfilePlaceholderTimezone => 'Select a timezone';

  @override
  String get editProfileSaveChanges => 'Save changes';

  @override
  String get editProfileDisplayNameTooLong =>
      'Display name must be 80 characters or fewer.';

  @override
  String get editProfileSessionExpired =>
      'Your session has expired. Please sign in again.';

  @override
  String get editProfileUpdatedSuccess => 'Profile updated.';

  @override
  String get settingsAppThemeDisplay => 'App Theme & Display';

  @override
  String get settingsThemeDarkSubtitle => 'Darker UI option for night use';

  @override
  String get settingsThemeLightSubtitle => 'Clean, high contrast appearance';

  @override
  String get settingsNotificationPreferences => 'Notification Preferences';

  @override
  String get settingsEnterFullName => 'Enter your full name';

  @override
  String get achievementsTitle => 'Achievements';

  @override
  String get achievementsMilestonesTitle => 'AIM Milestones';

  @override
  String achievementsBadgesUnlocked(int unlocked, int total) {
    return '$unlocked of $total badges unlocked';
  }

  @override
  String get achievementsLeagueRank => 'Gold League #3';

  @override
  String get achievementsTabAll => 'All Badges';

  @override
  String achievementsTabUnlocked(int count) {
    return 'Unlocked ($count)';
  }

  @override
  String achievementsTabInProgress(int count) {
    return 'In Progress ($count)';
  }

  @override
  String get achievementsBadgeUnlocked => 'Unlocked';

  @override
  String get achievementsFirstStepTitle => 'First Step';

  @override
  String get achievementsFirstStepDesc => 'Complete your first English lesson';

  @override
  String get achievementsStreakMasterTitle => 'Streak Master';

  @override
  String get achievementsStreakMasterDesc => 'Maintain a 7-day learning streak';

  @override
  String get achievementsGrammarWizardTitle => 'Grammar Wizard';

  @override
  String get achievementsGrammarWizardDesc =>
      'Score 90%+ in Grammar assessment';

  @override
  String get achievementsVoiceChampionTitle => 'Voice Champion';

  @override
  String get achievementsVoiceChampionDesc =>
      'Complete 5 Live AI Voice practice sessions';

  @override
  String get achievementsVocabularyTitanTitle => 'Vocabulary Titan';

  @override
  String get achievementsVocabularyTitanDesc => 'Master 200+ active words';

  @override
  String get achievementsSpeedLearnerTitle => 'Speed Learner';

  @override
  String get achievementsSpeedLearnerDesc => 'Finish 3 lessons in a single day';

  @override
  String get achievementsPerfectQuizTitle => 'Perfect Quiz Accuracy';

  @override
  String get achievementsPerfectQuizDesc => 'Score 100% on 5 practice quizzes';

  @override
  String get achievementsPolyglotLegendTitle => 'Polyglot Legend';

  @override
  String get achievementsPolyglotLegendDesc => 'Reach Level 20 in English';

  @override
  String get supportCreateTicketTitle => 'Submit a ticket';

  @override
  String get supportCreateTicketButton => 'Create Ticket';

  @override
  String get supportSubmitTicket => 'Submit Ticket';

  @override
  String get supportCategoryLabel => 'Category';

  @override
  String get supportSeverityLabel => 'Severity';

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
  String get supportSubjectRequired => 'Subject is required';

  @override
  String get supportDescriptionRequired => 'Description is required';

  @override
  String get supportCategoryBugReport => 'Bug Report';

  @override
  String get supportCategoryAccountIssue => 'Account Issue';

  @override
  String get supportCategoryLearningIssue => 'Learning Issue';

  @override
  String get supportCategoryBillingIssue => 'Billing Issue';

  @override
  String get supportCategoryGeneral => 'General';

  @override
  String get supportCategorySuggestion => 'Suggestion';

  @override
  String get supportCategoryCompliment => 'Compliment';

  @override
  String get supportCategoryComplaint => 'Complaint';

  @override
  String get supportCategoryOther => 'Other';

  @override
  String get supportSeverityLow => 'Low';

  @override
  String get supportSeverityMedium => 'Medium';

  @override
  String get supportSeverityHigh => 'High';

  @override
  String get supportSeverityCritical => 'Critical';

  @override
  String get supportFeedbackTitleLabel => 'Title';

  @override
  String get supportFeedbackTitlePlaceholder => 'A short summary';

  @override
  String get supportFeedbackBodyLabel => 'Your feedback';

  @override
  String get supportFeedbackBodyPlaceholder => 'Tell us what you think...';

  @override
  String get supportFeedbackTitleRequired => 'Title is required';

  @override
  String get supportFeedbackBodyRequired => 'Feedback details are required';

  @override
  String get supportTicketAddComment => 'Add a comment';

  @override
  String get supportTicketCommentPlaceholder => 'Write a follow-up message...';

  @override
  String get supportTicketSendComment => 'Send';

  @override
  String get supportStatusAllOperational => 'All Systems Operational';

  @override
  String get supportStatusNoComponents => 'No components reported';

  @override
  String get supportStatusNothingToShow => 'Nothing to show yet.';

  @override
  String get supportNoParentTickets => 'No Support Tickets';

  @override
  String get supportNoParentTicketsSubtitle =>
      'Create a ticket if you need help with your account.';

  @override
  String get coursesCurrentBadge => 'Current';

  @override
  String get voiceTeacherTitle => 'Voice Teacher';

  @override
  String get voiceTeacherStartingSession => 'Starting Voice Teacher session';

  @override
  String get voiceTeacherBackSemantic => 'Back';

  @override
  String get voiceTeacherStatusSpeaking => 'Speaking';

  @override
  String get voiceTeacherStatusRecording => 'Recording';

  @override
  String get voiceTeacherStatusProcessing => 'Processing';

  @override
  String get voiceTeacherStatusReady => 'Ready';

  @override
  String get voiceTeacherHeadingSpeaking => 'Your teacher is speaking…';

  @override
  String get voiceTeacherHeadingRecording => 'Listening to you…';

  @override
  String get voiceTeacherHeadingProcessing => 'Processing your answer…';

  @override
  String get voiceTeacherHeadingListening =>
      'Your turn — press and hold to speak';

  @override
  String get voiceTeacherPracticeSubtitle =>
      'Practise your pronunciation with the AI teacher';

  @override
  String get voiceTeacherMessagesButton => 'Messages';

  @override
  String get voiceTeacherBackToCall => 'Back to call';

  @override
  String voiceTeacherStatusSemantic(String status) {
    return 'Status: $status';
  }

  @override
  String get voiceTeacherPressAndHold => 'Press and hold to speak';

  @override
  String get voiceTeacherRecordingRelease => 'Recording — release to send';

  @override
  String voiceTeacherSaid(String text) {
    return 'Voice Teacher said: $text';
  }

  @override
  String voiceTeacherYouSaid(String text) {
    return 'You said: $text';
  }

  @override
  String get voiceTeacherEntryTitle => 'Voice Teacher';

  @override
  String get voiceTeacherEntrySubtitle =>
      'Practice conversational speaking with AI';

  @override
  String get billingPromoCodeLabel => 'Promotion code (optional)';

  @override
  String get billingPromoCodePlaceholder => 'Enter code';

  @override
  String get billingProceedToPayment => 'Proceed to Payment';

  @override
  String get billingNoInvoicesTitle => 'No Invoices Yet';

  @override
  String get billingNoInvoicesSubtitle =>
      'Your invoices will appear here after your first payment.';

  @override
  String get billingNoPlansAvailable => 'No plans available';

  @override
  String get billingCheckBackLaterPlans =>
      'Check back later for available plans.';

  @override
  String get billingSubscribe => 'Subscribe';

  @override
  String get assessmentsNoAssessmentsTitle => 'No assessments available';

  @override
  String get assessmentsNoAssessmentsSubtitle =>
      'Published quizzes and exams will appear here.';

  @override
  String get assessmentsStatQuestions => 'Questions';

  @override
  String get assessmentsStatTimeLimit => 'Time limit';

  @override
  String get assessmentsStatMaxAttempts => 'Max attempts';

  @override
  String get assessmentsStartAttempt => 'Start Attempt';

  @override
  String get assessmentsStartAttemptTitle => 'Start attempt';

  @override
  String get assessmentsGoBack => 'Go Back';

  @override
  String get assessmentsSubmit => 'Submit';

  @override
  String get assessmentsDone => 'Done';

  @override
  String get assessmentsNoResultsTitle => 'No results yet';

  @override
  String get assessmentsNoResultsSubtitle =>
      'Your past attempt results will appear here.';

  @override
  String get assessmentsDeadlinesTitle => 'Deadline';

  @override
  String get assessmentsNoDeadlinesTitle => 'No deadlines';

  @override
  String get assessmentsNoDeadlinesSubtitle =>
      'Your assessment deadlines will appear here.';

  @override
  String get assessmentsTabActive => 'Active';

  @override
  String get assessmentsTabUpcoming => 'Upcoming';

  @override
  String get assessmentsTabLate => 'Late';

  @override
  String get assessmentsTabMissed => 'Missed';

  @override
  String get assessmentsTabClosed => 'Closed';

  @override
  String get assessmentsOpensLabel => 'Opens';

  @override
  String get assessmentsClosesLabel => 'Closes';

  @override
  String get assessmentsExtendedCloseLabel => 'Extended close';

  @override
  String get assessmentsTypeAnswerPlaceholder => 'Type your answer here…';

  @override
  String get assessmentsYourAnswerLabel => 'Your answer';

  @override
  String get assessmentsQuestionsEmptyTitle => 'Questions';

  @override
  String get assessmentsQuestionsEmptySubtitle =>
      'No questions found for this attempt.';

  @override
  String get notificationsNoNotificationsTitle => 'No notifications yet';

  @override
  String get notificationsNoNotificationsSubtitle =>
      'Session reminders and progress updates will appear here.';

  @override
  String get assessmentsStatusCompleted => 'Completed';

  @override
  String get notificationsDismiss => 'Dismiss';

  @override
  String get notificationsDismissedTitle => 'Dismissed';

  @override
  String get notificationsEnableQuietHours => 'Enable quiet hours';

  @override
  String get notificationsSaveQuietHours => 'Save quiet hours';

  @override
  String get notificationsNoRemindersTitle => 'No reminders yet';

  @override
  String get notificationsNoRemindersSubtitle =>
      'Reminders you enable will appear here.';

  @override
  String get notificationsCancelReminder => 'Cancel';

  @override
  String get notificationsUnread => 'Unread';

  @override
  String get progressAvgMastery => 'Avg mastery';

  @override
  String get progressDayStreak => 'Day streak';

  @override
  String get progressSkillStates => 'Skill States';

  @override
  String get progressWeaknesses => 'Weaknesses';

  @override
  String get progressRecommendations => 'Recommendations';

  @override
  String get progressReviewSchedule => 'Review Schedule';

  @override
  String get progressFocusAreas => 'Focus Areas';

  @override
  String get progressNoProgressData => 'No progress data yet';

  @override
  String get progressNoSkillData => 'No skill data yet';

  @override
  String get progressNoFocusAreas => 'No focus areas yet';

  @override
  String get progressNoRecommendations => 'No recommendations yet';

  @override
  String get progressStatusStrong => 'Strong';

  @override
  String get progressStatusDeveloping => 'Developing';

  @override
  String get progressStatusNeedsWork => 'Needs work';

  @override
  String get progressTrendImproving => 'Improving';

  @override
  String get progressTrendDeclining => 'Declining';

  @override
  String get progressTrendStable => 'Stable';

  @override
  String get progressTrendInsufficient => 'Insufficient data';

  @override
  String get progressStatusSkipped => 'Skipped';

  @override
  String get progressStatusOverdue => 'Overdue';

  @override
  String get aiTeacherAskAnythingTitle => 'Ask AI Teacher anything';

  @override
  String get aiTeacherStartConversationSubtitle =>
      'Start the conversation by sending a message.';

  @override
  String get aiTeacherConversationHistory => 'Conversation history';

  @override
  String get aiTeacherNoConversationsTitle => 'No conversations yet';

  @override
  String get aiTeacherNoConversationsSubtitle =>
      'Start chatting with AI Teacher to see your history here.';

  @override
  String get aiTeacherPreferTextLabel => 'Prefer text replies over voice';

  @override
  String get aiTeacherReduceAnimationsLabel =>
      'Reduce animations in AI Teacher and Voice Tutor';

  @override
  String get aiTeacherAboutSettingsTitle => 'About these settings';

  @override
  String get aiTeacherAskAnythingHint => 'Ask me anything...';

  @override
  String get aiTeacherVoiceComingSoon => 'Voice input (coming soon)';

  @override
  String get aiTeacherSendMessage => 'Send message';

  @override
  String get aiTeacherLimitedBannerTitle => 'AI Teacher is limited right now';

  @override
  String get aiTeacherOpenButton => 'Open AI Teacher';

  @override
  String get voiceTeacherStartTalkingTitle =>
      'Start talking with your Voice Teacher';

  @override
  String get voiceTeacherTranscriptAppearSubtitle =>
      'Your transcript will appear here.';

  @override
  String get voiceTeacherMessages => 'Messages';

  @override
  String get qaContinueButton => 'Continue';

  @override
  String get qaYourAnswerLabel => 'Your answer';

  @override
  String get qaTypeAnswerPlaceholder => 'Type your answer here';

  @override
  String get qaQuestionsAttempted => 'Questions attempted';

  @override
  String get qaCorrectScore => 'Correct (backend score)';

  @override
  String get qaMasteryShift => 'Mastery shift';

  @override
  String get qaLessonCompletedToast => 'Lesson marked as completed! 🌟';

  @override
  String get qaMarkLessonCompletedButton => 'Mark Lesson as Completed ✨';

  @override
  String get shellNavMore => 'More';

  @override
  String get profileLanguageEnglish => 'English';

  @override
  String get profileLanguageArabic => 'Arabic';

  @override
  String get analyticsPageTitle => 'Analytics';

  @override
  String get analyticsNoReportsTitle => 'No reports available';

  @override
  String get analyticsNoReportsSubtitle =>
      'There are no analytics reports for you yet.';
}
