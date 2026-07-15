import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ecenovnik.app"),
  title: {
    default: "eCenovnik",
    template: "%s | eCenovnik",
  },
  description: "Pregledajte listu za kupovinu podeljenu iz eCenovnik aplikacije.",
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "eCenovnik",
    title: "eCenovnik — Lista za kupovinu",
    description: "Lista za kupovinu, uvek pri ruci.",
    images: [{ url: "/og.png?v=2", width: 1732, height: 909, alt: "eCenovnik lista za kupovinu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "eCenovnik — Lista za kupovinu",
    description: "Lista za kupovinu, uvek pri ruci.",
    images: ["/og.png?v=2"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
