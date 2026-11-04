import { describe, expect, it } from "vitest";
import config from "./vite.config";

describe("Androidビルドモード", () => {
  it("Android版の未知のモードをWeb版として扱わない", () => {
    expect(() => config({ command: "serve", mode: "android-unknown" })).toThrow();
  });
});
