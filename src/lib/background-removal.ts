// Client-side AI background removal using transformers.js's dedicated
// "background-removal" pipeline (BRIA RMBG-1.4). No image data is ever
// uploaded to a server — everything runs on-device.
//
// Note: the model previously wired up here (Xenova/segformer-b0-finetuned-ade-512-512)
// is a 150-class scene-parsing model (wall/floor/car/etc.), not a foreground/background
// matting model — grabbing its first result was effectively random and produced garbage
// or silently-broken output. RMBG-1.4 is purpose-built for this exact task.

import { pipeline, env } from "@huggingface/transformers";
import { loadImage } from "./image-processing";

env.allowLocalModels = false;
env.useBrowserCache = false;

const MODEL_ID = "briaai/RMBG-1.4";
const BACKGROUND_REMOVAL_TASK = "background-removal" as const;

// The model (~176MB) is cached across calls so it's only downloaded/initialized
// once per session instead of on every image.
let segmenterPromise: Promise<any> | null = null;

async function getSegmenter(onProgress?: (status: string) => void) {
  if (segmenterPromise) return segmenterPromise;

  onProgress?.("Loading AI model...");

  // WebGPU gives the best performance but isn't available in every browser yet;
  // fall back to the CPU/WASM backend so the tool still works everywhere.
  const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;

  segmenterPromise = pipeline(BACKGROUND_REMOVAL_TASK, MODEL_ID, {
    device: hasWebGPU ? "webgpu" : "wasm",
    dtype: "fp32",
  }).catch((err) => {
    console.warn("WebGPU pipeline failed, falling back to CPU:", err);
    const fallback = pipeline(BACKGROUND_REMOVAL_TASK, MODEL_ID, { device: "wasm", dtype: "fp32" });
    segmenterPromise = fallback;
    return fallback;
  });

  return segmenterPromise;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (status: string) => void
): Promise<Blob> => {
  const segmenter = await getSegmenter(onProgress);

  onProgress?.("Removing background...");
  // Returns an array of RawImage results (RGBA, already cut out, same
  // dimensions as the input) — one per input image.
  const [result] = await segmenter(imageElement.src);

  if (!result) {
    throw new Error("The AI model did not return a result.");
  }

  onProgress?.("Finalizing...");
  const canvas: HTMLCanvasElement = result.toCanvas();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
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
