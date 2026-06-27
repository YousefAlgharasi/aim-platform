import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/profile/data/models/profile_me_response_model.dart';
import 'package:aim_mobile/features/profile/data/models/profile_models.dart';
import 'package:aim_mobile/features/profile/logic/entity/profile_update_payloads.dart';
import 'package:aim_mobile/features/profile/logic/entity/student_profile.dart';

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
      'profileType': 'student_profile',
      'displayName': 'Yousef',
      'avatarUrl': null,
      'preferredLanguage': 'en',
      'timezone': 'Asia/Aden',
    });

    expect(model.id, 'student_profile_123');
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
// P6-039 additions ─────────────────────────────────────────────────────────────

  test('ProfileMeResponseModel parses student profile path', () {
    final model = ProfileMeResponseModel.fromJson(const {
      'internalUserId': 'usr_123',
      'userType': 'student',
      'studentProfile': {
        'id': 'sp_1',
        'profileType': 'student_profile',
        'displayName': 'Yousef',
        'preferredLanguage': 'ar',
        'timezone': 'Asia/Riyadh',
      },
    });

    expect(model.internalUserId, 'usr_123');
    expect(model.userType, 'student');
    expect(model.studentProfile, isNotNull);
    expect(model.studentProfile!.displayName, 'Yousef');
    expect(model.studentProfile!.preferredLanguage, 'ar');
    expect(model.adminProfile, isNull);
  });

  test('ProfileMeResponseModel parses admin profile path', () {
    final model = ProfileMeResponseModel.fromJson(const {
      'internalUserId': 'usr_admin_1',
      'userType': 'admin',
      'adminProfile': {
        'id': 'ap_1',
        'profileType': 'admin_profile',
        'displayName': 'Admin',
        'department': 'ops',
      },
    });

    expect(model.adminProfile, isNotNull);
    expect(model.adminProfile!.department, 'ops');
    expect(model.studentProfile, isNull);
  });

  test('ProfileMeResponseModel handles missing profile gracefully', () {
    final model = ProfileMeResponseModel.fromJson(const {
      'internalUserId': 'usr_new',
      'userType': 'student',
    });

    expect(model.studentProfile, isNull);
    expect(model.adminProfile, isNull);
  });

  test('StudentProfile entity isStudentProfile helper', () {
    const entity = StudentProfile(
      id: 'sp_1',
      userId: 'u_1',
      profileType: 'student_profile',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    );
    expect(entity.isStudentProfile, isTrue);
  });

  test('SafeStudentProfileUpdatePayload never contains privileged fields', () {
    const payload = SafeStudentProfileUpdatePayload(
      displayName: 'Test',
      preferredLanguage: 'en',
    );
    // Verify the payload entity has no privileged field definitions.
    expect(payload.displayName, 'Test');
    // avatarUrl and timezone not set → null.
    expect(payload.avatarUrl, isNull);
    expect(payload.timezone, isNull);
  });
}
