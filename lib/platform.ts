export type Platform = "ios" | "android" | "other";

// iPadOS Safari reports a Mac, so a Mac with a touch screen is an iPad.
export function platformFrom(userAgent: string, maxTouchPoints: number): Platform {
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return "ios";
  return /Android/.test(userAgent) ? "android" : "other";
}
