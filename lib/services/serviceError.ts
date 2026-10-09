// supabase-js returns errors as plain objects; wrapping keeps the code for logs and retry decisions.
export class ServiceError extends Error {
  code: string;

  constructor(error: { message?: string; code?: string; details?: string | null }) {
    super(error.message || "Unknown error");
    this.name = "ServiceError";
    this.code = error.code ?? "";
  }

  // We cancelled it ourselves (a newer search replaced it); never retried or reported.
  get aborted(): boolean {
    return /AbortError/.test(this.message);
  }

  // Statement timeout, expired session, network failure or gateway hiccup: worth one more try.
  get transient(): boolean {
    if (this.aborted) return false;
    return (
      this.code === "57014" ||
      this.code === "PGRST301" ||
      this.code === "PGRST303" ||
      this.code === "" ||
      /fetch|network|timeout|aborted/i.test(this.message)
    );
  }
}

export function isAborted(err: unknown): boolean {
  return err instanceof ServiceError ? err.aborted : err instanceof DOMException && err.name === "AbortError";
}

export function isTransient(err: unknown): boolean {
  return err instanceof ServiceError ? err.transient : err instanceof TypeError;
}
