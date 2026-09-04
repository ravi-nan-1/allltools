// Client-side AI background removal using transformers.js's dedicated
// "background-removal" pipeline (ORMBG-ONNX). No image data is ever
// uploaded to a server — everything runs on-device.
//
// Note: the model previously wired up here (Xenova/segformer-b0-finetuned-ade-512-512)
// is a 150-class scene-parsing model (wall/floor/car/etc.), not a foreground/background
// matting model — grabbing its first result was effectively random and produced garbage
// or silently-broken output. ORMBG-ONNX is purpose-built for this exact task.

import { pipeline, env } from "@huggingface/transformers";
import { loadImage } from "./image-processing";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "onnx-community/ormbg-ONNX";
const BACKGROUND_REMOVAL_TASK = "background-removal" as const;

// The quantized model is cached across calls so it's only downloaded/initialized
// once per session instead of on every image.
type BackgroundRemovalResult = {
  toCanvas: () => HTMLCanvasElement;
};

type BackgroundRemovalPipeline = (
  image: string
) => Promise<BackgroundRemovalResult[]>;

let segmenterPromise: Promise<BackgroundRemovalPipeline> | null = null;

async function createSegmenter(
  device: "webgpu" | "wasm"
): Promise<BackgroundRemovalPipeline> {
  const segmenter = await pipeline(BACKGROUND_REMOVAL_TASK, MODEL_ID, {
    device,
    // q8 is much lighter for WASM/CPU; fp16 is preferred when WebGPU is available.
    dtype: device === "webgpu" ? "fp16" : "q8",
  });
  return segmenter as unknown as BackgroundRemovalPipeline;
}

async function getSegmenter(onProgress?: (status: string) => void) {
  if (segmenterPromise) return segmenterPromise;

  onProgress?.("Loading AI model...");

  const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;

  segmenterPromise = createSegmenter(hasWebGPU ? "webgpu" : "wasm")
    .catch(async (err) => {
      if (hasWebGPU) {
        console.warn(
          "WebGPU background-removal pipeline failed, falling back to WASM:",
          err
        );
        return createSegmenter("wasm");
      }
      throw err;
    })
    .catch((err) => {
      segmenterPromise = null;
      throw err;
    });

  return segmenterPromise;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (status: string) => void
): Promise<Blob> => {
  const segmenter = await getSegmenter(onProgress);

  onProgress?.("Removing background...");
  // The dedicated background-removal pipeline returns an RGBA image with
  // the predicted foreground retained and the background made transparent.
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
