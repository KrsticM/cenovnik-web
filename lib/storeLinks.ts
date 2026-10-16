import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/support";

// Where a QR code or shared link should land for the device that opened it; anything else gets the App Store page.
export function storeUrlFor(userAgent: string | null): string {
  return /Android/i.test(userAgent ?? "") ? PLAY_STORE_URL : APP_STORE_URL;
}
