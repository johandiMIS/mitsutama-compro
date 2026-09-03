import type { Metadata, Viewport } from "next";
import { Geist_Mono, Lato } from "next/font/google";
import { Footer } from "@/components/footer/footer";
import { Header } from "@/components/header/header";
import { MinScreenNotice } from "@/components/MinScreenNotice";
import { TopNav } from "@/components/nav/TopNav";
import "./globals.css";

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
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

/* Mobile browser chrome matches the always-dark utility bar at the very top of the page —
   `--band`, which is #18181b in light mode and lifts to #27272a in dark. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#18181b" },
    { media: "(prefers-color-scheme: dark)", color: "#27272a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
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
