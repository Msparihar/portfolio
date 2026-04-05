import portfolioData from '@/config/portfolio.json';
import { personSchema, websiteSchema, profilePageSchema } from './metadata';
import { getGithubContributionsFast } from '@/lib/githubContributions';
import DesktopPage from '@/components/desktop/DesktopPage';

// ISR: Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

// Metadata for home page
export const metadata = {
  title: 'Home',
  description: `${portfolioData.name} - ${portfolioData.title}. ${portfolioData.bio}`,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${portfolioData.name} | ${portfolioData.title}`,
    description: portfolioData.bio,
    url: 'https://manishsingh.tech',
    type: 'website',
  },
};

// Fetch GitHub contributions data server-side with fallback-first strategy
// Returns cached/fallback data instantly without blocking the page
async function fetchGithubContributions() {
  try {
    const githubUsername = portfolioData.githubUsername || 'Msparihar';
    const result = await getGithubContributionsFast(githubUsername);
    return result;
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return { error: true, message: error.message };
  }
}

export default async function Home() {
  const githubData = await fetchGithubContributions();

  return (
    <>
      {/* JSON-LD Structured Data — Person Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* JSON-LD Structured Data — Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* JSON-LD Structured Data — Profile Page Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />

      {/* Visually hidden H1 for SEO and accessibility */}
      <h1 className="sr-only">Manish Singh Parihar — Full Stack & AI Engineer Portfolio</h1>

      <DesktopPage githubData={githubData} />
    </>
  );
}
