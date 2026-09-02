
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FunctionSquare } from "lucide-react";
import { FormulaSuggester } from "@/components/tools/excel/formula-suggester";
import { FormulaLibrary } from "@/components/tools/excel/formula-library";

export function ExcelPowerTools() {
  const [tab, setTab] = useState("suggester");
  const [preselectedSlug, setPreselectedSlug] = useState<string | null>(null);

  const handleSelectFormula = (slug: string) => {
    setPreselectedSlug(slug);
    setTab("library");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="suggester" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Formula Suggester
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FunctionSquare className="w-4 h-4" />
            Formula Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggester">
          <FormulaSuggester onSelectFormula={handleSelectFormula} />
        </TabsContent>

        <TabsContent value="library">
          <FormulaLibrary key={preselectedSlug ?? "none"} initialSlug={preselectedSlug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
