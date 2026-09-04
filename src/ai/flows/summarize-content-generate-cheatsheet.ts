'use server';

/**
 * @fileOverview A flow that summarizes content and generates a cheat sheet.
 *
 * - summarizeContentAndGenerateCheatSheet - A function that handles the summarization and cheat sheet generation process.
 * - SummarizeContentAndGenerateCheatSheetInput - The input type for the summarizeContentAndGenerateCheatSheet function.
 * - SummarizeContentAndGenerateCheatSheetOutput - The return type for the summarizeContentAndGenerateCheatSheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentType = z.enum([
  'math',
  'react',
  'business',
  'medical',
  'law',
  'general',
  'programming',
  'computer science theory',
]);

const SummarizeContentAndGenerateCheatSheetInputSchema = z.object({
  text: z.string().min(1).max(50000).describe('The content to summarize and generate a cheat sheet for.'),
  targetLanguage: z.string().optional().describe('The target language for the cheat sheet output (e.g., "English", "Spanish"). Defaults to English.'),
});
export type SummarizeContentAndGenerateCheatSheetInput = z.infer<typeof SummarizeContentAndGenerateCheatSheetInputSchema>;

const SummarizeContentAndGenerateCheatSheetOutputSchema = z.object({
  contentType: ContentType.describe('The detected content type.'),
  cheatSheetHtml: z.string().describe('The generated cheat sheet HTML.'),
});
export type SummarizeContentAndGenerateCheatSheetOutput = z.infer<typeof SummarizeContentAndGenerateCheatSheetOutputSchema>;

const detectContentTypePrompt = ai.definePrompt({
  name: 'detectContentTypePrompt',
  input: {
    schema: z.object({
      text: z.string(),
    }),
  },
  output: {schema: z.object({contentType: ContentType, reason: z.string()})},
  prompt: `Analyze the text and classify which subject it belongs to. Return only JSON:\n{\n "content_type": "...",\n "reason": "..."\n}\n\nText: {{{text}}}`,
});

const generateCheatSheetPrompt = ai.definePrompt({
  name: 'generateCheatSheetPrompt',
  input: {
    schema: z.object({
      text: z.string(),
      contentType: ContentType,
      targetLanguage: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      cheatSheetHtml: z.string().describe('A valid, non-empty HTML string for the cheat sheet.'),
    }),
  },
  prompt: `You are an AI specialized in creating subject-aware cheat sheets. Your output must be a JSON object with a single key, "cheatSheetHtml". The value must be a valid, non-empty HTML string. If you cannot generate a cheat sheet from the provided text, you MUST return a JSON object with the "cheatSheetHtml" key containing a single HTML div with an error message inside.

Generate the cheat sheet in the following language: {{{targetLanguage}}}.

Input:
1. Raw text: {{{text}}}
2. Content classification: {{{contentType}}}

Task:
- Auto-apply the correct template based on the content type.
- Extract only the most important concepts.
- Keep the cheat sheet very short, visual, and easy to understand.
- Use colored sections, boxes, and clear headers.
- Highlight formulas, code, or definitions separately.
- Ensure the final output is extremely readable and formatted as JSON.`,
});

export async function summarizeContentAndGenerateCheatSheet(
  input: SummarizeContentAndGenerateCheatSheetInput
): Promise<SummarizeContentAndGenerateCheatSheetOutput> {
  return summarizeContentAndGenerateCheatSheetFlow(input);
}

const summarizeContentAndGenerateCheatSheetFlow = ai.defineFlow(
  {
    name: 'summarizeContentAndGenerateCheatSheetFlow',
    inputSchema: SummarizeContentAndGenerateCheatSheetInputSchema,
    outputSchema: SummarizeContentAndGenerateCheatSheetOutputSchema,
  },
  async input => {
    let contentType: z.infer<typeof ContentType>;
    try {
        const contentTypeResult = await detectContentTypePrompt({ text: input.text });
        if (!contentTypeResult.output) {
          throw new Error('Failed to detect content type.');
        }
        contentType = contentTypeResult.output.contentType;
    } catch (e) {
        console.error("Error in content type detection:", e);
        // Fallback to general if detection fails
        contentType = 'general';
    }


    let cheatSheetHtml = '';
    try {
      const cheatSheetResult = await generateCheatSheetPrompt({
        text: input.text,
        contentType,
        targetLanguage: input.targetLanguage || 'English',
      });

      if (!cheatSheetResult.output?.cheatSheetHtml) {
        throw new Error('The model returned an empty response for the cheat sheet.');
      }
      cheatSheetHtml = cheatSheetResult.output.cheatSheetHtml;

    } catch (e) {
      console.error("Error in cheat sheet generation:", e);
      throw new Error(
        e instanceof Error
          ? e.message
          : 'The AI model failed to generate the cheat sheet. Please try again.'
      );
    }

    return {
      contentType: contentType,
      cheatSheetHtml: cheatSheetHtml,
    };
  }
);
