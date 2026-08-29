import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/entity/auth_context.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/logic/provider/logout_provider.dart';

/// Student Profile Page — high-fidelity design prototype implementation.
///
/// Displays:
/// 1. Centered gradient avatar with initial, display name, and email.
/// 2. Menu action cards:
///    - Edit Profile & Settings
///    - Achievements & Milestones
///    - Subscription Plan
///    - Log Out (destructive action with red icon and text)
///
/// Features full Light and Dark mode theme support using AIM Design Tokens.
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authContextState = ref.watch(authContextProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
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
          ),
        _ => const SizedBox.shrink(),
      },
    );
  }
}

class _ProfileBody extends ConsumerWidget {
  const _ProfileBody({
    required this.authContext,
  });

  final AuthContext authContext;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final profile = authContext.profile;
    final displayName = profile?.displayName ??
        ((authContext.user.email != null && authContext.user.email!.isNotEmpty)
            ? authContext.user.email!.split('@').first
            : 'Alex Johnson');
    final email = authContext.user.email ?? 'alex.johnson@example.com';
    final initial =
        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'A';

    final logoutState = ref.watch(logoutProvider);
    final isLoggingOut = logoutState.isLoading;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
            vertical: AimSpacing.space20,
          ),
          child: Column(
            children: [
              const SizedBox(height: AimSpacing.space16),

              // Centered Avatar + Name + Email
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: AimGradients.ai,
                        boxShadow: [
                          BoxShadow(
                            color:
                                const Color(0xFF4F46E5).withValues(alpha: 0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Text(
                        initial,
                        style: AimTextStyles.h1.copyWith(
                          color: AimColors.neutral0,
                          fontWeight: AimFontWeights.extrabold,
                          fontSize: 30,
                        ),
                      ),
                    ),
                    const SizedBox(height: AimSpacing.space12),
                    Text(
                      displayName,
                      style: AimTextStyles.h2.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: AimFontWeights.bold,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      email,
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textMuted,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AimSpacing.space24),

              // Action Menu Stack
              _ProfileOptionCard(
                icon: Icons.person_outline_rounded,
                label: 'Edit Profile & Settings',
                onTap: () => context.push(AppRoutePaths.accountSettings),
              ),
              const SizedBox(height: 8),
              _ProfileOptionCard(
                icon: Icons.emoji_events_outlined,
                label: 'Achievements & Milestones',
                onTap: () => context.push(AppRoutePaths.achievements),
              ),
              const SizedBox(height: 8),
              _ProfileOptionCard(
                icon: Icons.credit_card_outlined,
                label: 'Subscription Plan',
                onTap: () => context.push(AppRoutePaths.subscription),
              ),
              const SizedBox(height: 8),
              _ProfileOptionCard(
                icon: Icons.logout_rounded,
                label: 'Log Out',
                isDanger: true,
                isLoading: isLoggingOut,
                onTap: isLoggingOut
                    ? null
                    : () {
                        final token =
                            ref.read(authFlowProvider).accessToken ?? '';
                        ref.read(logoutProvider.notifier).logout(token);
                      },
              ),

              const SizedBox(height: AimSpacing.space32),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileOptionCard extends StatelessWidget {
  const _ProfileOptionCard({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isDanger = false,
    this.isLoading = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isDanger;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = isDanger
        ? AimColors.error500
        : (isDark ? AimColors.primary300 : const Color(0xFF4F46E5));
    final textColor = isDanger ? AimColors.error500 : surfaces.textPrimary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.space16,
            vertical: AimSpacing.space16,
          ),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: surfaces.border),
          ),
          child: Row(
            children: [
              if (isLoading)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AimColors.error500,
                  ),
                )
              else
                Icon(
                  icon,
                  size: 20,
                  color: iconColor,
                ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  label,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: textColor,
                    fontWeight: AimFontWeights.semibold,
                    fontSize: 14,
                  ),
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: surfaces.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
