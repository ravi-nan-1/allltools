
"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Maximize2, RefreshCw, Minimize2, Wand2, Languages } from "lucide-react";
import BackgroundRemoverTab from "@/components/tools/image/background-remover-tab";
import ImageResizerTab from "@/components/tools/image/image-resizer-tab";
import ImageConverterTab from "@/components/tools/image/image-converter-tab";
import ImageCompressorTab from "@/components/tools/image/image-compressor-tab";
import ImageFiltersTab from "@/components/tools/image/image-filters-tab";
import ImageTextTranslatorTab from "@/components/tools/image/image-text-translator-tab";

export function AiProductBackgroundRemover() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-4 md:p-6">
        <Tabs defaultValue="removebg" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6 h-auto">
            <TabsTrigger value="removebg" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Remove BG</span>
            </TabsTrigger>
            <TabsTrigger value="resizer" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Resize</span>
            </TabsTrigger>
            <TabsTrigger value="converter" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Convert</span>
            </TabsTrigger>
            <TabsTrigger value="compressor" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compress</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">Translate</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="removebg">
            <BackgroundRemoverTab />
          </TabsContent>
          <TabsContent value="resizer">
            <ImageResizerTab />
          </TabsContent>
          <TabsContent value="converter">
            <ImageConverterTab />
          </TabsContent>
          <TabsContent value="compressor">
            <ImageCompressorTab />
          </TabsContent>
          <TabsContent value="filters">
            <ImageFiltersTab />
          </TabsContent>
          <TabsContent value="ocr">
            <ImageTextTranslatorTab />
          </TabsContent>
        </Tabs>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Background removal, resizing, conversion, compression, and filters run entirely in your
        browser. Translate uses an in-browser text-recognition model plus a translation API.
      </p>
    </div>
  );
}
