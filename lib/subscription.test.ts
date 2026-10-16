import { describe, expect, it } from "vitest";
import { daysUntil, formatLongDate, subscriptionCopy, subscriptionStateFrom } from "./subscription";

const DAY = 86_400_000;
const END = new Date(2027, 2, 12, 12).getTime();
const NOW = new Date(2026, 9, 16, 22, 30).getTime();
const TRIAL_END = new Date(2026, 9, 25, 3).getTime();

describe("subscriptionCopy", () => {
  const base = { plan: "yearly", store: "app_store", renewal: "renews", trial: false, endsAt: END } as const;
  const trialing = { ...base, plan: null, trial: true, endsAt: TRIAL_END } as const;

  it("formats dates in the genitive", () => {
    expect(formatLongDate(END)).toBe("12. marta 2027.");
  });

  it("describes an active plan and a cancelled one", () => {
    const active = subscriptionCopy(base, NOW);
    expect(active.dateLine).toBe("Godišnje · obnavlja se 12. marta 2027.");
    expect(active.manageNote).toBe("Pretplatom upravljaš u App Store-u.");
    expect(active.howSteps).toHaveLength(1);

    const cancelled = subscriptionCopy({ ...base, plan: "monthly", store: "google_play", renewal: "ends" }, NOW);
    expect(cancelled.dateLine).toBe("Mesečno · ističe 12. marta 2027.");
    expect(cancelled.showHow).toBe(false);
  });

  it("drops the period when the plan is unknown and the verb when renewal is unclear", () => {
    expect(subscriptionCopy({ ...base, plan: null }, NOW).dateLine).toBe("Obnavlja se 12. marta 2027.");
    expect(subscriptionCopy({ ...base, renewal: "unclear" }, NOW).dateLine).toBe("Godišnje · aktivan do 12. marta 2027.");
  });

  it("does not send a Stripe or promotional plan to the app stores", () => {
    const copy = subscriptionCopy({ ...base, store: "other" }, NOW);
    expect(copy.manageNote).toBe("Pretplatom upravljaš tamo gde si je kupio.");
    expect(copy.deleteNote).toContain("otkaži tamo gde si je kupio");
    expect(copy.howSteps).toEqual([]);
    expect(copy.showHow).toBe(false);
  });

  it("counts calendar days, so late in the day it is still the same day", () => {
    expect(daysUntil(TRIAL_END, NOW)).toBe(9);
    expect(daysUntil(NOW, NOW)).toBe(0);
    expect(daysUntil(NOW - DAY, NOW)).toBe(0);
  });

  it("shows a running trial with the days left, the first charge and a progress bar", () => {
    const copy = subscriptionCopy(trialing, NOW);
    expect(copy.badge).toBe("trial");
    expect(copy.dateLine).toBe("Besplatno još 9 dana · prva naplata 25. oktobra 2026.");
    expect(copy.manageNote).toBe(
      "Ukoliko želiš da odustaneš od članstva, uradi to najkasnije 24 sata pre naredne naplate u App Store-u."
    );
    expect(copy.trialProgress).toBeCloseTo(5 / 14);
    expect(copy.howOpenByDefault).toBe(false);
    expect(copy.howFoot).toContain("probnog perioda");
    expect(copy.deleteNote).toBe(
      "Brisanje naloga ne otkazuje probni period. Otkaži ga u App Store-u, inače naplata počinje 25. oktobra 2026."
    );
  });

  it("uses the Serbian singular for 1 and 21 days", () => {
    const left = (days: number) => subscriptionCopy(trialing, TRIAL_END - days * DAY).dateLine;
    expect(left(1)).toContain("Besplatno još 1 dan ·");
    expect(left(2)).toContain("Besplatno još 2 dana ·");
    expect(left(11)).toContain("Besplatno još 11 dana ·");
    expect(left(21)).toContain("Besplatno još 21 dan ·");
  });

  it("opens the cancel steps and says billing starts today on the last day", () => {
    const copy = subscriptionCopy(trialing, TRIAL_END);
    expect(copy.badge).toBe("lastDay");
    expect(copy.dateLine).toBe("Probni period se završava danas, posle toga počinje naplata.");
    expect(copy.manageNote).toBe("Ukoliko želiš da odustaneš od benefita Premium članstva, otkaži danas u App Store-u.");
    expect(copy.howOpenByDefault).toBe(true);
    expect(copy.trialProgress).toBe(1);
  });

  it("says nothing will be charged for a trial cancelled before it ends", () => {
    const copy = subscriptionCopy({ ...trialing, renewal: "ends", store: null }, NOW);
    expect(copy.badge).toBe("cancelled");
    expect(copy.dateLine).toBe("Probni period ističe 25. oktobra 2026. · bez naplate");
    expect(copy.manageNote).toContain("Ništa neće biti naplaćeno.");
    expect(copy.manageNote).toContain("u App Store-u ili Google Play-u.");
    expect(copy.trialProgress).toBeNull();
    expect(copy.showHow).toBe(false);
  });

  it("falls back to both stores when the details or the store are unknown", () => {
    for (const copy of [subscriptionCopy(null, NOW), subscriptionCopy({ ...base, store: null }, NOW)]) {
      expect(copy.manageNote).toBe("Pretplatom upravljaš u App Store-u ili Google Play-u.");
      expect(copy.howSteps).toHaveLength(2);
    }
    expect(subscriptionCopy(null, NOW).dateLine).toBeNull();
  });
});

describe("subscriptionStateFrom", () => {
  const details = { plan: "yearly", store: "app_store", renewal: "renews", trial: false, endsAt: END } as const;

  it("reads a clear yes or no", () => {
    expect(subscriptionStateFrom({ isPremium: true, subscription: details })).toEqual({ status: "premium", details });
    expect(subscriptionStateFrom({ isPremium: true })).toEqual({ status: "premium", details: null });
    expect(subscriptionStateFrom({ isPremium: false })).toEqual({ status: "standard" });
  });

  it("never reads a failed or missing answer as Standard", () => {
    expect(subscriptionStateFrom(null)).toEqual({ status: "unknown" });
    expect(subscriptionStateFrom({ isPremium: null })).toEqual({ status: "unknown" });
    expect(subscriptionStateFrom({})).toEqual({ status: "unknown" });
  });
});
