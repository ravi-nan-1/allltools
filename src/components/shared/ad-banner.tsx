"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  adSlot: string;
  adFormat?: string;
  dataFullWidthResponsive?: boolean;
}

/**
 * Safe AdSense wrapper. Placeholder slot IDs must never be pushed to
 * AdSense: doing so causes the Google publisher TagError seen in dev.
 */
export function AdBanner({
  adSlot,
  adFormat = 'auto',
  dataFullWidthResponsive = false,
  className,
  ...props
}: AdBannerProps) {
  const hasValidSlot = Boolean(adSlot && !adSlot.startsWith('YOUR_'));

  useEffect(() => {
    if (!hasValidSlot) return;

    let cancelled = false;
    let attempts = 0;

    const pushAd = () => {
      if (cancelled || !hasValidSlot) return;

      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          return;
        }
      } catch (err) {
        // AdSense can reject an individual ad without taking down the page.
        console.warn(`AdSense could not initialize slot ${adSlot}.`, err);
        return;
      }

      if (attempts < 10) {
        attempts += 1;
        window.setTimeout(pushAd, 300);
      }
    };

    const timer = window.setTimeout(pushAd, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [adSlot, hasValidSlot]);

  // Keep the reserved space, but never create an invalid AdSense <ins> tag.
  if (!hasValidSlot) {
    return <div className={cn(className)} aria-hidden="true" {...props} />;
  }

  return (
    <div className={cn(className)} {...props}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3080938150148610"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
