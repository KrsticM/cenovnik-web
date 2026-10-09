"use client";

import { DialogTitle } from "@/components/ui/dialog";
import { StorePicker } from "@/components/StorePicker/StorePicker";
import { useStorePicker } from "@/components/StorePicker/useStorePicker";
import { useAuth } from "@/contexts/AuthContext";
import { withParam } from "@/lib/urlParam";
import { MY_MARKETS_PARAM } from "./myMarkets";

// Mounted only while the dialog is open, so every opening starts from the saved stores.
export function MyMarketsPicker() {
  const { user } = useAuth();
  const picker = useStorePicker(user?.id ?? null);

  const save = async () => {
    // A full load, so prices and "Samo moji marketi" pick up the new stores and the layout checks them again.
    if (await picker.save()) window.location.assign(withParam(window.location.href, MY_MARKETS_PARAM, null));
  };

  return <StorePicker picker={picker} onSave={save} heading={DialogTitle} />;
}
