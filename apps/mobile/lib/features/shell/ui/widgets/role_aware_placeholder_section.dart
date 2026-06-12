import 'package:flutter/material.dart';

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

  bool isVisibleFor(AuthContextModel authContext) {
    return requiredRoles.any(authContext.hasRole);
  }
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
) {
  return roleAwarePlaceholderActions
      .where((action) => action.isVisibleFor(authContext))
      .toList(growable: false);
}

class RoleAwarePlaceholderSection extends StatelessWidget {
  const RoleAwarePlaceholderSection({
    required this.authContext,
    super.key,
  });

  final AuthContextModel authContext;

  @override
  Widget build(BuildContext context) {
    final visibleActions = visibleRoleAwarePlaceholderActions(authContext);
    final roleLabels = authContext.roles.map((role) => role.key).join(', ');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Role-aware UI placeholder',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Visible items below come from backend-provided role data. '
              'Backend authorization remains final.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final role in authContext.roles)
                  Chip(label: Text(role.name)),
                if (authContext.roles.isEmpty)
                  const Chip(label: Text('No backend roles loaded')),
              ],
            ),
            const SizedBox(height: 16),
            if (visibleActions.isEmpty)
              Text(
                roleLabels.isEmpty
                    ? 'No role-aware placeholder items are visible yet.'
                    : 'No placeholder items are mapped for: $roleLabels.',
              )
            else
              ...visibleActions.map(
                (action) => _RoleAwarePlaceholderTile(action: action),
              ),
          ],
        ),
      ),
    );
  }
}

class _RoleAwarePlaceholderTile extends StatelessWidget {
  const _RoleAwarePlaceholderTile({required this.action});

  final RoleAwarePlaceholderAction action;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.visibility_outlined),
      title: Text(action.label),
      subtitle: Text(action.description),
    );
  }
}
