import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

export function verifyBuildKey(
  configuredKey: string | undefined,
  allowedSignersFile: string,
): void {
  const key = configuredKey?.trim();
  if (!key) {
    throw new Error(
      "本番ビルドには NANTEN_BUILD_SSH_KEY が必要です。.env.local または環境変数にSSH鍵ファイルのパスを設定してください。",
    );
  }
  const keyFile = key.startsWith("~/") ? join(homedir(), key.slice(2)) : key;
  const directory = mkdtempSync(join(tmpdir(), "nanten-build-signature-"));
  try {
    const challenge = randomBytes(32);
    const signature = execFileSync(
      "ssh-keygen",
      ["-Y", "sign", "-n", "nanten-build", "-f", keyFile],
      { input: challenge, stdio: ["pipe", "pipe", "inherit"] },
    );
    const signatureFile = join(directory, "challenge.sig");
    writeFileSync(signatureFile, signature, { mode: 0o600 });
    execFileSync(
      "ssh-keygen",
      [
        "-Y", "verify",
        "-f", allowedSignersFile,
        "-I", "nanten-build",
        "-n", "nanten-build",
        "-s", signatureFile,
      ],
      { input: challenge, stdio: ["pipe", "pipe", "inherit"] },
    );
  } catch (cause) {
    throw new Error(
      "ビルド用SSH署名を検証できません。ssh-keygen、鍵ファイル、ssh-agent、および build/allowed_signers の登録を確認してください。",
      { cause },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
