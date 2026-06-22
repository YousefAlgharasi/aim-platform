// Phase 6 — P6-041
// Profile screen — Student Mobile App MVP.
//
// Security boundary:
// - Displays only data returned from the backend via authContextProvider.
// - Role badges are UX-only. Backend is the final authority for role enforcement.
// - supabase_auth_uid and internal permission keys are never rendered.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'edit_profile_page.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/data/models/auth_context_model.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/ui/widgets/logout_button.dart';
import '../../../notifications/ui/widgets/notification_bell_button.dart';

/// Student profile screen.
///
/// Renders account info, student profile fields, and role badges sourced from
/// the backend [authContextProvider]. The [LogoutButton] at the bottom calls
/// [LogoutNotifier] which clears the persisted session and in-memory state.
///
/// Design system: all colours, typography, spacing, and interactive widgets
/// use AIM Mobile Design System tokens. No hard-coded values.
///
/// RTL/Arabic: no [TextDirection] hard-coded. [ListView] and all children
/// respect the ambient locale direction. [AIMTopAppBar] mirrors back icon.
///
/// Security:
/// - Reads data only from authContextProvider (backend-sourced).
/// - No credentials, no scoring, no AIM Engine calls.
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authContextState = ref.watch(authContextProvider);
    final surfaces = aimSurfacesOf(context);

    // Navigate to sign-in when sign-out completes.
    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedOut && context.mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutePaths.signIn,
          (_) => false,
        );
      }
    });

    return Scaffold(
      appBar: AIMTopAppBar(
        title: 'Profile',
        centerTitle: false,
        actions: [
          const NotificationBellButton(),
          if (authContextState is AppAsyncSuccess<AuthContextModel>)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit profile',
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const EditProfilePage(),
                ),
              ),
            ),
        ],
      ),
      body: switch (authContextState) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading profile',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: 'Could not load profile: $message',
            onRetry: null,
          ),
        AppAsyncSuccess(:final data) => _ProfileBody(
            authContext: data,
            surfaces: surfaces,
          ),
        _ => Center(
            child: Text(
              'No profile loaded.',
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
            ),
          ),
      },
      bottomNavigationBar: const SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            AimSpacing.screenPaddingMobile,
            AimSpacing.innerGap,
            AimSpacing.screenPaddingMobile,
            AimSpacing.space16,
          ),
          child: LogoutButton(),
        ),
      ),
    );
  }
}

// ── Profile body ──────────────────────────────────────────────────────────────

class _ProfileBody extends StatelessWidget {
  const _ProfileBody({
    required this.authContext,
    required this.surfaces,
  });

  final AuthContextModel authContext;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    final profile = authContext.profile;

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space24,
      ),
      children: [
        // Avatar + name/email header
        _ProfileAvatar(
          displayName: profile?.displayName,
          email: authContext.user.email,
          surfaces: surfaces,
        ),
        const SizedBox(height: AimSpacing.sectionGap),

        // Account section
        _ProfileSection(
          title: 'ACCOUNT',
          surfaces: surfaces,
          children: [
            _InfoRow(
              label: 'Email',
              value: authContext.user.email,
              surfaces: surfaces,
            ),
            _InfoRow(
              label: 'Status',
              value: authContext.user.status,
              surfaces: surfaces,
            ),
            _InfoRow(
              label: 'Type',
              value: authContext.user.userType,
              surfaces: surfaces,
            ),
          ],
        ),

        // Student profile section
        if (profile != null) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          _ProfileSection(
            title: 'PROFILE',
            surfaces: surfaces,
            children: [
              _InfoRow(
                label: 'Display Name',
                value: profile.displayName,
                surfaces: surfaces,
              ),
              if (profile.profileType == 'student_profile') ...[
                _InfoRow(
                  label: 'Language',
                  value: profile.preferredLanguage,
                  surfaces: surfaces,
                ),
                _InfoRow(
                  label: 'Timezone',
                  value: profile.timezone,
                  surfaces: surfaces,
                ),
              ],
            ],
          ),
        ],

        // Roles section
        if (authContext.roles.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          _ProfileSection(
            title: 'ROLES',
            subtitle: 'Displayed for reference only. Enforced by backend.',
            surfaces: surfaces,
            children: [
              Wrap(
                spacing: AimSpacing.innerGap,
                runSpacing: AimSpacing.innerGap,
                children: authContext.roles
                    .map(
                      (r) => AIMBadge(
                        tone: AIMBadgeTone.primary,
                        child: Text(r.name),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ],

        const SizedBox(height: AimSpacing.sectionGap),
      ],
    );
  }
}

// ── Avatar ────────────────────────────────────────────────────────────────────

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({
    this.displayName,
    this.email,
    required this.surfaces,
  });

  final String? displayName;
  final String? email;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    final initials = _initials(displayName ?? email);

    return Column(
      children: [
        CircleAvatar(
          radius: AimSizes.iconLg * 2,
          backgroundColor: AimColors.primary100,
          child: Text(
            initials,
            style: AimTextStyles.h2.copyWith(color: AimColors.primary700),
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        if (displayName != null)
          Text(
            displayName!,
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
            textAlign: TextAlign.center,
          ),
        if (email != null)
          Text(
            email!,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
      ],
    );
  }

  String _initials(String? value) {
    if (value == null || value.isEmpty) return '?';
    final parts = value.trim().split(RegExp(r'[\s@.]+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return value[0].toUpperCase();
  }
}

// ── Section card ──────────────────────────────────────────────────────────────

class _ProfileSection extends StatelessWidget {
  const _ProfileSection({
    required this.title,
    required this.children,
    required this.surfaces,
    this.subtitle,
  });

  final String title;
  final String? subtitle;
  final List<Widget> children;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AimTextStyles.label.copyWith(
              color: AimColors.primary600,
              letterSpacing: 1.2,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: AimSpacing.space2),
            Text(
              subtitle!,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
          ],
          const SizedBox(height: AimSpacing.componentGap),
          ...children,
        ],
      ),
    );
  }
}

// ── Info row ──────────────────────────────────────────────────────────────────

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    required this.surfaces,
  });

  final String label;
  final String? value;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AimSpacing.space4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 112,
            child: Text(
              label,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
          ),
          Expanded(
            child: Text(
              value ?? '—',
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
