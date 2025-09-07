import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "旅行記錄可視化器",
  description: "旅行記錄可視化器 - 將您的旅行記錄轉換為圖表和表格",
  keywords: [
    "旅行記錄",
    "旅行可視化",
    "旅行圖表",
    "旅行表格",
    "旅行歷史",
    "旅行分析",
    "旅行數據",
    "旅行統計",
    "旅行日誌",
    "旅行計劃",
    "旅行工具",
    "旅行應用",
    "旅行網站",
    "旅行資訊",
    "旅行記錄分析",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body className="min-h-screen p-6">{children}</body>
    </html>
  );
}
