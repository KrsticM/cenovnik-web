import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geist = Geist({ subsets: ["latin"] });

// Android Chrome then shrinks the page when the keyboard opens, so full-height dialogs keep their bottom button above it.
export const viewport: Viewport = { interactiveWidget: "resizes-content" };

export const metadata: Metadata = {
  metadataBase: new URL("https://web.ecenovnik.app"),
  title: {
    default: "eCenovnik",
    template: "%s | eCenovnik",
  },
  description: "Uporedi cene u svojim marketima i sastavi listu za kupovinu.",
  // Home-screen label on iOS; otherwise it takes the page title, e.g. "Proizvodi | eCenovnik".
  appleWebApp: { title: "eCenovnik", capable: false },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "eCenovnik",
    title: "eCenovnik — Uporedi cene u svojim marketima",
    description: "Pronađi najnižu cenu i sastavi listu za kupovinu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "eCenovnik — Uporedi cene u svojim marketima",
    description: "Pronađi najnižu cenu i sastavi listu za kupovinu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr" className={geist.className}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
