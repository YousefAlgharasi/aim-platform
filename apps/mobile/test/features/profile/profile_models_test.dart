import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/profile/data/models/profile_models.dart';

void main() {
  test('parses user profile contract fields', () {
    final model = UserProfileModel.fromJson(const {
      'id': 'usr_123',
      'email': 'user@example.com',
      'phone': null,
      'userType': 'student',
      'status': 'active',
      'createdAt': '2026-06-11T00:00:00Z',
      'updatedAt': '2026-06-11T00:00:00Z',
    });

    expect(model.id, 'usr_123');
    expect(model.email, 'user@example.com');
    expect(model.userType, 'student');
    expect(model.isActive, isTrue);
  });

  test('parses student profile contract fields', () {
    final model = StudentProfileModel.fromJson(const {
      'id': 'student_profile_123',
      'userId': 'usr_123',
      'profileType': 'student_profile',
      'displayName': 'Yousef',
      'avatarUrl': null,
      'preferredLanguage': 'en',
      'timezone': 'Asia/Aden',
      'createdAt': '2026-06-11T00:00:00Z',
      'updatedAt': '2026-06-11T00:00:00Z',
    });

    expect(model.id, 'student_profile_123');
    expect(model.userId, 'usr_123');
    expect(model.isStudentProfile, isTrue);
    expect(model.preferredLanguage, 'en');
    expect(model.timezone, 'Asia/Aden');
  });

  test('parses admin profile contract fields', () {
    final model = AdminProfileModel.fromJson(const {
      'id': 'admin_profile_123',
      'userId': 'usr_admin_123',
      'profileType': 'admin_profile',
      'displayName': 'Admin User',
      'avatarUrl': null,
      'department': 'operations',
      'createdAt': '2026-06-11T00:00:00Z',
      'updatedAt': '2026-06-11T00:00:00Z',
    });

    expect(model.id, 'admin_profile_123');
    expect(model.isAdminProfile, isTrue);
    expect(model.department, 'operations');
  });

  test('student update payload serializes only safe mutable fields', () {
    final json = const SafeStudentProfileUpdatePayloadModel(
      displayName: 'Yousef',
      avatarUrl: 'https://example.com/avatar.png',
      preferredLanguage: 'en',
      timezone: 'Asia/Aden',
    ).toJson();

    expect(json.keys, {
      'displayName',
      'avatarUrl',
      'preferredLanguage',
      'timezone',
    });
    expect(json.containsKey('id'), isFalse);
    expect(json.containsKey('userId'), isFalse);
    expect(json.containsKey('roles'), isFalse);
    expect(json.containsKey('permissions'), isFalse);
  });

  test('admin update payload serializes only safe mutable fields', () {
    final json = const SafeAdminProfileUpdatePayloadModel(
      displayName: 'Admin User',
      avatarUrl: 'https://example.com/admin.png',
      department: 'operations',
    ).toJson();

    expect(json.keys, {'displayName', 'avatarUrl', 'department'});
    expect(json.containsKey('id'), isFalse);
    expect(json.containsKey('userId'), isFalse);
    expect(json.containsKey('serviceRoleKey'), isFalse);
    expect(json.containsKey('jwtSecret'), isFalse);
  });
}
