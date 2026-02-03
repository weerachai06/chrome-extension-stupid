/**
 * Content Script for Debounce Network Extension
 * Injected into page context to intercept network activity
 */

import { DebounceSettings } from "../utils/storage";

/**
 * Setup content script communication with background
 * Listens for messages from injected script
 */
window.addEventListener("message", (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  if (event.data.type === "GET_SETTINGS") {
    // Request settings from background script
    chrome.runtime.sendMessage(
      { type: "GET_SETTINGS" },
      (response: { settings: DebounceSettings }) => {
        // Send response back to injected script
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
