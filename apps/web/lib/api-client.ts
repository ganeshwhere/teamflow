import { auth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestInitOptions = {
  body?: unknown;
  headers?: HeadersInit;
};

async function request<T>(method: HttpMethod, path: string, options?: RequestInitOptions): Promise<T> {
  const session = await auth();
  const apiToken = session?.apiToken;

  if (!apiToken) {
    throw new Error("Missing authenticated session token");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
      ...(options?.headers ?? {})
    },
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const get = <T>(path: string): Promise<T> => request<T>("GET", path);
export const post = <T>(path: string, body?: unknown): Promise<T> => request<T>("POST", path, { body });
export const patch = <T>(path: string, body?: unknown): Promise<T> => request<T>("PATCH", path, { body });
export const del = <T>(path: string): Promise<T> => request<T>("DELETE", path);
