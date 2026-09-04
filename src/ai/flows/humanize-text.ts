
'use server';

/**
 * @fileOverview A text rewriting AI agent that humanizes text to avoid AI detection.
 *
 * - humanizeText - A function that handles the text humanization process.
 * - HumanizeTextInput - The input type for the humanizeText function.
 * - HumanizeTextOutput - The return type for the humanizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HumanizeTextInputSchema = z.object({
  text: z.string().describe('The text to humanize.'),
  style: z
    .enum([
      'Human Casual',
      'Professional',
      'Academic',
      'Creative',
      'Story-like',
      'Ultra Humanized',
      'SEO-friendly',
      'Simple English',
      'Kid-friendly',
      'Expert tone',
    ])
    .default('Ultra Humanized')
    .describe('The writing style to use for humanizing the text.'),
  length: z.enum(['same', 'shorter', 'longer']).describe('The desired length of the rewritten text.'),
  creativity: z.number().min(0).max(1).describe('The creativity level for rewriting the text. 0 is deterministic, 1 is very creative.'),
  tone: z.number().min(0).max(1).describe('The tone of the rewritten text. 0 is very formal, 1 is very casual.'),
  removeAITone: z.boolean().optional().describe('If true, rewrite the text to sound less like it was written by an AI.'),
  creativeEnhancement: z.boolean().optional().describe('If true, enhance the text with more creative and engaging language.'),
  simplifyComplexText: z.boolean().optional().describe('If true, simplify complex sentences to make them easier to understand.'),
  professionalRewrite: z.boolean().optional().describe('If true, rewrite the text in a more professional and formal style.'),
  seoRewrite: z.boolean().optional().describe('If true, optimize the text for SEO by including relevant keywords naturally.'),
  grammarCheck: z.boolean().optional().describe('If true, perform a thorough grammar and spelling check.'),
  toneAdjustment: z.boolean().optional().describe('If true, adjust the tone based on the creativity and tone sliders.'),
  sentenceBySentence: z.boolean().optional().describe('If true, rewrite the text sentence by sentence to maintain structure.'),
});
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

const HumanizeTextOutputSchema = z.object({
  humanizedVersion: z.string().describe('The humanized version of the input text.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;

const humanizeTextPrompt = ai.definePrompt({
  name: 'humanizeTextPrompt',
  input: {schema: HumanizeTextInputSchema},
  output: {schema: HumanizeTextOutputSchema},
  model: 'googleai/gemini-3.6-flash',
  prompt: `Rewrite the following text with a {{{style}}} tone. Your goal is to make it sound completely human-written.

- Adjust the length to be {{{length}}} than the original.
- Use a creativity level of {{{creativity}}} (where 1 is most creative).
- Use a tone level of {{{tone}}} (where 1 is most casual).
{{#if removeAITone}}- Actively remove any phrasing that sounds robotic or AI-generated. Focus on natural language.{{/if}}
{{#if creativeEnhancement}}- Enhance the text with more creative, vivid, and engaging language.{{/if}}
{{#if simplifyComplexText}}- Simplify complex sentences and vocabulary to make the text more accessible.{{/if}}
{{#if professionalRewrite}}- Rewrite in a more professional and formal style, suitable for business communication.{{/if}}
{{#if seoRewrite}}- Optimize for SEO by naturally including relevant keywords.{{/if}}
{{#if grammarCheck}}- Perform a thorough grammar and spelling check, but allow for natural-sounding phrasing.{{/if}}
{{#if sentenceBySentence}}- Rewrite the text sentence-by-sentence to maintain the original structure as much as possible.{{/if}}

Original Text:
{{{text}}}`,
});

const humanizeTextFlow = ai.defineFlow(
  {
    name: 'humanizeTextFlow',
    inputSchema: HumanizeTextInputSchema,
    outputSchema: HumanizeTextOutputSchema,
  },
  async input => {
    const {output} = await humanizeTextPrompt(input);
    return output!;
  }
);

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
  return humanizeTextFlow(input);
}
