import { redirect } from "next/navigation";
import { SETTINGS_PARAM } from "@/components/SettingsDialog/settings";

export default function PodesavanjaPage() {
  redirect(`/proizvodi?${SETTINGS_PARAM}=1`);
}
