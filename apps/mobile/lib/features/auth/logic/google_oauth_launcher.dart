import 'package:url_launcher/url_launcher.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';

/// Opens the system browser at the backend's `GET /auth/google` endpoint to
/// start the Google OAuth redirect flow.
///
/// The backend already implements the full flow (redirect to Google →
/// `GET /auth/google/callback` → creates/signs in the user → redirects back
/// to the app's `aimapp://login-callback` deep link with session tokens in
/// the URL fragment). [DeepLinkHandler] picks that redirect up the same way
/// it already handles the email-confirmation and password-reset links, so
/// there is nothing else to wire up on the Flutter side — no Google SDK,
/// no ID token handling here.
Future<bool> launchGoogleOAuth(String backendApiBaseUrl) {
  final url = Uri.parse(
    '${backendApiBaseUrl.replaceAll(RegExp(r'/$'), '')}${BackendApiPaths.authGoogle}',
  );

  return launchUrl(url, mode: LaunchMode.externalApplication);
}
