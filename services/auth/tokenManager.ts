// frontend/services/auth/tokenManager.ts
const TOKEN_KEY = "resumeai_token";
const USER_KEY = "resumeai_user";

export const tokenManager = {
  setToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `resumeai_token=${token}; path=/; max-age=3600; SameSite=Lax`;
  },
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  removeToken: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "resumeai_token=; path=/; max-age=0";
  },
  setUser: (user: object) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: () => {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  },
  isLoggedIn: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },
};