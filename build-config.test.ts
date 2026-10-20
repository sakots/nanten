import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import config from "./vite.config";

let envDir: string;

beforeEach(() => {
  envDir = mkdtempSync(join(tmpdir(), "nanten-build-key-"));
  vi.spyOn(process, "cwd").mockReturnValue(envDir);
  vi.stubEnv("SITE_URL", "");
  vi.stubEnv("NANTEN_BUILD_SSH_KEY", undefined);
  vi.stubEnv("NANTEN_BUILD_KEY", undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  rmSync(envDir, { recursive: true, force: true });
});

describe("本番ビルドのキー制限", () => {
  it.each([undefined, "", " \t\n "])(
    "キーが未設定・空欄・空白のみならビルドを拒否する (%j)",
    (key) => {
      vi.stubEnv("NANTEN_BUILD_SSH_KEY", key);
      expect(() => config({ command: "build", mode: "production" })).toThrow();
    },
  );

  it.each(["development", "staging"])(
    "モードを %s に変えてもキーなしビルドを拒否する",
    (mode) => {
      expect(() => config({ command: "build", mode })).toThrow();
    },
  );

  it("環境変数が空なら .env.local の値より優先してビルドを拒否する", () => {
    writeFileSync(join(envDir, ".env.local"), "NANTEN_BUILD_SSH_KEY=local-key\n");
    vi.stubEnv("NANTEN_BUILD_SSH_KEY", "");
    expect(() => config({ command: "build", mode: "production" })).toThrow();
  });

  it("従来の任意文字列では署名検証を通過できない", () => {
    vi.stubEnv("NANTEN_BUILD_KEY", "previous-arbitrary-value");
    expect(() => config({ command: "build", mode: "production" })).toThrow();
  });

  it("署名できても許可されていない鍵ならビルドを拒否する", () => {
    const keyFile = join(envDir, "untrusted key");
    execFileSync("ssh-keygen", ["-q", "-t", "ed25519", "-N", "", "-f", keyFile]);
    vi.stubEnv("NANTEN_BUILD_SSH_KEY", keyFile);
    expect(() => config({ command: "build", mode: "production" })).toThrow();
  });

  it("利用できない鍵ファイルならビルドを拒否する", () => {
    vi.stubEnv("NANTEN_BUILD_SSH_KEY", join(envDir, "missing-key"));
    expect(() => config({ command: "build", mode: "production" })).toThrow();
  });
});
