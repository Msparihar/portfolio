import { Providers } from "./providers";
import { IBM_Plex_Mono, Fira_Code, Cinzel, Crimson_Text, Newsreader, IM_Fell_English, Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import "./globals.css";
import portfolioData from '@/config/portfolio.json';

// Optimize font loading with next/font - Use 'swap' for better performance
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'], // Reduced from 4 to 2 weights
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap', // Show fallback immediately, swap when loaded
  preload: true,
  adjustFontFallback: true, // Automatically adjust fallback font metrics to minimize layout shift
});

const firaCode = Fira_Code({
  weight: ['400', '500'], // Reduced from 5 to 2 weights
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap', // Show fallback immediately, swap when loaded
  preload: false,
  adjustFontFallback: true, // Automatically adjust fallback font metrics to minimize layout shift
});

const cinzel = Cinzel({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  preload: false,
});

const crimsonText = Crimson_Text({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-crimson-text',
  display: 'swap',
  preload: false,
});

const newsreader = Newsreader({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  preload: true,
});

const imFellEnglish = IM_Fell_English({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-im-fell-english',
  display: 'swap',
  preload: false,
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: true,
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
    icon: [
      { url: '/icons/kitsune-favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/kitsune-favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/kitsune-favicon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/icons/kitsune-favicon-32.png',
    apple: '/icons/kitsune-favicon-180.png'
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
    <html lang="en" suppressHydrationWarning className={`${ibmPlexMono.variable} ${firaCode.variable} ${cinzel.variable} ${crimsonText.variable} ${newsreader.variable} ${imFellEnglish.variable} ${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Resource hints only for external domains used on initial load */}
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="//blog.futuresmart.ai" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        {/* Preload Ghibli wallpaper — first-paint LCP asset for Welcome screen */}
        <link rel="preload" as="image" href="/images/worlds/ghibli/wallpaper.webp" type="image/webp" />
      </head>
      <body suppressHydrationWarning>
        {/* FOUC prevention — apply saved world vars to :root before React mounts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var w=localStorage.getItem('portfolio_world')||'ghibli';var m={'elden-ring':{'--dt-bg':'#0d0b07','--dt-surface':'rgba(26,21,16,0.97)','--dt-surface-deep':'rgba(13,11,7,0.98)','--dt-text':'#e8d5a3','--dt-text-muted':'#b2a66c','--dt-accent':'#c9a84c','--dt-accent-hover':'#f9c043','--dt-accent-soft':'rgba(201,168,76,0.08)','--dt-accent-border':'rgba(75,61,42,0.8)','--dt-accent-border-strong':'rgba(201,168,76,0.25)','--dt-taskbar-bg':'linear-gradient(180deg,rgba(18,14,8,0.95) 0%,rgba(10,8,4,0.98) 100%)','--dt-taskbar-border':'rgba(201,168,76,0.2)'},'ghibli':{'--dt-bg':'#121c15','--dt-surface':'rgba(250,246,237,0.80)','--dt-surface-deep':'rgba(240,232,216,0.90)','--dt-text':'#4a6b52','--dt-text-muted':'#4f5b62','--dt-accent':'#4a7c59','--dt-accent-hover':'#3a6a49','--dt-accent-soft':'rgba(74,124,89,0.08)','--dt-accent-border':'rgba(224,212,192,0.8)','--dt-accent-border-strong':'rgba(224,212,192,1.0)','--dt-taskbar-bg':'linear-gradient(180deg,rgba(255,255,255,0.75) 0%,rgba(255,255,255,0.65) 100%)','--dt-taskbar-border':'rgba(200,191,176,0.8)'},'got':{'--dt-bg':'#0d1b2a','--dt-surface':'rgba(26,58,92,0.85)','--dt-surface-deep':'rgba(13,27,42,0.95)','--dt-text':'#e8edf2','--dt-text-muted':'#8ba4b8','--dt-accent':'#4a9eda','--dt-accent-hover':'#6bb8e8','--dt-accent-soft':'rgba(74,158,218,0.08)','--dt-accent-border':'rgba(74,158,218,0.2)','--dt-accent-border-strong':'rgba(74,158,218,0.35)','--dt-taskbar-bg':'linear-gradient(180deg,rgba(13,27,42,0.92) 0%,rgba(8,16,28,0.96) 100%)','--dt-taskbar-border':'rgba(74,158,218,0.15)'}};var v=m[w]||m['ghibli'];var r=document.documentElement;for(var k in v)r.style.setProperty(k,v[k]);}catch(e){}})();`,
          }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5J2M5HE773"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5J2M5HE773');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
