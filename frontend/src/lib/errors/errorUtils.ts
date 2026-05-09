import { ApiError } from "./ApiError";

export function getErrorMessage(error: unknown): string {
  // custom api error
  if (error instanceof ApiError) {
    return error.message;
  }

  // Standard JS error
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  // fallback
  return "Something went wrong!";
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 401;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 404;
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 400;
}
