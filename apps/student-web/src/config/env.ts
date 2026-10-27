interface AppConfig {
  apiBaseUrl: string;
  /** Google OAuth web client ID; Google sign-in is hidden when unset. */
  googleClientId: string;
}

// Defaults to same-origin `/api`, which nginx (production) or the CRA dev proxy
// (src/setupProxy.js) forwards to the backend with the `/api` prefix stripped.
export const config: AppConfig = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || '/api',
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
};
