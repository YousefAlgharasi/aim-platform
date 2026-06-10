import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/networking.dart';

void main() {
  test('parses success response envelope', () {
    final envelope = ApiResponseEnvelope<Map<String, dynamic>>.fromJson(
      <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{'status': 'ok'},
        'meta': <String, dynamic>{
          'timestamp': '2026-01-01T00:00:00.000Z',
          'path': '/health',
          'method': 'GET',
          'requestId': 'request-1',
        },
      },
      decodeData: (json) => json! as Map<String, dynamic>,
    );

    expect(envelope.success, isTrue);
    expect(envelope.data?['status'], 'ok');
    expect(envelope.meta.path, '/health');
    expect(envelope.meta.method, 'GET');
    expect(envelope.meta.requestId, 'request-1');
  });

  test('parses error response envelope', () {
    final envelope = ApiResponseEnvelope<void>.fromJson(
      <String, dynamic>{
        'success': false,
        'error': <String, dynamic>{
          'code': 'VALIDATION_ERROR',
          'message': 'Validation failed',
          'details': <String, dynamic>{'field': 'email'},
        },
        'meta': <String, dynamic>{'path': '/auth/sign-in'},
      },
      decodeData: (_) {},
    );

    expect(envelope.success, isFalse);
    expect(envelope.error?.code, 'VALIDATION_ERROR');
    expect(envelope.error?.message, 'Validation failed');
    expect(envelope.meta.path, '/auth/sign-in');
  });
}
