import type { User } from '@tracker/database';

export interface UserMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthRegisterPayload extends UserMetadata {
  email: string;
  password: string;
  countryCode?: string;
  baseCurrencyCode?: string;
}

export interface AuthLoginPayload extends UserMetadata {
  email: string;
  password: string;
}

export interface AuthRefreshTokensPayload extends UserMetadata {
  refreshToken: string;
}

export interface AuthVerifyEmailPayload {
  token: string;
}

export interface AuthLogoutPayload {
  refreshToken: string;
}

export interface AuthLogoutAllPayload {
  userId: string;
}

export type AuthUser = Omit<
  User,
  | 'passwordHash'
  | 'emailVerificationToken'
  | 'emailVerificationTokenExpiresAt'
  | 'deletedAt'
>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthRefreshResponse {
  accessToken: string;
  refreshToken: string;
}
