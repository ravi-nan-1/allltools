
'use server';

/**
 * @fileOverview An AI agent that simplifies complex text into an easily digestible format.
 *
 * - simplifyComplexText - A function that handles the simplification process.
 * - SimplifyComplexTextInput - The input type for the simplifyComplexText function.
 * - SimplifyComplexTextOutput - The return type for the simplifyComplexText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyComplexTextInputSchema = z.object({
  text: z.string().describe('The complex text to simplify.'),
  length: z.enum(['same', 'shorter', 'longer']).describe('The desired length of the rewritten text.'),
  creativity: z.number().min(0).max(1).describe('The creativity level for rewriting the text. 0 is deterministic, 1 is very creative.'),
});
export type SimplifyComplexTextInput = z.infer<
  typeof SimplifyComplexTextInputSchema
>;

const SimplifyComplexTextOutputSchema = z.object({
  simplifiedText: z.string().describe('The simplified version of the input text.'),
});
export type SimplifyComplexTextOutput = z.infer<
  typeof SimplifyComplexTextOutputSchema
>;

export async function simplifyComplexText(
  input: SimplifyComplexTextInput
): Promise<SimplifyComplexTextOutput> {
  return simplifyComplexTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyComplexTextPrompt',
  input: {schema: SimplifyComplexTextInputSchema},
  output: {schema: SimplifyComplexTextOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert in simplifying complex text. Your goal is to take the input text and rewrite it in a way that is easier to understand, while maintaining the original meaning.

- Adjust the length to be {{{length}}} than the original.
- Use a creativity level of {{{creativity}}} (where 1 is most creative).

Original Text:
{{{text}}}

Simplified Text:`,
});

const simplifyComplexTextFlow = ai.defineFlow(
  {
    name: 'simplifyComplexTextFlow',
    inputSchema: SimplifyComplexTextInputSchema,
    outputSchema: SimplifyComplexTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
