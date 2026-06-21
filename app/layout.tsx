import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { BookingProvider } from "./components/booking-provider";
import { CookieConsent } from "@/app/components/cookie-consent";
import { MobileNav } from "./components/mobile-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capsula Israel — Нейро-сенсорная терапия от зависимостей",
  description:
    "Освободитесь от курения, сладкого и переедания через сенсорную терапию. Без таблеток. Без кодирования.",
  openGraph: {
    title: "Capsula Israel — Нейро-сенсорная терапия от зависимостей",
    description:
      "Освободитесь от курения, сладкого и переедания через сенсорную терапию.",
    url: "https://capsulaisrael.com",
    siteName: "Capsula Israel",
    images: [
      {
        url: "/icon.png",
        width: 1080,
        height: 1080,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <BookingProvider>
          {children}
          <MobileNav />
          <CookieConsent />
        </BookingProvider>
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="2wHGR7XGAC"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
