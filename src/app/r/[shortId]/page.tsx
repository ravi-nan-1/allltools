"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUrlStore } from "@/lib/tinyurl-store";

export default function RedirectPage() {
  const { shortId } = useParams() as { shortId: string };
  const { findLink, recordClick } = useUrlStore();
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shortId) return;

    const link = findLink(shortId);
    if (link) {
      recordClick(shortId);
      window.location.href = link.originalUrl;
    } else {
      const timer = setTimeout(() => setNotFound(true), 800);
      return () => clearTimeout(timer);
    }
  }, [shortId, findLink, recordClick]);

  if (notFound) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold">Short link not found</h1>
        <p className="text-muted-foreground max-w-md">
          This short link doesn&apos;t exist on this device, or it was created in a different
          browser. Short links created with our tool are stored locally in the browser that
          created them.
        </p>
        <button onClick={() => router.push("/tools/tinyurl-maker")} className="text-primary underline">
          Create a new short link
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
