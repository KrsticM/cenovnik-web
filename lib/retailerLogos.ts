// Keyed by retailer id; SuperVero's id comes from its owner (Veropoulos), as in the mobile app.
const LOGOS: Record<string, string> = {
  gomex: "/retailers/gomex.webp",
  idea: "/retailers/idea.webp",
  lidl: "/retailers/lidl.webp",
  maxi: "/retailers/maxi.webp",
  megamaxi: "/retailers/megamaxi.webp",
  mercator: "/retailers/mercator.webp",
  persu: "/retailers/persu.webp",
  roda: "/retailers/roda.webp",
  supervero: "/retailers/supervero.webp",
  veropoulos: "/retailers/supervero.webp",
  univerexport: "/retailers/univerexport.webp",
};

export function retailerLogoUrl(retailerId: string): string | null {
  return LOGOS[retailerId.toLowerCase()] ?? null;
}
