/**
 * GraphQL Client for making GraphQL queries and mutations
 * Handles query normalization and response parsing
 */

export interface GraphQLRequest {
  url: string;
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface GraphQLResponse {
  data?: unknown;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
    locations?: Array<{ line: number; column: number }>;
  }>;
  extensions?: Record<string, unknown>;
}

export interface GraphQLResult {
  request: GraphQLRequest;
  response: GraphQLResponse;
  duration: number;
  timestamp: number;
  status: number;
  statusText: string;
}

/**
 * Make a GraphQL request
 * @param request - GraphQL request configuration
 * @returns Promise<GraphQLResult> - GraphQL response with metadata
 * @throws Error if the request fails
 */
export async function makeGraphQLRequest(request: GraphQLRequest): Promise<GraphQLResult> {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeout = request.timeout || 30000;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const payload = {
      query: request.query,
      ...(request.variables && { variables: request.variables }),
      ...(request.operationName && { operationName: request.operationName }),
    };

    const response = await fetch(request.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...request.headers,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.text();
    const duration = performance.now() - startTime;

    let graphqlResponse: GraphQLResponse = {};
    try {
      graphqlResponse = JSON.parse(body);
    } catch {
      throw new Error(`Invalid JSON response: ${body}`);
    }

    return {
      request,
      response: graphqlResponse,
      duration,
      timestamp: Date.now(),
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw new Error(
      `GraphQL request failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extract operation name from GraphQL query
 * @param query - GraphQL query string
 * @returns Operation name or undefined
 */
export function extractOperationName(query: string): string | undefined {
  const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
  return match?.[1];
}

/**
 * Validate GraphQL query syntax
 * @param query - GraphQL query string
 * @returns true if query looks valid, false otherwise
 */
export function validateGraphQLQuery(query: string): boolean {
  const trimmed = query.trim();
  return trimmed.startsWith("{") || /^(query|mutation|subscription)\s+/.test(trimmed);
}

/**
 * Format GraphQL query for display
 * @param query - GraphQL query string
 * @returns Formatted query string
 */
export function formatGraphQLQuery(query: string): string {
  // Simple formatting - can be enhanced with proper GraphQL parser
  return query.replace(/\s+/g, " ").trim();
}
