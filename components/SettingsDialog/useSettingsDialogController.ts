"use client";

import { useCallback, useReducer } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistoryParam } from "@/hooks/useHistoryParam";
import { usePlatform } from "@/hooks/usePlatform";
import { useSubscription } from "@/hooks/useSubscription";
import { subscriptionCopy } from "@/lib/subscription";
import type { DeleteAccountStepProps } from "./DeleteAccountStep";
import type { SettingsContentProps } from "./SettingsContent";
import { SETTINGS_PARAM, accountSummary } from "./settings";
import { initialSettingsFlow, settingsFlowReducer } from "./settingsFlow";

// Everything the settings dialog knows and does; the components only receive what they show.
export function useSettingsDialogController() {
  const { user, deleteAccount } = useAuth();
  const { value, open, close, restoreFocus } = useHistoryParam(SETTINGS_PARAM);
  const platform = usePlatform();
  const isOpen = value !== null && user !== null;
  const { state: subscription, retry } = useSubscription(isOpen);
  const [flow, dispatch] = useReducer(settingsFlowReducer, initialSettingsFlow);

  const openDialog = useCallback(
    (trigger?: HTMLElement | null) => {
      dispatch({ type: "reset" });
      open("1", trigger);
    },
    [open]
  );

  const back = () => dispatch({ type: "back" });

  const confirmDelete = async () => {
    if (!flow.confirmed || flow.deleting) return;
    dispatch({ type: "deleteStarted" });
    try {
      await deleteAccount();
    } catch {
      dispatch({ type: "deleteFailed" });
    }
  };

  const details = subscription.status === "premium" ? subscription.details : null;
  const copy = subscriptionCopy(details);
  const activePremium = subscription.status === "premium" && !copy.cancelled;
  const qrUrl = platform === "other" && typeof window !== "undefined" ? new URL("/preuzmi", window.location.origin).href : null;

  const settings: SettingsContentProps | null = user
    ? {
        subscription,
        subscriptionCopy: copy,
        platform,
        qrUrl,
        account: accountSummary(user),
        focusDelete: flow.returned,
        onRetry: retry,
        onDelete: () => dispatch({ type: "askDelete" }),
      }
    : null;

  const deletion: DeleteAccountStepProps = {
    subscriptionNote: activePremium ? copy.deleteNote : null,
    confirmed: flow.confirmed,
    pending: flow.deleting,
    failed: flow.failed,
    onConfirmedChange: (confirmed) => dispatch({ type: "confirm", confirmed }),
    onConfirm: confirmDelete,
    onCancel: back,
  };

  return {
    open: openDialog,
    dialog: {
      open: isOpen,
      locked: flow.deleting,
      onClose: close,
      onEscape: flow.step === "confirm" ? back : undefined,
      onRestoreFocus: restoreFocus,
    },
    step: flow.step,
    settings,
    deletion,
    onBack: back,
  };
}
