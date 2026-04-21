"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "subtrack:install-dismissed:v1";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export default function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ignore registration errors silently
      });
    }
  }, []);

  useEffect(() => {
    if (isStandalone()) return;

    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // localStorage unavailable — proceed
    }

    if (isIos()) {
      setShowIosHint(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
      setVisible(false);
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // ignore
      }
    }
  }

  function handleDismiss() {
    setVisible(false);
    setDeferred(null);
    setShowIosHint(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:inset-x-auto sm:right-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-xl shadow-lg shadow-indigo-200">
          <span>💳</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            把 Subtrack 加到主畫面
          </p>
          {showIosHint ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              點擊下方工具列的
              <span className="mx-1 inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold">
                分享 ↑
              </span>
              ，再選「加入主畫面」即可。
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              像原生 App 一樣全螢幕使用，支援離線瀏覽。
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          aria-label="關閉提示"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          ✕
        </button>
      </div>
      {!showIosHint && deferred && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
          >
            以後再說
          </button>
          <button
            onClick={handleInstall}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-600 hover:to-purple-600 active:scale-95"
          >
            立即安裝
          </button>
        </div>
      )}
    </div>
  );
}
