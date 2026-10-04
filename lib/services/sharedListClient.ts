import type { SharedList, SharedListResult } from "@/lib/services/sharedList";

const UNAVAILABLE = "Lista trenutno nije dostupna.";

export async function fetchSharedListFromApi(token: string): Promise<SharedListResult> {
  try {
    const response = await fetch(`/api/lista/${encodeURIComponent(token)}`, { cache: "no-store" });
    if (response.status === 404) return { status: "not-found" };
    const body = await response.json();
    if (!response.ok) return { status: "error", message: body.error || UNAVAILABLE };
    return { status: "ok", list: body as SharedList };
  } catch {
    return { status: "error", message: UNAVAILABLE };
  }
}
