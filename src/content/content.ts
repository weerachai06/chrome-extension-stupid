/**
 * Content Script for Debounce Network Extension
 * Injected into page context to intercept network activity
 */

import { DebounceSettings } from "../utils/indexedDB";

/**
 * Setup content script communication with background
 * Listens for messages from injected script
 */
// window.addEventListener("message", (event) => {
//   if (event.source !== window) return;

//   const message = event.data;

//   console.log("[Debounce Content] Received message:", message);
// });

window.addEventListener("message", (event) => {
  if (event.data.type === "GET_SETTINGS") {
    chrome.runtime.sendMessage(
      event.data.workerMessage,
      (response: { settings: DebounceSettings }) => {
        // Send response back if needed
        window.postMessage(
          {
            type: "SETTINGS_RESPONSE",
            payload: response,
          },
          "*",
        );
      },
    );
  }
});

/**
 * Inject script into page to intercept fetch/XHR
 */
function injectScript(): void {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  script.onload = () => {
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject the script
injectScript();
