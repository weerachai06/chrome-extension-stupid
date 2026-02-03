/**
 * Background Service Worker for Debounce Network Extension
 * Handles request interception, storage, and communication with popup
 */

import { DebounceSettings, loadSettings } from "../utils/storage";
import { logger } from "../utils/logger";

// Message types for communication with popup and content scripts
type MessageRequest = {
  type:
    | "settings-updated"
    | "GET_SETTINGS";
  payload?: unknown;
};

type MessageResponse = {
  settings?: DebounceSettings;
  success?: boolean;
  data?: unknown;
};

/**
 * Initialize extension
 */
async function initializeExtension(): Promise<void> {
  logger.info("Service Worker initialized");

  // Set up message listener
  chrome.runtime.onMessage.addListener(
    (
      request: MessageRequest,
      _sender,
      sendResponse: (response: MessageResponse) => void,
    ) => {
      handleMessage(request).then(sendResponse);
      return true; // Return true to indicate response will be sent asynchronously
    },
  );
}

/**
 * Handle incoming messages
 */
async function handleMessage(request: MessageRequest): Promise<MessageResponse> {
  try {
    if (request.type === "GET_SETTINGS" || request.type === "settings-updated") {
      const settings = await loadSettings();
      return { settings };
    }
    
    return { success: false };
  } catch (error) {
    logger.error("Error handling message", error);
    return { success: false };
  }
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
    } else if (details.reason === "update") {
      logger.info("Extension updated");
    }
  });
}

// Start initialization
initializeExtension();
