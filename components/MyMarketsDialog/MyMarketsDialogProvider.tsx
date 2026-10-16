"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SETTINGS_ON_SUBSCRIPTION } from "@/components/SettingsDialog/settings";
import { useSettingsDialog } from "@/components/SettingsDialog/SettingsDialogProvider";
import { useHistoryParam } from "@/hooks/useHistoryParam";
import { MY_MARKETS_PARAM, myMarketsDialogMode, signedInAs } from "./myMarkets";
import { MyMarketsDialog } from "./MyMarketsDialog";
import { MyMarketsPicker } from "./MyMarketsPicker";

const MyMarketsDialogContext = createContext<{ open: (trigger?: HTMLElement | null) => void } | null>(null);

interface MyMarketsDialogProviderProps {
  // The account has fewer than two stores: the dialog opens by itself and cannot be closed.
  required: boolean;
  children: ReactNode;
}

export function MyMarketsDialogProvider({ required, children }: MyMarketsDialogProviderProps) {
  const { user, signOutUser } = useAuth();
  const settings = useSettingsDialog();
  const { value, open, takeTrigger, close, restoreFocus } = useHistoryParam(MY_MARKETS_PARAM);
  const mode = myMarketsDialogMode({ required, requested: value !== null });
  const signOut = !mode.dismissable && user ? { ...signedInAs(user), onSignOut: signOutUser } : undefined;
  // Premium is explained in the settings dialog; swap the two instead of stacking them, and let
  // closing settings return focus to where the picker was opened from.
  const goToSettings = () => settings.openInPlace(takeTrigger(), SETTINGS_ON_SUBSCRIPTION, MY_MARKETS_PARAM);
  const context = useMemo(() => ({ open: (trigger?: HTMLElement | null) => open("1", trigger) }), [open]);

  return (
    <MyMarketsDialogContext.Provider value={context}>
      {children}
      <MyMarketsDialog {...mode} onClose={close} onRestoreFocus={restoreFocus}>
        <MyMarketsPicker signOut={signOut} dismissable={mode.dismissable} onOpenSettings={goToSettings} />
      </MyMarketsDialog>
    </MyMarketsDialogContext.Provider>
  );
}

export function useMyMarketsDialog() {
  const context = useContext(MyMarketsDialogContext);
  if (!context) throw new Error("useMyMarketsDialog must be used inside MyMarketsDialogProvider");
  return context;
}
