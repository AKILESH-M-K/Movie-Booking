# CineBook PWA installation by browser

CineBook uses the browser's own installation controls. It cannot silently download or install an app: the browser/operating system must offer an install action and the user must confirm it. Automatic in-page install prompts are available only in some browsers and only when the site meets their installability requirements. Use the site over HTTPS (or localhost for development).

| Browser / platform | Install path used by CineBook |
| --- | --- |
| Chrome desktop | CineBook uses `beforeinstallprompt` if Chrome exposes it. Otherwise use the address-bar install control or Chrome's menu → Cast, save, and share → Install page as app. |
| Chrome Android | The custom button invokes `beforeinstallprompt` when available. The browser menu can also show Install or Install and create shortcut. |
| Edge desktop | Use the address-bar install control or Settings and more → Apps → Install this site as an app. A custom prompt is used only when the browser exposes it. |
| Edge Android | Use Add to phone / Add to Home screen when offered. This can create an Edge shortcut rather than a standalone WebAPK. |
| Safari iPhone / iPad | In Safari, use Share → Add to Home Screen; enable Open as Web App if offered. Safari does not expose `beforeinstallprompt`. |
| Safari macOS | On macOS Sonoma 14 or later, use File → Add to Dock (or Share → Add to Dock). |
| Firefox Android | Use Firefox's menu → Install or Add to Home Screen, then follow its Home Screen panel. This is a browser flow, not `beforeinstallprompt`. |
| Firefox desktop | Firefox has no built-in PWA installer. CineBook remains usable as a website; use Chrome or Edge for a standalone installation. |
| Samsung Internet Android | Use its + address-bar control / Homescreen action when available, or the browser menu. Some menu shortcuts may open in the browser rather than a separate app window. |
| Opera Android | Use the address-bar menu → Add to → Home screen, or the native install prompt if Opera offers one. The home-screen result can be a shortcut. |
| Opera desktop | A built-in PWA install-as-app flow is not documented. Use Chrome or Edge for standalone installation. |

CineBook's install button follows this compatibility model: it prompts natively where `beforeinstallprompt` is available, otherwise it displays browser- and platform-specific directions. After a successful native install it presents an **Open App** link to the manifest start URL. Manual installation must still be completed in the browser's own menu or share sheet.

## Browser-vendor references

- [Chrome: installable manifest requirements](https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest)
- [Chrome desktop: install or manage web apps](https://support.google.com/chrome/answer/9658361?hl=en&co=GENIE.Platform%3DDesktop)
- [Chrome Android: install or manage web apps](https://support.google.com/chrome/answer/9658361?hl=en&co=GENIE.Platform%3DAndroid)
- [Edge: web app manifests](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/webappmanifests)
- [Edge: install, manage, or uninstall apps](https://support.microsoft.com/en-us/edge/install-manage-or-uninstall-apps-in-microsoft-edge)
- [Apple: open a website as a web app on iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios)
- [Apple: add a website to the Dock on macOS](https://support.apple.com/en-us/104996)
- [Firefox Android: use web apps](https://support.mozilla.org/en-US/kb/use-web-apps-firefox-android)
- [MDN: installing progressive web apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing)
- [Samsung Internet: add websites to the Home screen](https://samsunginternet.github.io/docs/homescreen)
- [Opera Android help](https://help.opera.com/en/mobile/android/)
- [MDN: `beforeinstallprompt` support and browser notes](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)
