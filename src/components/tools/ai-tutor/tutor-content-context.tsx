"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { MOCK_CONTENT as initialContent, type Content } from "@/lib/tutor-content";

export type { Content };

interface ContentContextType {
  content: Content[];
  addContent: (item: Content) => void;
  removeContent: (id: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function TutorContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content[]>(initialContent);

  const addContent = (item: Content) => {
    setContent((prevContent) => [...prevContent, item]);
  };

  const removeContent = (id: string) => {
    setContent((prevContent) => prevContent.filter((item) => item.id !== id));
  };

  return (
    <ContentContext.Provider value={{ content, addContent, removeContent }}>{children}</ContentContext.Provider>
  );
}

export function useTutorContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useTutorContent must be used within a TutorContentProvider");
  }
  return context;
}
