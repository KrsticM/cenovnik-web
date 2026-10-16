"use client";

import { useRef, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { SETTINGS_ON_SUBSCRIPTION, SETTINGS_PARAM } from "@/components/SettingsDialog/settings";
import { StorePicker } from "@/components/StorePicker/StorePicker";
import { premiumStep } from "@/components/StorePicker/storePickerModel";
import { useStorePicker } from "@/components/StorePicker/useStorePicker";
import { useAuth } from "@/contexts/AuthContext";
import { withParam } from "@/lib/urlParam";
import { MY_MARKETS_PARAM } from "./myMarkets";
import { PremiumSaveDialog } from "./PremiumSaveDialog";
import type { SignedInLineProps } from "./SignedInLine";

const withoutMyMarkets = (href: string) => withParam(href, MY_MARKETS_PARAM, null);

interface MyMarketsPickerProps {
  signOut?: SignedInLineProps;
  // False while the dialog cannot be closed.
  dismissable: boolean;
  // Swaps this dialog for the settings dialog, on its subscription section.
  onOpenSettings: () => void;
}

// Mounted only while the dialog is open, so every opening starts from the saved stores.
export function MyMarketsPicker({ signOut, dismissable, onOpenSettings }: MyMarketsPickerProps) {
  const { user } = useAuth();
  const picker = useStorePicker(user?.id ?? null);
  const [asking, setAsking] = useState(false);
  const upgradeTrigger = useRef<HTMLElement | null>(null);

  const save = async () => {
    // A full load, so prices and "Samo moji marketi" pick up the new stores and the layout checks them again.
    if (await picker.save()) window.location.assign(withoutMyMarkets(window.location.href));
  };

  const settingsUrl = () => withParam(withoutMyMarkets(window.location.href), SETTINGS_PARAM, SETTINGS_ON_SUBSCRIPTION);

  const goToSettings = () => {
    setAsking(false);
    onOpenSettings();
  };

  const saveAndGoToSettings = async () => {
    if (await picker.save()) window.location.assign(settingsUrl());
  };

  return (
    <>
      <StorePicker
        picker={picker}
        onSave={save}
        heading={DialogTitle}
        signOut={signOut}
        onUpgrade={(trigger) => {
          upgradeTrigger.current = trigger;
          if (premiumStep(picker.dirty) === "ask") setAsking(true);
          else goToSettings();
        }}
      />
      <PremiumSaveDialog
        open={asking}
        canSkip={dismissable}
        saving={picker.saving}
        failed={picker.saveFailed}
        onSave={saveAndGoToSettings}
        onSkip={goToSettings}
        onStay={() => setAsking(false)}
        onRestoreFocus={() => upgradeTrigger.current?.focus()}
      />
    </>
  );
}
