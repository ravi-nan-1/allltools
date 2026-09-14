
import Link from 'next/link';
import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tool } from '@/lib/tools';
import { useLanguage } from '@/hooks/use-language';
import { ArrowRight, Wrench } from 'lucide-react';

export type ToolWithImage = Tool;

interface ToolCardProps {
  tool: ToolWithImage;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { translate } = useLanguage();
  const Icon = (icons[tool.icon as keyof typeof icons] as LucideIcon) || Wrench;

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl group">
       <Link href={`/tools/${tool.slug}`} className="flex flex-col h-full">
            <div className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/[0.08] via-background to-muted">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border bg-background shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2">
                <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
            </div>
          <CardHeader className="p-4">
            <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base font-headline leading-snug">
                    {tool.name}
                </CardTitle>
                <Icon className="h-8 w-8 text-primary/80 shrink-0" />
            </div>
            <Badge variant="outline" className="w-fit">{tool.category}</Badge>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
            <CardDescription className="text-sm leading-snug">{tool.description}</CardDescription>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
             <div className="w-full text-primary font-semibold flex items-center group-hover:underline">
                {translate('use_tool')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </CardFooter>
       </Link>
    </Card>
  );
}
