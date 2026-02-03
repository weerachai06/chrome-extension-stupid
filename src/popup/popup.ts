/**
 * Popup UI Controller
 * Handles debounce settings configuration
 */

import { logger } from "../utils/logger";
import {
  DebounceSettings,
  loadSettings as loadStorageSettings,
  saveSettings as saveStorageSettings,
} from "../utils/storage";

// DOM elements
const toast = document.getElementById("toast") as HTMLDivElement;
const debounceUrlsTextarea = document.getElementById(
  "debounceUrls",
) as HTMLTextAreaElement;
const debounceGraphqlOpsTextarea = document.getElementById(
  "debounceGraphqlOps",
) as HTMLTextAreaElement;
const debounceDelayInput = document.getElementById(
  "debounceDelay",
) as HTMLInputElement;
const saveSettingsBtn = document.getElementById(
  "saveSettingsBtn",
) as HTMLButtonElement;

/**
 * Show toast notification
 */
function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
): void {
  if (!toast) {
    console.warn("[Toast] Toast element not found, message:", message);
    return;
  }
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast?.classList.remove("show");
  }, 3000);
}

/**
 * Load settings from storage
 */
async function loadSettings(): Promise<void> {
  try {
    const settings = await loadStorageSettings();

    if (debounceUrlsTextarea) {
      debounceUrlsTextarea.value = settings.restUrls.join("\n");
    }

    if (debounceGraphqlOpsTextarea) {
      debounceGraphqlOpsTextarea.value = settings.graphqlOperations.join("\n");
    }

    if (debounceDelayInput) {
      debounceDelayInput.value = String(settings.debounceDelay);
    }

    console.log("[Popup] Settings loaded:", settings);
  } catch (error) {
    logger.error("Failed to load settings", error);
    showToast("Failed to load settings", "error");
  }
}

/**
 * Save settings to storage
 */
async function saveSettings(): Promise<void> {
  try {
    const restUrls = debounceUrlsTextarea.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const graphqlOperations = debounceGraphqlOpsTextarea.value
      .split("\n")
      .map((op) => op.trim())
      .filter((op) => op.length > 0);

    const debounceDelay = parseInt(debounceDelayInput.value, 10) || 0;

    const settings: DebounceSettings = {
      restUrls,
      graphqlOperations,
      debounceDelay,
    };

    await saveStorageSettings(settings);

    console.log("[Popup] Settings saved:", settings);
    showToast("Settings saved successfully!", "success");

    // Notify background script of settings change
    chrome.runtime
      .sendMessage({
        type: "settings-updated",
        payload: settings,
      })
      .catch(() => {
        // Ignore errors if background script is not ready
      });
  } catch (error) {
    logger.error("Failed to save settings", error);
    showToast("Failed to save settings", "error");
  }
}

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  console.log("[Popup Init] Initializing popup...");

  // Check required elements
  if (!debounceUrlsTextarea)
    console.error("[Popup Init] Missing: debounceUrlsTextarea");
  if (!debounceGraphqlOpsTextarea)
    console.error("[Popup Init] Missing: debounceGraphqlOpsTextarea");
  if (!debounceDelayInput)
    console.error("[Popup Init] Missing: debounceDelayInput");
  if (!saveSettingsBtn) console.error("[Popup Init] Missing: saveSettingsBtn");

  // Add event listeners
  saveSettingsBtn?.addEventListener("click", saveSettings);

  // Load settings
  await loadSettings();

  console.log("[Popup Init] Popup initialized successfully");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
