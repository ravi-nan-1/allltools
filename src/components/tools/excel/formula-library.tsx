"use client";

import { useMemo, useState } from "react";
import { formulas, type Formula } from "@/lib/excel-formulas";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Copy, Check, FunctionSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import ExcelSimulator from "./excel-simulator";

type GroupedFormulas = {
  [category: string]: {
    [subcategory: string]: Formula[];
  };
};

function FormulaDetail({ formula }: { formula: Formula }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formula.syntax);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-xl">Step-by-Step Tutorial</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="space-y-2">
            {formula.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-xl">Syntax</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} type="button">
                  {isCopied ? <Check className="text-primary" /> : <Copy />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? "Copied!" : "Copy to clipboard"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <code className="bg-muted text-muted-foreground p-4 rounded-md block font-mono text-sm w-full overflow-x-auto">
            {formula.syntax}
          </code>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>Watch the formula in action.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExcelSimulator simulationKey={formula.simulationKey} />
        </CardContent>
      </Card>
    </div>
  );
}

export function FormulaLibrary({ initialSlug }: { initialSlug?: string | null }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug ?? null);

  const groupedFormulas = useMemo(() => {
    return formulas.reduce<GroupedFormulas>((acc, formula) => {
      const { category, subcategory } = formula;
      if (!acc[category]) acc[category] = {};
      if (!acc[category][subcategory]) acc[category][subcategory] = [];
      acc[category][subcategory].push(formula);
      return acc;
    }, {});
  }, []);

  const selectedFormula = formulas.find((f) => f.slug === selectedSlug) ?? null;
  const defaultCategory = selectedFormula?.category ?? Object.keys(groupedFormulas)[0];

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      <Card className="p-4 h-fit md:sticky md:top-4">
        <h2 className="text-lg font-semibold mb-4 px-2">Formula Explorer</h2>
        <Accordion type="single" collapsible defaultValue={defaultCategory} className="max-h-[600px] overflow-y-auto">
          {Object.entries(groupedFormulas).map(([category, subcategories]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-base font-medium">{category}</AccordionTrigger>
              <AccordionContent>
                {Object.entries(subcategories).map(([subcategory, formulaList]) => (
                  <div key={subcategory} className="pl-2">
                    <h4 className="font-semibold text-sm text-muted-foreground my-2">{subcategory}</h4>
                    <ul className="space-y-1">
                      {formulaList.map((formula) => (
                        <li key={formula.slug}>
                          <button
                            type="button"
                            onClick={() => setSelectedSlug(formula.slug)}
                            className={cn(
                              "block w-full text-left p-2 rounded-md text-sm transition-colors",
                              selectedSlug === formula.slug
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-accent/50 text-foreground/80"
                            )}
                          >
                            {formula.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <div className="min-w-0">
        {selectedFormula ? (
          <FormulaDetail formula={selectedFormula} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <FunctionSquare className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="mt-4 text-2xl">Welcome to the Formula Library</CardTitle>
              <CardDescription>
                Select a formula from the list to view its details, see a step-by-step tutorial, and watch an
                interactive animation.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
