"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistoryParam } from "@/hooks/useHistoryParam";
import { usePlatform } from "@/hooks/usePlatform";
import { useSubscription } from "@/hooks/useSubscription";
import { subscriptionCopy } from "@/lib/subscription";
import type { SettingsContentProps } from "./SettingsContent";
import { SETTINGS_ON_SUBSCRIPTION, SETTINGS_PARAM, accountSummary } from "./settings";
import { useDeleteAccountFlow } from "./useDeleteAccountFlow";

interface ControllerOptions {
  // Another dialog that cannot be closed is on screen (the market picker); two stacked modals would trap focus against each other.
  suppressed: boolean;
}

// Everything the settings dialog knows and does; the components only receive what they show.
export function useSettingsDialogController({ suppressed }: ControllerOptions) {
  const { user, deleteAccount } = useAuth();
  const { value, open, swapIn, close, restoreFocus } = useHistoryParam(SETTINGS_PARAM);
  const platform = usePlatform();
  const { flow, reset, askDelete, back, deletion } = useDeleteAccountFlow(deleteAccount);
  // The days left are read against the moment the dialog was opened.
  const [now, setNow] = useState(() => Date.now());
  // A delete in flight keeps the dialog up even if the history entry is gone.
  const isOpen = !suppressed && ((value !== null && user !== null) || flow.deleting);
  const { state: subscription, retry } = useSubscription(isOpen);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (value === null && flow.deleting) open("1");
  }, [value, flow.deleting, open]);

  const openDialog = useCallback(
    (trigger?: HTMLElement | null) => {
      reset();
      setNow(Date.now());
      open("1", trigger);
    },
    [open, reset]
  );

  // Opens the dialog in place of another one (the market picker), returning focus to where that one came from.
  const openInPlace = useCallback(
    (trigger: HTMLElement | null, value: string, replacing: string) => {
      reset();
      setNow(Date.now());
      swapIn(value, trigger, replacing);
    },
    [reset, swapIn]
  );

  const details = subscription.status === "premium" ? subscription.details : null;
  const copy = subscriptionCopy(details, now);
  const activePremium = subscription.status === "premium" && !copy.cancelled;
  const qrUrl = isOpen && platform === "other" && typeof window !== "undefined" ? new URL("/preuzmi", window.location.origin).href : null;

  const settings: SettingsContentProps | null = user
    ? {
        subscription,
        subscriptionCopy: copy,
        platform,
        qrUrl,
        account: accountSummary(user),
        focusDelete: flow.returned,
        focusSubscription: value === SETTINGS_ON_SUBSCRIPTION,
        onRetry: retry,
        onDelete: askDelete,
      }
    : null;

  return {
    open: openDialog,
    openInPlace,
    dialog: {
      open: isOpen,
      locked: flow.deleting,
      onClose: close,
      onEscape: flow.step === "confirm" ? back : undefined,
      onRestoreFocus: restoreFocus,
    },
    step: flow.step,
    settings,
    deletion: { ...deletion, subscriptionNote: activePremium ? copy.deleteNote : null },
    onBack: back,
  };
}
