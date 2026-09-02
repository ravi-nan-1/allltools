"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Globe, UploadCloud, FileText, Youtube, CheckCircle, Trash2 } from "lucide-react";
import { useState, useRef, type ChangeEvent } from "react";
import { useTutorContent, type Content } from "./tutor-content-context";

const TEXT_LIKE_EXTENSIONS = [".txt", ".md", ".csv", ".json"];

export function UploadTab() {
  const { toast } = useToast();
  const { content, addContent, removeContent } = useTutorContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, type: "file" | "url") => {
    event.preventDefault();
    setIsSubmitting(true);

    let newContent: Omit<Content, "id" | "createdAt"> | null = null;

    if (type === "file" && selectedFile) {
      const file = selectedFile;
      const isTextLike = TEXT_LIKE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

      let fullText = `This file (${file.name}) was uploaded, but its content couldn't be automatically extracted in-browser. Full text extraction is currently supported for plain text files (.txt, .md, .csv, .json); PDF/audio/video extraction isn't available yet.`;
      if (isTextLike) {
        try {
          fullText = await readFileAsText(file);
        } catch {
          // keep the fallback message above
        }
      }

      newContent = {
        title: file.name,
        type: "PDF",
        source: file.name,
        description: isTextLike ? "A text file uploaded by the user." : "A file uploaded by the user.",
        fullText,
        icon: FileText,
      };
    } else if (type === "url" && urlInputRef.current?.value) {
      const url = urlInputRef.current.value;
      const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
      newContent = {
        title: `Content from ${url.substring(0, 30)}...`,
        type: isYoutube ? "YouTube" : "URL",
        source: url,
        description: "Content referenced from a URL (page/video content is not fetched automatically).",
        fullText: `The user wants to study content from this URL: ${url}. No page text was fetched automatically — ask the user to paste key excerpts if you need more detail.`,
        icon: isYoutube ? Youtube : Globe,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    if (newContent) {
      addContent({
        ...newContent,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Content added", description: "Your content has been added to the library." });
      setSelectedFile(null);
    } else {
      toast({
        variant: "destructive",
        title: "Nothing to add",
        description: "Please select a file or provide a URL.",
      });
    }

    (event.target as HTMLFormElement).reset();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Study Content</CardTitle>
          <CardDescription>Choose your preferred method to add content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">
                <UploadCloud className="mr-2 h-4 w-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="url">
                <Globe className="mr-2 h-4 w-4" />
                From URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="file">
              <form onSubmit={(e) => handleSubmit(e, "file")}>
                <Card className="border-dashed mt-4">
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      <Label htmlFor="file-upload" className="font-semibold text-primary cursor-pointer hover:underline">
                        Choose a file
                      </Label>
                      <p className="text-xs text-muted-foreground">TXT, MD, CSV, JSON extract fully. PDF/audio/video are added by name only.</p>
                      <Input id="file-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    </div>
                    {selectedFile && (
                      <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{selectedFile.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Button type="submit" className="w-full mt-4" disabled={isSubmitting || !selectedFile}>
                  {isSubmitting ? "Adding..." : "Add File"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="url">
              <form onSubmit={(e) => handleSubmit(e, "url")} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Web or YouTube URL</Label>
                  <Input id="url" placeholder="https://example.com" required ref={urlInputRef} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add URL"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="max-w-2xl mx-auto space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Your library ({content.length})</h3>
        {content.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeContent(item.id)} type="button">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
