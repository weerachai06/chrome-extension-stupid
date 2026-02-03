type GraphQLRequest = {
    operationName: string | null;
    query: string;
    variables: Record<string, unknown>;
  } | null;

export function parseGraphQLRequest(body: string): GraphQLRequest | null {
  if (!body || typeof body !== "string") {
    return null;
  }

  const parsedQuery: GraphQLRequest = (() => {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  })();

  if(!parsedQuery?.query) {
    return null;
  }

  return parsedQuery;
}

function findOperationName(query: string): string | null {
  if (!query) return null;
  
  // Match operation name: (query|mutation|subscription) OperationName
  // Handles whitespace variations and multiline
  const match = query.match(/^\s*(?:query|mutation|subscription)\s+([a-zA-Z0-9_]+)/i);
  
  if (match?.[1]) {
    return match[1];
  }

  return null;
}
/**
 * GraphQL Query Parser Helper
 * Utilities for parsing and extracting operation names from GraphQL queries
 */

/**
 * Extract operation name from GraphQL query string
 * Supports named and anonymous operations
 *
 * @param body - GraphQL query string
 * @returns Operation name or null if not found
 *
 * @example
 * getOperationName('query GetUser { user { id } }') // 'GetUser'
 * getOperationName('mutation CreatePost($title: String!) { createPost(title: $title) { id } }') // 'CreatePost'
 * getOperationName('{ user { id } }') // null (anonymous query)
 */
export function getOperationName(body: string): string | null {
  if(!body || typeof body !== "string") {
    return null
  }

  const parsedQuery = parseGraphQLRequest(body);
  if(parsedQuery?.operationName) {
    return parsedQuery.operationName;
  }
  
  // If parseGraphQLRequest returned null because it's not valid JSON,
  // or if it's valid JSON but operationName is missing, try parsing the query string.
  // We use the raw body as a fallback for findOperationName.
  const queryToParse = parsedQuery?.query || body;

  return findOperationName(queryToParse);
}

/**
 * Check if a GraphQL operation name matches any pattern in the list
 * Supports exact matches and wildcard patterns
 *
 * @param operationName - Operation name to check
 * @param patterns - Array of patterns (exact names or wildcards like "Get*")
 * @returns true if operation matches any pattern
 *
 * @example
 * matchesPattern('GetUser', ['GetUser', 'GetPosts']) // true
 * matchesPattern('GetUser', ['Get*']) // true
 * matchesPattern('CreatePost', ['Get*']) // false
 */
export function matchesPattern(operationName: string, patterns: string[]): boolean {
  if (!operationName || !patterns || patterns.length === 0) {
    return false;
  }

  return patterns.some((pattern) => {
    if (pattern === "*") {
      // Wildcard matches all
      return true;
    }

    if (pattern.includes("*")) {
      // Convert wildcard pattern to regex
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
        "i"
      );
      return regex.test(operationName);
    }

    // Exact match (case-insensitive)
    return operationName.toLowerCase() === pattern.toLowerCase();
  });
}

/**
 * Parse GraphQL query and extract metadata
 *
 * @param query - GraphQL query string
 * @returns Object with operation metadata
 *
 * @example
 * parseGraphQLQuery('query GetUser { user { id name } }')
 * // { operationName: 'GetUser', type: 'query', fields: ['user'] }
 */
export function parseGraphQLQuery(
  query: string
): {
  operationName: string | null;
  type: "query" | "mutation" | "subscription" | null;
  isValid: boolean;
} {
  if (!query || typeof query !== "string") {
    return {
      operationName: null,
      type: null,
      isValid: false,
    };
  }

  // Check if it's a valid GraphQL query (basic validation)
  const trimmed = query.trim();
  if (!trimmed.includes("{") || !trimmed.includes("}")) {
    return {
      operationName: null,
      type: null,
      isValid: false,
    };
  }

  // Extract operation type and name
  const typeMatch = trimmed.match(/^\s*(query|mutation|subscription)/i);
  const operationName = getOperationName(trimmed);

  const type = typeMatch ? (typeMatch[1].toLowerCase() as "query" | "mutation" | "subscription") : null;

  return {
    operationName,
    type,
    isValid: trimmed.startsWith("{") || typeMatch !== null,
  };
}
