
'use client';

import { homepageFaqItems } from '@/lib/homepage-faq';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = homepageFaqItems;

export function HomepageFaq() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl font-headline">
                Frequently Asked Questions
            </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {item.answer}
              </AccordionContent>
              <div className="sr-only">{item.answer}</div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
