
import { tools } from '@/lib/tools';
import { notFound } from 'next/navigation';
import { generateSEOMetadata } from '@/ai/flows/generate-seo-metadata';
import { ToolPageClient } from '@/components/tool-page/tool-page-client';
import type { Metadata } from 'next';
import { placeholderImages } from '@/lib/placeholder-images';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    return {
      title: 'Tool not found',
    };
  }

  const { seoTitle, seoDescription } = await generateSEOMetadata({
    toolName: tool.name,
    toolDescription: tool.longDescription,
    toolSlug: tool.slug,
  });

  return {
    alternates: {
      canonical: `https://all2ools.com/tools/${slug}`,
    },
    title: seoTitle,
    description: seoDescription,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const aiContent = await generateSEOMetadata({
    toolName: tool.name,
    toolDescription: tool.longDescription,
    toolSlug: tool.slug,
  });

  const image = placeholderImages.find((img) => img.id === tool.slug);
  const toolWithImage = {
    ...tool,
    image: image?.imageUrl || `https://picsum.photos/seed/${tool.slug}/1200/400`,
    imageHint: image?.imageHint || 'tool banner',
  };

  return (
    <ToolPageClient
      tool={toolWithImage}
      aiContent={aiContent}
    />
  );
}

export async function generateStaticParams() {
  // These pages have their own dedicated page.tsx files
  const excludedSlugs = new Set([
    'ai-humanizer',
    'tinyurl-maker',
    'ai-product-background-remover',
    'content-gap-analyzer',
    'api-latency-checker',
    'pdf-to-word-converter',
    'ai-tutor',
    'excel-power-tools',
    'image-compressor',
    'jwt-decoder-validator',
    'global-loan-optimizer',
    'crypto-tax-calculator',
    'forex-arbitrage-checker',
    'ai-invoice-generator',
    'business-valuation-calculator',
    'ai-headshot-generator',
    'keyword-cluster-generator',
    'ai-product-description-generator',
    'json-excel-converter',
    'regex-generator-from-text',
    'webhook-tester',
    '1-click-article-outline-generator',
    'invoice-excel-extractor',
    'stopwatch',
    'emi-calculator',
    'mortgage-calculator',
    'interest-calculator',
    'compound-interest-calculator',
    'simple-interest-calculator',
    'investment-return-calculator',
    'roi-calculator',
    'retirement-calculator',
    'pension-calculator',
    'sip-calculator',
    'fd-calculator',
    'ppf-calculator',
    'nps-calculator',
    '401k-calculator',
    'social-security-calculator',
    'income-tax-calculator',
    'take-home-pay-calculator',
    'salary-calculator',
    'gst-calculator',
    'sales-tax-calculator',
    'inflation-calculator',
    'percentage-calculator',
    'age-calculator',
    'date-calculator',
    'bmi-calculator',
    'calorie-calculator',
    'mortgage-payment-calculator',
    'auto-loan-calculator',
    'credit-card-payoff-calculator',
    'student-loan-calculator',
    'personal-loan-calculator',
    'discount-calculator',
    'tip-calculator',
    'profit-margin-calculator',
    'break-even-calculator',
    'currency-converter',
    'time-zone-converter',
    'scientific-calculator',
    'random-number-generator',
  ]);

  return tools
    .filter((tool) => !excludedSlugs.has(tool.slug))
    .map((tool) => ({
      slug: tool.slug,
    }));
}
