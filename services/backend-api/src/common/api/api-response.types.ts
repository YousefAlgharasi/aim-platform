export interface ApiResponseMeta {
  readonly timestamp: string;
  readonly path: string;
  readonly method: string;
  readonly requestId?: string;
}

export interface ApiSuccessResponse<TData = unknown> {
  readonly success: true;
  readonly data: TData;
  readonly meta: ApiResponseMeta;
}

export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: unknown;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiErrorBody;
  readonly meta: ApiResponseMeta;
}

export type ApiResponse<TData = unknown> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse;
