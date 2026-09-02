
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Library, FileText, ClipboardCheck } from "lucide-react";
import { TutorContentProvider } from "@/components/tools/ai-tutor/tutor-content-context";
import { ChatTab } from "@/components/tools/ai-tutor/chat-tab";
import { UploadTab } from "@/components/tools/ai-tutor/upload-tab";
import { SummaryTab } from "@/components/tools/ai-tutor/summary-tab";
import { PracticeTab } from "@/components/tools/ai-tutor/practice-tab";

export function AiTutor() {
  const [tab, setTab] = useState("chat");

  return (
    <TutorContentProvider>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Study Guide</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Practice Quiz</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>
          <TabsContent value="library">
            <UploadTab />
          </TabsContent>
          <TabsContent value="summary">
            <SummaryTab />
          </TabsContent>
          <TabsContent value="practice">
            <PracticeTab />
          </TabsContent>
        </Tabs>
      </div>
    </TutorContentProvider>
  );
}
