import { redirect } from "next/navigation";

// The e-mail sign-in now lives inside /prijava; old links keep working.
export default async function EmailRedirect({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  redirect(next ? `/prijava?next=${encodeURIComponent(next)}` : "/prijava");
}
