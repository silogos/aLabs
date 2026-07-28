/** Standard API error. Maps to the error envelope + status from conventions. */
import { ERROR_STATUS, type ErrorCode } from "@pmin/core";

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
    public status?: number,
  ) {
    super(message);
  }
  get httpStatus(): number {
    return this.status ?? ERROR_STATUS[this.code];
  }
  toJSON() {
    return { error: { code: this.code, message: this.message, details: this.details } };
  }
}

export const badRequest = (m: string, d?: Record<string, unknown>) => new ApiError("validation_error", m, d);
export const unauthorized = (m = "Not authenticated") => new ApiError("unauthorized", m);
export const forbidden = (m = "Forbidden") => new ApiError("forbidden", m);
export const notFound = (m = "Not found") => new ApiError("not_found", m);
export const conflict = (m: string, d?: Record<string, unknown>) => new ApiError("conflict", m, d);
