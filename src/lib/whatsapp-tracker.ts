import type { WhatsAppClickEventInput } from "@/types/whatsapp-analytics";

export function sendWhatsAppTrackingEvent(payload: WhatsAppClickEventInput) {
  try {
    const body = JSON.stringify({
      ...payload,
      pagePath: payload.pagePath ?? window.location.pathname,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track/whatsapp", blob);
      return;
    }

    void fetch("/api/track/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Tracking failures must never block navigation.
  }
}
