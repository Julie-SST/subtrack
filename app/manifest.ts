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
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
