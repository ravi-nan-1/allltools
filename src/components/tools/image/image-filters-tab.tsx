"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download, Wand2, RotateCcw } from "lucide-react";
import { applyFilter, downloadBlob } from "@/lib/image-processing";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "./image-uploader";

const ImageFiltersTab = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
    resetFilters();
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setGrayscale(false);
    setSepia(false);
  };

  const handleApplyFilters = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const blob = await applyFilter(file, { brightness, contrast, saturation, blur, grayscale, sepia });
      downloadBlob(blob, `filtered-${file.name}`);
      toast({ title: "Success!", description: "Filters applied and image downloaded" });
    } catch (error) {
      console.error("Error applying filters:", error);
      toast({ title: "Error", description: "Failed to apply filters. Please try again.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Wand2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Image Filters & Adjustments</h2>
        </div>
        <p className="text-muted-foreground">Apply filters and adjust image properties</p>
      </div>

      {!preview ? (
        <ImageUploader onImageUpload={handleImageUpload} />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden border border-border bg-muted/30 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-96 mx-auto object-contain"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) ${
                  grayscale ? "grayscale(100%)" : ""
                } ${sepia ? "sepia(100%)" : ""}`,
              }}
            />
          </div>

          <div className="bg-card rounded-2xl p-6 space-y-6 border border-border">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Brightness: {brightness}%</Label>
                <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} min={0} max={200} step={5} />
              </div>
              <div className="space-y-2">
                <Label>Contrast: {contrast}%</Label>
                <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} min={0} max={200} step={5} />
              </div>
              <div className="space-y-2">
                <Label>Saturation: {saturation}%</Label>
                <Slider value={[saturation]} onValueChange={(v) => setSaturation(v[0])} min={0} max={200} step={5} />
              </div>
              <div className="space-y-2">
                <Label>Blur: {blur}px</Label>
                <Slider value={[blur]} onValueChange={(v) => setBlur(v[0])} min={0} max={10} step={1} />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button variant={grayscale ? "default" : "outline"} onClick={() => setGrayscale(!grayscale)} size="sm" type="button">
                Grayscale
              </Button>
              <Button variant={sepia ? "default" : "outline"} onClick={() => setSepia(!sepia)} size="sm" type="button">
                Sepia
              </Button>
              <Button variant="outline" onClick={resetFilters} size="sm" type="button">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => { setFile(null); setPreview(null); }} variant="outline" size="lg" type="button">
              Upload New Image
            </Button>
            <Button onClick={handleApplyFilters} disabled={processing} size="lg" type="button">
              <Download className="w-4 h-4 mr-2" />
              {processing ? "Processing..." : "Apply & Download"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageFiltersTab;
