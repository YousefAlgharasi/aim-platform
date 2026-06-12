import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/client_safe_role_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/shell/ui/widgets/role_aware_placeholder_section.dart';

void main() {
  test('shows learner placeholder action for student role', () {
    final visibleActions = visibleRoleAwarePlaceholderActions(
      _authContextWithRoles(const [
        ClientSafeRoleModel(
          id: 'role-student',
          key: 'student',
          name: 'Student',
          isSystem: true,
        ),
      ]),
    );

    expect(
      visibleActions.map((action) => action.label),
      contains('Learner profile tools'),
    );
    expect(
      visibleActions.map((action) => action.label),
      isNot(contains('Admin console shortcut')),
    );
  });

  test('shows admin placeholder action for super admin role', () {
    final visibleActions = visibleRoleAwarePlaceholderActions(
      _authContextWithRoles(const [
        ClientSafeRoleModel(
          id: 'role-super-admin',
          key: 'super_admin',
          name: 'Super Admin',
          isSystem: true,
        ),
      ]),
    );

    expect(
      visibleActions.map((action) => action.label),
      contains('Admin console shortcut'),
    );
  });

  test('returns no placeholder actions when backend roles are absent', () {
    final visibleActions = visibleRoleAwarePlaceholderActions(
      _authContextWithRoles(const []),
    );

    expect(visibleActions, isEmpty);
  });
}

AuthContextModel _authContextWithRoles(List<ClientSafeRoleModel> roles) {
  return AuthContextModel(
    user: const CurrentUserModel(
      id: 'user-1',
      email: 'learner@example.com',
      userType: 'student',
      status: 'active',
      createdAt: _timestamp,
      updatedAt: _timestamp,
    ),
    roles: roles,
    permissions: const [],
  );
}

const _timestamp = '2026-06-12T00:00:00.000Z';
