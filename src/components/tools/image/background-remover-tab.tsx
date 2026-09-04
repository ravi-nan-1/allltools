"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Sparkles } from "lucide-react";
import { removeBackgroundFromFile } from "@/lib/background-removal";
import { downloadBlob } from "@/lib/image-processing";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "./image-uploader";

const BackgroundRemoverTab = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (processedImage) URL.revokeObjectURL(processedImage);
    };
  }, [originalImage, processedImage]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid image",
        description: "Please choose a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Image is too large",
        description: "Please choose an image smaller than 10 MB.",
        variant: "destructive",
      });
      return;
    }

    if (originalImage) URL.revokeObjectURL(originalImage);
    if (processedImage) URL.revokeObjectURL(processedImage);

    setOriginalImage(URL.createObjectURL(file));
    setProcessedImage(null);
    setProcessedBlob(null);
    setProcessing(true);
    setProgress("Starting...");

    try {
      const blob = await removeBackgroundFromFile(file, (status) => setProgress(status));
      setProcessedImage(URL.createObjectURL(blob));
      setProcessedBlob(blob);
      toast({ title: "Success!", description: "Background removed successfully." });
    } catch (error) {
      console.error("Error removing background:", error);
      toast({
        title: "Background removal failed",
        description:
          error instanceof Error
            ? error.message
            : "The browser AI model could not process this image. Try a smaller JPG/PNG.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  const handleDownload = () => {
    if (processedBlob) {
      downloadBlob(processedBlob, "background-removed.png");
      toast({ title: "Downloaded!", description: "Image saved to your downloads folder" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Background Remover</h2>
        </div>
        <p className="text-muted-foreground">
          Remove image backgrounds with AI directly in your browser. Your image stays on your device.
        </p>
      </div>

      {!originalImage ? (
        <ImageUploader onImageUpload={handleImageUpload} />
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Original</p>
              <div className="rounded-2xl overflow-hidden border border-border bg-muted/30 aspect-video flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Processed</p>
              <div className="rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-muted/30 to-muted/10 aspect-video flex items-center justify-center relative">
                {processing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">{progress}</p>
                  </div>
                ) : processedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={processedImage} alt="Processed" className="max-w-full max-h-full object-contain" />
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                if (originalImage) URL.revokeObjectURL(originalImage);
                if (processedImage) URL.revokeObjectURL(processedImage);
                setOriginalImage(null);
                setProcessedImage(null);
                setProcessedBlob(null);
              }}
              variant="outline"
              size="lg"
              type="button"
            >
              Upload New Image
            </Button>

            {processedImage && (
              <Button onClick={handleDownload} size="lg" type="button">
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemoverTab;
