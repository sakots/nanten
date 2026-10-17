import { defineConfig, loadEnv } from "vite";
import type { HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const configuredUrl = loadEnv(
    mode,
    process.cwd(),
    "SITE_URL",
  ).SITE_URL?.trim();
  const tags: HtmlTagDescriptor[] = [];

  if (configuredUrl) {
    const url = new URL(configuredUrl);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        "SITE_URLには認証情報・クエリ・フラグメントのないHTTP(S)公開ディレクトリの絶対URLを指定してください。",
      );
    }
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    const imageUrl = new URL("ogp.png", url).href;
    const title = "nanten — 麻雀点数トレーニング";
    const description =
      "牌姿を見て点数を答える、麻雀の点数計算ゲーム。役と符の解説付きで、10問ずつ気軽に練習できます。";
    const imageAlt =
      "nanten 麻雀点数トレーニング。その手、何点？ 麻雀牌を配置した緑と生成りの共有画像。";

    for (const [property, content] of Object.entries({
      "og:type": "website",
      "og:site_name": "nanten",
      "og:locale": "ja_JP",
      "og:title": title,
      "og:description": description,
      "og:url": url.href,
      "og:image": imageUrl,
      "og:image:type": "image/png",
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": imageAlt,
    })) {
      tags.push({
        tag: "meta",
        attrs: { property, content },
        injectTo: "head",
      });
    }
    for (const [name, content] of Object.entries({
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": imageUrl,
      "twitter:image:alt": imageAlt,
    })) {
      tags.push({ tag: "meta", attrs: { name, content }, injectTo: "head" });
    }
    tags.push({
      tag: "link",
      attrs: { rel: "canonical", href: url.href },
      injectTo: "head",
    });
  }

  return {
    base: "./",
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        injectRegister: false,
        includeAssets: ["favicon.svg", "icons/*.png"],
        manifest: {
          id: "./",
          name: "nanten — 麻雀点数トレーニング",
          short_name: "nanten",
          description: "牌姿を見て点数を答える、麻雀の点数計算ゲーム。",
          lang: "ja",
          start_url: "./",
          scope: "./",
          display: "standalone",
          theme_color: "#174f43",
          background_color: "#f5f4ee",
          icons: [
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg}"],
          navigateFallback: "index.html",
          cleanupOutdatedCaches: true,
          // 新版は全画面を閉じてから有効化し、練習中の再読み込みを避ける。
          skipWaiting: false,
          clientsClaim: false,
        },
      }),
      { name: "social-metadata", transformIndexHtml: () => tags },
    ],
  };
});
