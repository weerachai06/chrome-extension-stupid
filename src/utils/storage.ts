/**
 * Storage Helper for Debounce Network Extension
 * Uses chrome.storage.local for persisting settings and request logs
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
    chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => {
      resolve();
    });
  });
}

/**
 * Load debounce settings from chrome.storage.local
 */
export function loadSettings(): Promise<DebounceSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (result) => {
      const defaultSettings: DebounceSettings = {
        restUrls: [],
        graphqlOperations: [],
        debounceDelay: 0,
      };
      
      resolve(result[SETTINGS_KEY] || defaultSettings);
    });
  });
}

/**
 * Clear all settings from chrome.storage.local
 */
export function clearSettings(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(SETTINGS_KEY, () => {
      resolve();
    });
  });
}

// ==========================================
// Request Logging Storage
// ==========================================

export interface StoredRequest {
  id: string;
  type: "rest" | "graphql";
  url: string;
  method?: string;
  timestamp: number;
  status?: number;
  duration: number;
  request: unknown;
  response: unknown;
}

const REQUESTS_KEY = "debounce_network_requests";
const MAX_STORED_REQUESTS = 100;

/**
 * Generate unique ID for request
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Store a request in chrome storage
 * @param request - Request to store
 */
export async function storeRequest(request: StoredRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([REQUESTS_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const requests = (result[REQUESTS_KEY] || []) as StoredRequest[];
      const newRequests = [request, ...requests].slice(0, MAX_STORED_REQUESTS);

      chrome.storage.local.set({ [REQUESTS_KEY]: newRequests }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Get all stored requests
 * @returns Array of stored requests
 */
export async function getStoredRequests(): Promise<StoredRequest[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([REQUESTS_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve((result[REQUESTS_KEY] || []) as StoredRequest[]);
      }
    });
  });
}

/**
 * Clear all stored requests
 */
export async function clearStoredRequests(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([REQUESTS_KEY], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Delete a specific request
 * @param requestId - ID of request to delete
 */
export async function deleteRequest(requestId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([REQUESTS_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const requests = (result[REQUESTS_KEY] || []) as StoredRequest[];
      const filtered = requests.filter((r) => r.id !== requestId);

      chrome.storage.local.set({ [REQUESTS_KEY]: filtered }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Create stored request object
 */
export function createStoredRequest(
  type: "rest" | "graphql",
  url: string,
  request: unknown,
  response: unknown,
  duration: number,
  status?: number
): StoredRequest {
  return {
    id: generateRequestId(),
    type,
    url,
    timestamp: Date.now(),
    status,
    duration,
    request,
    response,
  };
}
