// Bugfix: the AIM Engine section of the dev-only API Endpoint Tester used
// to hardcode the literal path segment "me" (e.g.
// /aim/students/me/skill-states), which the backend's ParseUUIDPipe always
// rejected with 400 since "me" isn't a UUID. decodeJwtSubClaim() extracts
// the real Supabase auth UID (the `sub` claim) from the access token so the
// tester can substitute it into the {studentId} placeholder instead.

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/dev_tools/ui/pages/endpoint_tester_page.dart';

String _fakeJwt(Map<String, dynamic> payload) {
  String segment(Object value) =>
      base64Url.encode(utf8.encode(jsonEncode(value))).replaceAll('=', '');
  return '${segment({
        'alg': 'HS256',
      })}.${segment(payload)}.fake-signature';
}

void main() {
  group('decodeJwtSubClaim', () {
    test('extracts the sub claim from a well-formed JWT', () {
      final token = _fakeJwt({'sub': 'auth-uid-123', 'exp': 9999999999});
      expect(decodeJwtSubClaim(token), 'auth-uid-123');
    });

    test('returns null for a non-JWT string', () {
      expect(decodeJwtSubClaim('not-a-jwt'), isNull);
    });

    test('returns null when the sub claim is missing', () {
      final token = _fakeJwt({'exp': 9999999999});
      expect(decodeJwtSubClaim(token), isNull);
    });

    test('returns null for malformed base64 payload', () {
      expect(decodeJwtSubClaim('a.not-valid-base64!!!.c'), isNull);
    });
  });
}
