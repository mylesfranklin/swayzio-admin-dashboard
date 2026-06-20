import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { isClerkConfigured } from "@/lib/auth";
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
  // ClerkProvider lives inside <body> (Clerk's Next 16 guidance). Requires keys,
  // so in keyless local dev we render children directly; production always has
  // keys (enforced in proxy.ts).
  const body = isClerkConfigured ? (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{ theme: dark, variables: { colorPrimary: "#3b5bdb" } }}
    >
      {children}
    </ClerkProvider>
  ) : (
    children
  );

  return (
    <html lang="en" data-theme="swayzio" className={inter.variable}>
      <body className="min-h-screen bg-base-100 text-base-content antialiased">
        {body}
      </body>
    </html>
  );
}
