import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check } from 'lucide-react';
import type { Tool } from '@/lib/tools';
import { seoToolContent } from '@/lib/seo-tool-content';

export function SeoContent({ tool }: { tool: Tool }) {
  const content = seoToolContent[tool.slug];

  if (!content) return null;

  const stepsTitle = `How to Use Our ${tool.name} (Step-by-Step)`;
  const workTitle = `How Does ${tool.name} Work?`;
  const whyTitle = `Why Choose Our ${tool.name}?`;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: stepsTitle,
    description: `Step-by-step instructions for using ${tool.name}.`,
    step: content.steps.map((step) => ({ '@type': 'HowToStep', text: step })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <article className="w-full max-w-4xl mx-auto px-4 py-4 md:py-12 space-y-12 text-base md:text-lg leading-relaxed text-foreground">
      <section>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">{workTitle}</h2>
        <p>{content.how}</p>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Features &amp; Benefits</h2>
        <ul className="space-y-4">
          {content.features.map((feature) => (
            <li key={feature} className="flex items-start">
              <Check className="h-6 w-6 text-green-500 mr-2 mt-1 shrink-0" />
              <div>{feature}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Supported Formats &amp; Use Cases</h2>
        <p className="mb-4">Common ways to use {tool.name.toLowerCase()} include:</p>
        <div className="grid md:grid-cols-3 gap-6 mt-4">
          {content.use.split('\n').map((item) => {
            const [audience, description] = item.split(/\s*:\s*/, 2);
            return (
              <div key={item}>
                <h3 className="font-bold text-xl mb-2">{audience}</h3>
                <p>{description || audience}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">{stepsTitle}</h2>
        <ol className="list-decimal list-inside space-y-2">
          {content.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <p className="mt-4 font-semibold">That’s it — review the result, make any needed edits, and use it with confidence.</p>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">{whyTitle}</h2>
        <p className="mb-4">{content.why}</p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>All2ools</TableHead>
                <TableHead>Traditional Workflow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.compare.map(([feature, ours, alternative]) => (
                <TableRow key={feature}>
                  <TableCell>{feature}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{ours}</TableCell>
                  <TableCell>{alternative}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Frequently Asked Questions (FAQ)</h2>
        <Accordion type="single" collapsible className="w-full">
          {content.faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={faq.question}>
              <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Conclusion</h2>
        <p>{content.conclusion}</p>
      </section>
      </article>
    </>
  );
}
