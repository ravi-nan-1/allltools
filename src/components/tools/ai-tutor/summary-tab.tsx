"use client";

import { useState } from "react";
import { summarizeUploadedContent } from "@/ai/flows/summarize-uploaded-content";
import { useTutorContent } from "./tutor-content-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, Download } from "lucide-react";
import jsPDF from "jspdf";

type State = {
  summary: string | null;
  error: string | null;
  title: string | null;
};

export function SummaryTab() {
  const { content: availableContent } = useTutorContent();
  const [contentId, setContentId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<State>({ summary: null, error: null, title: null });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contentId) return;

    setIsPending(true);
    const selectedContent = availableContent.find((c) => c.id === contentId);
    if (!selectedContent) {
      setState({ summary: null, error: "Content not found.", title: null });
      setIsPending(false);
      return;
    }

    try {
      const result = await summarizeUploadedContent({ content: selectedContent.fullText });
      setState({ summary: result.summary, error: null, title: selectedContent.title });
    } catch (error) {
      console.error(error);
      setState({ summary: null, error: "Failed to generate summary.", title: null });
    } finally {
      setIsPending(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!state.summary || !state.title) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    const checkAndAddPage = (spaceNeeded: number) => {
      if (yPos + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`Study Guide: ${state.title}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    const lines = state.summary.split("\n");
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const drawCodeBlock = () => {
      if (codeBlockLines.length > 0) {
        const blockHeight = codeBlockLines.length * 4 + 6;
        checkAndAddPage(blockHeight + 2);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 3, contentWidth, blockHeight, "F");
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text(codeBlockLines.join("\n"), margin + 3, yPos + 1);
        yPos += blockHeight;
        codeBlockLines = [];
        doc.setTextColor(80, 80, 80);
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("```")) {
        if (inCodeBlock) drawCodeBlock();
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      if (!trimmedLine) {
        yPos += 5;
        checkAndAddPage(5);
        return;
      }

      const isBold = trimmedLine.startsWith("**") && trimmedLine.endsWith("**");

      if (isBold) {
        checkAndAddPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        const text = trimmedLine.replace(/\*\*/g, "");
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, yPos);
        yPos += textLines.length * 5 + 3;
      } else {
        checkAndAddPage(5 * doc.splitTextToSize(trimmedLine, contentWidth).length);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const textLines = doc.splitTextToSize(trimmedLine, contentWidth);
        doc.text(textLines, margin, yPos);
        yPos += textLines.length * 4 + 2;
      }
    });

    drawCodeBlock();
    doc.save(`${state.title.replace(/\s+/g, "_").toLowerCase()}_study_guide.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Study Guide</CardTitle>
          <CardDescription>Select a piece of content from your library to create a detailed summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select onValueChange={setContentId} disabled={isPending || availableContent.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select content..." />
              </SelectTrigger>
              <SelectContent>
                {availableContent.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isPending || !contentId}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Generate Study Guide
            </Button>
            {availableContent.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Your library is empty. Add content in the &quot;Library&quot; tab first.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {isPending && (
        <Card>
          <CardContent className="p-6 flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      )}

      {state.error && !isPending && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{state.error}</p>
          </CardContent>
        </Card>
      )}

      {state.summary && !isPending && state.title && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{state.title} - Study Guide</CardTitle>
              <CardDescription>A comprehensive summary of your selected content.</CardDescription>
            </div>
            <Button variant="outline" onClick={handleDownloadPdf} type="button">
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full rounded-md border p-4 bg-muted/50">
              <pre className="text-sm whitespace-pre-wrap font-mono">{state.summary}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
