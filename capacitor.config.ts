import type { CapacitorConfig } from "@capacitor/cli";

const variant = process.env.NANTEN_ANDROID_VARIANT;

const config: CapacitorConfig = {
  appId: variant === "adfree" ? "nanten.myapp.adfree" : "nanten.myapp",
  appName: variant === "adfree" ? "nanten 広告なし" : "nanten",
  webDir: variant ? `dist/android-${variant}` : "dist",
  plugins: variant === "ads" ? {
    SystemBars: { insetsHandling: "disable" },
  } : {},
};

export default config;
