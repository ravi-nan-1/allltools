
'use server';

/**
 * @fileOverview This file defines a Genkit flow for adjusting the tone of text.
 *
 * adjustTextTone - A function that adjusts the tone of the input text.
 * AdjustTextToneInput - The input type for the adjustTextTone function.
 * AdjustTextToneOutput - The return type for the adjustTextTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustTextToneInputSchema = z.object({
  text: z.string().describe('The input text to adjust the tone of.'),
  tone: z.string().describe('The desired tone of the rewritten text.'),
  length: z.enum(['same', 'shorter', 'longer']).describe('The desired length of the rewritten text.'),
  creativity: z.number().min(0).max(1).describe('The creativity level for rewriting the text. 0 is deterministic, 1 is very creative.'),
  removeAITone: z.boolean().optional().describe('If true, rewrite the text to sound less like it was written by an AI.'),
  creativeEnhancement: z.boolean().optional().describe('If true, enhance the text with more creative and engaging language.'),
  simplifyComplexText: z.boolean().optional().describe('If true, simplify complex sentences to make them easier to understand.'),
  professionalRewrite: z.boolean().optional().describe('If true, rewrite the text in a more professional and formal style.'),
  seoRewrite: z.boolean().optional().describe('If true, optimize the text for SEO by including relevant keywords naturally.'),
  grammarCheck: z.boolean().optional().describe('If true, perform a thorough grammar and spelling check.'),
  toneAdjustment: z.boolean().optional().describe('If true, adjust the tone based on the creativity and tone sliders.'),
  sentenceBySentence: z.boolean().optional().describe('If true, rewrite the text sentence by sentence to maintain structure.'),
});

export type AdjustTextToneInput = z.infer<typeof AdjustTextToneInputSchema>;

const AdjustTextToneOutputSchema = z.object({
  rewrittenText: z.string().describe('The rewritten text with the adjusted tone.'),
});
export type AdjustTextToneOutput = z.infer<typeof AdjustTextToneOutputSchema>;

export async function adjustTextTone(input: AdjustTextToneInput): Promise<AdjustTextToneOutput> {
  return adjustTextToneFlow(input);
}

const adjustTextTonePrompt = ai.definePrompt({
  name: 'adjustTextTonePrompt',
  input: {schema: AdjustTextToneInputSchema},
  output: {schema: AdjustTextToneOutputSchema},
  model: 'googleai/gemini-3.6-flash',
  prompt: `Rewrite the following text with a {{{tone}}} tone.

- Adjust the length to be {{{length}}} than the original.
- Use a creativity level of {{{creativity}}} (where 1 is most creative).
{{#if removeAITone}}- Actively remove any phrasing that sounds robotic or AI-generated.{{/if}}
{{#if creativeEnhancement}}- Enhance the text with more creative and engaging language.{{/if}}
{{#if simplifyComplexText}}- Simplify complex sentences.{{/if}}
{{#if professionalRewrite}}- Rewrite in a more professional and formal style.{{/if}}
{{#if seoRewrite}}- Optimize for SEO by naturally including relevant keywords.{{/if}}
{{#if grammarCheck}}- Perform a thorough grammar and spelling check.{{/if}}
{{#if sentenceBySentence}}- Rewrite the text sentence-by-sentence to maintain the original structure as much as possible.{{/if}}

Original Text:
{{{text}}}`,
});

const adjustTextToneFlow = ai.defineFlow(
  {
    name: 'adjustTextToneFlow',
    inputSchema: AdjustTextToneInputSchema,
    outputSchema: AdjustTextToneOutputSchema,
  },
  async input => {
    const {output} = await adjustTextTonePrompt(input);
    return output!;
  }
);
