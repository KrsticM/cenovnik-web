"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistoryParam } from "@/hooks/useHistoryParam";
import { usePlatform } from "@/hooks/usePlatform";
import { useSubscription } from "@/hooks/useSubscription";
import { subscriptionCopy } from "@/lib/subscription";
import type { DeleteAccountStepProps } from "./DeleteAccountStep";
import type { SettingsContentProps } from "./SettingsContent";
import { SETTINGS_PARAM, accountSummary } from "./settings";
import { initialSettingsFlow, settingsFlowReducer } from "./settingsFlow";

interface ControllerOptions {
  // Another dialog that cannot be closed is on screen (the market picker); two stacked modals would trap focus against each other.
  suppressed: boolean;
}

// Everything the settings dialog knows and does; the components only receive what they show.
export function useSettingsDialogController({ suppressed }: ControllerOptions) {
  const { user, deleteAccount } = useAuth();
  const { value, open, close, restoreFocus } = useHistoryParam(SETTINGS_PARAM);
  const platform = usePlatform();
  const [flow, dispatch] = useReducer(settingsFlowReducer, initialSettingsFlow);
  // A delete in flight keeps the dialog up even if the history entry is gone.
  const isOpen = !suppressed && ((value !== null && user !== null) || flow.deleting);
  const { state: subscription, retry } = useSubscription(isOpen);

  useEffect(() => {
    if (!isOpen) dispatch({ type: "reset" });
  }, [isOpen]);

  useEffect(() => {
    if (value === null && flow.deleting) open("1");
  }, [value, flow.deleting, open]);

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
  const qrUrl = isOpen && platform === "other" && typeof window !== "undefined" ? new URL("/preuzmi", window.location.origin).href : null;

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
