// Client-side image processing utilities (canvas-based, no server round-trip).

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load the selected image."));
    };
    img.src = objectUrl;
  });
};

export const resizeImage = async (
  file: File,
  width: number,
  height: number,
  maintainAspectRatio: boolean
): Promise<Blob> => {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  let targetWidth = width;
  let targetHeight = height;

  if (maintainAspectRatio) {
    const aspectRatio = img.width / img.height;
    if (targetWidth / targetHeight > aspectRatio) {
      targetWidth = targetHeight * aspectRatio;
    } else {
      targetHeight = targetWidth / aspectRatio;
    }
  }

  canvas.width = Math.round(targetWidth);
  canvas.height = Math.round(targetHeight);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob"));
    }, file.type || "image/png");
  });
};

export const convertImageFormat = async (
  file: File,
  format: "image/png" | "image/jpeg" | "image/webp",
  quality = 0.95
): Promise<Blob> => {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = img.width;
  canvas.height = img.height;

  // Flatten transparency onto white when converting to JPEG (JPEG has no alpha channel).
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      format,
      quality
    );
  });
};

export const compressImage = async (file: File, quality: number): Promise<Blob> => {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // PNG has no lossy quality parameter in Canvas toBlob, so re-encode as JPEG for
  // real size reduction unless the source format is already lossy (jpeg/webp).
  const outputType = file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      outputType,
      quality / 100
    );
  });
};

export const applyFilter = async (
  file: File,
  filter: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: boolean;
    sepia?: boolean;
  }
): Promise<Blob> => {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = img.width;
  canvas.height = img.height;

  const filters: string[] = [];
  if (filter.brightness !== undefined) filters.push(`brightness(${filter.brightness}%)`);
  if (filter.contrast !== undefined) filters.push(`contrast(${filter.contrast}%)`);
  if (filter.saturation !== undefined) filters.push(`saturate(${filter.saturation}%)`);
  if (filter.blur !== undefined) filters.push(`blur(${filter.blur}px)`);
  if (filter.grayscale) filters.push("grayscale(100%)");
  if (filter.sepia) filters.push("sepia(100%)");

  ctx.filter = filters.join(" ");
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      file.type,
      1.0
    );
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
