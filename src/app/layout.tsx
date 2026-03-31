import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume Tailor AI",
  description: "Privacy-first, multi-agent AI resume tailoring and application tracking directly into your Google Drive and Sheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen selection:bg-indigo-500/30`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
