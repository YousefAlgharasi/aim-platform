export type AdminApiConfig = {
  readonly backendApiBaseUrl: string;
};

const DEFAULT_BACKEND_API_BASE_URL = 'http://localhost:3000';

export function getAdminApiConfig(): AdminApiConfig {
  return {
    backendApiBaseUrl:
      process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ??
      DEFAULT_BACKEND_API_BASE_URL,
  };
}
