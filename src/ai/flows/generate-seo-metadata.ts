'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating SEO metadata, JSON-LD schema, and FAQ content for tool pages.
 *
 * It exports:
 * - `generateSEOMetadata`: An async function that takes a tool description as input and returns SEO metadata, JSON-LD schema, and FAQ content.
 * - `GenerateSEOMetadataInput`: The input type for the `generateSEOMetadata` function.
 * - `GenerateSEOMetadataOutput`: The output type for the `generateSEOMetadata` function.
 */

import {ai} from '@/ai/genkit';
import {tools} from '@/lib/tools';
import {z} from 'genkit';

const GenerateSEOMetadataInputSchema = z.object({
  toolDescription: z
    .string()
    .describe('The detailed description of the tool.'),
  toolName: z.string().describe('The name of the tool.'),
  toolSlug: z.string().optional().describe('The URL slug of the tool, used to build its canonical URL.'),
});

export type GenerateSEOMetadataInput = z.infer<
  typeof GenerateSEOMetadataInputSchema
>;

const GenerateSEOMetadataOutputSchema = z.object({
  seoTitle: z.string().describe('The SEO title for the tool page.'),
  seoDescription: z.string().describe('The SEO description for the tool page.'),
  jsonLdSchema: z.string().describe('A valid JSON-LD WebApplication schema as a string.'),
  faqContent: z.string().describe('A multi-line string containing 3-5 frequently asked questions and their answers.'),
});

export type GenerateSEOMetadataOutput = z.infer<
  typeof GenerateSEOMetadataOutputSchema
>;

export async function generateSEOMetadata(
  input: GenerateSEOMetadataInput
): Promise<GenerateSEOMetadataOutput> {
  return generateSEOMetadataFlow(input);
}


const generateSEOMetadataFlow = ai.defineFlow(
  {
    name: 'generateSEOMetadataFlow',
    inputSchema: GenerateSEOMetadataInputSchema,
    outputSchema: GenerateSEOMetadataOutputSchema,
  },
  async (input) => {
    const tool = input.toolSlug ? tools.find((item) => item.slug === input.toolSlug) : undefined;
    const seoTitle = tool?.metaTitle || `${input.toolName} | All2ools`;
    const seoDescription = tool?.metaDescription || input.toolDescription.substring(0, 160);
    const faqContent = tool?.faq?.map((faq, index) => `${index + 1}. ${faq.question}\n${faq.answer}`).join('\n\n') || '';

    const categoryMap: Record<string, string> = {
      Finance: 'FinanceApplication',
      Business: 'BusinessApplication',
      Image: 'MultimediaApplication',
      SEO: 'BusinessApplication',
      Developer: 'DeveloperApplication',
      Health: 'HealthApplication',
    };

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: input.toolName,
      description: seoDescription,
      applicationCategory: tool ? categoryMap[tool.category] || 'WebApplication' : 'WebApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern web browser with JavaScript enabled.',
      ...(input.toolSlug ? { url: `https://all2ools.com/tools/${input.toolSlug}` } : {}),
      ...(tool?.keywords?.length ? { keywords: tool.keywords.join(', ') } : {}),
      ...(tool?.features?.length ? { featureList: tool.features } : {}),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };

    return {
      seoTitle,
      seoDescription,
      faqContent,
      jsonLdSchema: JSON.stringify(jsonLd, null, 2),
    };
  }
);
