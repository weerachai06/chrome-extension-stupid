# Debounce Network Extension

A Chrome extension for debugging REST and GraphQL network requests with automatic request debouncing.

## Features

- **Request Capture**: Automatically capture and display REST and GraphQL requests
- **Debouncing**: Prevent duplicate requests within a configurable time window
- **Request Testing**: Built-in interface for testing REST and GraphQL endpoints
- **Request History**: View and manage history of captured requests
- **Storage**: Persist request logs in Chrome storage (up to 100 most recent requests)
- **Responsive UI**: Modern, Material Design-inspired popup interface
- **Multi-language Support**: Internationalization-ready structure

## Installation

1. Navigate to `chrome://extensions`
2. Enable "Developer mode" (top-right corner)
3. Click "Load unpacked"
4. Select the `dist` folder of this extension

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
cd extension
npm install
```

### Build

```bash
# Development build with source maps
npm run dev

# Production build (minified)
npm run build
```

### Structure

```
src/
├── background/        # Background service worker
├── popup/            # Popup UI (HTML, CSS, TypeScript)
├── content/          # Content script and injected script
└── utils/            # Shared utilities
    ├── restClient.ts        # REST API client
    ├── graphqlClient.ts     # GraphQL client
    ├── debounce.ts         # Debouncing logic
    ├── storage.ts          # Chrome storage utilities
    └── logger.ts           # Logging utility
```

## Usage

### Popup Interface

1. **Requests Tab**: View captured REST and GraphQL requests with their responses
2. **Test Tab**: Manually test REST and GraphQL endpoints
3. **Settings Tab**: Configure debounce delay and logging

### REST Requests

The extension automatically captures all REST requests made by the page. You can also manually test REST endpoints:

1. Go to the "Test" tab
2. Select HTTP method
3. Enter URL and optional body
4. Click "Send REST Request"

### GraphQL Requests

The extension automatically captures all GraphQL requests. Test GraphQL endpoints:

1. Go to the "Test" tab
2. Enter GraphQL endpoint URL
3. Enter GraphQL query
4. (Optional) Add variables as JSON
5. Click "Send GraphQL Request"

## API

### REST Client

```typescript
import { makeRestRequest } from './utils/restClient';

const response = await makeRestRequest({
  method: 'GET',
  url: 'https://api.example.com/users',
  headers: { 'Authorization': 'Bearer token' },
});
```

### GraphQL Client

```typescript
import { makeGraphQLRequest } from './utils/graphqlClient';

const result = await makeGraphQLRequest({
  url: 'https://api.example.com/graphql',
  query: 'query GetUser { user(id: 1) { id name } }',
  variables: { id: 1 },
});
```

### Debouncing

```typescript
import { debounceRequest } from './utils/debounce';

const result = await debounceRequest(
  'rest',
  'https://api.example.com/search',
  async () => fetchData(),
  300, // delay in ms
  'POST'
);
```

## Architecture

### Manifest V3 Compliance

This extension follows Chrome Extension Manifest V3 specifications:

- Service Worker for background script (no persistent background pages)
- Content Security Policy for security
- `host_permissions` for cross-origin requests
- `web_accessible_resources` for injected scripts

### Security

- Minimal permissions following principle of least privilege
- No inline scripts
- Secure message passing between components
- XSS prevention through HTML escaping
- CSRF protection through chrome.runtime.sendMessage

### Performance

- Debounced requests to prevent duplicate network calls
- Efficient storage management (max 100 requests)
- Lazy loading of components
- Optimized CSS and JavaScript

## Best Practices Implemented

Based on the Chrome Extension Development skill:

✅ Manifest V3 compliant
✅ TypeScript for type safety
✅ Service Worker architecture
✅ Content Security Policy
✅ Principle of least privilege permissions
✅ Async/Promise-based operations
✅ Proper error handling and logging
✅ Material Design UI
✅ Internationalization support
✅ Chrome DevTools integration ready

## Privacy

The extension:

- Does NOT collect or transmit user data to external servers
- Stores request history locally in Chrome storage only
- Does NOT modify page content
- Does NOT track user behavior

## License

MIT
# chrome-extension-stupid
