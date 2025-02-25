import "./globals.css";

import localFont from "next/font/local";
import { cn } from "../lib/utils";
import { Header } from "@/components/base/header";
import { Toaster } from "@/components/shadcn/toaster";
import { Metadata } from "next";
import Providers from "@/components/providers/providers";

const tahoma = localFont({
  src: [
    {
      path: "./assets/lucida-sans-regular.ttf",
      weight: "400",
      style: "normal",
    },
    { path: "./assets/lucida-sans-bold.ttf", weight: "700", style: "bold" },
  ],
});

export const metadata: Metadata = {
  title: "Facecoin",
  description: "Facecoin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-theme-background font-sans flex flex-col",
          tahoma.className
        )}
      >
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-6 flex-grow flex flex-col overscroll-contain">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
