import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../../core/errors/app_exception.dart';
import 'supabase_auth_datasource.dart';

/// Calls the Supabase Auth REST API using the public anon key.
///
/// The Supabase URL and anon key are public client-safe values — they are
/// NOT secrets. The service-role key, JWT secret, and AI provider keys must
/// never appear here or anywhere in Flutter code.
class SupabaseAuthDatasourceImpl implements SupabaseAuthDatasource {
  const SupabaseAuthDatasourceImpl({
    required String supabaseUrl,
    required String supabaseAnonKey,
    http.Client? httpClient,
  })  : _supabaseUrl = supabaseUrl,
        _supabaseAnonKey = supabaseAnonKey,
        _httpClient = httpClient;

  final String _supabaseUrl;
  final String _supabaseAnonKey;
  final http.Client? _httpClient;

  http.Client get _client => _httpClient ?? http.Client();

  /// POST /auth/v1/token?grant_type=password
  @override
  Future<String> signInWithEmailPassword({
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse('$_supabaseUrl/auth/v1/token').replace(
      queryParameters: {'grant_type': 'password'},
    );

    final http.Response response;
    try {
      response = await _client.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabaseAnonKey,
        },
        body: jsonEncode({'email': email, 'password': password}),
      );
    } catch (_) {
      throw const AppException(
        message: 'Unable to reach the authentication service.',
        code: 'AUTH_NETWORK_ERROR',
      );
    }

    final Map<String, dynamic> body;
    try {
      body = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      throw const AppException(
        message: 'Unexpected response from authentication service.',
        code: 'AUTH_INVALID_RESPONSE',
      );
    }

    if (response.statusCode == 200) {
      final accessToken = body['access_token'];
      if (accessToken is! String || accessToken.isEmpty) {
        throw const AppException(
          message: 'Authentication succeeded but no token was returned.',
          code: 'AUTH_MISSING_TOKEN',
        );
      }
      return accessToken;
    }

    // Supabase returns error_description or error on failure.
    final errorDesc = body['error_description'] as String?;
    final errorCode = body['error'] as String?;

    throw AppException(
      message: errorDesc ?? 'Sign in failed. Please check your credentials.',
      code: errorCode ?? 'AUTH_FAILED',
    );
  }

  /// POST /auth/v1/signup
  @override
  Future<SignUpResult> signUpWithEmailPassword({
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse('$_supabaseUrl/auth/v1/signup');

    final http.Response response;
    try {
      response = await _client.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabaseAnonKey,
        },
        body: jsonEncode({'email': email, 'password': password}),
      );
    } catch (_) {
      throw const AppException(
        message: 'Unable to reach the authentication service.',
        code: 'AUTH_NETWORK_ERROR',
      );
    }

    final Map<String, dynamic> body;
    try {
      body = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      throw const AppException(
        message: 'Unexpected response from authentication service.',
        code: 'AUTH_INVALID_RESPONSE',
      );
    }

    if (response.statusCode == 200) {
      final accessToken = body['access_token'] as String?;
      // Supabase returns access_token when email confirmation is disabled.
      // When confirmation is required it returns user object without a token.
      final requiresConfirmation =
          accessToken == null || accessToken.isEmpty;

      return SignUpResult(
        email: email,
        accessToken: requiresConfirmation ? null : accessToken,
        requiresEmailConfirmation: requiresConfirmation,
      );
    }

    final errorDesc = body['error_description'] as String?;
    final errorCode = body['error'] as String?;
    final msg = body['msg'] as String?; // some Supabase versions use msg

    throw AppException(
      message: errorDesc ?? msg ?? 'Registration failed. Please try again.',
      code: errorCode ?? 'REGISTER_FAILED',
    );
  }
}
