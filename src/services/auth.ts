import axios from 'axios';
import api from './api';

type LoginDto = { email: string; password: string };
type TokenResponse = { accessToken: string; refreshToken?: string; expiresIn?: number };

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export async function login(dto: LoginDto): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>('/auth/login', dto);
  const { accessToken, refreshToken } = res.data;
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  return res.data;
}

export function logout(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  // Optionally call server logout endpoint:
  void api.post('/auth/logout').catch(() => { /* ignore */ });
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

// Basic refresh helper (call directly where needed)
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error('No refresh token available');
  const resp = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, { refreshToken });
  const { accessToken } = resp.data as TokenResponse;
  if (!accessToken) throw new Error('Refresh failed');
  localStorage.setItem(ACCESS_KEY, accessToken);
  return accessToken;
}