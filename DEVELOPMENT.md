# Debounce Network Extension - Development Guide

## Overview

The Debounce Network extension is a Chrome extension built with Manifest V3 that provides advanced debugging capabilities for REST and GraphQL network requests. It includes automatic request debouncing to prevent duplicate calls.

## Quick Start

```bash
cd extension
npm install
npm run build
```

Then load the `dist` folder in Chrome via `chrome://extensions`.

## Architecture

### Core Components

#### 1. **Background Service Worker** (`src/background/service-worker.ts`)
- Handles message routing from the popup
- Manages REST and GraphQL request execution
- Persists request data to Chrome storage
- Implements debouncing logic

**Key Functions:**
- `handleMessage()` - Routes messages from popup
- `initializeExtension()` - Sets up listeners and alarms

#### 2. **Popup UI** (`src/popup/`)
- **popup.html** - Three-tab interface (Requests, Test, Settings)
- **popup.ts** - Event handling and DOM manipulation
- **popup.css** - Material Design styling

**Tabs:**
- **Requests**: View captured/sent requests with filtering
- **Test**: Manual testing interface for REST/GraphQL
- **Settings**: Debounce delay and logging configuration

#### 3. **Content Script** (`src/content/content.ts`)
- Runs in content script context
- Injects script into page context for network interception

#### 4. **Injected Script** (`src/content/inject.ts`)
- Runs in page context (can access `window.fetch` and `XMLHttpRequest`)
- Intercepts network requests and sends messages to content script
- Enables request monitoring without page modifications

#### 5. **Utilities**

**restClient.ts**
```typescript
- makeRestRequest(config) - Makes HTTP requests
- parseRestResponse(contentType, body) - Parses responses
```

**graphqlClient.ts**
```typescript
- makeGraphQLRequest(config) - Makes GraphQL requests
- extractOperationName(query) - Extracts operation name
- validateGraphQLQuery(query) - Validates query syntax
- formatGraphQLQuery(query) - Formats for display
```

**debounce.ts**
```typescript
- debounceRequest() - Debounces network requests
- cancelDebouncedRequest() - Cancels pending request
- getPendingRequestCount() - Check pending count
```

**storage.ts**
```typescript
- storeRequest() - Persist request to Chrome storage
- getStoredRequests() - Retrieve stored requests
- deleteRequest() - Delete specific request
- clearStoredRequests() - Clear all requests
```

**logger.ts**
```typescript
- logger.info/warn/error/debug() - Logging utility
```

## Message Protocol

### REST Request
```typescript
{
  type: 'make-rest-request',
  payload: {
    url: string,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    headers?: Record<string, string>,
    body?: string,
    useDebounce?: boolean
  }
}
```

### GraphQL Request
```typescript
{
  type: 'make-graphql-request',
  payload: {
    url: string,
    query: string,
    variables?: Record<string, any>,
    operationName?: string,
    headers?: Record<string, string>,
    useDebounce?: boolean
  }
}
```

## Configuration

### Manifest V3 Features

**Permissions:**
- `storage` - Access to Chrome storage API
- `alarms` - For periodic maintenance tasks
- `host_permissions` - `<all_urls>` for cross-origin requests

**Scripts:**
- Background Service Worker (MV3 requirement)
- Content script with injected script for network interception

**CSP Headers:**
- Prevents inline scripts
- Requires all resources from extension package

## Development Workflow

### Development Build
```bash
npm run dev
# Webpack watches for changes and rebuilds automatically
```

### Production Build
```bash
npm run build
# Minified output in dist/
```

### Adding New Features

1. **New REST endpoint test:** Add form fields in `popup.html` and handlers in `popup.ts`
2. **New GraphQL operation:** Extend `graphqlClient.ts` utilities
3. **New storage feature:** Add functions to `storage.ts`
4. **New background logic:** Add message handlers in `service-worker.ts`

### Testing Locally

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Go to `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `dist` folder

3. Test on a website with REST/GraphQL APIs:
   - Open extension popup
   - Use "Test" tab to send requests
   - Check "Requests" tab for captured requests

## Best Practices Implementation

### Security
✅ Manifest V3 compliant (no eval, no inline scripts)
✅ Content Security Policy headers
✅ XSS prevention through HTML escaping
✅ Secure message passing with `chrome.runtime.sendMessage`
✅ Minimal permissions (principle of least privilege)

### Performance
✅ Debounced requests prevent duplicate network calls
✅ Efficient storage management (max 100 requests)
✅ Lazy loading of popup components
✅ Service Worker (no persistent background page)
✅ Optimized CSS and bundle size

### Code Quality
✅ TypeScript for type safety
✅ ESLint configuration for code standards
✅ Modular architecture with clear separation of concerns
✅ Comprehensive error handling
✅ JSDoc comments for public APIs

### User Experience
✅ Material Design UI
✅ Responsive interface
✅ Toast notifications for feedback
✅ Keyboard shortcuts (Enter to send requests)
✅ Real-time request list updates

## Troubleshooting

### Extension Won't Load
- Verify `manifest.json` is in dist folder
- Check console for syntax errors in background script
- Ensure all referenced files exist in dist

### Requests Not Captured
- Verify content script is injected on target page
- Check browser console for content script errors
- Ensure host permissions include target domain

### Debounce Not Working
- Confirm `useDebounce: true` in message payload
- Check debounce delay setting (default 300ms)
- Verify identical URL and method for debouncing

## Extension APIs Used

- `chrome.runtime.onMessage` - Message passing
- `chrome.storage.local.get/set` - Data persistence
- `chrome.alarms.create/onAlarm` - Scheduled tasks
- `chrome.runtime.getURL` - Resource access
- `chrome.runtime.onInstalled` - Lifecycle events
- `Fetch API` - HTTP requests
- `XMLHttpRequest` - Request interception

## File Structure

```
extension/
├── public/
│   ├── manifest.json
│   ├── popup.html
│   ├── _locales/
│   │   └── en/
│   │       └── messages.json
│   └── images/
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── content/
│   │   ├── content.ts
│   │   └── inject.ts
│   └── utils/
│       ├── restClient.ts
│       ├── graphqlClient.ts
│       ├── debounce.ts
│       ├── storage.ts
│       └── logger.ts
├── dist/ (generated)
├── package.json
├── tsconfig.json
├── webpack.config.ts
├── .eslintrc.json
├── .gitignore
└── README.md
```

## Next Steps

- Add GraphQL introspection query helper
- Implement request filtering and search
- Add request export (JSON/HAR format)
- Create keyboard shortcuts
- Add dark mode support
- Implement request replay functionality
- Add performance analytics
