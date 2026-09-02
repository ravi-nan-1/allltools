'use server';

/**
 * @fileOverview This file defines a Genkit flow for writing emails.
 *
 * writeEmail - A function that writes an email based on the input.
 * WriteEmailInput - The input type for the writeEmail function.
 * WriteEmailOutput - The return type for the writeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WriteEmailInputSchema = z.object({
  topic: z.string().describe('The topic of the email.'),
  recipient: z.string().describe('The recipient of the email.'),
  tone: z
    .enum(['Professional', 'Casual', 'Friendly', 'Formal'])
    .describe('The desired tone of the email.'),
});
export type WriteEmailInput = z.infer<typeof WriteEmailInputSchema>;

const WriteEmailOutputSchema = z.object({
  emailContent: z.string().describe('The generated email content.'),
});
export type WriteEmailOutput = z.infer<typeof WriteEmailOutputSchema>;

export async function writeEmail(input: WriteEmailInput): Promise<WriteEmailOutput> {
  return writeEmailFlow(input);
}

const writeEmailPrompt = ai.definePrompt({
  name: 'writeEmailPrompt',
  input: {schema: WriteEmailInputSchema},
  output: {schema: WriteEmailOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `Write an email based on the following details:

Topic: {{{topic}}}
Recipient: {{{recipient}}}
Tone: {{{tone}}}

Please generate the email content only.`,
});

const writeEmailFlow = ai.defineFlow(
  {
    name: 'writeEmailFlow',
    inputSchema: WriteEmailInputSchema,
    outputSchema: WriteEmailOutputSchema,
  },
  async input => {
    const {output} = await writeEmailPrompt(input);
    return output!;
  }
);
