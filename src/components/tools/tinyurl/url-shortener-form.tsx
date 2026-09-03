"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clipboard, ClipboardCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUrlStore, type StoredLink } from "@/lib/tinyurl-store";
import Link from "next/link";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  alias: z.string().optional(),
});

export function UrlShortenerForm() {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLink, setLastLink] = useState<StoredLink | null>(null);
  const { links, addLink } = useUrlStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "", alias: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const alias = values.alias?.trim();

    if (alias && links.some((l) => l.id === alias)) {
      form.setError("alias", { type: "manual", message: "This custom alias is already taken on this device." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tinyurl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: values.url, alias: alias || "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errors = data?.error as Record<string, string[]> | undefined;
        if (errors?.url) form.setError("url", { message: errors.url[0] });
        if (errors?.alias) form.setError("alias", { message: errors.alias[0] });
        if (!errors?.url && !errors?.alias) {
          toast({ variant: "destructive", title: "Something went wrong", description: "Please try again." });
        }
        return;
      }

      const newLink: StoredLink = { ...data.link, clicks: 0 };
      addLink(newLink);
      setLastLink(newLink);
      toast({ title: "Success", description: "Link shortened successfully!" });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Something went wrong", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onCopy = () => {
    if (!lastLink) return;
    const fullUrl = `${window.location.origin}${lastLink.shortUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast({ title: "Copied to clipboard!", description: fullUrl });
    setTimeout(() => setCopied(false), 2000);
  };

  const shortUrl =
    lastLink && typeof window !== "undefined" ? `${window.location.origin}${lastLink.shortUrl}` : "";

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Your Long URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/very-long-url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Custom Alias (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Shortening..." : "Shorten Link"}
          </Button>
        </form>
      </Form>

      {lastLink && (
        <Alert className="bg-primary/10">
          <AlertTitle>Success! Here is your short link:</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-grow space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={lastLink.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-primary hover:underline break-all"
                >
                  {shortUrl}
                </Link>
                <Button variant="ghost" size="icon" onClick={onCopy} type="button">
                  {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer rounded-lg bg-white p-2">
                  <QRCodeSVG value={shortUrl} size={80} />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>QR Code for {shortUrl}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 flex items-center justify-center">
                  <div className="rounded-lg bg-white p-4">
                    <QRCodeSVG value={shortUrl} size={256} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
      )}

      {links.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Recent links on this device</p>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id} className="flex items-center justify-between gap-2 text-sm">
                <Link href={link.shortUrl} target="_blank" className="font-mono text-primary hover:underline truncate">
                  {typeof window !== "undefined" ? `${window.location.origin}${link.shortUrl}` : link.shortUrl}
                </Link>
                <span className="text-muted-foreground whitespace-nowrap">{link.clicks} clicks</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        We don&apos;t store any personal data. The history of your last 5 links is kept locally in
        this browser only and is never sent to our servers.
      </p>
    </div>
  );
}
