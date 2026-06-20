import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swayzio — Admin Dashboard",
  description: "The brain and analytics engine behind Swayzio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="swayzio" className={inter.variable}>
      <body className="min-h-screen bg-base-100 text-base-content antialiased">
        {children}
      </body>
    </html>
  );
}
