"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DeleteAccountStep } from "./DeleteAccountStep";
import { SettingsContent } from "./SettingsContent";
import { SettingsDialog } from "./SettingsDialog";
import { BackHeader } from "./SettingsHeader";
import { useSettingsDialogController } from "./useSettingsDialogController";

const SettingsDialogContext = createContext<{ open: (trigger?: HTMLElement | null) => void } | null>(null);

export function SettingsDialogProvider({ children }: { children: ReactNode }) {
  const { open, dialog, step, settings, deletion, onBack } = useSettingsDialogController();
  const context = useMemo(() => ({ open }), [open]);

  return (
    <SettingsDialogContext.Provider value={context}>
      {children}
      <SettingsDialog {...dialog}>
        {step === "settings" && settings && <SettingsContent {...settings} />}
        {step === "confirm" && (
          <>
            <BackHeader disabled={deletion.pending} onBack={onBack} />
            <DeleteAccountStep {...deletion} />
          </>
        )}
      </SettingsDialog>
    </SettingsDialogContext.Provider>
  );
}

export function useSettingsDialog() {
  const context = useContext(SettingsDialogContext);
  if (!context) throw new Error("useSettingsDialog must be used inside SettingsDialogProvider");
  return context;
}
