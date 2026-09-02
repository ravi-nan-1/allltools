"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { chatWithAiTutor } from "@/ai/flows/chat-with-ai-tutor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

export function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, setIsPending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get("message") as string)?.trim();
    if (!query || isPending) return;

    formRef.current?.reset();

    const userMessage: Message = { id: Date.now(), sender: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setIsPending(true);

    try {
      const { answer } = await chatWithAiTutor({ query });
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: answer }]);
    } catch (error) {
      console.error("Error chatting with AI tutor:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: "I'm sorry, but I encountered an error. Please try again." },
      ]);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat with your AI Tutor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ask me anything you're studying — I'll do my best to explain it clearly.
              </p>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
                {message.sender === "ai" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-3 max-w-xl ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.sender === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 max-w-xl bg-muted flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="mt-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              name="message"
              placeholder="Ask a question about your content..."
              className="flex-1"
              autoComplete="off"
              disabled={isPending}
            />
            <Button type="submit" size="icon" disabled={isPending}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
