import portfolioData from '@/config/portfolio.json';

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
    'Computer Vision',
    'Natural Language Processing',
    'LLM',
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
  manifest: '/manifest.json'
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' }
  ],
  width: 'device-width',
  initialScale: 1
};

// JSON-LD Structured Data Schemas

// Person Schema
export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: portfolioData.name,
  url: 'https://manishsingh.tech',
  image: 'https://manishsingh.tech/images/og-image.png',
  sameAs: [
    'https://github.com/Msparihar',
    'https://linkedin.com/in/manishsparihar',
    'https://twitter.com/manishs_parihar',
    'https://hashnode.com/@manishsparihar'
  ],
  jobTitle: portfolioData.title,
  description: portfolioData.bio,
  email: portfolioData.contact.email,
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'Vellore Institute of Technology'
  },
  knowsAbout: [
    'Full Stack Development',
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Next.js',
    'React',
    'FastAPI',
    'Python',
    'JavaScript',
    'TypeScript',
    'PyTorch',
    'TensorFlow',
    'LangChain',
    'Large Language Models'
  ]
};

// Website Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: `${portfolioData.name} Portfolio`,
  url: 'https://manishsingh.tech',
  description: portfolioData.bio,
  author: {
    '@type': 'Person',
    name: portfolioData.name
  },
  inLanguage: 'en-US',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://manishsingh.tech/projects?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

// Profile Page Schema
export const profilePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: personSchema,
  url: 'https://manishsingh.tech',
  name: `${portfolioData.name} - Portfolio`,
  description: portfolioData.bio
};

// Breadcrumb Schema Generator
export const getBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://manishsingh.tech${item.path}`
    }))
  };
};