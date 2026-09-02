"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { humanizeAll, writeEmailAction, translateOutput } from "./actions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Download,
  Sparkles,
  Book,
  Briefcase,
  BrainCircuit,
  Globe,
  Repeat,
  CopyPlus,
  SpellCheck,
  Smile,
  Split,
  Bot,
  Mail,
  Languages,
} from "lucide-react";

const humanizerFormSchema = z.object({
  text: z.string().min(20, { message: "Please enter at least 20 characters to humanize." }),
  style: z
    .enum([
      "Human Casual",
      "Professional",
      "Academic",
      "Creative",
      "Story-like",
      "Ultra Humanized",
      "SEO-friendly",
      "Simple English",
      "Kid-friendly",
      "Expert tone",
    ])
    .default("Ultra Humanized"),
  creativity: z.number().min(0).max(1).default(0.7),
  tone: z.number().min(0).max(1).default(0.5),
  length: z.enum(["same", "shorter", "longer"]).default("same"),
  sentenceBySentence: z.boolean().default(false),
  grammarCheck: z.boolean().default(false),
  toneAdjustment: z.boolean().default(false),
  removeAITone: z.boolean().default(true),
  creativeEnhancement: z.boolean().default(false),
  simplifyComplexText: z.boolean().default(false),
  professionalRewrite: z.boolean().default(false),
  seoRewrite: z.boolean().default(false),
  paraphrasedVersions: z.boolean().default(false),
  multipleVariations: z.boolean().default(false),
});

const emailFormSchema = z.object({
  topic: z.string().min(1, { message: "Topic is required." }),
  recipient: z.string().min(1, { message: "Recipient is required." }),
  tone: z.enum(["Professional", "Casual", "Friendly", "Formal"]).default("Professional"),
});

type HumanizerFormValues = z.infer<typeof humanizerFormSchema>;
type EmailFormValues = z.infer<typeof emailFormSchema>;

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Mandarin" },
  { value: "hi", label: "Hindi" },
];

const styleOptions = [
  "Human Casual",
  "Professional",
  "Academic",
  "Creative",
  "Story-like",
  "Ultra Humanized",
  "SEO-friendly",
  "Simple English",
  "Kid-friendly",
  "Expert tone",
] as const;

const emailToneOptions = ["Professional", "Casual", "Friendly", "Formal"] as const;

const extraFeatures = [
  { id: "removeAITone", label: "Remove AI Tone", icon: BrainCircuit },
  { id: "creativeEnhancement", label: "Creative Enhancement", icon: Sparkles },
  { id: "simplifyComplexText", label: "Simplify Complex Text", icon: Book },
  { id: "professionalRewrite", label: "Professional Rewrite", icon: Briefcase },
  { id: "seoRewrite", label: "SEO Rewrite", icon: Globe },
  { id: "grammarCheck", label: "Grammar Check", icon: SpellCheck },
  { id: "toneAdjustment", label: "Tone Adjustment", icon: Smile },
  { id: "sentenceBySentence", label: "Sentence by Sentence", icon: Split },
  { id: "paraphrasedVersions", label: "Paraphrased Versions", icon: Repeat },
  { id: "multipleVariations", label: "Multiple Variations", icon: CopyPlus },
] as const;

export function HumanizerForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [originalOutputs, setOriginalOutputs] = useState({ humanized: "", simplified: "", professional: "", email: "" });
  const [displayOutputs, setDisplayOutputs] = useState({ humanized: "", simplified: "", professional: "", email: "" });

  const [activeInputTab, setActiveInputTab] = useState("humanizer");
  const [activeOutputTab, setActiveOutputTab] = useState("humanized");
  const [outputLanguage, setOutputLanguage] = useState("en");

  const humanizerForm = useForm<HumanizerFormValues>({
    resolver: zodResolver(humanizerFormSchema),
    defaultValues: {
      text: "The rapid development of artificial intelligence has significantly transformed the way people create, share, and analyze information. Many individuals rely on AI tools to generate content quickly, but this often leads to writing that sounds repetitive, overly structured, or unnatural. As a result, users may face challenges when their content is reviewed by AI detection systems, academic platforms, or strict quality checks. To ensure authenticity, it is essential to rewrite AI-generated text into language that feels more human, expressive, and natural without losing its original meaning.",
      style: "Ultra Humanized",
      creativity: 0.7,
      tone: 0.5,
      length: "same",
      sentenceBySentence: false,
      grammarCheck: false,
      toneAdjustment: false,
      removeAITone: true,
      creativeEnhancement: false,
      simplifyComplexText: false,
      professionalRewrite: false,
      seoRewrite: false,
      paraphrasedVersions: false,
      multipleVariations: false,
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { topic: "", recipient: "", tone: "Professional" },
  });

  const handleOutputLanguageChange = (newLang: string) => {
    setOutputLanguage(newLang);
    startTransition(async () => {
      const outputsToTranslate = { ...originalOutputs };
      const translated = { ...displayOutputs };

      const translateIfNeeded = async (text: string) => {
        if (!text) return text;
        const result = await translateOutput({ text, language: newLang });
        if (result.error) {
          toast({ variant: "destructive", title: "Translation failed", description: result.error });
          return text;
        }
        return result.translatedText;
      };

      if (activeInputTab === "humanizer") {
        const [humanized, simplified, professional] = await Promise.all([
          translateIfNeeded(outputsToTranslate.humanized),
          translateIfNeeded(outputsToTranslate.simplified),
          translateIfNeeded(outputsToTranslate.professional),
        ]);
        translated.humanized = humanized;
        translated.simplified = simplified;
        translated.professional = professional;
      } else {
        translated.email = await translateIfNeeded(outputsToTranslate.email);
      }
      setDisplayOutputs(translated);
    });
  };

  const onHumanizerSubmit = (values: HumanizerFormValues) => {
    startTransition(async () => {
      const resetState = { humanized: "", simplified: "", professional: "", email: "" };
      setOriginalOutputs(resetState);
      setDisplayOutputs(resetState);
      setActiveOutputTab("humanized");
      const result = await humanizeAll(values);

      if (result.error) {
        toast({ variant: "destructive", title: "Humanization failed", description: result.error });
        const errorState = { humanized: values.text, simplified: values.text, professional: values.text, email: "" };
        setOriginalOutputs(errorState);
        setDisplayOutputs(errorState);
      } else {
        const newOutputs = { humanized: result.humanized!, simplified: result.simplified!, professional: result.professional!, email: "" };
        setOriginalOutputs(newOutputs);

        if (outputLanguage !== "en") {
          const translated = { ...newOutputs };
          const translateIfNeeded = async (text: string) => {
            if (!text) return text;
            const transResult = await translateOutput({ text, language: outputLanguage });
            return transResult.translatedText;
          };
          translated.humanized = await translateIfNeeded(newOutputs.humanized);
          translated.simplified = await translateIfNeeded(newOutputs.simplified);
          translated.professional = await translateIfNeeded(newOutputs.professional);
          setDisplayOutputs(translated);
        } else {
          setDisplayOutputs(newOutputs);
        }
      }
    });
  };

  const onEmailSubmit = (values: EmailFormValues) => {
    startTransition(async () => {
      setOriginalOutputs((prev) => ({ ...prev, email: "" }));
      setDisplayOutputs((prev) => ({ ...prev, email: "" }));

      const result = await writeEmailAction(values);

      if (result.error) {
        toast({ variant: "destructive", title: "An error occurred", description: result.error });
      } else {
        const emailContent = result.emailContent || "";
        setOriginalOutputs((prev) => ({ ...prev, email: emailContent }));

        if (outputLanguage !== "en" && emailContent) {
          const transResult = await translateOutput({ text: emailContent, language: outputLanguage });
          setDisplayOutputs((prev) => ({ ...prev, email: transResult.translatedText || "" }));
        } else {
          setDisplayOutputs((prev) => ({ ...prev, email: emailContent }));
        }
      }
    });
  };

  const activeContent =
    activeInputTab === "email" ? displayOutputs.email : displayOutputs[activeOutputTab as keyof Omit<typeof displayOutputs, "email">];

  const handleCopy = () => {
    if (!activeContent) return;
    navigator.clipboard.writeText(activeContent);
    toast({ title: "Copied to clipboard!" });
  };

  const handleDownload = () => {
    if (!activeContent) return;
    const blob = new Blob([activeContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeOutputTab}_output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="flex flex-col">
        <Tabs defaultValue="humanizer" onValueChange={setActiveInputTab} className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="humanizer">Humanizer</TabsTrigger>
              <TabsTrigger value="email">Write Email</TabsTrigger>
            </TabsList>
          </CardHeader>
          <TabsContent value="humanizer">
            <Form {...humanizerForm}>
              <form onSubmit={humanizerForm.handleSubmit(onHumanizerSubmit)}>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <FormField
                    control={humanizerForm.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col">
                        <FormLabel className="text-lg font-semibold">AI Text Humanizer</FormLabel>
                        <FormDescription className="mb-2">
                          Paste your AI-generated text below to rewrite it and make it sound human.
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Use this AI paraphraser to rewrite text like a human, convert AI text to human, and bypass AI detection..."
                            className="flex-1 resize-none min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={humanizerForm.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {styleOptions.map((style) => (
                                <SelectItem key={style} value={style}>
                                  {style}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={humanizerForm.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Length</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="shorter" />
                                </FormControl>
                                <FormLabel className="font-normal">Shorter</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="same" />
                                </FormControl>
                                <FormLabel className="font-normal">Same</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="longer" />
                                </FormControl>
                                <FormLabel className="font-normal">Longer</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={humanizerForm.control}
                      name="creativity"
                      render={({ field: { value, onChange } }) => (
                        <FormItem>
                          <FormLabel>Creativity: {value}</FormLabel>
                          <FormControl>
                            <Slider value={[value]} onValueChange={(vals) => onChange(vals[0])} max={1} step={0.1} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={humanizerForm.control}
                      name="tone"
                      render={({ field: { value, onChange } }) => (
                        <FormItem>
                          <FormLabel>Tone: {value}</FormLabel>
                          <FormControl>
                            <Slider value={[value]} onValueChange={(vals) => onChange(vals[0])} max={1} step={0.1} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="extra-features">
                      <AccordionTrigger className="text-sm font-medium">Extra Features</AccordionTrigger>
                      <AccordionContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                        {extraFeatures.map((feature) => (
                          <FormField
                            key={feature.id}
                            control={humanizerForm.control}
                            name={feature.id}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="flex items-center gap-2">
                                    <feature.icon className="h-4 w-4" />
                                    {feature.label}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Humanizing..." : "Humanize Text"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="email">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <FormField
                    control={emailForm.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Following up on our meeting" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. My manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {emailToneOptions.map((tone) => (
                              <SelectItem key={tone} value={tone}>
                                {tone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Writing..." : "Write Email"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex-grow">
            <CardTitle>Output</CardTitle>
            <CardDescription>Your human-like text will be generated here.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select onValueChange={handleOutputLanguageChange} value={outputLanguage}>
                <SelectTrigger className="w-[110px] text-xs h-8">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="text-xs">
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!activeContent || isPending} type="button">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload} disabled={!activeContent || isPending} type="button">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeInputTab === "humanizer" ? (
            <Tabs defaultValue="humanized" onValueChange={setActiveOutputTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="humanized">Humanized</TabsTrigger>
                <TabsTrigger value="simplified">Simplified</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
              </TabsList>
              <TabsContent value="humanized">
                <div className="mt-4 min-h-[400px] rounded-md border bg-muted/50 p-4">
                  {isPending ? <OutputSkeleton /> : displayOutputs.humanized || <OutputPlaceholder type="humanizer" />}
                </div>
              </TabsContent>
              <TabsContent value="simplified">
                <div className="mt-4 min-h-[400px] rounded-md border bg-muted/50 p-4">
                  {isPending ? <OutputSkeleton /> : displayOutputs.simplified || <OutputPlaceholder type="humanizer" />}
                </div>
              </TabsContent>
              <TabsContent value="professional">
                <div className="mt-4 min-h-[400px] rounded-md border bg-muted/50 p-4">
                  {isPending ? <OutputSkeleton /> : displayOutputs.professional || <OutputPlaceholder type="humanizer" />}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="mt-4 min-h-[400px] rounded-md border bg-muted/50 p-4">
              {isPending ? <OutputSkeleton /> : displayOutputs.email || <OutputPlaceholder type="email" />}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OutputSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function OutputPlaceholder({ type }: { type: "humanizer" | "email" }) {
  const Icon = type === "email" ? Mail : Bot;
  const text = type === "email" ? "Your generated email will appear here." : "Your humanized text will appear here.";
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
      <Icon className="h-12 w-12 mb-4 text-primary/50" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
