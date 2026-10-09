import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script"; // <-- Yeh line add ki hai
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

const siteUrl = "https://cinematch-web-kappa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CineMatch — Swipe & Discover Your Next Favorite Movie",
    template: "%s | CineMatch",
  },
  description:
    "End decision fatigue. Swipe right on trending Hollywood, Bollywood, and international cinema. Find what to watch tonight with trailers, verified cast, and streaming platforms.",
  keywords: [
    "movie recommendation app",
    "tinder for movies",
    "what to watch tonight",
    "swipe movies",
    "movie match maker",
    "trending movies",
    "bollywood movie recommendations",
    "hollywood cinema guide",
    "streaming guide",
    "tmdb movie finder",
  ],
  authors: [{ name: "Muhammad Awais Khan" }],
  creator: "Muhammad Awais Khan",
  publisher: "CineMatch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CineMatch — Tinder for Movies | Match, Swipe & Watch",
    description:
      "Tired of endless scrolling? Swipe through movies tailored to your mood and build your watchlist in seconds.",
    url: siteUrl,
    siteName: "CineMatch",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CineMatch Movie Discovery Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineMatch — Stop Scrolling, Start Matching",
    description: "Discover top-rated cinema and trending movies with an intuitive swipe deck.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "entertainment",
};

export const viewport: Viewport = {
  themeColor: "#07070b",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CineMatch",
  url: siteUrl,
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "All",
  browserRequirements: "Requires modern web browser",
  description:
    "An interactive movie discovery application helping viewers discover trending cinema across Hollywood, Bollywood, Anime, and Sci-Fi genres.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Swipe-based movie discovery",
    "Real-time trending cinema sync",
    "Custom mood and genre filters",
    "Personalized watchlist builder",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3609007329468888"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}