/// Custom URI scheme used to receive Supabase auth redirects (e.g. email
/// confirmation links) directly inside the app instead of a browser.
///
/// Must match the `<data android:scheme="..." android:host="..."/>` entry in
/// AndroidManifest.xml and the `CFBundleURLSchemes` entry in Info.plist.
const authDeepLinkScheme = 'com.aim.ailearn';
const authDeepLinkHost = 'auth-callback';
const authDeepLinkRedirectUrl = '$authDeepLinkScheme://$authDeepLinkHost';
