import { ApiResponse } from "@/types";
import { ApiError } from "../errors/ApiError";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  let json: ApiResponse<T>;

  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, "Invalid JSON response");
  }

  if (!res.ok) {
    throw new ApiError(res.status, json.message || "An error occurred");
  }

  return json.data;
}
