"use client";

import { motion } from "framer-motion";
import { Download, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_STORAGE_KEY = "itech_install_prompt_dismissed_at_v2";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

function isIosDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(max-width: 1024px)").matches;
}

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
  if (!raw) {
    return false;
  }
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt) || dismissedAt <= 0) {
    return false;
  }
  return Date.now() - dismissedAt < DISMISS_TTL_MS;
}

function markDismissed() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
}

export function InstallAppPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHintVisible, setIosHintVisible] = useState(false);
  const [fallbackHintVisible, setFallbackHintVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAdminRoute = useMemo(() => pathname.startsWith("/admin"), [pathname]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    setIsMobile(isMobileViewport());

    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (isAdminRoute || !isMobile || isStandaloneMode() || wasDismissedRecently()) {
      setVisible(false);
      setIosHintVisible(false);
      setFallbackHintVisible(false);
      setDeferredPrompt(null);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setFallbackHintVisible(false);
      setIosHintVisible(false);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
      setIosHintVisible(false);
      setFallbackHintVisible(false);
      markDismissed();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    const showIosHint = isIosDevice() && !isStandaloneMode();
    if (showIosHint) {
      setIosHintVisible(true);
      setVisible(true);
    }

    const fallbackTimer = window.setTimeout(() => {
      if (!showIosHint && !isStandaloneMode() && !deferredPrompt) {
        setFallbackHintVisible(true);
        setVisible(true);
      }
    }, 1400);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [deferredPrompt, isAdminRoute, isMobile]);

  if (!visible || isAdminRoute || !isMobile) {
    return null;
  }

  async function installApp() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      markDismissed();
      setVisible(false);
      setDeferredPrompt(null);
      return;
    }

    setDeferredPrompt(null);
    setFallbackHintVisible(true);
  }

  function closePrompt() {
    setVisible(false);
    markDismissed();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.28 }}
      className="pointer-events-none fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] z-[80] mx-auto w-[min(95vw,430px)]"
    >
      <div className="pointer-events-auto relative overflow-hidden rounded-2xl border border-amber-200/90 bg-[linear-gradient(135deg,#fff8e8_0%,#f6e9c8_40%,#eed7a0_100%)] p-4 shadow-[0_24px_45px_rgba(120,84,20,0.30)]">
        <div className="absolute inset-0 gold-install-shine" aria-hidden="true" />
        <button
          type="button"
          onClick={closePrompt}
          className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border border-amber-300 bg-white/80 text-amber-900"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        <div className="relative flex items-start gap-3 pr-8">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-white text-amber-700 shadow-[0_8px_18px_rgba(120,84,20,0.20)]">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">Instala iTech Peru en tu celular</p>
            <p className="mt-1 text-xs text-slate-700">
              Abre mas rapido, navega mejor y consulta productos al instante.
            </p>

            {iosHintVisible && !deferredPrompt ? (
              <p className="mt-2 text-xs font-semibold text-slate-800">
                En Safari toca <span className="text-amber-800">Compartir</span> y luego{" "}
                <span className="text-amber-800">Anadir a pantalla de inicio</span>.
              </p>
            ) : null}

            {fallbackHintVisible && !iosHintVisible && !deferredPrompt ? (
              <p className="mt-2 text-xs font-semibold text-slate-800">
                En Chrome toca el menu <span className="text-amber-800">...</span> y elige{" "}
                <span className="text-amber-800">Instalar app</span>.
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-2 gap-2">
          {deferredPrompt ? (
            <button
              type="button"
              onClick={() => void installApp()}
              className="gold-install-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-900"
            >
              <Download className="size-4" />
              Instalar app
            </button>
          ) : (
            <button
              type="button"
              onClick={closePrompt}
              className="gold-install-button inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold text-slate-900"
            >
              Entendido
            </button>
          )}

          <button
            type="button"
            onClick={closePrompt}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300 bg-white/80 px-3 text-sm font-semibold text-slate-700"
          >
            Ahora no
          </button>
        </div>
      </div>
    </motion.div>
  );
}
