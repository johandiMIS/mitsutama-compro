import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer/footer";
import { Header } from "@/components/header/header";
import { MinScreenNotice } from "@/components/MinScreenNotice";
import { TopNav } from "@/components/nav/TopNav";
import "./globals.css";

const lufga = localFont({
  src: [
    { path: "./fonts/lufga/Lufga-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/lufga/Lufga-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/lufga/Lufga-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/lufga/Lufga-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-lufga",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mitsutama Indo Teknik",
  description: "Replace with a short company description for search engines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lufga.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MinScreenNotice />
        <Header />
        <TopNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
