"use client";

import { useCallback, useEffect, useState } from "react";

export type StoredLink = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
};

const STORAGE_KEY = "all2ools-tinyurl-links";
const MAX_LINKS = 5;

let memoryState: StoredLink[] = [];
const listeners: Array<(state: StoredLink[]) => void> = [];

function dispatch(next: StoredLink[]) {
  memoryState = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage may be unavailable (private browsing, etc.) - fail silently
    }
  }
  listeners.forEach((listener) => listener(memoryState));
}

export function useUrlStore() {
  const [links, setLinks] = useState<StoredLink[]>(memoryState);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        memoryState = JSON.parse(stored);
        setLinks(memoryState);
      }
    } catch {
      memoryState = [];
      setLinks([]);
    }

    listeners.push(setLinks);
    return () => {
      const index = listeners.indexOf(setLinks);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const addLink = useCallback((link: StoredLink) => {
    const next = [link, ...memoryState.filter((l) => l.id !== link.id)].slice(0, MAX_LINKS);
    dispatch(next);
  }, []);

  const removeLink = useCallback((id: string) => {
    dispatch(memoryState.filter((l) => l.id !== id));
  }, []);

  const recordClick = useCallback((id: string) => {
    dispatch(memoryState.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l)));
  }, []);

  const findLink = useCallback((id: string) => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed: StoredLink[] = stored ? JSON.parse(stored) : memoryState;
      return parsed.find((l) => l.id === id) ?? null;
    } catch {
      return memoryState.find((l) => l.id === id) ?? null;
    }
  }, []);

  return { links, addLink, removeLink, recordClick, findLink };
}
