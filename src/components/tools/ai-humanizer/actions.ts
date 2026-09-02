'use server';

import { humanizeText } from '@/ai/flows/humanize-text';
import { simplifyComplexText } from '@/ai/flows/simplify-complex-text';
import { adjustTextTone } from '@/ai/flows/adjust-text-tone';
import { writeEmail } from '@/ai/flows/write-email';
import { z } from 'zod';
import { translateText } from '@/ai/flows/translate-text';

const HumanizeTextInputSchema = z.object({
  text: z.string(),
  style: z.enum([
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
  ]),
  creativity: z.number().min(0).max(1),
  tone: z.number().min(0).max(1),
  length: z.enum(['same', 'shorter', 'longer']),
  sentenceBySentence: z.boolean(),
  grammarCheck: z.boolean(),
  toneAdjustment: z.boolean(),
  removeAITone: z.boolean(),
  creativeEnhancement: z.boolean(),
  simplifyComplexText: z.boolean(),
  professionalRewrite: z.boolean(),
  seoRewrite: z.boolean(),
  paraphrasedVersions: z.boolean(),
  multipleVariations: z.boolean(),
});

type HumanizeAllInput = z.infer<typeof HumanizeTextInputSchema>;

async function safeTranslate(text: string | null | undefined, language: string): Promise<string> {
  if (!text || !text.trim() || language === 'en') {
    return text || '';
  }
  try {
    const result = await translateText({ text, language });
    return result.translatedText;
  } catch (e) {
    console.error(`Translation failed for text:`, e);
    return text;
  }
}

export async function humanizeAll(input: HumanizeAllInput) {
  try {
    const validatedInput = HumanizeTextInputSchema.parse(input);

    const [humanizeResult, simplifyResult, professionalResult] = await Promise.allSettled([
      humanizeText(validatedInput),
      simplifyComplexText({ text: validatedInput.text, length: validatedInput.length, creativity: validatedInput.creativity }),
      adjustTextTone({ ...validatedInput, tone: 'Professional' }),
    ]);

    let humanized = validatedInput.text;
    if (humanizeResult.status === 'fulfilled' && humanizeResult.value?.humanizedVersion) {
      humanized = humanizeResult.value.humanizedVersion;
    } else {
      const reason = humanizeResult.status === 'rejected' ? humanizeResult.reason : 'Unknown error';
      console.error('Humanize text failed:', reason);
      return {
        error: `Humanization failed: ${reason}`,
        humanized: input.text,
        simplified: input.text,
        professional: input.text,
      };
    }

    let simplified = humanized;
    if (simplifyResult.status === 'fulfilled' && simplifyResult.value?.simplifiedText) {
      simplified = simplifyResult.value.simplifiedText;
    } else {
      console.error('Simplify text failed, using fallback:', simplifyResult.status === 'rejected' ? simplifyResult.reason : 'No text');
    }

    let professional = humanized;
    if (professionalResult.status === 'fulfilled' && professionalResult.value?.rewrittenText) {
      professional = professionalResult.value.rewrittenText;
    } else {
      console.error(
        'Professional tone adjustment failed, using fallback:',
        professionalResult.status === 'rejected' ? professionalResult.reason : 'No text'
      );
    }

    return {
      humanized,
      simplified,
      professional,
      error: null,
    };
  } catch (e) {
    console.error('Error in humanizeAll:', e);
    const errorMessage =
      e instanceof z.ZodError ? 'Invalid input provided. Please check the form and try again.' : 'An unexpected error occurred while processing your request. Please try again later.';
    return {
      error: errorMessage,
      humanized: input.text,
      simplified: input.text,
      professional: input.text,
    };
  }
}

const WriteEmailInputSchema = z.object({
  topic: z.string().min(1, 'Topic is required.'),
  recipient: z.string().min(1, 'Recipient is required.'),
  tone: z.enum(['Professional', 'Casual', 'Friendly', 'Formal']),
});

type WriteEmailActionInput = z.infer<typeof WriteEmailInputSchema>;

export async function writeEmailAction(input: WriteEmailActionInput) {
  try {
    const validatedInput = WriteEmailInputSchema.parse(input);
    const result = await writeEmail(validatedInput);

    const emailContent = result?.emailContent;

    return {
      emailContent: emailContent || '',
      error: null,
    };
  } catch (e) {
    console.error('Error in writeEmailAction:', e);
    if (e instanceof z.ZodError) {
      return { error: 'Invalid input provided. Please check the form and try again.', emailContent: null };
    }
    return {
      error: 'An unexpected error occurred while processing your request. Please try again later.',
      emailContent: null,
    };
  }
}

const TranslateOutputSchema = z.object({
  text: z.string(),
  language: z.string(),
});

type TranslateOutputInput = z.infer<typeof TranslateOutputSchema>;

export async function translateOutput(input: TranslateOutputInput) {
  try {
    const validatedInput = TranslateOutputSchema.parse(input);
    const translatedText = await safeTranslate(validatedInput.text, validatedInput.language);
    return { translatedText, error: null };
  } catch (e) {
    console.error('Error in translateOutput:', e);
    const errorMessage = e instanceof z.ZodError ? 'Invalid input for translation.' : 'An unexpected error occurred during translation.';
    return { translatedText: input.text, error: errorMessage };
  }
}
