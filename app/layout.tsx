import "./globals.css";

import { Inter } from "next/font/google";
import { cn } from "../lib/utils";
import { Header } from "@/components/base/header";
import { Toaster } from "@/components/shadcn/toaster";

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
          "min-h-screen bg-theme-background font-sans antialiased flex flex-col",
          inter.className
        )}
      >
        <Header />
        <main className="container mx-auto px-4 py-6 flex-grow flex flex-col">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
