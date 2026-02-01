/**
 * Background Service Worker for Debounce Network Extension
 * Handles request interception, storage, and communication with popup
 */

import { DebounceSettings, loadSettings } from "../utils/indexedDB";
import { logger } from "../utils/logger";

// Message types for communication with popup and content scripts
type MessageRequest = {
  type:
    | "make-rest-request"
    | "make-graphql-request"
    | "get-requests"
    | "clear-requests"
    | "delete-request"
    | "settings-updated"
    | "DEBOUNCE_FETCH_REQUEST"
    | "DEBOUNCE_XHR_REQUEST";
  payload?: unknown;
};

type MessageResponse = {
  settings: DebounceSettings;
};

/**
 * Initialize extension
 */
async function initializeExtension(): Promise<void> {
  const settings = await loadSettings();
  logger.info("Service Worker initialized");

  // Set up message listener
  chrome.runtime.onMessage.addListener(
    (
      request: MessageRequest,
      _sender,
      sendResponse: (response: MessageResponse) => void,
    ) => {
      sendResponse({ settings });
      // Return true to indicate response will be sent asynchronously
      return true;
    },
  );
}

/**
 * Handle alarms
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanup-logs") {
    logger.info("Running periodic cleanup");
    // Add additional cleanup logic here if needed
  }
});

// Initialize on installation
if (chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      logger.info("Extension installed");
      // Open installation page or show welcome message
    } else if (details.reason === "update") {
      logger.info("Extension updated");
    }
  });
}

// Start initialization
initializeExtension();
