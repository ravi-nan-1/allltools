'use server';
/**
 * @fileOverview An AI-powered tool to remove backgrounds from product images.
 *
 * - removeBackground - A function that removes the background from a product image.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  productPhotoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  backgroundRemovedPhotoDataUri: z
    .string()
    .describe('The background-removed product photo, as a data URI.'),
});
export type RemoveBackgroundOutput = z.infer<
  typeof RemoveBackgroundOutputSchema
>;

export async function removeBackground(
  input: RemoveBackgroundInput
): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {media: {url: input.productPhotoDataUri}},
        {
          text:
            'Edit this product photo by precisely removing the entire background while preserving the product itself, including its shape, edges, colors, texture, text, logos, and fine details. Do not redesign, crop, or change the product. The final image must contain only the isolated product on a transparent background.',
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('AI model did not return an image.');
    }
    
    return {backgroundRemovedPhotoDataUri: media.url};
  }
);
