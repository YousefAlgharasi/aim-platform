export interface User {
  id: string;
  email: string;
  name: string;
  locale: 'en' | 'ar';
  avatarUrl?: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}
