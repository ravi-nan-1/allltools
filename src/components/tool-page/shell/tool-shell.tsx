"use client";

import Link from 'next/link';
import * as icons from 'lucide-react';
import { ChevronRight, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Tool } from '@/lib/tools';

/**
 * ToolBreadcrumb — compact top-of-page trail (category > tool).
 * Replaces the old "back to tools" button + giant hero image.
 */
export function ToolBreadcrumb({ tool }: { tool: Pick<Tool, 'name' | 'category'> }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap"
    >
      <Link href="/" className="hover:text-foreground transition-colors">
        All2ools
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <Link
        href={`/?category=${encodeURIComponent(tool.category)}`}
        className="hover:text-foreground transition-colors"
      >
        {tool.category}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="text-foreground font-medium truncate">{tool.name}</span>
    </nav>
  );
}

/**
 * ToolHeader — title + short description + category badge.
 * No banner image, no huge empty hero — the tool workspace below is the hero.
 */
export function ToolHeader({
  tool,
}: {
  tool: Pick<Tool, 'name' | 'category' | 'description' | 'icon'>;
}) {
  const Icon = (icons[tool.icon as keyof typeof icons] as icons.LucideIcon) || Wrench;

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {tool.name}
            </h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {tool.category}
            </Badge>
          </div>
          <p className="mt-1.5 max-w-2xl text-base text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </div>
    </header>
  );
}

/**
 * ToolWorkspace — the primary, visually dominant surface that holds the
 * actual tool UI. Full-width, no ad banner inside, no nested "Tool
 * Interface" chrome — the tool itself is the focus.
 */
export function ToolWorkspace({
  children,
  className,
  fullBleed = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Set true for tools (iframes, canvases) that want to manage their own internal padding/scroll. */
  fullBleed?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card shadow-sm',
        fullBleed ? 'overflow-hidden' : 'p-4 sm:p-6 lg:p-8',
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * ToolSection — consistent wrapper for supporting content blocks
 * (features, how-it-works, use-cases, FAQ) below the workspace.
 */
export function ToolSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('scroll-mt-20', className)}>
      {title && (
        <h2 className="mb-4 flex items-center gap-2 font-headline text-xl font-bold text-foreground sm:text-2xl">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/**
 * ToolMaxWidth — the shared content-width container for tool pages.
 * Wider than the site's default container so data/AI-heavy tools have room
 * to breathe, while keeping prose sections readable.
 */
export function ToolMaxWidth({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>;
}
