import { execFileSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const [variant, target = "debug"] = process.argv.slice(2);
if (!["ads", "adfree"].includes(variant) || !["debug", "release"].includes(target)) {
  throw new Error("使い方: node scripts/build-android.mjs ads|adfree [debug|release]");
}
const root = fileURLToPath(new URL("../", import.meta.url));
const android = join(root, "android");
const env = {
  ...process.env,
  ...loadEnv(target === "release" ? "production" : "development", root, "NANTEN_"),
  NANTEN_ANDROID_VARIANT: variant,
};
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, env, stdio: "inherit" });

run("pnpm", [`build:android:${variant}`]);
run("pnpm", ["exec", "cap", "sync", "android"]);

// Capacitor sync writes shared assets; flavor source sets must never share them.
const generatedAssets = join(android, "app/src/main/assets");
const flavorAssets = join(android, `app/src/${variant}/assets`);
rmSync(flavorAssets, { recursive: true, force: true });
cpSync(generatedAssets, flavorAssets, { recursive: true });
rmSync(generatedAssets, { recursive: true, force: true });

const flavorTask = variant === "ads" ? "Ads" : "Adfree";
const task = target === "release" ? `bundle${flavorTask}Release` : `assemble${flavorTask}Debug`;
run(process.platform === "win32" ? "gradlew.bat" : "./gradlew", [task], android);
