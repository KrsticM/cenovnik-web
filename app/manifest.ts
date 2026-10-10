import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "eCenovnik",
    short_name: "eCenovnik",
    description: "Uporedi cene u svojim marketima i sastavi listu za kupovinu.",
    lang: "sr",
    start_url: "/proizvodi",
    // A home-screen shortcut that opens in the browser: a standalone iOS web app keeps its own cookies and loses the Google/Apple sign-in.
    display: "browser",
    background_color: "#f8f8f8",
    theme_color: "#f8f8f8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
