export type SettingsFlow = {
  step: "settings" | "confirm";
  // Focus goes back to "Obriši nalog" when the user returns from the delete step.
  returned: boolean;
  confirmed: boolean;
  deleting: boolean;
  failed: boolean;
};

export type SettingsFlowAction =
  | { type: "reset" }
  | { type: "askDelete" }
  | { type: "back" }
  | { type: "confirm"; confirmed: boolean }
  | { type: "deleteStarted" }
  | { type: "deleteFailed" };

export const initialSettingsFlow: SettingsFlow = {
  step: "settings",
  returned: false,
  confirmed: false,
  deleting: false,
  failed: false,
};

// Nothing but the end of a delete may change the flow while one is running.
export function settingsFlowReducer(state: SettingsFlow, action: SettingsFlowAction): SettingsFlow {
  if (action.type === "reset") return initialSettingsFlow;
  if (action.type === "deleteFailed") return { ...state, deleting: false, failed: true };
  if (state.deleting) return state;

  switch (action.type) {
    case "askDelete":
      return { ...state, step: "confirm", confirmed: false, failed: false };
    case "back":
      return { ...state, step: "settings", returned: true, confirmed: false, failed: false };
    case "confirm":
      return { ...state, confirmed: action.confirmed };
    case "deleteStarted":
      return state.confirmed ? { ...state, deleting: true, failed: false } : state;
  }
}
