
"use client";

import { useState, useRef } from "react";
import { handleCheatSheetGeneration } from "@/app/actions";
import type { SummarizeContentAndGenerateCheatSheetOutput } from "@/ai/flows/summarize-content-generate-cheatsheet";
import { extractTextFromUrl } from "@/ai/flows/extract-text-from-url";
import { extractTextFromPdf } from "@/ai/flows/extract-text-from-pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, AlertCircle, Download, Share2, FileText, Link as LinkIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CheatSheetSkeleton } from "@/components/tools/cheat-sheet/cheat-sheet-skeleton";

type CheatSheetResult = SummarizeContentAndGenerateCheatSheetOutput | null;

const OUTPUT_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Chinese",
  "Portuguese",
  "Japanese",
];

export function FreeCheatSheetGenerator() {
  const [activeTab, setActiveTab] = useState("text");
  const [inputText, setInputText] = useState("");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cheatSheet, setCheatSheet] = useState<CheatSheetResult>(null);
  const [targetLanguage, setTargetLanguage] = useState("English");
  const { toast } = useToast();
  const cheatSheetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    let contentToProcess = "";
    setError(null);
    setCheatSheet(null);
    setIsLoading(true);
    setLoadingMessage("Working on it...");

    try {
      if (activeTab === "text") {
        if (!inputText) {
          toast({ variant: "destructive", title: "Add some text", description: "Please paste in the content you want summarized." });
          setIsLoading(false);
          return;
        }
        contentToProcess = inputText;
      } else if (activeTab === "url") {
        if (!url) {
          toast({ variant: "destructive", title: "Add a URL", description: "Please enter a URL to fetch content from." });
          setIsLoading(false);
          return;
        }
        setLoadingMessage("Fetching the page...");
        const urlResult = await extractTextFromUrl({ url });
        contentToProcess = urlResult.text;
      } else if (activeTab === "pdf") {
        if (!pdfFile) {
          toast({ variant: "destructive", title: "Add a PDF", description: "Please choose a PDF file to summarize." });
          setIsLoading(false);
          return;
        }
        if (pdfFile.size > 10 * 1024 * 1024) {
          throw new Error("PDF is too large. Please use a PDF under 10MB.");
        }
        setLoadingMessage("Reading the PDF...");
        const pdfDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pdfFile);
        });
        const pdfResult = await extractTextFromPdf({ pdf: pdfDataUri });
        contentToProcess = pdfResult.text;
        setLoadingMessage(`Summarizing ${pdfResult.numPages} page(s)...`);
      }

      contentToProcess = contentToProcess.trim();

      if (!contentToProcess) {
        throw new Error("We couldn't find any meaningful content to summarize.");
      }

      if (contentToProcess.length > 50000) {
        throw new Error("The extracted content is too large. Please use a shorter document or webpage (50,000 characters max).");
      }

      const response = await handleCheatSheetGeneration(contentToProcess, targetLanguage);
      if ("error" in response) {
        throw new Error(response.error);
      }
      if (!response.data?.cheatSheetHtml) {
        throw new Error("Cheat sheet generation failed. Please try again.");
      }
      setCheatSheet(response.data);
      toast({
        title: "Cheat sheet ready!",
        description: `Detected content type: ${response.data.contentType ?? "General"}`,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Something unexpected happened. Please try again.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Generation failed", description: errorMessage });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleDownload = () => {
    if (!cheatSheetRef.current) return;

    const cheatSheetHtml = cheatSheetRef.current.innerHTML;
    const pageStyles = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>All2ools Cheat Sheet</title>
<style>
body{font-family:Arial,sans-serif;background:#fff;color:#111;line-height:1.5;margin:0}
.container{max-width:1000px;margin:0 auto;padding:32px}
h1,h2,h3{line-height:1.2}
section,.card,.box{margin:12px 0;padding:16px;border:1px solid #ddd;border-radius:12px}
pre{white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;overflow:auto}
code{background:#f3f3f3;padding:2px 4px;border-radius:4px}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}
</style>
</head>
<body><main class="container">${cheatSheetHtml}</main></body>
</html>`;

    const blob = new Blob([pageStyles], { type: "text/html;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "all2ools-cheatsheet.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);

    toast({ title: "Downloaded", description: "Your cheat sheet was saved as an HTML file." });
  };

  const handleShare = () => {
    if (!cheatSheetRef.current?.innerText) return;
    navigator.clipboard.writeText(cheatSheetRef.current.innerText).then(
      () => toast({ title: "Copied", description: "The cheat sheet text was copied to your clipboard." }),
      () => toast({ variant: "destructive", title: "Couldn't copy", description: "Your browser blocked clipboard access." })
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ variant: "destructive", title: "Invalid file", description: "Please choose a PDF file." });
        return;
      }
      setPdfFile(file);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card className="lg:sticky lg:top-4 h-fit">
          <CardHeader>
            <CardTitle>Create Your Cheat Sheet</CardTitle>
            <CardDescription>Paste text, link a page, or upload a PDF to summarize.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10">
                <TabsTrigger value="text" className="flex-col md:flex-row h-auto py-2 md:py-1.5">
                  <FileText className="mb-1 md:mb-0 md:mr-2" />
                  <span>Text</span>
                </TabsTrigger>
                <TabsTrigger value="url" className="flex-col md:flex-row h-auto py-2 md:py-1.5">
                  <LinkIcon className="mb-1 md:mb-0 md:mr-2" />
                  <span>URL</span>
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex-col md:flex-row h-auto py-2 md:py-1.5">
                  <Upload className="mb-1 md:mb-0 md:mr-2" />
                  <span>PDF</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Paste your notes, article, or any text here..."
                  className="min-h-[250px] text-base resize-y"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="url" className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Input type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
              </TabsContent>
              <TabsContent value="pdf" className="mt-4 space-y-2">
                <div className="flex flex-col items-start space-y-2">
                  <Input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    {pdfFile ? "Change PDF" : "Upload PDF"}
                  </Button>
                  {pdfFile && <span className="text-sm text-muted-foreground truncate">Selected: {pdfFile.name}</span>}
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Output language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isLoading ? loadingMessage : "Generate Cheat Sheet"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="min-h-[500px] flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Your Cheat Sheet</CardTitle>
            {cheatSheet && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} type="button">
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} type="button">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading && <CheatSheetSkeleton />}
            {error && !isLoading && (
              <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center">
                <AlertCircle className="h-8 w-8" />
                <AlertTitle className="mt-4 text-lg font-bold">Generation failed</AlertTitle>
                <AlertDescription className="mt-2">{error}</AlertDescription>
              </Alert>
            )}
            {!isLoading && !error && cheatSheet && (
              <div id="cheatsheet-content" ref={cheatSheetRef} dangerouslySetInnerHTML={{ __html: cheatSheet.cheatSheetHtml }} />
            )}
            {!isLoading && !error && !cheatSheet && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-lg border-2 border-dashed">
                <Sparkles className="h-16 w-16 mb-4 text-primary/50" />
                <h3 className="text-xl font-semibold">Your cheat sheet will appear here</h3>
                <p className="mt-2 max-w-sm">Add your content on the left and click Generate.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
