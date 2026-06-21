import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/networking.dart';

void main() {
  test('attaches bearer token when none provided', () {
    final interceptor = AuthInterceptor(() => 'token-123');

    final headers = interceptor.apply({'accept': 'application/json'});

    expect(headers['authorization'], 'Bearer token-123');
    expect(headers['accept'], 'application/json');
  });

  test('does not attach a header when token is null', () {
    final interceptor = AuthInterceptor(() => null);

    final headers = interceptor.apply({'accept': 'application/json'});

    expect(headers.containsKey('authorization'), isFalse);
  });

  test('does not attach a header when token is empty', () {
    final interceptor = AuthInterceptor(() => '');

    final headers = interceptor.apply(const {});

    expect(headers.containsKey('authorization'), isFalse);
  });

  test('does not override an explicitly provided authorization header', () {
    final interceptor = AuthInterceptor(() => 'token-123');

    final headers = interceptor.apply({'authorization': 'Bearer explicit'});

    expect(headers['authorization'], 'Bearer explicit');
  });

  test('handles null headers input', () {
    final interceptor = AuthInterceptor(() => 'token-123');

    final headers = interceptor.apply(null);

    expect(headers['authorization'], 'Bearer token-123');
  });
}
