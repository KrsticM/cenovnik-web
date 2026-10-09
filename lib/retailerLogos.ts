// Keyed by retailer id; SuperVero's id comes from its owner (Veropoulos), as in the mobile app.
const LOGOS: Record<string, string> = {
  gomex: "/retailers/gomex.png",
  idea: "/retailers/idea.png",
  lidl: "/retailers/lidl.png",
  maxi: "/retailers/maxi.png",
  megamaxi: "/retailers/megamaxi.png",
  mercator: "/retailers/mercator.png",
  persu: "/retailers/persu.png",
  roda: "/retailers/roda.png",
  supervero: "/retailers/supervero.png",
  veropoulos: "/retailers/supervero.png",
  univerexport: "/retailers/univerexport.png",
};

export function retailerLogoUrl(retailerId: string): string | null {
  return LOGOS[retailerId.toLowerCase()] ?? null;
}
