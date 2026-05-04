// frontend/services/api/profile.ts
import { tokenManager } from "../auth/tokenManager";
import { apiUrl } from "./config";
import { parseApiResponse } from "./response";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${tokenManager.getToken()}`,
});

export const profileApi = {
  get: async () => {
    const res = await fetch(apiUrl("/profile/"), { headers: authHeaders() });
    return parseApiResponse(res);
  },

  update: async (data: object) => {
    const res = await fetch(apiUrl("/profile/"), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  autofill: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(apiUrl("/profile/autofill"), {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenManager.getToken()}` },
      body: form,
    });
    return parseApiResponse(res);
  },
};
