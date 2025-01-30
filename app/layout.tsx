import "./globals.css";

import { Inter } from "next/font/google";
import { cn } from "../lib/utils";
import { Header } from "@/components/header";
import type React from "react"; // Added import for React

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-[#F0F2F5] font-sans antialiased",
          inter.className
        )}
      >
        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
