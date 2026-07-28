export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();

  if (error && typeof error === "object") {
    const candidate = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [candidate.message, candidate.details, candidate.hint]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim());
    if (parts.length) return [...new Set(parts)].join(" ");
    if (typeof candidate.code === "string" && candidate.code.trim()) return `${fallback} (kode: ${candidate.code.trim()})`;
  }

  return fallback;
}
