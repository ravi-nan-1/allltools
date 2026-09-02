"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { compareTwoTexts } from "@/ai/flows/compare-two-texts";
import { ResultsDisplay, type AnalysisResult } from "@/components/tools/plagiarism/results-display";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  text1: z.string().min(50, {
    message: "Text must be at least 50 characters.",
  }),
  text2: z.string().min(50, {
    message: "Text must be at least 50 characters.",
  }),
});

export function PlagiarismChecker() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text1: "",
      text2: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await compareTwoTexts(values);
      setResult(analysisResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with the analysis. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Compare Two Texts</CardTitle>
          <CardDescription>
            Paste a source text and a comparison text below. We'll compute a similarity score
            and use AI to surface matched or paraphrased phrases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="text1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the source text here..."
                          className="min-h-[200px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="text2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comparison Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the text to compare here..."
                          className="min-h-[200px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Analyzing..." : "Check for Plagiarism"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && <ResultsDisplay result={result} />}

      <p className="text-xs text-muted-foreground text-center">
        This tool compares the two texts you provide using a cosine-similarity algorithm plus
        AI-identified matched phrasing. It does not crawl the live web or external databases.
      </p>
    </div>
  );
}
