import { describe, expect, it } from "vitest";
import { platformFrom } from "./platform";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";

describe("platformFrom", () => {
  it("tells phones apart from computers", () => {
    expect(platformFrom(IPHONE, 5)).toBe("ios");
    expect(platformFrom(ANDROID, 5)).toBe("android");
    expect(platformFrom(MAC, 0)).toBe("other");
  });

  it("treats an iPad in desktop mode, a Mac with a touch screen, as iOS", () => {
    expect(platformFrom(MAC, 5)).toBe("ios");
  });

  it("does not call a Mac with a single touch point an iPad", () => {
    expect(platformFrom(MAC, 1)).toBe("other");
  });
});
