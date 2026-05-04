// frontend/services/api/auth.ts
import { parseApiResponse } from "./response";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  signup: async (data: { email: string; full_name: string; password: string; role: string }) => {
    const res = await fetch(`${BASE}/auth/signup`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },
  login: async (data: { email: string; password: string }) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },
  verifyOtp: async (data: { email: string; otp_code: string; purpose: string }) => {
    const res = await fetch(`${BASE}/auth/verify-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },
  resendOtp: async (email: string, purpose: string) => {
    const res = await fetch(`${BASE}/auth/resend-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });
    return parseApiResponse(res);
  },
};
