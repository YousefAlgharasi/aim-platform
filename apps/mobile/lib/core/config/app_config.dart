// The backend (NestJS, services/backend-api) is the sole auth authority.
// Flutter never talks to Supabase (or any identity provider) directly —
// all auth flows (login/refresh/register/logout) go through BackendApiPaths.
class AppConfig {
  const AppConfig({
    required this.environment,
    required this.backendApiBaseUrl,
    required this.googleWebClientId,
  });

  factory AppConfig.fromEnvironment() {
    return const AppConfig(
      environment: String.fromEnvironment(
        'AIM_ENV',
        defaultValue: 'local',
      ),
      backendApiBaseUrl: String.fromEnvironment(
        'BACKEND_API_BASE_URL',
        defaultValue: 'http://localhost:3000',
      ),
      // Must be the OAuth "Web application" client ID from the same Google
      // Cloud project as the Google provider configured in Supabase Auth —
      // its audience is what Supabase validates the ID token against, not
      // the Android client used for the sign-in flow itself.
      googleWebClientId: String.fromEnvironment(
        'GOOGLE_WEB_CLIENT_ID',
        defaultValue: '',
      ),
    );
  }

  final String environment;
  final String backendApiBaseUrl;
  final String googleWebClientId;

  bool get isProduction => environment == 'production';
}
