export async function parseApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { detail: await res.text() };

  if (!res.ok) {
    const message = data?.detail || data?.message || `Request failed with status ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}
