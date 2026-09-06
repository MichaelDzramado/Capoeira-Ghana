import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Capoeira Ghana",
    template: "%s | Capoeira Ghana",
  },
  description:
    "Discover Capoeira in Ghana. Train, connect, grow, and become part of the Capoeira Ghana community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen">
        <SiteHeader />
        <div className="flex min-h-[calc(100vh-5rem)] flex-col">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}