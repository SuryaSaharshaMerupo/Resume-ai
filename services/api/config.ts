const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "";

export function apiUrl(path: string) {
  if (!rawApiBaseUrl) {
    throw new Error(
      "Backend API URL is not configured. Add NEXT_PUBLIC_API_URL in Vercel and redeploy.",
    );
  }

  const base = rawApiBaseUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
}
