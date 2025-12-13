import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // 👈 THIS IS THE CRITICAL LINE!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PR Guardian",
  description: "AI-Powered Code Review",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}