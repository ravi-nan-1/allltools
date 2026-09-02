
"use client";

import type { Tool } from '@/lib/tools';
import type { GenerateSEOMetadataOutput } from '@/ai/flows/generate-seo-metadata';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Sparkles, BookOpen, BrainCircuit, HelpCircle } from 'lucide-react';
import { ToolInterface } from './tool-interface';
import { DeferredAdBanner } from '@/components/shared/deferred-ad-banner';
import { toolClusters } from '@/lib/tool-clusters';
import { tools } from '@/lib/tools';
import { ToolCard } from '@/components/homepage/tool-card';
import { placeholderImages } from '@/lib/placeholder-images';
import { ToolBreadcrumb, ToolHeader, ToolWorkspace, ToolSection, ToolMaxWidth } from './shell/tool-shell';

interface ToolPageClientProps {
  tool: Tool & { image: string; imageHint: string };
  aiContent: GenerateSEOMetadataOutput;
}

const iframeTools: string[] = [];

const ContentSection = ({ title, content, icon: Icon }: { title: string, content: string, icon: React.ElementType }) => {
    const isEmpty = !content || content.startsWith(`${title.toLowerCase().replace(/ /g, '_')}_`);

    return (
        <ToolSection title={title} icon={Icon}>
            <Card className="border-border/60 shadow-none">
                <CardContent className="pt-6">
                    {isEmpty ? (
                        <p className="text-muted-foreground">The {title.toLowerCase()} for this tool are being updated. Please check back soon.</p>
                    ) : (
                        <ul className="space-y-3 text-muted-foreground">
                            {content.split('\n').map(item => item.trim()).filter(Boolean).map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </ToolSection>
    );
};

const HowItWorksSection = ({ content }: { content: string }) => {
    const isEmpty = !content || content.startsWith('how_it_works_');
    return (
        <ToolSection title="How It Works" icon={BookOpen}>
            <Card className="border-border/60 shadow-none">
                <CardContent className="pt-6">
                    {isEmpty ? (
                        <p className="text-muted-foreground">The instructions for this tool are being updated. Please check back soon.</p>
                    ) : (
                        <ol className="space-y-4 text-muted-foreground">
                            {content.split('\n').map(item => item.trim()).filter(Boolean).map((step, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-base shrink-0">{index + 1}</span>
                                    <span className="mt-1">{step}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </CardContent>
            </Card>
        </ToolSection>
    );
}

const FaqSection = ({ content }: { content: string }) => {
    const isEmpty = !content || content.startsWith('faq_');
    return (
        <ToolSection title="Frequently Asked Questions" icon={HelpCircle}>
            <Card className="border-border/60 shadow-none">
                <CardContent className="pt-6 space-y-6">
                    {isEmpty ? (
                        <p className="text-muted-foreground">FAQs for this tool are being updated. Please check back soon.</p>
                    ) : (
                        content.split('\n\n').map(q => q.trim()).filter(Boolean).map((faqItem, index) => {
                            const [question, ...answerParts] = faqItem.split('\n');
                            const answer = answerParts.join('\n');
                            return (
                                <div key={index} className="border-l-2 border-primary pl-4">
                                    <h4 className="font-semibold text-foreground text-lg">{question.replace(/^\d+\.\s*/, '')}</h4>
                                    <p className="text-muted-foreground mt-1">{answer}</p>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </ToolSection>
    );
}

export function ToolPageClient({ tool, aiContent }: ToolPageClientProps) {
  const { translate } = useLanguage();
  const { jsonLdSchema } = aiContent;

  const longDescription = translate(`${tool.slug}_long_description`);
  const faqContent = translate(`${tool.slug}_faq`);
  const featuresContent = translate(`${tool.slug}_features`);
  const howItWorksContent = translate(`${tool.slug}_how_it_works`);
  const useCasesContent = translate(`${tool.slug}_use_cases`);

  const isIframeTool = iframeTools.includes(tool.slug);

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

  if (isIframeTool) {
    return <ToolInterface slug={tool.slug} />;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSchema }}
      />
      <ToolMaxWidth className="py-6 md:py-10">
        <ToolBreadcrumb tool={tool} />
        <ToolHeader tool={tool} />

        {/* Primary tool workspace — the hero of the page, no banner, no ads inside */}
        <ToolWorkspace className="mb-10">
          <ToolInterface slug={tool.slug} />
        </ToolWorkspace>

        <div className="space-y-12">
          {!longDescription.startsWith(`${tool.slug}_`) && (
            <section>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
                {longDescription}
              </p>
            </section>
          )}

          {relatedTools.length > 0 && relatedCluster && (
            <ToolSection title={relatedCluster.title}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedTools.map(relatedTool => (
                  <ToolCard key={relatedTool.slug} tool={relatedTool} />
                ))}
              </div>
            </ToolSection>
          )}

          <section>
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="features"><Sparkles className="mr-2 h-4 w-4"/>{translate('features')}</TabsTrigger>
                <TabsTrigger value="how-it-works"><BookOpen className="mr-2 h-4 w-4"/>{translate('how_it_works')}</TabsTrigger>
                <TabsTrigger value="use-cases"><BrainCircuit className="mr-2 h-4 w-4"/>{translate('use_cases')}</TabsTrigger>
              </TabsList>
              <TabsContent value="features" className="mt-6">
                <ContentSection title="Features" content={featuresContent} icon={Sparkles} />
              </TabsContent>
              <TabsContent value="how-it-works" className="mt-6">
                 <HowItWorksSection content={howItWorksContent} />
              </TabsContent>
              <TabsContent value="use-cases" className="mt-6">
                <ContentSection title="Common Use Cases" content={useCasesContent} icon={BrainCircuit} />
              </TabsContent>
            </Tabs>
          </section>

          <FaqSection content={faqContent} />

          {/* Ad placement: below all real content, never inside or above the tool workspace */}
          <div className="pt-2">
            <p className="text-center text-xs uppercase tracking-wide text-muted-foreground mb-2">Advertisement</p>
            <DeferredAdBanner
              adSlot="YOUR_IN_ARTICLE_AD_SLOT_ID"
              className="w-full min-h-[100px] flex items-center justify-center bg-muted/50 rounded-lg"
            />
          </div>
        </div>
      </ToolMaxWidth>
    </>
  );
}
