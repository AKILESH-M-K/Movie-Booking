import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (!deferredPrompt) {
      setShowHelp(true);
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-xl border border-[#dbcfb4] bg-[#fcf7eb] px-4 py-2.5 text-sm font-black text-[#5e5039] transition-all hover:-translate-y-0.5 hover:border-[#c9803d] hover:bg-[#f9efdd]"
        title="Install CineBook or view installation instructions"
      >
        {deferredPrompt ? "Install App" : "App / Install"}
      </button>

      {showHelp &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-help-title"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border border-[#eae3cc] bg-[#fffef7] p-5 sm:p-7 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="pwa-help-title"
                className="text-xl sm:text-2xl font-black text-[#3d3324]"
              >
                Install CineBook
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-6 sm:leading-7 text-[#736956]">
                This browser does not expose the automatic PWA installation
                prompt. In Chrome or Edge, open the browser menu and choose{" "}
                <b>Install app</b> or <b>Add to Home screen</b>.
              </p>
              <p className="mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-[#847960]">
                Zen Browser is Firefox-based and may not provide an
                installable-PWA button. The CineBook website itself still works
                normally in Zen.
              </p>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full rounded-xl bg-[#a4652a] px-5 py-3.5 text-sm sm:text-base font-black text-white transition-colors hover:bg-[#875022]"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}