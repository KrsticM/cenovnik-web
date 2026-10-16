import { describe, expect, it } from "vitest";
import { initialSettingsFlow, settingsFlowReducer, type SettingsFlow, type SettingsFlowAction } from "./settingsFlow";

const run = (actions: SettingsFlowAction[], from: SettingsFlow = initialSettingsFlow) =>
  actions.reduce(settingsFlowReducer, from);

describe("settingsFlowReducer", () => {
  it("opens the delete step unconfirmed and returns with the focus hint", () => {
    const asked = run([{ type: "askDelete" }, { type: "confirm", confirmed: true }]);
    expect(asked).toMatchObject({ step: "confirm", confirmed: true });

    const back = run([{ type: "back" }], asked);
    expect(back).toMatchObject({ step: "settings", returned: true, confirmed: false });
  });

  it("does not start deleting until the box is ticked", () => {
    expect(run([{ type: "askDelete" }, { type: "deleteStarted" }]).deleting).toBe(false);
    expect(run([{ type: "askDelete" }, { type: "confirm", confirmed: true }, { type: "deleteStarted" }]).deleting).toBe(true);
  });

  it("is locked while deleting, except for the failure that ends it", () => {
    const deleting = run([{ type: "askDelete" }, { type: "confirm", confirmed: true }, { type: "deleteStarted" }]);
    expect(run([{ type: "back" }, { type: "confirm", confirmed: false }, { type: "askDelete" }], deleting)).toBe(deleting);
    expect(run([{ type: "deleteFailed" }], deleting)).toMatchObject({ step: "confirm", deleting: false, failed: true });
  });

  it("clears an earlier failure when the delete is tried again", () => {
    const failed = run([
      { type: "askDelete" },
      { type: "confirm", confirmed: true },
      { type: "deleteStarted" },
      { type: "deleteFailed" },
    ]);
    expect(run([{ type: "deleteStarted" }], failed)).toMatchObject({ deleting: true, failed: false });
  });

  it("starts from the settings step on reset, whatever was left over", () => {
    expect(run([{ type: "askDelete" }, { type: "reset" }])).toEqual(initialSettingsFlow);

    const leftOver = run([
      { type: "askDelete" },
      { type: "confirm", confirmed: true },
      { type: "deleteStarted" },
      { type: "deleteFailed" },
      { type: "back" },
    ]);
    expect(leftOver.returned).toBe(true);
    expect(run([{ type: "reset" }], leftOver)).toEqual(initialSettingsFlow);
  });
});
