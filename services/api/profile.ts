// frontend/services/api/profile.ts
import { tokenManager } from "../auth/tokenManager";
import { parseApiResponse } from "./response";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${tokenManager.getToken()}`,
});

export const profileApi = {
  get: async () => {
    const res = await fetch(`${BASE}/profile/`, { headers: authHeaders() });
    return parseApiResponse(res);
  },

  update: async (data: object) => {
    const res = await fetch(`${BASE}/profile/`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  autofill: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/profile/autofill`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenManager.getToken()}` },
      body: form,
    });
    return parseApiResponse(res);
  },
};
