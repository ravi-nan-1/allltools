"use client";

import type { Tool } from '@/lib/tools';
import type { GenerateSEOMetadataOutput } from '@/ai/flows/generate-seo-metadata';
import { ToolInterface } from './tool-interface';
import { toolClusters } from '@/lib/tool-clusters';
import { tools } from '@/lib/tools';
import { ToolCard } from '@/components/homepage/tool-card';
import { placeholderImages } from '@/lib/placeholder-images';
import { ToolBreadcrumb, ToolHeader, ToolWorkspace, ToolMaxWidth } from './shell/tool-shell';
import { SeoContent } from './seo-content';

interface ToolPageClientProps {
  tool: Tool & { image: string; imageHint: string };
  aiContent: GenerateSEOMetadataOutput;
}

export function ToolPageClient({ tool, aiContent }: ToolPageClientProps) {
  const { jsonLdSchema } = aiContent;

  const relatedCluster = toolClusters.find(cluster => cluster.slugs.includes(tool.slug));
  const relatedTools = relatedCluster
    ? tools
        .filter(t => relatedCluster.slugs.includes(t.slug) && t.slug !== tool.slug)
        .map(t => {
          const image = placeholderImages.find(img => img.id === t.slug);
          return {
            ...t,
            image: image?.imageUrl || `https://picsum.photos/seed/${t.slug}/300/300`,
            width: 300,
            height: 300,
            imageHint: image?.imageHint || 'tool illustration',
          };
        })
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSchema }}
      />
      <ToolMaxWidth className="py-6 md:py-10">
        <ToolBreadcrumb tool={tool} />
        <ToolHeader tool={tool} />

        <ToolWorkspace className="mb-10">
          <ToolInterface slug={tool.slug} />
        </ToolWorkspace>

        <div className="space-y-12">
          <section className="max-w-4xl mx-auto px-4">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {tool.longDescription}
            </p>
          </section>

          {relatedTools.length > 0 && relatedCluster && (
            <section className="max-w-5xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{relatedCluster.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedTools.map(relatedTool => (
                  <ToolCard key={relatedTool.slug} tool={relatedTool} />
                ))}
              </div>
            </section>
          )}

          <SeoContent tool={tool} />
        </div>
      </ToolMaxWidth>
    </>
  );
}
