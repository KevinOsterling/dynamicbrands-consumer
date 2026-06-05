import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrivyClientProvider } from "@/components/PrivyClientProvider";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dynamic Brands",
  description: "Your brand loyalty wallet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16">
        <PrivyClientProvider>
          <AuthGate>
            {children}
            <BottomNav />
          </AuthGate>
        </PrivyClientProvider>
      </body>
    </html>
  );
}
