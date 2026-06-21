export { AdminApiClient, adminApiClient } from './admin-api-client';
export { AdminApiClientError } from './admin-api-client-error';
export { getAdminApiConfig } from './admin-api-config';
export type { AdminApiConfig } from './admin-api-config';
export type { ApiErrorEnvelope } from './api-error-envelope';
export type { ApiMeta } from './api-meta';
export type {
  ApiFailureEnvelope,
  ApiJsonDecoder,
  ApiResponseEnvelope,
  ApiSuccessEnvelope,
} from './api-response-envelope';
export { parseApiResponseEnvelope } from './api-response-envelope';

// P11-010: Phase 11 additions
export { getAdminToken } from './admin-token';
export type { AdminPaginatedResponse } from './admin-paginated-response';
export { decodePaginatedResponse } from './admin-paginated-response';
export * from './admin-assessments-api';
export * from './admin-deadlines-api';
export * from './admin-assessment-results-api';
export * from './admin-student-progress-api';
export * from './admin-aim-data-api';
export * from './admin-logs-api';
export * from './admin-reports-api';
