import Link from 'next/link';
import type { Metadata } from 'next';
import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { tools } from '@/lib/tools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SITE_URL = 'https://all2ools.com';

export const metadata: Metadata = {
  title: 'PDF & Document Tools | Free Online PDF Utilities | All2ools',
  description: 'Explore All2ools PDF and document utilities for conversion, extraction, invoices, and study materials.',
  alternates: { canonical: `${SITE_URL}/pdf-tools` },
  openGraph: {
    title: 'PDF & Document Tools | All2ools',
    description: 'Free browser-based PDF and document utilities from All2ools.',
    url: `${SITE_URL}/pdf-tools`,
    siteName: 'All2ools',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'All2ools PDF and document tools' }],
  },
};

const documentSlugs = [
  'pdf-to-word-converter',
  'invoice-excel-extractor',
  'free-cheat-sheet-generator',
  'ai-invoice-generator',
  'excel-power-tools',
];

export default function PdfToolsPage() {
  const documentTools = documentSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));

  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          PDF & Document Tools
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Use focused browser-based utilities for PDF conversion, document extraction,
          invoices, spreadsheets, and study materials. Each tool has its own workflow and
          limitations, so there are no misleading claims about unsupported PDF operations.
        </p>
      </header>

      <section className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="PDF and document tools">
        {documentTools.map((tool) => (
          <Card key={tool.slug} className="group flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle>{tool.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="text-sm leading-6 text-muted-foreground">{tool.description}</p>
              <Link
                href={`/tools/${tool.slug}`}
                className="mt-auto pt-6 inline-flex items-center font-semibold text-primary hover:underline"
              >
                Use tool
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-4xl rounded-2xl bg-muted/40 p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">Why use All2ools document tools?</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            'Focused workflows instead of a crowded all-in-one editor.',
            'Browser-based interfaces with no desktop installation.',
            'Tool-specific instructions and limitations.',
            'Quick links to related utilities when your workflow changes.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
