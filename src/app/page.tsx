
import { tools } from '@/lib/tools';
import { homepageFaqItems } from '@/lib/homepage-faq';
import { HomePageClient } from '@/components/homepage/home-page-client';
import { placeholderImages } from '@/lib/placeholder-images';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://all2ools.com/',
  },
};


export default function Home() {
  const toolsWithImages = tools.map((tool) => {
    const image = placeholderImages.find((img) => img.id === tool.slug);
    // Don't pass the icon component to the client
    const { ...toolWithoutIcon } = tool;
    return {
      ...toolWithoutIcon,
      icon: tool.icon,
      image: image?.imageUrl || `https://picsum.photos/seed/${tool.slug}/300/300`,
      width: 300,
      height: 300,
      imageHint: image?.imageHint || 'tool illustration',
    };
  });

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://all2ools.com/',
    name: 'All2ools',
    description: `All2ools offers ${tools.length} free online tools across finance, SEO, image, business, developer, and health categories.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://all2ools.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'All2ools',
    url: 'https://all2ools.com/',
    logo: 'https://all2ools.com/logo.svg',
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
  
  const featuredTools = [
    'pdf-to-word-converter', 'image-compressor', 'regex-generator-from-text', 
    '1-click-article-outline-generator', 'json-excel-converter', 'api-latency-checker'
  ];

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Tools on All2ools',
    itemListElement: tools
      .filter(t => featuredTools.includes(t.slug))
      .map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: tool.name,
        url: `https://all2ools.com/tools/${tool.slug}`,
        applicationCategory: 'Utility',
        operatingSystem: 'Any',
        description: tool.description,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <HomePageClient tools={toolsWithImages} />
    </>
  );
}
