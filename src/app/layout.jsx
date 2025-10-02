import { Providers } from "./providers";
import { IBM_Plex_Mono, Fira_Code } from 'next/font/google';
import "./globals.css";
import portfolioData from '@/config/portfolio.json';

// Optimize font loading with next/font - Use 'block' to prevent FOUT and layout shifts
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'], // Reduced from 4 to 2 weights
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'block', // Changed from 'swap' to 'block' to prevent FOUT
  preload: true,
  adjustFontFallback: true, // Automatically adjust fallback font metrics
});

const firaCode = Fira_Code({
  weight: ['400', '500'], // Reduced from 5 to 2 weights
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'block', // Changed from 'optional' to 'block' for consistency
  preload: false,
  adjustFontFallback: true, // Automatically adjust fallback font metrics
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
        {/* Resource hints only for external domains used on initial load */}
        <link rel="dns-prefetch" href="//blog.futuresmart.ai" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
