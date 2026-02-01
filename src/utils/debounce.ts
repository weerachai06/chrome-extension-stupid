/**
 * Debounce utility for handling rapid network requests
 * Prevents duplicate requests within a specified time window
 */

interface DebouncedRequest {
  key: string;
  timer: NodeJS.Timeout;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  requestFn: () => Promise<unknown>;
}

const debouncedRequests = new Map<string, DebouncedRequest>();

/**
 * Generate debounce key for request
 * @param type - Request type (rest or graphql)
 * @param url - Request URL
 * @param method - HTTP method or operation type
 * @returns Debounce key
 */
function generateDebounceKey(
  type: string,
  url: string,
  method?: string,
): string {
  return `${type}:${url}:${method || "default"}`;
}

/**
 * Debounce a network request
 * @param type - Request type (rest or graphql)
 * @param url - Request URL
 * @param requestFn - Function that performs the request
 * @param delay - Debounce delay in milliseconds
 * @param method - HTTP method or operation type
 * @returns Promise that resolves with request result
 */
export async function debounceRequest(
  type: string,
  url: string,
  requestFn: () => Promise<unknown>,
  delay = 0,
  method?: string,
): Promise<unknown> {
  const key = generateDebounceKey(type, url, method);

  // Cancel previous request if exists
  if (debouncedRequests.has(key)) {
    const previous = debouncedRequests.get(key);
    if (previous) {
      clearTimeout(previous.timer);
      previous.reject(new Error("Request cancelled by newer request"));
      debouncedRequests.delete(key);
    }
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        debouncedRequests.delete(key);
      }
    }, delay);

    debouncedRequests.set(key, {
      key,
      timer,
      resolve,
      reject,
      requestFn,
    });
  });
}

/**
 * Cancel a debounced request
 * @param type - Request type
 * @param url - Request URL
 * @param method - HTTP method or operation type
 */
export function cancelDebouncedRequest(
  type: string,
  url: string,
  method?: string,
): void {
  const key = generateDebounceKey(type, url, method);
  const request = debouncedRequests.get(key);

  if (request) {
    clearTimeout(request.timer);
    request.reject(new Error("Request cancelled"));
    debouncedRequests.delete(key);
  }
}

/**
 * Cancel all debounced requests
 */
export function cancelAllDebouncedRequests(): void {
  for (const [key, request] of debouncedRequests.entries()) {
    clearTimeout(request.timer);
    request.reject(new Error("All requests cancelled"));
    debouncedRequests.delete(key);
  }
}

/**
 * Get pending request count
 */
export function getPendingRequestCount(): number {
  return debouncedRequests.size;
}
