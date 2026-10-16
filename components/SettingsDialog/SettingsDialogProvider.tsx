"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DeleteAccountStep } from "./DeleteAccountStep";
import { SettingsContent } from "./SettingsContent";
import { SettingsDialog } from "./SettingsDialog";
import { BackHeader } from "./SettingsHeader";
import { useSettingsDialogController } from "./useSettingsDialogController";

interface SettingsDialogApi {
  open: (trigger?: HTMLElement | null) => void;
  openInPlace: (trigger: HTMLElement | null, value: string, replacing: string) => void;
}

const SettingsDialogContext = createContext<SettingsDialogApi | null>(null);

export function SettingsDialogProvider({ suppressed = false, children }: { suppressed?: boolean; children: ReactNode }) {
  const { open, openInPlace, dialog, step, settings, deletion, onBack } = useSettingsDialogController({ suppressed });
  const context = useMemo(() => ({ open, openInPlace }), [open, openInPlace]);

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
