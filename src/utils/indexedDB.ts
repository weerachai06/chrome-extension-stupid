/**
 * IndexedDB Helper for Debounce Network Extension
 * Provides a simple abstraction layer for storing debounce settings
 * Accessible from both extension context and page context
 */

const DB_NAME = "DebounceNetworkDB";
const STORE_NAME = "settings";
const DB_VERSION = 1;

export interface DebounceSettings {
  restUrls: string[];
  graphqlOperations: string[];
  debounceDelay: number;
}

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Save debounce settings to IndexedDB
 */
export async function saveSettings(settings: DebounceSettings): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.put(settings, "debounceSettings");

    request.onerror = () => {
      reject(new Error(`Failed to save settings: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Load debounce settings from IndexedDB
 */
export async function loadSettings(): Promise<DebounceSettings> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get("debounceSettings");

    request.onerror = () => {
      reject(new Error(`Failed to load settings: ${request.error}`));
    };

    request.onsuccess = () => {
      const result = request.result;
      const defaultSettings: DebounceSettings = {
        restUrls: [],
        graphqlOperations: [],
        debounceDelay: 0,
      };

      resolve(result || defaultSettings);
    };
  });
}

/**
 * Clear all settings from IndexedDB
 */
export async function clearSettings(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.clear();

    request.onerror = () => {
      reject(new Error(`Failed to clear settings: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}
