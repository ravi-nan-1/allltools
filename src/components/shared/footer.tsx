'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { tools } from '@/lib/tools';
import { toolClusters } from '@/lib/tool-clusters';
import { useLanguage } from '@/hooks/use-language';
import { usePathname } from 'next/navigation';

const guideRelations: Record<string, string[]> = {
  'pdf-compression': ['free-image-file-compressor', 'pdf-to-word-converter', 'invoice-excel-extractor', 'excel-power-tools'],
  'image-compression': ['free-image-file-compressor',],
  'calculator-guide': ['emi-calculator', 'compound-interest-calculator', 'percentage-calculator', 'bmi-calculator', 'calorie-calculator'],
};

export function Footer({ showRelatedTools = true }: { showRelatedTools?: boolean }) {
  const { translate } = useLanguage();
  const pathname = usePathname();
  const slug = pathname.startsWith('/tools/') ? pathname.split('/')[2] : '';
  const guideSlug = pathname.startsWith('/guides/') ? pathname.split('/')[2] : '';
  const currentTool = tools.find(tool => tool.slug === slug);

  let relatedSlugs: string[] = [];
  let heading = 'Related Tools';

  if (guideSlug && guideRelations[guideSlug]) {
    relatedSlugs = guideRelations[guideSlug];
    heading = 'Tools for This Guide';
  } else if (currentTool) {
    const cluster = toolClusters.find(cluster => cluster.slugs.includes(currentTool.slug));
    if (cluster) {
      relatedSlugs = cluster.slugs.filter(item => item !== currentTool.slug).slice(0, 5);
      heading = cluster.title;
    } else {
      relatedSlugs = tools
        .filter(tool => tool.category === currentTool.category && tool.slug !== currentTool.slug)
        .slice(0, 5)
        .map(tool => tool.slug);
    }
  }

  const relatedTools = relatedSlugs
    .map(relatedSlug => tools.find(tool => tool.slug === relatedSlug))
    .filter((tool): tool is typeof tools[number] => Boolean(tool))
    .slice(0, 6)
    .map(tool => ({
      name: translate(tool.name),
      description: translate(tool.description),
      href: `/tools/${tool.slug}`,
    }));

  return (
    <footer className="w-full bg-background border-t border-border mt-auto py-12">
      <div className="container mx-auto text-center px-4">
        {showRelatedTools && relatedTools.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-3 font-headline">{heading}</h3>
            <p className="mb-8 text-muted-foreground">Explore a few tools that are closely related to this page.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group block p-5 rounded-xl bg-card border text-left transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                >
                  <h4 className="font-bold text-base text-foreground flex justify-between items-center gap-2">
                    {tool.name}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-8 text-muted-foreground">
          <nav className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Use</Link>
            <Link href="/#tools" className="hover:text-primary">All Tools</Link>
          </nav>
          <p className="text-sm">&copy; {new Date().getFullYear()} All2ools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
