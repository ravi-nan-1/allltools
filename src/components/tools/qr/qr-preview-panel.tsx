"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import type { QRConfig } from "./types";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QRPreviewPanelProps {
  config: QRConfig;
}

export const QRPreviewPanel = ({ config }: QRPreviewPanelProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const { toast } = useToast();

  const downloadQR = async (format: "png" | "jpg" | "svg" | "pdf") => {
    try {
      if (format === "png" || format === "jpg") {
        const canvas = qrRef.current?.querySelector("canvas");
        if (!canvas) {
          toast({ variant: "destructive", title: "QR code not found" });
          return;
        }
        const mime = format === "jpg" ? "image/jpeg" : "image/png";
        const dataUrl = canvas.toDataURL(mime, 1.0);
        const link = document.createElement("a");
        link.download = `qrcode.${format}`;
        link.href = dataUrl;
        link.click();
        toast({ title: `Downloaded as ${format.toUpperCase()}` });
      } else if (format === "svg") {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg) {
          toast({ variant: "destructive", title: "QR code not found" });
          return;
        }
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "qrcode.svg";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "Downloaded as SVG" });
      } else if (format === "pdf") {
        const canvas = qrRef.current?.querySelector("canvas");
        if (!canvas) {
          toast({ variant: "destructive", title: "QR code not found" });
          return;
        }
        const { jsPDF } = await import("jspdf");
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: [config.size + 80, config.size + 80],
        });
        pdf.addImage(dataUrl, "PNG", 40, 40, config.size, config.size);
        pdf.save("qrcode.pdf");
        toast({ title: "Downloaded as PDF" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to download" });
      console.error(error);
    }
  };

  const imageSettings = config.logo
    ? {
        src: config.logo,
        height: (config.size * config.logoSize) / 100,
        width: (config.size * config.logoSize) / 100,
        excavate: true,
      }
    : undefined;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              disabled={zoom <= 50}
              type="button"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              disabled={zoom >= 150}
              type="button"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          className="flex items-center justify-center min-h-[400px] bg-muted/20 rounded-lg border-2 border-dashed border-border p-8 overflow-auto"
          role="img"
          aria-label="QR code preview"
        >
          <div
            ref={qrRef}
            style={{
              transform: `scale(${zoom / 100})`,
              transition: "transform 0.3s ease",
            }}
          >
            {/* Hidden canvas used for PNG/JPG/PDF export */}
            <div className="hidden">
              <QRCodeCanvas
                value={config.content || "https://example.com"}
                size={config.size}
                bgColor={config.bgColor}
                fgColor={config.fgColor}
                level={config.errorCorrection}
                marginSize={config.margin}
                imageSettings={imageSettings}
              />
            </div>
            {/* Visible, crisp SVG preview (also used for SVG export) */}
            <QRCodeSVG
              value={config.content || "https://example.com"}
              size={Math.min(config.size, 320)}
              bgColor={config.bgColor}
              fgColor={config.fgColor}
              level={config.errorCorrection}
              marginSize={config.margin}
              imageSettings={imageSettings}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Export Options</p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => downloadQR("png")} className="w-full" type="button">
              <Download className="w-4 h-4 mr-2" />
              PNG
            </Button>
            <Button onClick={() => downloadQR("jpg")} variant="outline" type="button">
              <Download className="w-4 h-4 mr-2" />
              JPG
            </Button>
            <Button onClick={() => downloadQR("svg")} variant="outline" type="button">
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
            <Button onClick={() => downloadQR("pdf")} variant="outline" type="button">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            ✨ Your QR code updates in real-time as you customize it. Free download in multiple formats!
          </p>
        </div>
      </div>
    </Card>
  );
};
