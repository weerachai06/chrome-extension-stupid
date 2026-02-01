# GraphQL Parser Helper Utility

Created a comprehensive GraphQL query parsing utility in `src/utils/graphqlParser.ts` to extract and match GraphQL operation names.

## Functions

### `getOperationName(query: string): string | null`
Extracts the primary operation name from a GraphQL query string.

**Examples:**
```typescript
getOperationName('query GetUser { user { id } }')
// Returns: 'GetUser'

getOperationName('mutation CreatePost($title: String!) { createPost(title: $title) { id } }')
// Returns: 'CreatePost'

getOperationName('{ user { id } }')
// Returns: null (anonymous query)
```

### `getAllOperationNames(query: string): string[]`
Extracts all operation names from a GraphQL query document (supports multiple operations).

**Examples:**
```typescript
getAllOperationNames('query GetUser { ... } query GetPosts { ... }')
// Returns: ['GetUser', 'GetPosts']
```

### `matchesPattern(operationName: string, patterns: string[]): boolean`
Checks if an operation name matches any pattern in a list. Supports exact matches and wildcards.

**Features:**
- Exact case-insensitive matching
- Wildcard patterns (`Get*`, `Create*`)
- Universal wildcard (`*`)
- Regex-style patterns

**Examples:**
```typescript
matchesPattern('GetUser', ['GetUser', 'GetPosts'])
// Returns: true (exact match)

matchesPattern('GetUser', ['Get*'])
// Returns: true (wildcard match)

matchesPattern('CreatePost', ['Get*'])
// Returns: false (no match)

matchesPattern('GetUserById', ['Get*', 'Create*'])
// Returns: true (matches Get*)
```

### `parseGraphQLQuery(query: string)`
Parses a GraphQL query and returns metadata including operation name, type, and validity.

**Returns:**
```typescript
{
  operationName: string | null;
  type: 'query' | 'mutation' | 'subscription' | null;
  isValid: boolean;
}
```

**Example:**
```typescript
parseGraphQLQuery('query GetUser { user { id name } }')
// Returns: {
//   operationName: 'GetUser',
//   type: 'query',
//   isValid: true
// }
```

## Integration with Service Worker

The helper is integrated into `src/background/service-worker.ts` to:

1. **Parse FETCH requests** - Detects if a fetch contains a GraphQL query and extracts operation name
2. **Match against configured operations** - Compares extracted operation names against user-configured patterns
3. **Log detection results** - Provides detailed logging of operation detection and pattern matching

### Usage in Service Worker:
```typescript
import { getOperationName, matchesPattern } from "../utils/graphqlParser";

// When a FETCH_REQUEST is detected:
const operationName = getOperationName(body);
const shouldDebounce = config.graphqlOperations.length === 0 || 
  (operationName !== null && matchesPattern(operationName, config.graphqlOperations));

logger.info(`Fetch request detected`, {
  isGraphQL: isGraphQLRequest,
  operationName,
  shouldDebounce,
});
```

## User Configuration Examples

Users can configure debounce patterns in the popup settings:

```
GraphQL Operations to Debounce:
Get*
Create*
UpdateUser
DeletePost
```

This will match:
- `GetUser`, `GetPosts`, `GetComments` (Get*)
- `CreatePost`, `CreateUser` (Create*)
- `UpdateUser` (exact)
- `DeletePost` (exact)

Leaving the field empty debounces all GraphQL operations.

## Build Status
✅ All 4 helper functions compiled successfully
✅ Integrated with service worker message handlers
✅ Type-safe with TypeScript strict mode
✅ Zero external dependencies
✅ Comprehensive pattern matching with wildcards
