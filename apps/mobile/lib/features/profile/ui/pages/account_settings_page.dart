// Settings screen — only settings that are real and saved:
// - Profile: display name (saved via PATCH profile), email (read-only).
// - Learning: daily lesson goal (read from the Home engagement summary,
//   saved via the engagement goal endpoint).
// - Preferences: theme, language, links to the notification preferences and
//   study reminder screens (each saves through its own backend endpoint).
// - Account: change password (emails a reset link), sign out.
//
// RTL/Arabic: directional insets and chevrons; no hard-coded text direction.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/localization/locale_provider.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/logout_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/profile/data/models/profile_update_payload_models.dart';
import 'package:aim_mobile/features/profile/logic/provider/profile_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Daily goal choices, in lessons per day.
const _dailyGoalOptions = [1, 2, 3];

class AccountSettingsPage extends ConsumerStatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  ConsumerState<AccountSettingsPage> createState() =>
      _AccountSettingsPageState();
}

class _AccountSettingsPageState extends ConsumerState<AccountSettingsPage> {
  final _nameController = TextEditingController();
  String _savedName = '';
  bool _savingName = false;

  /// Goal picked on this screen; null until the student changes it, so the
  /// backend value from the Home summary is shown.
  int? _pickedGoal;
  bool _savingGoal = false;

  String? _version;

  @override
  void initState() {
    super.initState();
    final authState = ref.read(authContextProvider);
    if (authState is AppAsyncSuccess<AuthContext>) {
      _savedName = authState.data.profile?.displayName ?? '';
      _nameController.text = _savedName;
    }
    _nameController.addListener(() => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadGoal());
    PackageInfo.fromPlatform().then((info) {
      if (mounted) setState(() => _version = info.version);
    }).catchError((_) {});
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  String? get _token {
    final token = ref.read(authFlowProvider).accessToken;
    return (token == null || token.isEmpty) ? null : token;
  }

  void _loadGoal() {
    if (ref.read(homeProvider) is AppAsyncSuccess) return;
    final token = _token;
    final authState = ref.read(authContextProvider);
    if (token == null || authState is! AppAsyncSuccess<AuthContext>) return;
    ref.read(homeProvider.notifier).load(
          bearerToken: token,
          studentId: authState.data.user.id,
        );
  }

  void _showSnack(String message, {bool error = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        backgroundColor: error ? AimColors.error500 : AimColors.success500,
        content: Text(message),
      ));
  }

  Future<void> _saveName() async {
    final token = _token;
    final name = _nameController.text.trim();
    if (token == null || name.isEmpty) return;
    final l10n = AppLocalizations.of(context);
    setState(() => _savingName = true);
    try {
      await ref.read(profileProvider.notifier).updateProfile(
            token,
            studentPayload:
                SafeStudentProfileUpdatePayloadModel(displayName: name),
          );
      await ref.read(authContextProvider.notifier).loadCurrentUser(token);
      _savedName = name;
      if (mounted) _showSnack(l10n.settingsSaveSuccess);
    } catch (e) {
      if (mounted) _showSnack(l10n.profileSaveFailed('$e'), error: true);
    } finally {
      if (mounted) setState(() => _savingName = false);
    }
  }

  Future<void> _saveGoal(int lessons) async {
    final token = _token;
    if (token == null) return;
    final l10n = AppLocalizations.of(context);
    final previous = _pickedGoal;
    setState(() {
      _pickedGoal = lessons;
      _savingGoal = true;
    });
    try {
      await ref
          .read(profileProvider.notifier)
          .updateEngagementGoal(token, dailyGoalLessons: lessons);
      if (mounted) _showSnack(l10n.settingsDailyGoalSaved);
    } catch (e) {
      if (mounted) {
        setState(() => _pickedGoal = previous);
        _showSnack(l10n.profileSaveFailed('$e'), error: true);
      }
    } finally {
      if (mounted) setState(() => _savingGoal = false);
    }
  }

  Future<void> _changePassword(String email) async {
    final l10n = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.settingsChangePassword),
        content: Text(l10n.settingsChangePasswordBody(email)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.commonCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.settingsSendLink),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await ref.read(authRepositoryProvider).requestPasswordReset(email: email);
      if (mounted) _showSnack(l10n.profilePasswordResetSuccess);
    } catch (e) {
      if (mounted) {
        _showSnack(l10n.profilePasswordResetFailed('$e'), error: true);
      }
    }
  }

  Future<void> _signOut() async {
    final token = _token;
    if (token == null) return;
    final l10n = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.settingsLogoutTitle),
        content: Text(l10n.settingsLogoutMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.commonCancel),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AimColors.error500),
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.authSignOutButton),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      ref.read(logoutProvider.notifier).logout(token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final authState = ref.watch(authContextProvider);
    final email = switch (authState) {
      AppAsyncSuccess(:final data) => data.user.email ?? '',
      _ => '',
    };
    final backendGoal = switch (ref.watch(homeProvider)) {
      AppAsyncSuccess<HomeData>(:final data) => data.goal?.targetLessons,
      _ => null,
    };
    final goal = _pickedGoal ?? backendGoal;
    final themeMode = ref.watch(themeModeProvider);
    final localeCode = ref.watch(localeProvider).languageCode;
    final name = _nameController.text.trim();
    final nameChanged = name.isNotEmpty && name != _savedName;

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.settingsPageTitle,
        onBack: () => context.canPop()
            ? context.pop()
            : context.go(AppRoutePaths.mainShell),
      ),
      body: SafeArea(
        top: false,
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
            vertical: AimSpacing.space16,
          ),
          children: [
            // ── Profile ──
            _SectionTitle(l10n.settingsSectionProfile),
            AIMCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _FieldLabel(l10n.settingsFullName),
                  AIMInput(
                    controller: _nameController,
                    placeholder: l10n.settingsEnterFullName,
                  ),
                  const SizedBox(height: AimSpacing.space16),
                  _FieldLabel(l10n.settingsEmailAddress),
                  Text(
                    email,
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textSecondary),
                  ),
                  const SizedBox(height: AimSpacing.space16),
                  AIMButton(
                    fullWidth: true,
                    loading: _savingName,
                    disabled: !nameChanged,
                    onPressed: _saveName,
                    child: Text(l10n.settingsSave),
                  ),
                ],
              ),
            ),

            // ── Learning ──
            _SectionTitle(l10n.settingsSectionLearning),
            AIMCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _FieldLabel(l10n.settingsDailyGoal),
                  SegmentedButton<int>(
                    showSelectedIcon: false,
                    emptySelectionAllowed: true,
                    segments: [
                      for (final n in _dailyGoalOptions)
                        ButtonSegment(
                          value: n,
                          label: Text(l10n.settingsDailyGoalLessons(n)),
                        ),
                    ],
                    selected: {if (goal != null) goal},
                    onSelectionChanged: _savingGoal
                        ? null
                        : (selection) {
                            if (selection.isNotEmpty &&
                                selection.first != goal) {
                              _saveGoal(selection.first);
                            }
                          },
                  ),
                ],
              ),
            ),

            // ── Preferences ──
            _SectionTitle(l10n.settingsSectionPreferences),
            AIMCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _FieldLabel(l10n.settingsTheme),
                  SegmentedButton<ThemeMode>(
                    showSelectedIcon: false,
                    segments: [
                      ButtonSegment(
                        value: ThemeMode.system,
                        icon: const Icon(Icons.brightness_auto_rounded),
                        label: Text(l10n.settingsThemeSystem),
                      ),
                      ButtonSegment(
                        value: ThemeMode.light,
                        icon: const Icon(Icons.light_mode_rounded),
                        label: Text(l10n.settingsThemeLightShort),
                      ),
                      ButtonSegment(
                        value: ThemeMode.dark,
                        icon: const Icon(Icons.dark_mode_rounded),
                        label: Text(l10n.settingsThemeDarkShort),
                      ),
                    ],
                    selected: {themeMode},
                    onSelectionChanged: (s) =>
                        ref.read(themeModeProvider.notifier).state = s.first,
                  ),
                  const SizedBox(height: AimSpacing.space16),
                  _FieldLabel(l10n.profileLabelLanguage),
                  SegmentedButton<String>(
                    showSelectedIcon: false,
                    segments: const [
                      ButtonSegment(
                        value: AppLocale.english,
                        label: Text('English'),
                      ),
                      ButtonSegment(
                        value: AppLocale.arabic,
                        label: Text('العربية'),
                      ),
                    ],
                    selected: {localeCode},
                    onSelectionChanged: (s) => ref
                        .read(localeProvider.notifier)
                        .state = Locale(s.first),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMCard(
              padding: const EdgeInsets.symmetric(vertical: AimSpacing.space4),
              child: Column(
                children: [
                  _SettingsRow(
                    icon: Icons.notifications_outlined,
                    label: l10n.settingsNotificationPreferences,
                    onTap: () =>
                        context.push(AppRoutePaths.notificationPreferences),
                  ),
                  Divider(
                    height: 1,
                    indent: AimSpacing.space48,
                    color: surfaces.divider,
                  ),
                  _SettingsRow(
                    icon: Icons.alarm_rounded,
                    label: l10n.settingsStudyReminders,
                    onTap: () => context.push(AppRoutePaths.reminderSettings),
                  ),
                ],
              ),
            ),

            // ── Account ──
            _SectionTitle(l10n.settingsSectionAccount),
            AIMCard(
              padding: const EdgeInsets.symmetric(vertical: AimSpacing.space4),
              child: Column(
                children: [
                  if (email.isNotEmpty) ...[
                    _SettingsRow(
                      icon: Icons.lock_reset_rounded,
                      label: l10n.settingsChangePassword,
                      onTap: () => _changePassword(email),
                    ),
                    Divider(
                      height: 1,
                      indent: AimSpacing.space48,
                      color: surfaces.divider,
                    ),
                  ],
                  _SettingsRow(
                    icon: Icons.logout_rounded,
                    label: l10n.authSignOutButton,
                    destructive: true,
                    onTap: _signOut,
                  ),
                ],
              ),
            ),

            if (_version != null) ...[
              const SizedBox(height: AimSpacing.sectionGap),
              Text(
                l10n.settingsAppVersion(_version!),
                textAlign: TextAlign.center,
                style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
              ),
            ],
            const SizedBox(height: AimSpacing.sectionGap),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.only(
        start: AimSpacing.space4,
        top: AimSpacing.sectionGap,
        bottom: AimSpacing.space8,
      ),
      child: Text(
        text,
        style: AimTextStyles.label.copyWith(
          color: aimSurfacesOf(context).textSecondary,
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space8),
      child: Text(
        text,
        style: AimTextStyles.bodySm.copyWith(
          color: aimSurfacesOf(context).textSecondary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _SettingsRow extends StatelessWidget {
  const _SettingsRow({
    required this.icon,
    required this.label,
    required this.onTap,
    this.destructive = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final color = destructive ? AimColors.error500 : surfaces.textPrimary;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.space16,
          vertical: AimSpacing.space12,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: AimSizes.iconMd,
              color: destructive ? AimColors.error500 : AimColors.primary600,
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Text(
                label,
                style: AimTextStyles.bodyMd.copyWith(
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            if (!destructive)
              Icon(
                isRtl ? Icons.chevron_left : Icons.chevron_right,
                size: AimSizes.iconSm,
                color: surfaces.textMuted,
              ),
          ],
        ),
      ),
    );
  }
}
