"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  accept?: Record<string, string[]>;
}

const ImageUploader = ({
  onImageUpload,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
}: ImageUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-primary-foreground" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-1">
            {isDragActive ? "Drop your image here" : "Upload an image"}
          </p>
          <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
          <p className="text-xs text-muted-foreground mt-2">Supports PNG, JPG, JPEG, WEBP</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
