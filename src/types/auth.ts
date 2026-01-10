export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface TokenPayload {
  sub: string;
  email: string;
  type: string;
  exp: number;
  iat: number;
}