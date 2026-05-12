import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://personalclimb.com"),
  title: "PERSONAL CLIMB | High Performance Protocol",
  description: "The ultimate high-performance operating system for climbing coaches and athletes. Optimize your training with Academia Boulder.",
  keywords: ["climbing", "performance", "training", "bouldering", "coach", "personal trainer"],
  authors: [{ name: "Govinda" }],
  openGraph: {
    title: "PERSONAL CLIMB | High Performance Protocol",
    description: "The ultimate high-performance operating system for climbing coaches and athletes.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://personalclimb.com",
    siteName: "Personal Climb",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Personal Climb Performance Platform",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PERSONAL CLIMB | High Performance Protocol",
    description: "The ultimate high-performance operating system for climbing coaches and athletes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
