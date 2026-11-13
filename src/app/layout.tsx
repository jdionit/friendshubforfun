// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friends Rewards Hub",
  description: "Login to claim your gift",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* Tailwind's 'font-sans' uses the standard system sans-serif fonts (Roboto on Android, San Francisco on iOS, Segoe UI on Windows) */}
      <body className="font-sans antialiased bg-[#181A1E] text-white">
        {children}
      </body>
    </html>
  );
}