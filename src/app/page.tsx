import { tools } from '@/lib/tools';
import { homepageFaqItems } from '@/lib/homepage-faq';
import { HomePageClient } from '@/components/homepage/home-page-client';
import type { Metadata } from 'next';

const SITE_URL = 'https://all2ools.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: 'Free Online AI Tools | PDF, SEO, Image & Business Tools',
    description: `All2ools offers ${tools.length} free online tools across documents, images, SEO, finance, business, developer, and health categories.`,
    url: SITE_URL,
    siteName: 'All2ools',
    type: 'website',
    locale: 'en_US',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'All2ools free online tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All2ools — Free Online Tools',
    description: `Explore ${tools.length} free online tools for work, study, documents, images, SEO, finance, and development.`,
    images: [OG_IMAGE],
  },
};

export default function Home() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'All2ools',
    description: `All2ools offers ${tools.length} free online tools across finance, SEO, image, business, developer, and health categories.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'All2ools',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: [],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homepageFaqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  const featuredSlugs = [
    'pdf-to-word-converter',
    'image-compressor',
    'regex-generator-from-text',
    '1-click-article-outline-generator',
    'json-excel-converter',
    'api-latency-checker',
  ];

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Tools on All2ools',
    itemListElement: tools
      .filter((tool) => featuredSlugs.includes(tool.slug))
      .map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: tool.name,
          url: `${SITE_URL}/tools/${tool.slug}`,
          applicationCategory: 'Utility',
          operatingSystem: 'Any',
          description: tool.description,
        },
      })),
  };

  // Tool cards intentionally use functional SVG icons instead of stock photography.
  const toolsForHome = tools;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <HomePageClient tools={toolsForHome} />
    </>
  );
}
