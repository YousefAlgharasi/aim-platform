// The backend (NestJS, services/backend-api) is the sole auth authority.
// Flutter never talks to Supabase (or any identity provider) directly —
// all auth flows (login/refresh/register/logout) go through BackendApiPaths.
class AppConfig {
  const AppConfig({
    required this.environment,
    required this.backendApiBaseUrl,
    this.googleServerClientId,
    this.supabaseUrl = 'https://yrarpdkvdxszgxxondkt.supabase.co',
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
      googleServerClientId: String.fromEnvironment(
        'GOOGLE_SERVER_CLIENT_ID',
        defaultValue:
            '766098419690-g9ve6up7ih41klmp5igmkd6v0jb1je4v.apps.googleusercontent.com',
      ),
      supabaseUrl: String.fromEnvironment(
        'SUPABASE_URL',
        defaultValue: 'https://yrarpdkvdxszgxxondkt.supabase.co',
      ),
    );
  }

  final String environment;
  final String backendApiBaseUrl;
  final String? googleServerClientId;
  final String supabaseUrl;

  bool get isProduction => environment == 'production';
}

