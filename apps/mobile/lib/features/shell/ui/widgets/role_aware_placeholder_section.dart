import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/data/models/auth_context_model.dart';

class RoleAwarePlaceholderAction {
  const RoleAwarePlaceholderAction({
    required this.label,
    required this.description,
    required this.requiredRoles,
  });

  final String label;
  final String description;
  final Set<String> requiredRoles;

  bool isVisibleFor(AuthContextModel authContext) =>
      requiredRoles.any(authContext.hasRole);
}

const roleAwarePlaceholderActions = <RoleAwarePlaceholderAction>[
  RoleAwarePlaceholderAction(
    label: 'Learner profile tools',
    description: 'Shown for student role context from the Backend API.',
    requiredRoles: {'student'},
  ),
  RoleAwarePlaceholderAction(
    label: 'Review queue shortcut',
    description: 'Shown for reviewer or support role context.',
    requiredRoles: {'reviewer', 'support'},
  ),
  RoleAwarePlaceholderAction(
    label: 'Admin console shortcut',
    description: 'Shown for admin or super_admin role context.',
    requiredRoles: {'admin', 'super_admin'},
  ),
];

List<RoleAwarePlaceholderAction> visibleRoleAwarePlaceholderActions(
  AuthContextModel authContext,
) =>
    roleAwarePlaceholderActions
        .where((a) => a.isVisibleFor(authContext))
        .toList(growable: false);

/// Role-aware placeholder section rendered on the profile screen.
///
/// Displays role chips and placeholder action tiles derived from backend-
/// provided role data. Backend authorisation remains final — this widget
/// only renders what the backend returns.
class RoleAwarePlaceholderSection extends StatelessWidget {
  const RoleAwarePlaceholderSection({
    required this.authContext,
    super.key,
  });

  final AuthContextModel authContext;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final visibleActions = visibleRoleAwarePlaceholderActions(authContext);
    final roleLabels = authContext.roles.map((r) => r.key).join(', ');

    return AIMCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Role-aware UI placeholder',
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            'Visible items below come from backend-provided role data. '
            'Backend authorisation remains final.',
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Wrap(
            spacing: AimSpacing.innerGap,
            runSpacing: AimSpacing.innerGap,
            children: [
              for (final role in authContext.roles)
                AIMBadge(
                  tone: AIMBadgeTone.primary,
                  child: Text(role.name),
                ),
              if (authContext.roles.isEmpty)
                const AIMBadge(
                  tone: AIMBadgeTone.neutral,
                  child: Text('No backend roles loaded'),
                ),
            ],
          ),
          const SizedBox(height: AimSpacing.formFieldGap),
          if (visibleActions.isEmpty)
            Text(
              roleLabels.isEmpty
                  ? 'No role-aware placeholder items are visible yet.'
                  : 'No placeholder items are mapped for: $roleLabels.',
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            )
          else
            ...visibleActions.map(
              (action) => _RoleAwarePlaceholderTile(action: action),
            ),
        ],
      ),
    );
  }
}

class _RoleAwarePlaceholderTile extends StatelessWidget {
  const _RoleAwarePlaceholderTile({required this.action});

  final RoleAwarePlaceholderAction action;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.only(top: AimSpacing.componentGap),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.visibility_outlined,
            size: AimSizes.iconMd,
            color: surfaces.textMuted,
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  action.label,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  action.description,
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
