"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Maximize2 } from "lucide-react";
import { resizeImage, downloadBlob, formatFileSize } from "@/lib/image-processing";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "./image-uploader";

const ImageResizerTab = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const img = new Image();
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = URL.createObjectURL(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
  };

  const handleResize = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const blob = await resizeImage(file, width, height, maintainAspectRatio);
      const filename = `resized-${width}x${height}-${file.name}`;
      downloadBlob(blob, filename);

      toast({
        title: "Success!",
        description: `Image resized to ${width}x${height}px`,
      });
    } catch (error) {
      console.error("Error resizing image:", error);
      toast({
        title: "Error",
        description: "Failed to resize image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Maximize2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Image Resizer</h2>
        </div>
        <p className="text-muted-foreground">Resize images to exact dimensions while maintaining quality</p>
      </div>

      {!preview ? (
        <ImageUploader onImageUpload={handleImageUpload} />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden border border-border bg-muted/30 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-w-full max-h-96 mx-auto object-contain" />
          </div>

          <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="aspect-ratio" className="text-sm font-medium">
                Maintain aspect ratio
              </Label>
              <Switch id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={setMaintainAspectRatio} />
            </div>

            {file && <div className="text-sm text-muted-foreground">Original size: {formatFileSize(file.size)}</div>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              variant="outline"
              size="lg"
              type="button"
            >
              Upload New Image
            </Button>

            <Button onClick={handleResize} disabled={processing} size="lg" type="button">
              <Download className="w-4 h-4 mr-2" />
              {processing ? "Resizing..." : "Resize & Download"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageResizerTab;
