export interface LoginResponse {
  token?: string;
  requiresTwoFactor?: boolean;
  type?: string;
  username?: string;
  email?: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
}

export interface TwoFactorSetupResponse {
  tfaSetupSecret: string;
  tfaType: 'APP' | 'EMAIL';
  success: boolean;
}

export interface TwoFactorVerifyResponse {
  token: string;
  success: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  tfaEnabled: boolean;
}

export interface ApiError {
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  captchaResponse: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  captchaResponse: string;
}

export interface TwoFactorVerifyRequest {
  username: string;
  code: string;
}

export interface PasswordResetResponse {
  message: string;
  valid?: boolean;
  username?: string;
}
