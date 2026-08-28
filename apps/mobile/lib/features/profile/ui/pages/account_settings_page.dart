import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/logout_provider.dart';
import 'package:aim_mobile/features/profile/logic/provider/profile_provider.dart';
import 'package:aim_mobile/features/profile/data/models/profile_update_payload_models.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class AccountSettingsPage extends ConsumerStatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  ConsumerState<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends ConsumerState<AccountSettingsPage> {
  final _nameController = TextEditingController();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();

  String _commitment = '15'; // '5' | '15' | '30'
  bool _dailyReminders = true;
  bool _weaknessAlerts = true;

  bool _isSavingProfile = false;
  bool _isUpdatingPassword = false;

  @override
  void initState() {
    super.initState();
    _loadCurrentProfile();
    _nameController.addListener(_onFormChanged);
    _currentPasswordController.addListener(_onFormChanged);
    _newPasswordController.addListener(_onFormChanged);
  }

  void _onFormChanged() {
    setState(() {});
  }

  void _loadCurrentProfile() {
    final authState = ref.read(authContextProvider);
    if (authState is AppAsyncSuccess<AuthContext>) {
      _nameController.text = authState.data.profile?.displayName ?? '';
    }
  }

  @override
  void dispose() {
    _nameController.removeListener(_onFormChanged);
    _currentPasswordController.removeListener(_onFormChanged);
    _newPasswordController.removeListener(_onFormChanged);
    _nameController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    setState(() {
      _isSavingProfile = true;
    });

    final l10n = AppLocalizations.of(context);

    try {
      // 1. Update Profile Display Name
      await ref.read(profileProvider.notifier).updateProfile(
            token,
            studentPayload: SafeStudentProfileUpdatePayloadModel(
              displayName: _nameController.text.trim(),
            ),
          );

      // Refresh current auth context to display updated name immediately
      await ref.read(authContextProvider.notifier).loadCurrentUser(token);

      // 2. Update Daily Learning Commitment Goal in Backend API via ProfileNotifier
      final lessonsMap = {'5': 1, '15': 2, '30': 3};
      final dailyGoalLessons = lessonsMap[_commitment] ?? 2;

      await ref.read(profileProvider.notifier).updateEngagementGoal(
            token,
            dailyGoalLessons: dailyGoalLessons,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AimColors.success500,
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: AimColors.neutral0),
                const SizedBox(width: 8),
                Text(l10n.settingsSaveSuccess),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AimColors.error500,
            content: Text('Failed to save profile changes: $e'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSavingProfile = false;
        });
      }
    }
  }

  Future<void> _updatePassword() async {
    setState(() {
      _isUpdatingPassword = true;
    });

    try {
      final authState = ref.read(authContextProvider);
      final email = switch (authState) {
        AppAsyncSuccess(:final data) => data.user.email ?? '',
        _ => '',
      };

      if (email.isNotEmpty) {
        await ref.read(authRepositoryProvider).requestPasswordReset(email: email);
      }


      if (mounted) {
        setState(() {
          _isUpdatingPassword = false;
          _currentPasswordController.clear();
          _newPasswordController.clear();
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AimColors.success500,
            content: Row(
              children: [
                Icon(Icons.mark_email_read, color: AimColors.neutral0),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Password reset email sent. Please check your inbox.',
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUpdatingPassword = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AimColors.error500,
            content: Text('Failed to request password reset: $e'),
          ),
        );
      }
    }
  }

  void _logout() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    final l10n = AppLocalizations.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.settingsLogoutTitle),
        content: Text(l10n.settingsLogoutMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(l10n.commonCancel),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AimColors.error500,
              foregroundColor: AimColors.neutral0,
            ),
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(logoutProvider.notifier).logout(token);
            },
            child: Text(l10n.authSignOutButton),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authContextProvider);
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    final email = switch (authState) {
      AppAsyncSuccess(:final data) => data.user.email ?? '',
      _ => '',
    };
    final displayName = switch (authState) {
      AppAsyncSuccess(:final data) => data.profile?.displayName ?? '',
      _ => '',
    };

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: surfaces.surface,
        elevation: 0,
        scrolledUnderElevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: surfaces.border, height: 1),
        ),
        leadingWidth: 72,
        leading: Center(
          child: GestureDetector(
            onTap: () => context.canPop() ? context.pop() : context.go(AppRoutePaths.mainShell),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: surfaces.border.withValues(alpha: 0.2),
                borderRadius: AimRadius.borderMd,
              ),
              child: Icon(
                Icons.arrow_back_rounded,
                color: surfaces.textPrimary,
                size: 20,
              ),
            ),
          ),
        ),
        title: Text(
          l10n.settingsTitle,
          style: AimTextStyles.title.copyWith(
            color: surfaces.textPrimary,
            fontSize: 18,
            fontWeight: AimFontWeights.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          const AimQuickThemeToggle(size: 36, iconSize: 18),
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: CircleAvatar(
              radius: 18,
              backgroundColor: AimColors.primary500,
              child: Text(
                displayName.isNotEmpty ? displayName[0].toUpperCase() : 'A',
                style: AimTextStyles.bodyLg.copyWith(
                  color: AimColors.neutral0,
                  fontWeight: AimFontWeights.bold,
                ),
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // 1. Profile & Learning Commitment Card
          _buildCard(
            surfaces,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: const BoxDecoration(
                        color: AimColors.primary500,
                        borderRadius: AimRadius.borderLg,
                      ),
                      child: Center(
                        child: Text(
                          displayName.isNotEmpty ? displayName[0].toUpperCase() : 'A',
                          style: AimTextStyles.h2.copyWith(
                            color: AimColors.neutral0,
                            fontSize: 24,
                            fontWeight: AimFontWeights.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            displayName.isNotEmpty ? displayName : 'Alex Johnson',
                            style: AimTextStyles.bodyLg.copyWith(
                              color: surfaces.textPrimary,
                              fontWeight: AimFontWeights.extrabold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            email.isNotEmpty ? email : 'alex.johnson@example.com',
                            style: AimTextStyles.caption.copyWith(
                              color: surfaces.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AimColors.primary500.withValues(alpha: 0.1),
                                  borderRadius: AimRadius.borderSm,
                                ),
                                child: Text(
                                  'AIM PLUS MEMBER',
                                  style: AimTextStyles.caption.copyWith(
                                    color: AimColors.primary600,
                                    fontSize: 9,
                                    fontWeight: AimFontWeights.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  l10n.settingsFullName.toUpperCase(),
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.bold,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 6),
                AIMInput(
                  controller: _nameController,
                  placeholder: 'Enter your full name',
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.settingsEmailAddress.toUpperCase(),
                      style: AimTextStyles.caption.copyWith(
                        color: surfaces.textSecondary,
                        fontWeight: AimFontWeights.bold,
                        fontSize: 11,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: surfaces.border.withValues(alpha: 0.4),
                        borderRadius: AimRadius.borderSm,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.lock_outline, size: 12, color: surfaces.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            l10n.settingsVerifiedEmail,
                            style: AimTextStyles.caption.copyWith(
                              color: surfaces.textSecondary,
                              fontWeight: AimFontWeights.bold,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                TextField(
                  enabled: false,
                  decoration: InputDecoration(
                    hintText: email.isNotEmpty ? email : 'alex.johnson@example.com',
                    filled: true,
                    fillColor: surfaces.border.withValues(alpha: 0.15),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    border: OutlineInputBorder(
                      borderRadius: AimRadius.borderMd,
                      borderSide: BorderSide(color: surfaces.border),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: AimRadius.borderMd,
                      borderSide: BorderSide(color: surfaces.border.withValues(alpha: 0.5)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.settingsDailyCommitment.toUpperCase(),
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.bold,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    borderRadius: AimRadius.borderMd,
                    border: Border.all(color: surfaces.border),
                    color: surfaces.surface,
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _commitment,
                      dropdownColor: surfaces.surface,
                      icon: Icon(Icons.keyboard_arrow_down, color: surfaces.textPrimary),
                      isExpanded: true,
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _commitment = val;
                          });
                        }
                      },
                      items: [
                        DropdownMenuItem(
                          value: '5',
                          child: Text(l10n.settingsCommitmentCasual),
                        ),
                        DropdownMenuItem(
                          value: '15',
                          child: Text(l10n.settingsCommitmentRecommended),
                        ),
                        DropdownMenuItem(
                          value: '30',
                          child: Text(l10n.settingsCommitmentIntensive),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                AIMButton(
                  fullWidth: true,
                  onPressed: _isSavingProfile ? null : _saveProfile,
                  child: Text(_isSavingProfile ? l10n.settingsSavingButton : l10n.settingsSaveButton),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 2. App Theme & Display
          Padding(
            padding: const EdgeInsets.only(bottom: 8, left: 4),
            child: Text(
              'App Theme & Display',
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textPrimary,
                fontWeight: AimFontWeights.extrabold,
              ),
            ),
          ),
          _buildCard(
            surfaces,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: surfaces.border.withValues(alpha: 0.15),
                borderRadius: AimRadius.borderLg,
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark 
                          ? AimColors.neutral800 
                          : AimColors.warning500.withValues(alpha: 0.1),
                      borderRadius: AimRadius.borderMd,
                    ),
                    child: Icon(
                      isDark ? Icons.nights_stay_rounded : Icons.wb_sunny_rounded,
                      color: isDark ? AimColors.neutral300 : AimColors.warning500,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isDark ? l10n.settingsThemeDark : l10n.settingsThemeLight,
                          style: AimTextStyles.bodyMd.copyWith(
                            color: surfaces.textPrimary,
                            fontWeight: AimFontWeights.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isDark 
                              ? 'Darker UI option for night use' 
                              : 'Clean, high contrast appearance',
                          style: AimTextStyles.caption.copyWith(
                            color: surfaces.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: isDark,
                    activeThumbColor: AimColors.primary500,
                    onChanged: (val) {
                      ref.read(themeModeProvider.notifier).state =
                          val ? ThemeMode.dark : ThemeMode.light;
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // 3. Notification Preferences
          Padding(
            padding: const EdgeInsets.only(bottom: 8, left: 4),
            child: Text(
              'Notification Preferences',
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textPrimary,
                fontWeight: AimFontWeights.extrabold,
              ),
            ),
          ),
          _buildCard(
            surfaces,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.settingsReminders,
                            style: AimTextStyles.bodyMd.copyWith(
                              color: surfaces.textPrimary,
                              fontWeight: AimFontWeights.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Get notified at your preferred study time',
                            style: AimTextStyles.caption.copyWith(
                              color: surfaces.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _dailyReminders,
                      activeThumbColor: AimColors.primary500,
                      onChanged: (val) {
                        setState(() {
                          _dailyReminders = val;
                        });
                      },
                    ),
                  ],
                ),
                const Divider(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.settingsDiagnostics,
                            style: AimTextStyles.bodyMd.copyWith(
                              color: surfaces.textPrimary,
                              fontWeight: AimFontWeights.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Alerts when AI detects new learning gaps',
                            style: AimTextStyles.caption.copyWith(
                              color: surfaces.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _weaknessAlerts,
                      activeThumbColor: AimColors.primary500,
                      onChanged: (val) {
                        setState(() {
                          _weaknessAlerts = val;
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 4. Security & Password
          Padding(
            padding: const EdgeInsets.only(bottom: 8, left: 4),
            child: Text(
              'Security & Password',
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textPrimary,
                fontWeight: AimFontWeights.extrabold,
              ),
            ),
          ),
          _buildCard(
            surfaces,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  l10n.settingsCurrentPassword.toUpperCase(),
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.bold,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 6),
                AIMInput(
                  controller: _currentPasswordController,
                  type: AIMInputType.password,
                  placeholder: '••••••••',
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.settingsNewPassword.toUpperCase(),
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.bold,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 6),
                AIMInput(
                  controller: _newPasswordController,
                  type: AIMInputType.password,
                  placeholder: '••••••••',
                ),
                const SizedBox(height: 24),
                AIMButton(
                  fullWidth: true,
                  disabled: _currentPasswordController.text.isEmpty || _newPasswordController.text.isEmpty,
                  onPressed: _isUpdatingPassword ? null : _updatePassword,
                  child: Text(_isUpdatingPassword ? l10n.settingsUpdatingPassword : l10n.settingsUpdatePassword),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // 5. Logout Button
          GestureDetector(
            onTap: _logout,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2), // Red 50
                borderRadius: AimRadius.borderMd,
                border: Border.all(color: const Color(0xFFFECDD3), width: 1.5), // Red 100
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.logout_rounded, color: Color(0xFFE11D48), size: 20), // Red 600
                  const SizedBox(width: 8),
                  Text(
                    l10n.settingsLogoutButton,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: const Color(0xFFE11D48), // Red 600
                      fontWeight: AimFontWeights.extrabold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  Widget _buildCard(AimSurfaceTheme surfaces, {required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: AimRadius.borderLg,
        border: Border.all(color: surfaces.border),
        boxShadow: [
          BoxShadow(
            color: AimColors.neutral900.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}
