import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { IBM_Plex_Mono, Fira_Code } from 'next/font/google';
import "./globals.css";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import portfolioData from '@/config/portfolio.json';

// Prevent FontAwesome from adding its CSS since we import it manually
config.autoAddCss = false;

// Optimize font loading with next/font
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const firaCode = Fira_Code({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

// Metadata configuration
export const metadata = {
  metadataBase: new URL('https://manishsingh.tech'),
  title: {
    default: `${portfolioData.name} | ${portfolioData.title}`,
    template: `%s | ${portfolioData.name}`
  },
  description: portfolioData.bio,
  keywords: [
    'Full Stack Developer',
    'AI Engineer',
    'Machine Learning',
    'Next.js',
    'React',
    'FastAPI',
    'Python',
    'JavaScript',
    'TypeScript',
    'Computer Vision',
    'Natural Language Processing',
    'LLM',
    'Deep Learning',
    'Portfolio',
    portfolioData.name
  ],
  authors: [{ name: portfolioData.name, url: 'https://manishsingh.tech' }],
  creator: portfolioData.name,
  publisher: portfolioData.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://manishsingh.tech',
    siteName: `${portfolioData.name} Portfolio`,
    title: `${portfolioData.name} | ${portfolioData.title}`,
    description: portfolioData.bio,
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: `${portfolioData.name} - ${portfolioData.title}`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${portfolioData.name} | ${portfolioData.title}`,
    description: portfolioData.bio,
    creator: portfolioData.contact.twitter,
    images: ['/images/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: '/icons/terminal-favicon.svg',
    shortcut: '/icons/terminal-favicon.svg',
    apple: '/icons/terminal-favicon.svg'
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-site-verification-code'
  }
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' }
  ],
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${ibmPlexMono.variable} ${firaCode.variable}`}>
      <head>
        {/* Resource hints for external domains */}
        <link rel="dns-prefetch" href="//github.com" />
        <link rel="dns-prefetch" href="//api.github.com" />
        <link rel="dns-prefetch" href="//avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="//raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="//blog.futuresmart.ai" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />

        {/* Preconnect to critical external domains */}
        <link rel="preconnect" href="https://github.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.github.com" crossOrigin="" />

        {/* Preload only above-fold critical optimized images */}
        <link rel="preload" href="/images/optimized/llama-3.1-novel.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/images/optimized/fire-optimized.gif" as="image" fetchPriority="high" />

        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/_next/static/media/ibm-plex-mono-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
