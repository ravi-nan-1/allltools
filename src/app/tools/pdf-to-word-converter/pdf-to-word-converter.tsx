
"use client";

import { useState } from "react";
import { FileConverter, type ConversionType } from "@/components/tools/pdf-to-word/file-converter";
import { FeatureGrid } from "@/components/tools/pdf-to-word/feature-grid";
import { TrustAndSecurity } from "@/components/tools/pdf-to-word/trust-and-security";

export function PdfToWordConverter() {
  const [conversionType, setConversionType] = useState<ConversionType>("pdf-to-word");

  return (
    <div className="flex flex-col items-center w-full gap-10">
      <div className="w-full max-w-2xl mx-auto">
        <FileConverter conversionType={conversionType} setConversionType={setConversionType} />
      </div>
      <div className="w-full">
        <FeatureGrid setConversionType={setConversionType} />
      </div>
      <div className="w-full">
        <TrustAndSecurity />
      </div>
    </div>
  );
}
