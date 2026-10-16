import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BrandBars } from "@/components/ui/brand-bars";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/ui/auth-card";
import { Heading, Text } from "@/components/ui/typography";

export const metadata = { title: "Premium članstvo" };

// Placeholder until plans, prices and web payment are decided.
export default function PremiumPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-8">
      <AuthCard variant="notice">
        <BrandBars />
        <Badge variant="soon" className="mt-[22px]">
          Uskoro
        </Badge>
        <Heading className="mt-3.5">Premium članstvo</Heading>
        <Text className="mt-2.5">Radimo na ovoj stranici. Uskoro ćeš ovde moći da pređeš na Premium.</Text>
        <Button asChild variant="sage" size="pill-lg" className="mt-7 px-6 font-medium">
          <Link href="/proizvodi?moji-marketi=1">Nazad na Moje markete</Link>
        </Button>
      </AuthCard>
    </main>
  );
}
