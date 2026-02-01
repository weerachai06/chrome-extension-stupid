/**
 * REST Client for making HTTP requests
 * Supports all standard HTTP methods with proper error handling
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export interface RestRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface RestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
  timestamp: number;
}

/**
 * Make a REST API request
 * @param request - REST request configuration
 * @returns Promise<RestResponse> - Response from the server
 * @throws Error if the request fails or times out
 */
export async function makeRestRequest(request: RestRequest): Promise<RestResponse> {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeout = request.timeout || 30000;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...request.headers,
      },
      body: request.body,
      signal: controller.signal,
    });

    const body = await response.text();
    const duration = performance.now() - startTime;

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      duration,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw new Error(
      `REST request failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse REST response body
 * @param contentType - Content-Type header value
 * @param body - Response body string
 * @returns Parsed response body
 */
export function parseRestResponse(contentType: string, body: string): unknown {
  try {
    if (contentType.includes("application/json")) {
      return JSON.parse(body);
    }
    if (contentType.includes("application/xml") || contentType.includes("text/xml")) {
      const parser = new DOMParser();
      return parser.parseFromString(body, "application/xml");
    }
    return body;
  } catch {
    return body;
  }
}
