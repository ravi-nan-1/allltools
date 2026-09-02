// Client-side AI background removal using an in-browser segmentation model
// (Hugging Face Transformers.js). No image data is ever uploaded to a server.

import { pipeline, env } from "@huggingface/transformers";
import { loadImage } from "./image-processing";

env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (status: string) => void
): Promise<Blob> => {
  onProgress?.("Loading AI model...");

  // WebGPU gives the best performance but isn't available in every browser yet;
  // fall back to the CPU/WASM backend so the tool still works everywhere.
  let segmenter;
  try {
    segmenter = await pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512", {
      device: "webgpu",
    });
  } catch (err) {
    console.warn("WebGPU unavailable, falling back to CPU:", err);
    segmenter = await pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512");
  }

  onProgress?.("Processing image...");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  resizeImageIfNeeded(canvas, ctx, imageElement);
  const imageData = canvas.toDataURL("image/jpeg", 0.8);

  onProgress?.("Removing background...");
  const result = await segmenter(imageData);

  if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
    throw new Error("Invalid segmentation result");
  }

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) throw new Error("Could not get output canvas context");

  outputCtx.drawImage(canvas, 0, 0);
  const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  const data = outputImageData.data;

  for (let i = 0; i < result[0].mask.data.length; i++) {
    const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
    data[i * 4 + 3] = alpha;
  }

  outputCtx.putImageData(outputImageData, 0, 0);
  onProgress?.("Finalizing...");

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.("Complete!");
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/png",
      1.0
    );
  });
};

export const removeBackgroundFromFile = async (file: File, onProgress?: (status: string) => void): Promise<Blob> => {
  const img = await loadImage(file);
  return removeBackground(img, onProgress);
};
