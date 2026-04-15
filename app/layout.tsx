import type { Metadata } from "next";
import localFont from "next/font/local";
import "./global.css";

const atoz = localFont({
  src: [
    { path: "../public/fonts/에이투지체-1Thin.ttf", weight: "100", style: "normal" },
    { path: "../public/fonts/에이투지체-2ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../public/fonts/에이투지체-3Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/에이투지체-4Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/에이투지체-5Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/에이투지체-6SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/에이투지체-7Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/에이투지체-8ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/에이투지체-9Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-atoz",
});

export const metadata: Metadata = {
  title: "본오동 열린 컴퓨터 교실",
  description: "본오동 열린 컴퓨터 교실",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={atoz.variable}>
      <body className={atoz.className}>{children}</body>
    </html>
  );
}

