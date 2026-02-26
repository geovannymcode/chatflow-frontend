export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    hasVerifiedEmail: boolean;
  };
}

export interface TokenPayload {
  sub: string;
  email: string;
  type: string;
  exp: number;
  iat: number;
}