"use client";

import type React from "react";
import { useMemo } from "react";

import { sendWhatsAppTrackingEvent } from "@/lib/whatsapp-tracker";
import type { WhatsAppClickEventInput } from "@/types/whatsapp-analytics";

type BaseAnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

interface WhatsAppLinkProps extends BaseAnchorProps {
  href: string;
  tracking: Omit<WhatsAppClickEventInput, "href">;
}

export function WhatsAppLink({ href, tracking, onClick, ...props }: WhatsAppLinkProps) {
  const isTrackable = useMemo(() => /^https:\/\/wa\.me\/.+/i.test(href), [href]);

  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        if (isTrackable) {
          sendWhatsAppTrackingEvent({
            ...tracking,
            href,
          });
        }
      }}
    />
  );
}
