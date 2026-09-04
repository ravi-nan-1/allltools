import { tools } from '@/lib/tools';
import { notFound } from 'next/navigation';
import { generateSEOMetadata } from '@/ai/flows/generate-seo-metadata';
import { ToolPageClient } from '@/components/tool-page/tool-page-client';
import type { Metadata } from 'next';
import { placeholderImages } from '@/lib/placeholder-images';

const SLUG = 'date-calculator';

export async function generateMetadata(): Promise<Metadata> {
  const tool = tools.find((t) => t.slug === SLUG);
  if (!tool) return { title: 'Tool not found' };
  return {
    alternates: { canonical: `https://all2ools.com/tools/${SLUG}` },
    title: tool.metaTitle || tool.name,
    description: tool.metaDescription || tool.description,
    keywords: tool.keywords,
  };
}

export default async function ToolPage() {
  const tool = tools.find((t) => t.slug === SLUG);
  if (!tool) notFound();

  const image = placeholderImages.find((img) => img.id === tool.slug);
  const toolWithImage = {
    ...tool,
    image: image?.imageUrl || `https://picsum.photos/seed/${tool.slug}/1200/400`,
    imageHint: image?.imageHint || 'calculator illustration',
  };

  const aiContent = await generateSEOMetadata({
    toolName: tool.name,
    toolDescription: tool.longDescription,
    toolSlug: tool.slug,
  });

  return <ToolPageClient tool={toolWithImage} aiContent={aiContent} />;
}
