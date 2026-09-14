import Link from 'next/link';
import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tool } from '@/lib/tools';
import { useLanguage } from '@/hooks/use-language';
import { ArrowRight, Wrench } from 'lucide-react';

export type ToolWithImage = Pick<Tool, 'name' | 'slug' | 'category' | 'description' | 'icon'> & {
  image?: string;
  imageHint?: string;
  width?: number;
  height?: number;
};

interface ToolCardProps {
  tool: ToolWithImage;
  priority?: boolean;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { translate } = useLanguage();
  const Icon = (icons[tool.icon as keyof typeof icons] as LucideIcon) || Wrench;

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg group">
      <Link href={`/tools/${tool.slug}`} className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="flex items-center justify-center min-h-28 p-7 bg-muted/40 border-b">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-9 w-9" strokeWidth={1.8} aria-hidden="true" />
          </div>
        </div>
        <CardHeader className="p-4">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base font-headline leading-snug">{tool.name}</CardTitle>
            <Icon className="h-5 w-5 text-primary/70 shrink-0" aria-hidden="true" />
          </div>
          <Badge variant="outline" className="w-fit">{tool.category}</Badge>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <p className="text-sm leading-snug text-muted-foreground">{tool.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <span className="w-full text-primary font-semibold flex items-center group-hover:underline">
            {translate('use_tool')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
