
'use client';

import { tools } from '@/lib/tools';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

const featuredSlugs = [
    'pdf-to-word-converter', 
    'image-compressor', 
    'regex-generator-from-text', 
    '1-click-article-outline-generator', 
    'json-excel-converter', 
    'api-latency-checker'
];

export function FeaturedTools() {
    const { translate } = useLanguage();
    const featuredTools = tools.filter(tool => featuredSlugs.includes(tool.slug));

    // Featured cards use their own editorial blurbs so the homepage does not
    // repeat the same tool description shown in the main tool directory.
    const featuredDescriptions: Record<string, string> = {
        'pdf-to-word-converter': 'Turn a PDF into an editable Word document when you need to revise, reuse, or repurpose its content.',
        'image-compressor': 'Shrink image files for quicker uploads, lighter pages, and easier sharing while keeping practical visual quality.',
        'regex-generator-from-text': 'Describe the text pattern you need and build a regular expression that is easier to test and refine.',
        '1-click-article-outline-generator': 'Create a structured article outline from a topic so you can move from an idea to a clear writing plan faster.',
        'json-excel-converter': 'Move structured JSON data into a spreadsheet-friendly format for inspection, reporting, and everyday analysis.',
        'api-latency-checker': 'Measure API response times and use the results to spot slow endpoints and compare network performance.'
    };
    
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl font-headline">
                        Featured Tools
                    </h2>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                        Explore some of our most popular and powerful utilities, designed to solve common problems in seconds.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredTools.map(tool => (
                        <Card key={tool.slug} className="group hover:border-primary/50 transition-all">
                             <Link href={`/tools/${tool.slug}`} className="flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle className="text-xl">{translate(tool.slug)}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{featuredDescriptions[tool.slug] ?? translate(tool.description)}</CardDescription>
                                </CardContent>
                                 <div className="p-6 pt-0">
                                    <div className="text-primary font-semibold flex items-center group-hover:underline">
                                        Use Tool
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                             </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
