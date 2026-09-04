
"use server";

import { z } from 'zod';
import { removeBackground } from "@/ai/flows/ai-product-background-remover";
import { analyzeContentGap } from "@/ai/flows/analyze-content-gap";
import { translateContent } from "@/ai/flows/translate-content";
import { generateInvoiceFromPrompt } from "@/ai/flows/generate-invoice-from-prompt";
import { generateFinancialsFromPrompt } from "@/ai/flows/generate-financials-from-prompt";
import { generateHeadshot } from '@/ai/flows/generate-headshot';
import { generateKeywordClusters } from '@/ai/flows/generate-keyword-clusters';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateRegexFromText, describeRegex } from '@/ai/flows/generate-regex-from-text';
import { generateWebhookPayload } from '@/ai/flows/webhook-tester';
import { generateArticleOutline } from '@/ai/flows/generate-article-outline';
import {
  summarizeContentAndGenerateCheatSheet,
} from '@/ai/flows/summarize-content-generate-cheatsheet';
import type { GenerateRegexInput, DescribeRegexInput } from '@/ai/flows/generate-regex-from-text';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters.'),
  features: z.string().min(10, 'Please list at least one key feature.'),
  targetAudience: z.string().min(3, 'Target audience is required.'),
  tone: z.string().min(1, 'Please select a tone.'),
});

const MAX_AI_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_CHEAT_SHEET_CHARS = 50000;

async function fileToDataUri(file: File): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Please provide a valid image file.');
  }

  if (file.size > MAX_AI_IMAGE_BYTES) {
    throw new Error('Image file is too large. Please use an image under 4MB.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function handleBackgroundRemoval(formData: FormData) {
  try {
    const imageFile = formData.get('image');
    if (!(imageFile instanceof File)) {
      return { error: 'No image file provided.' };
    }

    const productPhotoDataUri = await fileToDataUri(imageFile);
    const result = await removeBackground({ productPhotoDataUri });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during background removal.';
    console.error('Background removal action error:', error);
    if (message.includes('upstream')) {
        return { error: 'The AI service is currently unavailable. Please try again later.' };
    }
    return { error: message };
  }
}

export async function handleContentAnalysis(formData: FormData) {
  try {
    const text = formData.get('text') as string;
    if (!text) {
      throw new Error('No text provided.');
    }
    
    const competitorUrls = formData.getAll('competitorUrls') as string[];
    const validUrls = competitorUrls.filter(url => url.trim() !== '');

    if (validUrls.length === 0) {
        throw new Error('No competitor URLs provided.');
    }
    
    for (const url of validUrls) {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL format: ${url}`);
      }
    }
    
    const result = await analyzeContentGap({ text, competitorUrls: validUrls });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to analyze content.';
    return { error: message };
  }
}

export async function handleCheatSheetGeneration(
  text: string,
  targetLanguage: string
) {
  try {
    if (typeof text !== 'string' || !text.trim()) {
      return { error: 'Please provide some content to summarize.' };
    }

    if (text.length > MAX_CHEAT_SHEET_CHARS) {
      return {
        error: `Please keep the source content under ${MAX_CHEAT_SHEET_CHARS.toLocaleString()} characters.`,
      };
    }

    const language =
      typeof targetLanguage === 'string' && targetLanguage.trim()
        ? targetLanguage.trim()
        : 'English';

    const result = await summarizeContentAndGenerateCheatSheet({
      text: text.trim(),
      targetLanguage: language,
    });

    if (!result?.cheatSheetHtml?.trim()) {
      return { error: 'The AI returned an empty cheat sheet. Please try again.' };
    }

    return { data: result };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate the cheat sheet. Please try again.';
    console.error('Cheat sheet generation error:', error);
    return { error: message };
  }
}

// This is a simplified version. A real-world implementation would use distributed workers.
const regions = [
  { name: 'US East (N. Virginia)', flag: '🇺🇸', baseLatency: 50 },
  { name: 'US West (Oregon)', flag: '🇺🇸', baseLatency: 90 },
  { name: 'Europe (Ireland)', flag: '🇮🇪', baseLatency: 120 },
  { name: 'Asia Pacific (Tokyo)', flag: '🇯🇵', baseLatency: 180 },
  { name: 'South America (São Paulo)', flag: '🇧🇷', baseLatency: 220 },
  { name: 'Australia (Sydney)', flag: '🇦🇺', baseLatency: 250 },
];

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}


export async function handleLatencyCheck(formData: FormData) {
  try {
    const url = formData.get('url') as string;
    const method = formData.get('method') as string || 'GET';
    const headers = JSON.parse(formData.get('headers') as string || '{}');
    const body = ['POST', 'PUT', 'PATCH'].includes(method) ? (formData.get('body') as string) : undefined;
    
    if (!url) {
      throw new Error('No URL provided.');
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format.');
    }

    const promises = regions.map(async (region) => {
      try {
        const start = Date.now();
        const response = await fetch(url, { method, headers, body, cache: 'no-store' });
        const totalLatency = Date.now() - start;

        const size = response.headers.get('content-length');
        
        // Simulate detailed breakdown
        const baseLatency = region.baseLatency + (Math.random() * 50);
        const dns = Math.round(baseLatency * 0.1);
        const connection = Math.round(baseLatency * 0.2);
        const ttfb = Math.round(totalLatency * 0.4) + Math.round(baseLatency * 0.7);
        const finalLatency = dns + connection + ttfb + Math.round(totalLatency * 0.6);

        return { 
          region: `${region.flag} ${region.name}`, 
          latency: finalLatency,
          status: response.status,
          size: size ? formatBytes(parseInt(size, 10)) : 'N/A',
          dns,
          connection,
          ttfb
        };
      } catch (e) {
        return { 
          region: `${region.flag} ${region.name}`, 
          latency: 'Error',
          status: (e instanceof Error && 'cause' in e && (e.cause as { code?: string } | undefined)?.code) || 'FETCH_ERROR',
          size: 'N/A',
          dns: 0,
          connection: 0,
          ttfb: 0,
        };
      }
    });

    const data = await Promise.all(promises);
    return { data };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check latency.';
    return { error: message };
  }
}

export async function handleTranslation(content: string, targetLanguage: string) {
  try {
    if (!content) {
      throw new Error('No content provided for translation.');
    }
    const result = await translateContent({ content, targetLanguage });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to translate content.';
    return { error: message };
  }
}

export async function handleInvoiceGeneration(prompt: string) {
    try {
        if (!prompt) {
            throw new Error('No prompt provided for invoice generation.');
        }
        const result = await generateInvoiceFromPrompt({ prompt });
        return { data: result };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate invoice from prompt.';
        return { error: message };
    }
}

export async function handleFinancialsGeneration(prompt: string) {
    try {
        if (!prompt) {
            throw new Error('No prompt provided for financials generation.');
        }
        const result = await generateFinancialsFromPrompt({ prompt });
        return { data: result };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate financials from prompt.';
        return { error: message };
    }
}

export async function handleHeadshotGeneration(formData: FormData) {
  try {
    const imageFile = formData.get('image');
    const styleValue = formData.get('style');
    const style = typeof styleValue === 'string' ? styleValue.trim() : '';

    if (!(imageFile instanceof File)) {
      return { error: 'No image file provided.' };
    }
    if (!style) {
        return { error: 'No style selected.' };
    }

    const photoDataUri = await fileToDataUri(imageFile);
    const result = await generateHeadshot({ photoDataUri, style });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during headshot generation.';
    console.error('Headshot generation action error:', error);
    if (message.includes('upstream')) {
        return { error: 'The AI service is currently unavailable. Please try again later.' };
    }
    return { error: message };
  }
}

export async function handleKeywordClusterGeneration(formData: FormData) {
    try {
        const primaryKeyword = formData.get('primaryKeyword') as string;
        const secondaryKeywords = formData.getAll('secondaryKeywords') as string[];

        if (!primaryKeyword) {
            return { error: 'Primary keyword is required.' };
        }

        const result = await generateKeywordClusters({ 
            primaryKeyword, 
            secondaryKeywords: secondaryKeywords.filter(k => k.trim() !== '')
        });
        return { data: result };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate keyword clusters.';
        return { error: message };
    }
}

export async function handleProductDescriptionGeneration(
  input: z.infer<typeof GenerateProductDescriptionInputSchema>
) {
  try {
    const validatedInput = GenerateProductDescriptionInputSchema.parse(input);
    const result = await generateProductDescription(validatedInput);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(', ') };
    }
    const message = error instanceof Error ? error.message : 'Failed to generate product descriptions from prompt.';
    return {
      error: message,
    };
  }
}


export async function handleRegexGeneration(
  input: GenerateRegexInput
) {
  try {
    const result = await generateRegexFromText(input);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(', ') };
    }
    const message = error instanceof Error ? error.message : 'Failed to generate regex from text.';
    return {
      error: message,
    };
  }
}
    
export async function handleRegexDescription(
    input: DescribeRegexInput
) {
    try {
        const result = await describeRegex(input);
        return { data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
        return { error: error.errors.map((e) => e.message).join(', ') };
        }
        const message = error instanceof Error ? error.message : 'Failed to describe regex.';
        return {
        error: message,
        };
    }
}

export async function handleWebhookPayloadGeneration(type: 'github' | 'stripe') {
    try {
        const result = await generateWebhookPayload({ type });
        return { payload: result.payload };
    } catch (error) {
        const message = error instanceof Error ? error.message : `Failed to generate ${type} payload.`;
        return { error: message }
    }
}

const ArticleOutlineInputSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters.'),
  sourceUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  pastedText: z.string().optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
});

export async function handleArticleOutlineGeneration(
  input: z.infer<typeof ArticleOutlineInputSchema>
) {
  try {
    const validatedInput = ArticleOutlineInputSchema.parse(input);
    const result = await generateArticleOutline(validatedInput);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(', ') };
    }
    const message = error instanceof Error ? error.message : 'Failed to generate article outline.';
    return {
      error: message,
    };
  }
}
