"use client";

import { useCallback, useReducer } from "react";
import type { DeleteAccountStepProps } from "./DeleteAccountStep";
import { initialSettingsFlow, settingsFlowReducer } from "./settingsFlow";

// The two steps of deleting an account (settings, then confirm) and the delete itself; what the step shows besides this is up to the caller.
export function useDeleteAccountFlow(deleteAccount: () => Promise<void>) {
  const [flow, dispatch] = useReducer(settingsFlowReducer, initialSettingsFlow);

  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const askDelete = useCallback(() => dispatch({ type: "askDelete" }), []);
  const back = useCallback(() => dispatch({ type: "back" }), []);

  const confirmDelete = async () => {
    if (!flow.confirmed || flow.deleting) return;
    dispatch({ type: "deleteStarted" });
    try {
      await deleteAccount();
    } catch {
      dispatch({ type: "deleteFailed" });
    }
  };

  const deletion: Omit<DeleteAccountStepProps, "subscriptionNote"> = {
    confirmed: flow.confirmed,
    pending: flow.deleting,
    failed: flow.failed,
    onConfirmedChange: (confirmed) => dispatch({ type: "confirm", confirmed }),
    onConfirm: confirmDelete,
    onCancel: back,
  };

  return { flow, reset, askDelete, back, deletion };
}
