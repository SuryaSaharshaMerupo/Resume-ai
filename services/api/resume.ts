// frontend/services/api/resume.ts
import { tokenManager } from "../auth/tokenManager";
import { parseApiResponse } from "./response";
import { downloadResumePdf } from "../pdf/resumePdf";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const resumeApi = {
  tailor: async (file: File, jd: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("jd", jd);
    const res = await fetch(`${BASE}/resume/tailor`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenManager.getToken()}` },
      body: form,
    });
    return parseApiResponse(res);
  },

  history: async () => {
    const res = await fetch(`${BASE}/resume/history`, {
      headers: {
        Authorization: `Bearer ${tokenManager.getToken()}`,
        "Content-Type": "application/json",
      },
    });
    return parseApiResponse(res);
  },

  chatEdit: async (resume_text: string, instruction: string) => {
    const res = await fetch(`${BASE}/resume/chat-edit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenManager.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume_text, instruction }),
    });
    return parseApiResponse(res);
  },

  download: async (resumeId: number) => {
    const res = await fetch(`${BASE}/resume/${resumeId}/download`, {
      headers: { Authorization: `Bearer ${tokenManager.getToken()}` },
    });
    if (!res.ok) throw new Error("Download failed");
    const resumeText = await res.text();
    downloadResumePdf(resumeText, `resume_${resumeId}.pdf`);
  },

  downloadFromText: (resumeText: string, fileName = "resume.pdf") => {
    downloadResumePdf(resumeText, fileName);
  },
};
