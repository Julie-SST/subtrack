import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Subtrack - 訂閱管理儀表板",
    short_name: "Subtrack",
    description: "輕鬆追蹤你的每月訂閱服務與支出",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "zh-TW",
    background_color: "#f8fafc",
    theme_color: "#6366f1",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/pwa-icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/pwa-screenshot-wide",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "桌面版：訂閱總覽與分類統計",
      },
      {
        src: "/pwa-screenshot-narrow",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "手機版：隨時查看下次扣款與月支出",
      },
    ],
  };
}
