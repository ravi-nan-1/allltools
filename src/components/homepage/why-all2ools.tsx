import { CheckCircle, Lock, Sparkles, Zap } from 'lucide-react';

function FeatureItem({ icon: Icon, children }: { icon: typeof Lock; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export function WhyAll2ools() {
  return (
    <section className="py-16 md:py-20" aria-labelledby="why-all2ools">
      <header className="text-center max-w-4xl mx-auto">
        <h2 id="why-all2ools" className="text-3xl font-extrabold tracking-tight text-primary md:text-5xl font-headline">
          Free Online Tools for Everyday Digital Tasks
        </h2>
        <p className="mx-auto mt-4 text-lg text-muted-foreground">
          All2ools brings practical document, image, SEO, finance, business, developer,
          and AI utilities together in one searchable workspace. Each tool has a focused
          workflow so you can move from a task to a result without switching between
          multiple websites.
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-5xl rounded-2xl bg-muted/40 p-8 md:p-12">
        <h3 className="text-2xl md:text-3xl font-bold font-headline mb-4">
          Why Choose All2ools?
        </h3>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          The platform is organized around practical workflows such as document
          conversion, image processing, content work, calculations, and developer tasks.
        </p>
        <ul className="grid gap-5 md:grid-cols-2">
          <FeatureItem icon={Lock}>No login or signup required for the core tools.</FeatureItem>
          <FeatureItem icon={Sparkles}>AI-assisted workflows for supported writing and document tasks.</FeatureItem>
          <FeatureItem icon={Zap}>Fast, browser-based interfaces designed for everyday tasks.</FeatureItem>
          <FeatureItem icon={CheckCircle}>Clear tool-specific instructions, FAQs, and limitations where applicable.</FeatureItem>
        </ul>
      </div>
    </section>
  );
}
