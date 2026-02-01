/**
 * Request storage and management
 * Handles persisting and retrieving network requests
 */

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

const STORAGE_KEY = "debounce_network_requests";
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
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const requests = (result[STORAGE_KEY] || []) as StoredRequest[];
      const newRequests = [request, ...requests].slice(0, MAX_STORED_REQUESTS);

      chrome.storage.local.set({ [STORAGE_KEY]: newRequests }, () => {
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
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve((result[STORAGE_KEY] || []) as StoredRequest[]);
      }
    });
  });
}

/**
 * Clear all stored requests
 */
export async function clearStoredRequests(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([STORAGE_KEY], () => {
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
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const requests = (result[STORAGE_KEY] || []) as StoredRequest[];
      const filtered = requests.filter((r) => r.id !== requestId);

      chrome.storage.local.set({ [STORAGE_KEY]: filtered }, () => {
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
 * @param type - Request type (rest or graphql)
 * @param url - Request URL
 * @param request - Request details
 * @param response - Response details
 * @param duration - Request duration in ms
 * @returns StoredRequest object
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
