"use client";

import { Card } from "@/components/ui/card";
import { StorePicker } from "@/components/StorePicker/StorePicker";
import { useStorePicker } from "@/components/StorePicker/useStorePicker";
import { useAuth } from "@/contexts/AuthContext";

// Same picker as the sign-in step, in a page-sized card.
export function MyMarkets() {
  const { user } = useAuth();
  const picker = useStorePicker(user?.id ?? null);

  const save = async () => {
    // A full load, so the list prices and "Samo moji marketi" pick up the new stores.
    if (await picker.save()) window.location.assign("/proizvodi");
  };

  return (
    <main className="flex flex-1 justify-center px-4 py-8 lg:py-12">
      <Card className="h-fit w-full max-w-[640px] rounded-[24px] border-line bg-white p-[clamp(24px,6vw,44px)] shadow-none">
        <StorePicker picker={picker} onSave={save} />
      </Card>
    </main>
  );
}
