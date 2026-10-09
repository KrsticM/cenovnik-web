"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useHistoryParam } from "@/hooks/useHistoryParam";
import { MY_MARKETS_PARAM, myMarketsDialogMode } from "./myMarkets";
import { MyMarketsDialog } from "./MyMarketsDialog";
import { MyMarketsPicker } from "./MyMarketsPicker";

const MyMarketsDialogContext = createContext<{ open: () => void } | null>(null);

interface MyMarketsDialogProviderProps {
  // The account has fewer than two stores: the dialog opens by itself and cannot be closed.
  required: boolean;
  children: ReactNode;
}

export function MyMarketsDialogProvider({ required, children }: MyMarketsDialogProviderProps) {
  const { value, open, close, restoreFocus } = useHistoryParam(MY_MARKETS_PARAM);
  const mode = myMarketsDialogMode({ required, requested: value !== null });
  const context = useMemo(() => ({ open: () => open("1") }), [open]);

  return (
    <MyMarketsDialogContext.Provider value={context}>
      {children}
      <MyMarketsDialog {...mode} onClose={close} onRestoreFocus={restoreFocus}>
        <MyMarketsPicker />
      </MyMarketsDialog>
    </MyMarketsDialogContext.Provider>
  );
}

export function useMyMarketsDialog() {
  const context = useContext(MyMarketsDialogContext);
  if (!context) throw new Error("useMyMarketsDialog must be used inside MyMarketsDialogProvider");
  return context;
}
