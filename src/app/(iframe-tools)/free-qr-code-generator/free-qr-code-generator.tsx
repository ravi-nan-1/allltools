
"use client";

import { useState } from "react";
import { QROptionsPanel } from "@/components/tools/qr/qr-options-panel";
import { QRPreviewPanel } from "@/components/tools/qr/qr-preview-panel";
import type { QRConfig } from "@/components/tools/qr/types";

export function FreeQrCodeGenerator() {
  const [qrConfig, setQRConfig] = useState<QRConfig>({
    type: "url",
    content: "https://example.com",
    fgColor: "#000000",
    bgColor: "#ffffff",
    size: 512,
    errorCorrection: "M",
    logo: null,
    logoSize: 20,
    margin: 4,
  });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        <QROptionsPanel config={qrConfig} setConfig={setQRConfig} />
        <QRPreviewPanel config={qrConfig} />
      </div>
    </div>
  );
}
