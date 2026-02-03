/**
 * Storage Helper for Debounce Network Extension
 * Uses chrome.storage.local for persisting settings
 */

// ==========================================
// Settings Storage
// ==========================================

export interface DebounceSettings {
  restUrls: string[];
  graphqlOperations: string[];
  debounceDelay: number;
}

const SETTINGS_KEY = 'debounceSettings';

/**
 * Save debounce settings to chrome.storage.local
 */
export function saveSettings(settings: DebounceSettings): Promise<void> {
  return new Promise((resolve) => {
    const storage = typeof chrome !== 'undefined' ? chrome.storage : (window as any).chrome?.storage;
    storage.local.set({ [SETTINGS_KEY]: settings }, () => {
      resolve();
    });
  });
}

/**
 * Load debounce settings from chrome.storage.local
 */
export function loadSettings(): Promise<DebounceSettings> {
  return new Promise((resolve) => {
    const storage = typeof chrome !== 'undefined' ? chrome.storage : (window as any).chrome?.storage;
    storage.local.get([SETTINGS_KEY], (result: any) => {
      const defaultSettings: DebounceSettings = {
        restUrls: [],
        graphqlOperations: [],
        debounceDelay: 0,
      };
      
      resolve(result[SETTINGS_KEY] || defaultSettings);
    });
  });
}
