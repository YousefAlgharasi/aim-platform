import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/localization/inline_tr.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/logic/provider/logout_provider.dart';
import '../../../notifications/logic/provider/notification_providers.dart';
import '../../logic/main_shell_tab_provider.dart';

/// The slide-in menu: the same sections and items as the web app's menu.
class AppMenuDrawer extends ConsumerStatefulWidget {
  const AppMenuDrawer({super.key});

  @override
  ConsumerState<AppMenuDrawer> createState() =>
      _AppMenuDrawerState();
}

class _AppMenuDrawerState
    extends ConsumerState<AppMenuDrawer> {
  void _close() => Scaffold.of(context).closeDrawer();

  /// Opens one of the main tabs from any page.
  void _selectTab(int index) {
    _close();
    ref.read(mainShellTabIndexProvider.notifier).state = index;
    context.go(AppRoutePaths.mainShell);
  }

  void _navigateTo(String routeName) {
    _close();
    context.push(routeName);
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = ref.watch(mainShellTabIndexProvider);
    final unread = switch (ref.watch(notificationUnreadCountProvider)) {
      AppAsyncSuccess(:final data) => data,
      _ => 0,
    };

    AIMDrawerItemData item(
      IconData icon,
      String en,
      String ar, {
      bool selected = false,
      VoidCallback? onTap,
      Widget? trailing,
    }) =>
        AIMDrawerItemData(
          icon: Icon(icon),
          label: context.tr(en, ar),
          selected: selected,
          trailing: trailing,
          onTap: onTap ?? () {},
        );

    // Same sections, order and names as the student web app's menu.
    // The Dashboard entry opens the Home tab (the page itself is untouched).
    final sections = [
      AIMDrawerSectionData(
        label: context.tr('LEARN', 'تعلّم'),
        items: [
          item(Icons.home_outlined, 'Dashboard', 'لوحة التحكم',
              selected: selectedIndex == 0, onTap: () => _selectTab(0)),
          item(Icons.menu_book_outlined, 'Courses', 'الدورات',
              selected: selectedIndex == 1, onTap: () => _selectTab(1)),
          item(Icons.track_changes_rounded, 'Improve', 'تحسين',
              onTap: () => _navigateTo(AppRoutePaths.improve)),
          item(Icons.assignment_outlined, 'Assessments', 'التقييمات',
              onTap: () => _navigateTo(AppRoutePaths.assessments)),
        ],
      ),
      AIMDrawerSectionData(
        label: context.tr('PRACTICE', 'تدرّب'),
        items: [
          item(Icons.bolt_rounded, 'Practice', 'تدرّب',
              onTap: () => _navigateTo(AppRoutePaths.practiceHub)),
          item(Icons.chat_bubble_outline_rounded, 'AI Teacher', 'المعلم الذكي',
              onTap: () {
            _close();
            context.push(AppRoutePaths.aiTeacherChat,
                extra: const {'contextRef': 'general'});
          }),
          item(Icons.lightbulb_outline_rounded, 'My words', 'كلماتي',
              onTap: () => _navigateTo(AppRoutePaths.vocabulary)),
          item(Icons.refresh_rounded, 'My mistakes', 'أخطائي',
              onTap: () => _navigateTo(AppRoutePaths.mistakes)),
          item(Icons.style_outlined, 'Review', 'المراجعة',
              selected: selectedIndex == 2, onTap: () => _selectTab(2)),
        ],
      ),
      AIMDrawerSectionData(
        label: context.tr('PROGRESS', 'التقدم'),
        items: [
          item(Icons.bar_chart_outlined, 'Progress', 'التقدم',
              selected: selectedIndex == 3, onTap: () => _selectTab(3)),
          item(Icons.emoji_events_outlined, 'Achievements', 'الإنجازات',
              onTap: () => _navigateTo(AppRoutePaths.achievements)),
          item(Icons.workspace_premium_outlined, 'Certificates', 'الشهادات',
              onTap: () => _navigateTo(AppRoutePaths.certificates)),
        ],
      ),
      AIMDrawerSectionData(
        label: context.tr('ACCOUNT', 'الحساب'),
        items: [
          item(Icons.notifications_none_rounded, 'Notifications', 'الإشعارات',
              onTap: () => _navigateTo(AppRoutePaths.notificationInbox),
              trailing: unread > 0 ? _UnreadBadge(count: unread) : null),
          item(Icons.credit_card_outlined, 'Billing', 'الفواتير',
              onTap: () => _navigateTo(AppRoutePaths.subscription)),
          item(Icons.support_agent_outlined, 'Support', 'الدعم',
              onTap: () => _navigateTo(AppRoutePaths.helpCenter)),
          item(Icons.settings_outlined, 'Settings', 'الإعدادات',
              onTap: () => _navigateTo(AppRoutePaths.accountSettings)),
        ],
      ),
    ];

    return AIMAppDrawer(
      header: const AppMenuHeader(),
      items: const [],
      sections: sections,
      footer: Consumer(
        builder: (context, ref, child) {
          final logoutState = ref.watch(logoutProvider);
          final isLoggingOut = logoutState.isLoading;
          final surfaces = aimSurfacesOf(context);

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: isLoggingOut
                    ? null
                    : () {
                        final token =
                            ref.read(authFlowProvider).accessToken ?? '';
                        ref.read(logoutProvider.notifier).logout(token);
                      },
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: AimSpacing.space8),
                  child: Text(
                    context.tr('Log Out', 'تسجيل الخروج'),
                    style: AimTextStyles.bodyMd.copyWith(
                      color: AimColors.error500,
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AimSpacing.space4),
              Text(
                'AIM Mind Coach v2.4.0',
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textMuted,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _UnreadBadge extends StatelessWidget {
  const _UnreadBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AimColors.error500,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        count > 99 ? '99+' : '$count',
        style: AimTextStyles.caption.copyWith(
          color: Colors.white,
          fontWeight: AimFontWeights.bold,
        ),
      ),
    );
  }
}

/// App-branding & profile header shown at the top of the side navigation drawer.
class AppMenuHeader extends ConsumerWidget {
  const AppMenuHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final authContextState = ref.watch(authContextProvider);

    final displayName = switch (authContextState) {
      AppAsyncSuccess(:final data) => data.profile?.displayName ??
          ((data.user.email != null && data.user.email!.isNotEmpty)
              ? data.user.email!.split('@').first
              : AppLocalizations.of(context).commonLearner),
      _ => AppLocalizations.of(context).commonLearner,
    };

    final avatarLetter =
        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'A';

    final isParent = switch (authContextState) {
      AppAsyncSuccess(:final data) => data.hasRole('parent'),
      _ => false,
    };
    final badgeText = isParent ? 'PARENT MEMBER' : 'AIM PLUS MEMBER';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'AIM',
              style: AimTextStyles.h2.copyWith(
                color: AimColors.primary500,
                fontWeight: AimFontWeights.extrabold,
                fontSize: 22,
                letterSpacing: -0.5,
              ),
            ),
            GestureDetector(
              onTap: () => Scaffold.of(context).closeDrawer(),
              child: Container(
                padding: const EdgeInsets.all(AimSpacing.space8),
                decoration: BoxDecoration(
                  color: surfaces.surfaceSunken,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.close,
                  size: AimSizes.iconSm,
                  color: surfaces.textSecondary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AimSpacing.space16),
        GestureDetector(
          onTap: () {
            Scaffold.of(context).closeDrawer();
            ref.read(mainShellTabIndexProvider.notifier).state = 4;
            context.go(AppRoutePaths.mainShell);
          },
          child: Container(
            padding: const EdgeInsets.all(AimSpacing.space16),
            decoration: BoxDecoration(
              color: surfaces.surfaceRaised,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: surfaces.border,
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: AimGradients.gzHero,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    avatarLetter,
                    style: AimTextStyles.h3.copyWith(
                      color: AimColors.neutral0,
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
                ),
                const SizedBox(width: AimSpacing.componentGap),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        displayName,
                        style: AimTextStyles.bodyLg.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: AimFontWeights.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: soft.primary,
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Text(
                          badgeText,
                          style: AimTextStyles.caption.copyWith(
                            color: soft.onPrimary,
                            fontWeight: AimFontWeights.extrabold,
                            fontSize: 10,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}