import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Tools Guides | All2ools',
  description: 'Practical guides for PDF compression, image optimization, calculators, and everyday online tools.',
  alternates: { canonical: 'https://all2ools.com/guides' },
};

const guides = [
  ['pdf-compression', 'How to Compress a PDF', 'Learn how file size, images, quality, and document use cases affect PDF compression.'],
  ['image-compression', 'Image Compression Guide', 'Choose formats and quality settings for websites, email, documents, and sharing.'],
  ['calculator-guide', 'How to Choose the Right Calculator', 'Understand which All2ools calculator fits loans, investments, taxes, percentages, dates, and more.'],
];

export default function GuidesPage() {
  return <main className="container mx-auto px-4 py-12 md:py-16">
    <div className="max-w-3xl">
      <p className="text-sm font-semibold text-primary">All2ools Resources</p>
      <h1 className="mt-2 text-4xl font-bold">Practical Online Tool Guides</h1>
      <p className="mt-4 text-lg text-muted-foreground">Short, task-focused guides that explain how to choose settings, interpret results, and get better outcomes from common online utilities.</p>
    </div>
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {guides.map(([slug,title,description]) => <Link key={slug} href={`/guides/${slug}`} className="rounded-2xl border p-6 hover:border-primary transition">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <span className="mt-5 inline-block text-sm font-medium text-primary">Read guide →</span>
      </Link>)}
    </div>
  </main>;
}
