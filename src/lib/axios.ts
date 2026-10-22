import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

const REFRESH_KEY = "careermate.refresh";
let accessToken: string | null = null;
let refreshInFlight: Promise<string> | null = null;

export type AuthUser = { id: string; name: string; email: string; emailVerified: boolean; avatarUrl: string | null };
export type AuthSession = { accessToken: string; refreshToken: string; expiresIn: number; user: AuthUser };

export function saveAuthSession(session: AuthSession) {
  accessToken = session.accessToken;
  if (typeof window !== "undefined") window.sessionStorage.setItem(REFRESH_KEY, session.refreshToken);
}

export function clearAuthSession() {
  accessToken = null;
  if (typeof window !== "undefined") window.sessionStorage.removeItem(REFRESH_KEY);
}

export function getRefreshToken() {
  return typeof window === "undefined" ? null : window.sessionStorage.getItem(REFRESH_KEY);
}

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No active session");
    const response = await axios.post<{ data: AuthSession }>(`${api.defaults.baseURL}/auth/refresh`, { refreshToken }, { timeout: 10_000 });
    saveAuthSession(response.data.data);
    return response.data.data.accessToken;
  })();
  try {
    return await refreshInFlight;
  } catch (error) {
    clearAuthSession();
    throw error;
  } finally {
    refreshInFlight = null;
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as (typeof error.config & { _authRetry?: boolean }) | undefined;
    if (error.response?.status !== 401 || !request || request._authRetry || String(request.url).includes("/auth/")) throw error;
    request._authRetry = true;
    try {
      const token = await refreshAccessToken();
      request.headers.Authorization = `Bearer ${token}`;
      return api(request);
    } catch {
      throw error;
    }
  },
);

export async function exchangeGoogleHandoff(handoffCode: string) {
  const response = await api.post<{ data: AuthSession }>("/auth/google/exchange", { handoffCode });
  saveAuthSession(response.data.data);
  return response.data.data;
}

export async function restoreAuthSession() {
  return refreshAccessToken();
}

export async function requestAuthSession(email: string, password: string) {
  const response = await api.post<{ data: AuthSession }>("/auth/login", { email, password });
  saveAuthSession(response.data.data);
  return response.data.data;
}
