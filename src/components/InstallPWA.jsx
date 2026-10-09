import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const APP_START_URL = "/Movie-Booking/";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function getBrowserGuide() {
  const userAgent = window.navigator.userAgent || "";
  const platform = window.navigator.userAgentData?.platform || window.navigator.platform || "";
  const isAppleMobile =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);
  const isFirefox = /Firefox|FxiOS/i.test(userAgent);
  const isSamsung = /SamsungBrowser/i.test(userAgent);
  const isEdge = /EdgA|EdgiOS|Edg\//i.test(userAgent);
  const isOpera = /OPR\/|Opera/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR/i.test(userAgent);
  const isMac = /Mac/i.test(platform) || /Macintosh/i.test(userAgent);

  if (isAppleMobile) {
    return {
      browser: "iPhone or iPad",
      steps: [
        "Open this page in Safari, tap Share, then choose Add to Home Screen.",
        "If Open as Web App appears, turn it on before tapping Add.",
        "Tap the CineBook icon on your Home Screen to launch it as a web app.",
      ],
      note: "Safari uses a manual Add to Home Screen flow; it does not provide the automatic install prompt used by Chrome.",
    };
  }

  if (isAndroid && isSamsung) {
    return {
      browser: "Samsung Internet on Android",
      steps: [
        "When CineBook is recognized as installable, tap the + control in the address bar and choose Homescreen.",
        "If that control is not shown, open the browser menu and look for Add to home screen.",
        "Open CineBook from the new Home Screen icon. The menu shortcut may open in the browser rather than a separate app window.",
      ],
      note: "Samsung Internet controls its own install affordance; the website cannot force it to appear.",
    };
  }

  if (isAndroid && isFirefox) {
    return {
      browser: "Firefox on Android",
      steps: [
        "Open the Firefox menu and choose Install (or Add to Home Screen if that is what your version displays).",
        "Follow the Add to Home Screen panel and place the CineBook icon.",
        "Tap the new icon to launch CineBook.",
      ],
      note: "Firefox Android uses its browser menu rather than the site's automatic install prompt. Firefox desktop does not have a built-in PWA installer.",
    };
  }

  if (isAndroid && isEdge) {
    return {
      browser: "Microsoft Edge on Android",
      steps: [
        "Open the Edge menu and choose Add to phone or Add to Home screen when available.",
        "Tap Add, then open the new CineBook shortcut from your Home Screen.",
      ],
      note: "Edge Android creates a browser shortcut; it is not the same as Chrome's native WebAPK-style app installation.",
    };
  }

  if (isAndroid && isOpera) {
    return {
      browser: "Opera on Android",
      steps: [
        "Open the Opera menu at the end of the address bar and choose Add to.",
        "Select the Home screen option and follow the prompts.",
        "If Opera shows a CineBook install prompt instead, use that prompt to install the web app.",
      ],
      note: "Depending on Opera and Android versions, Add to Home screen may create a browser shortcut rather than a standalone app.",
    };
  }

  if (isAndroid) {
    return {
      browser: "Android browser",
      steps: [
        "Open the browser menu and choose Install app, Install, or Add to Home screen.",
        "Confirm the browser's prompt, then launch CineBook from the new Home Screen icon.",
      ],
      note: "Menu names vary by browser and version. A shortcut may open in the browser instead of a separate app window.",
    };
  }

  if (isMac && isSafari) {
    return {
      browser: "Safari on macOS",
      steps: [
        "On macOS Sonoma 14 or later, choose File → Add to Dock in Safari (or Share → Add to Dock).",
        "Confirm Add, then open CineBook from the Dock or Applications folder.",
      ],
      note: "This is Safari's manual web-app installation flow; the site cannot open the system install dialog itself.",
    };
  }

  if (isFirefox) {
    return {
      browser: "Firefox desktop",
      steps: [
        "Firefox desktop does not include a built-in PWA installer, so CineBook cannot install as a standalone app from this browser.",
        "To install CineBook, open this same secure website in Chrome or Edge and use the browser's Install control.",
      ],
      note: "CineBook still works as a normal website in Firefox.",
    };
  }

  if (isEdge) {
    return {
      browser: "Microsoft Edge desktop",
      steps: [
        "Use the App available/Install control in Edge's address bar when shown.",
        "Alternatively, open Settings and more → Apps → Install this site as an app.",
        "Confirm the dialog, then launch CineBook from the installed app or your operating system's app list.",
      ],
      note: "The Edge install option appears only when browser and site requirements are met.",
    };
  }

  if (isOpera) {
    return {
      browser: "Opera desktop",
      steps: [
        "Opera desktop does not document a built-in install-as-app workflow for this site.",
        "For a standalone CineBook app, open the secure website in Chrome or Edge and use the browser's Install control.",
      ],
      note: "Opera bookmarks or page shortcuts are not the same as installing a standalone PWA.",
    };
  }

  return {
    browser: "this browser",
    steps: [
      "Open the browser's menu and look for Install app, Install this site, or Add to Home Screen.",
      "If there is no install option, open this secure website in Chrome or Edge on desktop, Chrome on Android, Safari on iPhone/iPad, or Safari on macOS Sonoma or later.",
    ],
    note: "Browser support and menu names vary. Websites cannot bypass the browser's install controls or user confirmation.",
  };
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [showHelp, setShowHelp] = useState(false);
  const [installError, setInstallError] = useState("");
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const guide = getBrowserGuide();

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallError("");
    };

    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setInstallError("");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  useEffect(() => {
    if (!showHelp) return undefined;

    const previousFocus = document.activeElement;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowHelp(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus !== document.body) {
        previousFocus.focus();
      } else {
        trigger?.focus();
      }
    };
  }, [showHelp]);

  const handleInstallClick = async () => {
    if (!window.isSecureContext && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      setInstallError("Installation requires a secure HTTPS connection. Open CineBook using its HTTPS address.");
      setShowHelp(true);
      return;
    }

    if (!deferredPrompt) {
      setInstallError("");
      setShowHelp(true);
      return;
    }

    try {
      const promptEvent = deferredPrompt;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setDeferredPrompt(null);
      if (choice?.outcome === "accepted") {
        setInstalled(true);
        setInstallError("");
      } else {
        setInstallError("Installation was cancelled. You can try again from your browser's install option.");
      }
    } catch {
      setDeferredPrompt(null);
      setInstallError("This browser could not open its install prompt. Use the browser steps below instead.");
      setShowHelp(true);
    }
  };

  return (
    <>
      {installed ? (
        <a
          href={APP_START_URL}
          className="inline-flex items-center justify-center rounded-xl border border-[#d0d5dd] bg-[#fcf7eb] px-4 py-2.5 text-sm font-black text-[#344054] transition-all hover:-translate-y-0.5 hover:border-[#e4572e] hover:bg-[#fff1ed]"
          title="Open CineBook"
        >
          Open App
        </a>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleInstallClick}
          className="rounded-xl border border-[#d0d5dd] bg-[#fcf7eb] px-4 py-2.5 text-sm font-black text-[#344054] transition-all hover:-translate-y-0.5 hover:border-[#e4572e] hover:bg-[#fff1ed]"
          title={deferredPrompt ? "Install CineBook" : "Install CineBook or view browser-specific instructions"}
        >
          {deferredPrompt ? "Install App" : "Install / Open"}
        </button>
      )}

      {showHelp && createPortal(
        <div
          className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/50 p-4 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowHelp(false);
          }}
        >
          <section
            ref={dialogRef}
            className="my-auto max-h-[calc(100vh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-help-title"
            aria-describedby="pwa-help-description"
          >
            <h2 id="pwa-help-title" className="text-2xl font-black text-[#14213d]">
              Install CineBook
            </h2>
            <p id="pwa-help-description" className="mt-3 text-base leading-7 text-[#667085]">
              {deferredPrompt
                ? "Your browser can open its native install prompt. Choose Install there to add CineBook to your device."
                : `No automatic install prompt is available in ${guide.browser}. Try these steps:`}
            </p>

            {installError && (
              <p role="alert" className="mt-3 rounded-xl border border-[#f7c8bb] bg-[#fff7f4] px-4 py-3 text-sm font-bold text-[#9f5525]">
                {installError}
              </p>
            )}

            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#667085]">
              {guide.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <p className="mt-4 text-sm leading-6 text-[#667085]">{guide.note}</p>
            <p className="mt-3 text-xs leading-5 text-[#667085]">
              A website cannot silently download or install an app. The browser or operating system must show the install controls and you must confirm.
            </p>

            <a
              href={APP_START_URL}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#d0d5dd] bg-[#fcf7eb] px-5 py-3 text-sm font-black text-[#344054] hover:border-[#e4572e] hover:bg-[#fff1ed]"
            >
              Open CineBook
            </a>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-3 w-full rounded-xl bg-[#e4572e] px-5 py-3.5 text-base font-black text-white hover:bg-[#c94423] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14213d]"
            >
              Close
            </button>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
