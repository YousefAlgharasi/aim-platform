class AppConfig {
  const AppConfig({
    required this.environment,
    required this.backendApiBaseUrl,
    required this.supabaseUrl,
    required this.supabaseAnonKey,
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
      // Public client-safe Supabase config — NOT secrets.
      // Pass via --dart-define=SUPABASE_URL=https://...supabase.co
      // and --dart-define=SUPABASE_ANON_KEY=<anon-key>
      // Never pass SUPABASE_SERVICE_ROLE_KEY or SUPABASE_JWT_SECRET to Flutter.
      supabaseUrl: String.fromEnvironment(
        'SUPABASE_URL',
        defaultValue: 'https://placeholder.supabase.co',
      ),
      supabaseAnonKey: String.fromEnvironment(
        'SUPABASE_ANON_KEY',
        defaultValue: '',
      ),
    );
  }

  final String environment;
  final String backendApiBaseUrl;

  /// Public Supabase project URL (client-safe, not a secret).
  final String supabaseUrl;

  /// Public Supabase anon key (client-safe, not a secret).
  final String supabaseAnonKey;

  bool get isProduction => environment == 'production';
}
