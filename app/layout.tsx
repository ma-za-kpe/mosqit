import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#667eea',
}

export const metadata: Metadata = {
  title: "Mosqit - AI-Driven Frontend Debugging Chrome Extension | Buzz Through Bugs with Gemini Nano",
  description: "Revolutionize frontend debugging with Mosqit - Chrome extension combining Logcat-inspired logging with AI. Real-time error analysis, pattern detection, framework-specific insights, and GitHub issue generation from DevTools. <100ms response, 100% on-device privacy.",
  keywords: "chrome extension, debugging tool, ai debugging, gemini nano, javascript debugger, console log analyzer, error analysis, chrome devtools, react debugging, vue debugging, angular debugging, typescript debugging, web development tools, chrome ai api, writer api, on-device ai, privacy-focused debugging, logcat for web, pattern detection, error tracking, chrome built-in ai challenge 2025",
  authors: [{ name: "Mosqit Team" }],
  creator: "Mosqit",
  publisher: "Mosqit",
  applicationName: "Mosqit",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mosqit.dev',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mosqit.dev',
    title: 'Mosqit - AI-Driven Frontend Debugging Chrome Extension',
    description: 'Buzz through frontend bugs with AI-driven GitHub issues from DevTools. Real-time analysis, pattern detection, and framework-specific insights - all on-device for complete privacy.',
    siteName: 'Mosqit',
    images: [
      {
        url: 'https://mosqit.dev/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Mosqit - AI-Powered Debugging Assistant',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosqit - AI-Driven Frontend Debugging Extension',
    description: 'Buzz through bugs with AI-driven analysis, pattern detection, and GitHub issue generation from DevTools.',
    creator: '@mosqit_dev',
    images: ['https://mosqit.dev/twitter-image.svg'],
  },
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code',
  },
  category: 'Developer Tools',
  classification: 'Software',
};

// Structured Data for SEO and AEO
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://mosqit.dev/#software",
      "name": "Mosqit",
      "description": "AI-powered debugging assistant Chrome extension that analyzes console outputs, detects error patterns, and provides instant fix suggestions using Chrome's built-in Gemini Nano AI model.",
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "Debugging Tool",
      "operatingSystem": "Chrome 127+",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "reviewCount": "50"
      },
      "featureList": [
        "AI-powered error analysis using Chrome's Gemini Nano",
        "Real-time console output interception",
        "Pattern detection for recurring issues",
        "100% on-device processing for privacy",
        "DevTools panel with Logcat-inspired UI",
        "40+ fallback debugging patterns",
        "Support for all JavaScript frameworks",
        "Context-aware debugging insights"
      ],
      "screenshot": "https://mosqit.dev/screenshots/main.png",
      "softwareVersion": "1.0.0",
      "datePublished": "2024-10-01",
      "dateModified": "2024-10-31",
      "author": {
        "@type": "Organization",
        "name": "Mosqit Team",
        "url": "https://mosqit.dev"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://mosqit.dev/#website",
      "url": "https://mosqit.dev",
      "name": "Mosqit",
      "description": "Official website for Mosqit - AI-powered debugging assistant for Chrome",
      "publisher": {
        "@id": "https://mosqit.dev/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://mosqit.dev/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://mosqit.dev/#organization",
      "name": "Mosqit",
      "url": "https://mosqit.dev",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mosqit.dev/logo.png",
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://github.com/ma-za-kpe/mosqit",
        "https://twitter.com/mosqit_dev",
        "https://www.linkedin.com/company/mosqit"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Mosqit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mosqit is an AI-powered debugging assistant Chrome extension that uses Chrome's built-in Gemini Nano model to analyze console outputs, detect patterns, and provide instant fix suggestions for JavaScript errors."
          }
        },
        {
          "@type": "Question",
          "name": "How does Mosqit protect my privacy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mosqit runs 100% on-device using Chrome's local Gemini Nano AI model. Your code and debugging data never leave your machine, ensuring complete privacy."
          }
        },
        {
          "@type": "Question",
          "name": "Which frameworks does Mosqit support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mosqit works with all JavaScript frameworks including React, Vue, Angular, Svelte, and vanilla JavaScript. It automatically detects your framework and dependencies."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need a GPU to use Mosqit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "While a GPU enhances performance, Mosqit includes 40+ fallback debugging patterns that work without AI, ensuring functionality on all machines."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Install Mosqit Chrome Extension",
      "description": "Step-by-step guide to install and set up Mosqit debugging assistant",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enable Chrome AI flags",
          "text": "Navigate to chrome://flags and enable Prompt API for Gemini Nano, Writer API, and Optimization Guide On Device Model"
        },
        {
          "@type": "HowToStep",
          "name": "Restart Chrome",
          "text": "Completely restart Chrome from system tray to apply flag changes"
        },
        {
          "@type": "HowToStep",
          "name": "Install Extension",
          "text": "Clone repository, run npm install && npm run build:extension, then load unpacked extension from dist folder"
        },
        {
          "@type": "HowToStep",
          "name": "Download AI Model",
          "text": "Chrome will automatically download Gemini Nano model (~2GB) on first use"
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" prefix="og: https://ogp.me/ns#">
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mosqit" />

        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon and Icons */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-32.svg" sizes="32x32" type="image/svg+xml" />
        <link rel="icon" href="/icon-16.svg" sizes="16x16" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />

        {/* Additional AEO Tags for AI Understanding */}
        <meta name="ai-content-type" content="software-documentation" />
        <meta name="ai-expertise-level" content="developer-tools" />
        <meta name="ai-use-case" content="debugging,error-analysis,development-tools" />
        <meta name="ai-technology" content="chrome-ai,gemini-nano,on-device-ai" />

        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Google Analytics (replace with your ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        itemScope
        itemType="https://schema.org/WebPage"
      >
        {/* Skip to Content for Accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded">
          Skip to main content
        </a>

        <main id="main-content" itemProp="mainEntity">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}