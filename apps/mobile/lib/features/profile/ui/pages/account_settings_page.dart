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
    final shownName = _savedName.isNotEmpty ? _savedName : name;
    final initial = shownName.isNotEmpty
        ? String.fromCharCode(shownName.runes.first).toUpperCase()
        : (email.isNotEmpty ? email[0].toUpperCase() : '?');

    void goBack() => context.canPop()
        ? context.pop()
        : context.go(AppRoutePaths.mainShell);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        children: [
          _SettingsTopBar(
            title: l10n.settingsPageTitle,
            initial: initial,
            onBack: goBack,
          ),
          Expanded(
            child: SafeArea(
              top: false,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  AimSpacing.space20,
                  AimSpacing.space16,
                  AimSpacing.space20,
                  AimSpacing.space32,
                ),
                children: [
                  // ── Profile ──
                  _SectionCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            _Avatar(initial: initial, size: 56),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    shownName.isNotEmpty
                                        ? shownName
                                        : l10n.settingsSectionProfile,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: AimTextStyles.bodyMd.copyWith(
                                      color: surfaces.textPrimary,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  if (email.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 2),
                                      child: Text(
                                        email,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: AimTextStyles.bodySm.copyWith(
                                          color: surfaces.textMuted,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AimSpacing.space16),
                        _FieldLabel(l10n.settingsFullName),
                        _SettingsTextField(
                          controller: _nameController,
                          hint: l10n.settingsEnterFullName,
                        ),
                        const SizedBox(height: AimSpacing.space12),
                        _FieldLabel(
                          l10n.settingsEmailAddress,
                          trailing: Icon(
                            Icons.lock_outline_rounded,
                            size: 14,
                            color: surfaces.textMuted,
                          ),
                        ),
                        _ReadOnlyField(text: email),
                        const SizedBox(height: AimSpacing.space16),
                        _PrimaryActionButton(
                          label: l10n.settingsSave,
                          loading: _savingName,
                          onPressed: nameChanged ? _saveName : null,
                        ),
                      ],
                    ),
                  ),

                  // ── Learning ──
                  const SizedBox(height: AimSpacing.space16),
                  _SectionCard(
                    title: l10n.settingsSectionLearning,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _FieldLabel(l10n.settingsDailyGoal),
                        _PillSelector<int>(
                          value: goal,
                          enabled: !_savingGoal,
                          options: [
                            for (final n in _dailyGoalOptions)
                              (n, l10n.settingsDailyGoalLessons(n), null),
                          ],
                          onChanged: (n) {
                            if (n != goal) _saveGoal(n);
                          },
                        ),
                      ],
                    ),
                  ),

                  // ── Theme & display ──
                  const SizedBox(height: AimSpacing.space16),
                  _SectionCard(
                    title: l10n.settingsAppThemeDisplay,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _FieldLabel(l10n.settingsTheme),
                        _PillSelector<ThemeMode>(
                          value: themeMode,
                          options: [
                            (
                              ThemeMode.system,
                              l10n.settingsThemeSystem,
                              Icons.brightness_auto_rounded
                            ),
                            (
                              ThemeMode.light,
                              l10n.settingsThemeLightShort,
                              Icons.light_mode_rounded
                            ),
                            (
                              ThemeMode.dark,
                              l10n.settingsThemeDarkShort,
                              Icons.dark_mode_rounded
                            ),
                          ],
                          onChanged: (m) =>
                              ref.read(themeModeProvider.notifier).state = m,
                        ),
                        const SizedBox(height: AimSpacing.space16),
                        _FieldLabel(l10n.profileLabelLanguage),
                        _PillSelector<String>(
                          value: localeCode,
                          options: const [
                            (AppLocale.english, 'English', null),
                            (AppLocale.arabic, 'العربية', null),
                          ],
                          onChanged: (code) => ref
                              .read(localeProvider.notifier)
                              .setLocale(Locale(code)),
                        ),
                      ],
                    ),
                  ),

                  // ── Notifications ──
                  const SizedBox(height: AimSpacing.space16),
                  _SectionCard(
                    title: l10n.settingsNotificationPreferences,
                    padding: const EdgeInsetsDirectional.fromSTEB(
                      AimSpacing.space16,
                      AimSpacing.space16,
                      AimSpacing.space16,
                      AimSpacing.space4,
                    ),
                    child: Column(
                      children: [
                        _SettingsRow(
                          icon: Icons.notifications_outlined,
                          label: l10n.settingsNotificationPreferences,
                          onTap: () => context
                              .push(AppRoutePaths.notificationPreferences),
                        ),
                        Divider(height: 1, color: surfaces.divider),
                        _SettingsRow(
                          icon: Icons.alarm_rounded,
                          label: l10n.settingsStudyReminders,
                          onTap: () =>
                              context.push(AppRoutePaths.reminderSettings),
                        ),
                      ],
                    ),
                  ),

                  // ── Security ──
                  if (email.isNotEmpty) ...[
                    const SizedBox(height: AimSpacing.space16),
                    _SectionCard(
                      title: l10n.settingsSectionAccount,
                      child: _PrimaryActionButton(
                        label: l10n.settingsChangePassword,
                        dark: true,
                        icon: Icons.lock_reset_rounded,
                        onPressed: () => _changePassword(email),
                      ),
                    ),
                  ],

                  // ── Log out ──
                  const SizedBox(height: AimSpacing.space16),
                  _LogoutButton(
                    label: l10n.authSignOutButton,
                    onPressed: _signOut,
                  ),

                  if (_version != null) ...[
                    const SizedBox(height: AimSpacing.sectionGap),
                    Text(
                      l10n.settingsAppVersion(_version!),
                      textAlign: TextAlign.center,
                      style: AimTextStyles.caption
                          .copyWith(color: surfaces.textMuted),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────── Building blocks ───────────────────────────
// Mirrors the "Modern Auth Pages" account-settings design: rounded bordered
// cards, uppercase muted field labels, 12px-radius inputs, pill selectors.

class _SettingsTopBar extends StatelessWidget {
  const _SettingsTopBar({
    required this.title,
    required this.initial,
    required this.onBack,
  });

  final String title;
  final String initial;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    return Container(
      decoration: BoxDecoration(
        color: surfaces.surface.withValues(alpha: 0.9),
        border: Border(bottom: BorderSide(color: surfaces.border)),
      ),
      padding: EdgeInsets.fromLTRB(
        AimSpacing.space20 + MediaQuery.paddingOf(context).left,
        MediaQuery.paddingOf(context).top + AimSpacing.space8,
        AimSpacing.space20 + MediaQuery.paddingOf(context).right,
        AimSpacing.space12,
      ),
      child: Row(
        children: [
          Material(
            color: surfaces.surfaceSunken,
            borderRadius: AimRadius.borderMd,
            child: InkWell(
              borderRadius: AimRadius.borderMd,
              onTap: onBack,
              child: SizedBox(
                width: 40,
                height: 40,
                child: Icon(
                  isRtl
                      ? Icons.arrow_forward_rounded
                      : Icons.arrow_back_rounded,
                  size: 20,
                  color: surfaces.textPrimary,
                ),
              ),
            ),
          ),
          Expanded(
            child: Text(
              title,
              textAlign: TextAlign.center,
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textPrimary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          _Avatar(initial: initial, size: 36),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.initial, required this.size});

  final String initial;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: AimGradients.ai,
        borderRadius: BorderRadius.circular(size * 0.3),
        boxShadow: [
          BoxShadow(
            color: AimColors.primary500.withValues(alpha: 0.25),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Text(
        initial,
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w800,
          fontSize: size * 0.4,
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.child,
    this.title,
    this.padding = const EdgeInsets.all(18),
  });

  final Widget child;
  final String? title;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: AimRadius.borderLg,
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (title != null) ...[
            Text(
              title!,
              style: AimTextStyles.bodySm.copyWith(
                color: surfaces.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AimSpacing.space12),
          ],
          child,
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text, {this.trailing});

  final String text;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(
              text.toUpperCase(),
              style: AimTextStyles.caption.copyWith(
                color: aimSurfacesOf(context).textMuted,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
              ),
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

class _SettingsTextField extends StatelessWidget {
  const _SettingsTextField({
    required this.controller,
    this.hint,
  });

  final TextEditingController controller;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    OutlineInputBorder border(Color c, [double w = 1]) => OutlineInputBorder(
          borderRadius: AimRadius.borderMd,
          borderSide: BorderSide(color: c, width: w),
        );
    return TextField(
      controller: controller,
      style: AimTextStyles.bodyMd.copyWith(
        color: surfaces.textPrimary,
        fontWeight: FontWeight.w600,
      ),
      decoration: InputDecoration(
        isDense: true,
        hintText: hint,
        hintStyle: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
        filled: true,
        fillColor: surfaces.background,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        border: border(surfaces.border),
        enabledBorder: border(surfaces.border),
        focusedBorder: border(AimColors.primary500, 1.5),
      ),
    );
  }
}

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        color: surfaces.surfaceSunken,
        borderRadius: AimRadius.borderMd,
        border: Border.all(color: surfaces.border),
      ),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: AimTextStyles.bodyMd.copyWith(
          color: surfaces.textMuted,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

/// Segmented "pill" selector: the selected option is a filled brand-blue pill.
class _PillSelector<T> extends StatelessWidget {
  const _PillSelector({
    required this.value,
    required this.options,
    required this.onChanged,
    this.enabled = true,
  });

  final T? value;
  final List<(T, String, IconData?)> options;
  final ValueChanged<T> onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Row(
      children: [
        for (var i = 0; i < options.length; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          Expanded(
            child: _Pill(
              label: options[i].$2,
              icon: options[i].$3,
              selected: options[i].$1 == value,
              surfaces: surfaces,
              onTap: enabled ? () => onChanged(options[i].$1) : null,
            ),
          ),
        ],
      ],
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({
    required this.label,
    required this.selected,
    required this.surfaces,
    required this.onTap,
    this.icon,
  });

  final String label;
  final IconData? icon;
  final bool selected;
  final AimSurfaceTheme surfaces;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final fg = selected ? Colors.white : surfaces.textSecondary;
    return Material(
      color: selected ? AimColors.primary500 : surfaces.surfaceSunken,
      borderRadius: AimRadius.borderMd,
      child: InkWell(
        borderRadius: AimRadius.borderMd,
        onTap: onTap,
        child: Container(
          constraints: const BoxConstraints(minHeight: 44),
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: AimRadius.borderMd,
            border: Border.all(
              color: selected ? AimColors.primary500 : surfaces.border,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 16, color: fg),
                const SizedBox(width: 4),
              ],
              Flexible(
                child: Text(
                  label,
                  maxLines: 2,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.bodySm.copyWith(
                    color: fg,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PrimaryActionButton extends StatelessWidget {
  const _PrimaryActionButton({
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.dark = false,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool dark;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = dark
        ? (isDark ? AimColors.neutral700 : AimColors.neutral900)
        : AimColors.primary500;
    final enabled = onPressed != null && !loading;
    return Opacity(
      opacity: onPressed == null && !loading ? 0.45 : 1,
      child: Material(
        color: bg,
        borderRadius: AimRadius.borderMd,
        child: InkWell(
          borderRadius: AimRadius.borderMd,
          onTap: enabled ? onPressed : null,
          child: Container(
            height: 48,
            alignment: Alignment.center,
            child: loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) ...[
                        Icon(icon, size: 18, color: Colors.white),
                        const SizedBox(width: 8),
                      ],
                      Flexible(
                        child: Text(
                          label,
                          overflow: TextOverflow.ellipsis,
                          style: AimTextStyles.button.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

class _LogoutButton extends StatelessWidget {
  const _LogoutButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fg = isDark ? AimColors.error500 : AimColors.error600;
    return Material(
      color: isDark ? AimColors.error500.withValues(alpha: 0.12) : AimColors.error50,
      borderRadius: AimRadius.borderMd,
      child: InkWell(
        borderRadius: AimRadius.borderMd,
        onTap: onPressed,
        child: Container(
          height: 50,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: AimRadius.borderMd,
            border: Border.all(
              color: isDark
                  ? AimColors.error500.withValues(alpha: 0.4)
                  : AimColors.error100,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.logout_rounded, size: 18, color: fg),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.button
                      .copyWith(color: fg, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
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
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsetsDirectional.symmetric(
          vertical: AimSpacing.space12,
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: AimRadius.borderMd,
              ),
              child: Icon(icon, size: 18, color: AimColors.primary500),
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Text(
                label,
                style: AimTextStyles.bodyMd.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
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
