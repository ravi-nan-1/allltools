'use client';

import { useMemo, useState } from 'react';
import type { ToolCategory } from '@/lib/tools';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolCard } from './tool-card';
import { useLanguage } from '@/hooks/use-language';
import { Search, ArrowRight, Check, FileText } from 'lucide-react';
import { WhyAll2ools } from './why-all2ools';
import { HomepageFaq } from './homepage-faq';
import { Personas } from './personas';
import { FeaturedTools } from './featured-tools';
import { DeferredAdBanner } from '../shared/deferred-ad-banner';
import Link from 'next/link';

const categories: ToolCategory[] = [
  'Finance',
  'Business',
  'Image',
  'SEO',
  'Developer',
  'Health',
];

interface HomePageClientProps {
  tools: Array<{
    slug: string;
    name: string;
    description: string;
    category: ToolCategory;
    icon: string;
  }>;
}

export function HomePageClient({ tools }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');
  const { translate } = useLanguage();

  const translatedAndFilteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tools
      .map((tool) => ({
        ...tool,
        name: translate(tool.name),
        description: translate(tool.description),
      }))
      .filter((tool) => {
        const matchesCategory =
          selectedCategory === 'All' || tool.category === selectedCategory;
        const matchesSearch =
          !query ||
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });
  }, [tools, searchQuery, selectedCategory, translate]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="relative bg-background py-16 md:py-20 px-4 text-center">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Free Online AI Tools for Every Task
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            All2ools brings together focused online utilities for documents, images, SEO,
            finance, developer tasks, and everyday work.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
            {['100% Free Forever', 'No Signup Required', 'Unlimited Use', `${tools.length} Online Tools`].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#tools" className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition inline-block">
              Explore All Tools →
            </a>
            <Link
              href="/pdf-tools"
              className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition inline-flex items-center justify-center gap-2"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              Explore PDF & Document Tools
            </Link>
          </div>
        </div>
      </section>

      <section id="tools" className="pt-12" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="sr-only">All online tools</h2>
        <div className="max-w-xl mx-auto relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder={translate('search_placeholder')}
            aria-label="Search online tools"
            className="w-full pl-10 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-12">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('All')}
            className="rounded-full"
          >
            {translate('filter_all')}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {translate(`filter_${category.toLowerCase()}`)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {translatedAndFilteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>

        {translatedAndFilteredTools.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No tools found.</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </section>

      <div className="my-12 md:my-16">
        <DeferredAdBanner
          adSlot="YOUR_TOP_BANNER_AD_SLOT_ID"
          className="w-full min-h-[100px] flex items-center justify-center bg-muted rounded-lg"
        />
      </div>

      <WhyAll2ools />
      <Personas />

      <div className="my-12 md:my-16" id="popular">
        <DeferredAdBanner
          adSlot="YOUR_MID_BANNER_AD_SLOT_ID"
          className="w-full min-h-[100px] flex items-center justify-center bg-muted rounded-lg"
        />
      </div>

      <FeaturedTools />
      <HomepageFaq />

      <section className="text-center py-16 md:py-24">
        <h2 className="text-3xl font-bold font-headline">Ready to Boost Your Productivity?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Explore the full suite of free tools and start working smarter today.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="#tools">
            Explore All Tools
            <ArrowRight className="ml-2" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
