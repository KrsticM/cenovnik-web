import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BrandBars } from "@/components/ui/brand-bars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Premium članstvo" };

// Placeholder until plans, prices and web payment are decided.
export default function PremiumPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-8">
      <Card className="flex w-full max-w-[440px] flex-col items-center rounded-[24px] border-line p-[clamp(28px,6vw,44px)] text-center shadow-none">
        <BrandBars />
        <Badge variant="soon" className="mt-[22px]">
          Uskoro
        </Badge>
        <h1 className="mt-3.5 text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink">Premium članstvo</h1>
        <p className="mt-2.5 text-base leading-normal text-ink-muted text-pretty">
          Radimo na ovoj stranici. Uskoro ćeš ovde moći da pređeš na Premium.
        </p>
        <Button asChild variant="sage" size="pill-lg" className="mt-7 px-6 font-medium">
          <Link href="/proizvodi?moji-marketi=1">Nazad na Moje markete</Link>
        </Button>
      </Card>
    </main>
  );
}
