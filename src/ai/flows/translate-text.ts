
'use server';

/**
 * @fileOverview This file defines a Genkit flow for translating text.
 *
 * translateText - A function that translates the input text to a specified language.
 * TranslateTextInput - The input type for the translateText function.
 * TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The input text to translate.'),
  language: z.string().describe('The target language for translation (e.g., "Spanish", "French", "de", "zh").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translateTextPrompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  model: 'googleai/gemini-3.6-flash',
  prompt: `Translate the following text to {{{language}}}:

{{{text}}}`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    if (!input.text.trim()) {
        return { translatedText: '' };
    }
    const {output} = await translateTextPrompt(input);
    return output!;
  }
);
