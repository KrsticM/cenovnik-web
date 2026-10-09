export const MY_MARKETS_PARAM = "moji-marketi";

// An account with fewer than two stores cannot leave the dialog until it has saved them.
export function myMarketsDialogMode({ required, requested }: { required: boolean; requested: boolean }) {
  return { open: required || requested, dismissable: !required };
}
