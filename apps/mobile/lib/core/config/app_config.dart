// The backend (NestJS, services/backend-api) is the sole auth authority.
// Flutter never talks to Supabase (or any identity provider) directly —
// all auth flows (login/refresh/register/logout) go through BackendApiPaths.
class AppConfig {
  const AppConfig({
    required this.environment,
    required this.backendApiBaseUrl,
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
    );
  }

  final String environment;
  final String backendApiBaseUrl;

  bool get isProduction => environment == 'production';
}
