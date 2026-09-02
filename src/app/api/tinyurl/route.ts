import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { detectMaliciousUrl } from "@/ai/flows/detect-malicious-urls";

const shortenUrlSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  alias: z
    .string()
    .min(3, { message: "Alias must be at least 3 characters." })
    .max(20, { message: "Alias must be at most 20 characters." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Alias can only contain letters, numbers, hyphens, and underscores.",
    })
    .optional()
    .or(z.literal("")),
});

function generateRandomAlias(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let alias = "";
  for (let i = 0; i < length; i++) {
    alias += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return alias;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { form: ["Invalid request body."] } }, { status: 400 });
  }

  const validated = shortenUrlSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: validated.data ?? validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const { url, alias } = validated.data;

  // Best-effort AI safety check. Never block the request if the AI call itself fails
  // (e.g. missing API key) - shortening should still work.
  try {
    const safety = await detectMaliciousUrl({
      url,
      userActivity: "User is submitting this URL to a public URL shortener.",
    });
    if (safety?.isMalicious) {
      return NextResponse.json(
        { error: { url: [`This URL was flagged as potentially unsafe: ${safety.reason}`] } },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Malicious URL check failed, continuing without it:", err);
  }

  const finalAlias = alias || generateRandomAlias();

  return NextResponse.json({
    link: {
      id: finalAlias,
      originalUrl: url,
      shortUrl: `/r/${finalAlias}`,
      createdAt: new Date().toISOString(),
      clicks: 0,
    },
  });
}
