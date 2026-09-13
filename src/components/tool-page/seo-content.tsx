import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Check, CircleHelp, Info, ListChecks, ShieldCheck, Sparkles } from 'lucide-react';
import type { Tool } from '@/lib/tools';
import { seoToolContent } from '@/lib/seo-tool-content';
import { getToolKeywords } from '@/lib/seo-keywords';

function splitUseCase(value: string) {
  const [audience, ...rest] = value.split(/\s*:\s*/);
  return { audience, description: rest.join(': ') || audience };
}

function makeSpecificFaqs(tool: Tool) {
  const isCalculator = /calculator|checker|converter|generator|compressor|formatter|validator|analyzer|maker|timer|humanizer|tutor|extractor|power tools|shortener/i.test(tool.name);
  const description = tool.description.replace(/\s+/g, ' ').trim();
  const inputAnswer = isCalculator
    ? `${tool.name} uses the inputs shown in the calculator to produce an estimate or calculation. Enter realistic values, keep the units consistent, and change one assumption at a time when comparing scenarios.`
    : `${tool.name} is designed around the task described above. Use the controls in the workspace, review the output, and adjust the inputs or options when you need a different result.`;

  return [
    { question: `What is ${tool.name}?`, answer: `${tool.name} is an online ${tool.category.toLowerCase()} tool. ${description}` },
    { question: `How does ${tool.name} work?`, answer: inputAnswer },
    { question: `What should I enter or upload?`, answer: `Use the values, text, links, files, or other information requested by the tool interface. Avoid guessing important inputs; accurate inputs produce more useful results.` },
    { question: `Can I use ${tool.name} for more than one scenario?`, answer: `Yes. After reviewing a result, change the relevant inputs and run the calculation or workflow again. Comparing a few realistic scenarios is often more useful than relying on one set of assumptions.` },
    { question: `Should I verify the result?`, answer: `For financial, tax, health, legal, employment, or other consequential decisions, treat the result as an estimate or planning aid and verify the inputs, formulas, and applicable rules with an authoritative source or qualified professional.` },
  ];
}

export function SeoContent({ tool }: { tool: Tool }) {
  const content = seoToolContent[tool.slug];
  const keywords = getToolKeywords(tool.slug);
  if (!content) return null;

  const faqs = content.faqs.length ? content.faqs : (tool.faq?.length ? tool.faq : makeSpecificFaqs(tool));
  const useCases = content.use.split('\n').filter(Boolean).map(splitUseCase);
  const stepsTitle = `How to Use ${tool.name}`;
  const workTitle = `How ${tool.name} Works`;
  const hasComparison = content.compare.length > 0;
  const featureCount = content.features.length;

  const faqSchema = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  const howToSchema = content.steps.length ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: stepsTitle,
    description: `Step-by-step instructions for using ${tool.name} online.`,
    step: content.steps.map((step) => ({ '@type': 'HowToStep', text: step })),
  } : null;

  return (
    <>
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {howToSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />}

      <article className="mx-auto w-full max-w-6xl px-4 pb-14 md:pb-20">
        <header className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-background via-muted/30 to-primary/[0.06] p-6 shadow-sm md:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {tool.category} guide
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{keywords.headings.intro}</h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">{tool.description}</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Related searches: {keywords.secondary.slice(0, 3).join(" · ")}</p>
            <div className="mt-7 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border bg-background px-3 py-1.5">{featureCount} key capabilities</span>
              <span className="rounded-full border bg-background px-3 py-1.5">{useCases.length} common use cases</span>
              <span className="rounded-full border bg-background px-3 py-1.5">{faqs.length} FAQs</span>
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Best for</p>
            <p className="mt-2 font-semibold">Focused {tool.category.toLowerCase()} tasks</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Use the workspace above for the actual task, then use this guide to understand the result.</p>
          </div>
          <div className="rounded-2xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Before you start</p>
            <p className="mt-2 font-semibold">Use accurate inputs</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Units, dates, rates, files, and source data can materially change the output.</p>
          </div>
          <div className="rounded-2xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Good practice</p>
            <p className="mt-2 font-semibold">Compare realistic scenarios</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Test a few reasonable inputs instead of treating one result as a universal answer.</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[2rem] border bg-background shadow-sm">
          <section className="p-6 md:p-10">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Info className="h-6 w-6" /></div>
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">What is a {keywords.primary}?</h2>
                <p className="mt-1 text-muted-foreground">A quick explanation before you use the tool.</p>
              </div>
            </div>
            <p className="max-w-4xl text-base leading-8 text-muted-foreground md:text-lg">{tool.longDescription || tool.description}</p>
          </section>

          <section className="border-t bg-muted/20 p-6 md:p-10">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600"><Sparkles className="h-6 w-6" /></div>
              <div><h2 className="text-2xl font-bold md:text-3xl">{keywords.headings.method}</h2><p className="mt-1 text-muted-foreground">Understand the method and assumptions behind the result.</p></div>
            </div>
            <p className="max-w-4xl text-base leading-8 text-muted-foreground md:text-lg">{content.how}</p>
          </section>

          <section className="border-t p-6 md:p-10">
            <div className="flex items-end justify-between gap-4">
              <div><h2 className="text-2xl font-bold md:text-3xl">Key features and benefits</h2><p className="mt-1 text-muted-foreground">What the workflow is designed to help you accomplish.</p></div>
              <span className="hidden rounded-full bg-muted px-3 py-1 text-sm font-medium sm:inline-flex">{featureCount} highlights</span>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.features.map((feature, index) => (
                <div key={feature} className="group rounded-2xl border bg-background p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold text-muted-foreground">{String(index + 1).padStart(2, '0')}</span><Check className="h-5 w-5 text-emerald-600" /></div>
                  <p className="font-semibold leading-7">{feature}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t p-6 md:p-10">
            <h2 className="text-2xl font-bold md:text-3xl">{keywords.headings.useCases}</h2>
            <p className="mt-1 text-muted-foreground">Examples of practical situations where this type of tool can save time or reduce manual work.</p>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {useCases.map(({ audience, description }) => (
                <div key={audience + description} className="rounded-2xl border bg-muted/20 p-5">
                  <h3 className="font-semibold">{audience}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t p-6 md:p-10">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600"><ListChecks className="h-6 w-6" /></div>
              <div><h2 className="text-2xl font-bold md:text-3xl">{keywords.headings.steps}</h2><p className="mt-1 text-muted-foreground">A practical workflow from input to final result.</p></div>
            </div>
            <ol className="grid gap-4 md:grid-cols-2">
              {content.steps.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl border p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                  <span className="leading-7 text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-t bg-muted/20 p-6 md:p-10">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600"><ShieldCheck className="h-6 w-6" /></div>
              <div><h2 className="text-2xl font-bold md:text-3xl">How to interpret the result</h2><p className="mt-1 text-muted-foreground">The number or output is only as useful as the assumptions behind it.</p></div>
            </div>
            <p className="max-w-4xl text-base leading-8 text-muted-foreground md:text-lg">{content.why}</p>
            {hasComparison && (
              <div className="mt-8 overflow-hidden rounded-2xl border bg-background">
                <div className="border-b px-5 py-4"><h3 className="font-semibold">Practical comparison</h3><p className="text-sm text-muted-foreground">How this workflow differs from doing the same task manually or with a conventional alternative.</p></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Consideration</TableHead><TableHead>All2ools</TableHead><TableHead>Alternative</TableHead></TableRow></TableHeader><TableBody>{content.compare.map(([feature, ours, alternative]) => <TableRow key={feature}><TableCell className="font-medium">{feature}</TableCell><TableCell>{ours}</TableCell><TableCell>{alternative}</TableCell></TableRow>)}</TableBody></Table></div>
              </div>
            )}
          </section>

          <section className="border-t p-6 md:p-10">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600"><CircleHelp className="h-6 w-6" /></div>
              <div><h2 className="text-2xl font-bold md:text-3xl">{keywords.headings.faq}</h2><p className="mt-1 text-muted-foreground">Answers to common questions about {tool.name.toLowerCase()}.</p></div>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border bg-background px-5">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={faq.question}>
                  <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base leading-7 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="border-t bg-gradient-to-r from-primary/[0.06] to-transparent p-6 md:p-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div><h2 className="text-2xl font-bold md:text-3xl">Ready to use {tool.name}?</h2><p className="mt-2 max-w-3xl leading-7 text-muted-foreground">{content.conclusion}</p></div>
              <a href="#tool-workspace" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">Back to tool <ArrowRight className="h-4 w-4" /></a>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
