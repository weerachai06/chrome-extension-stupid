# Debounce Network Extension - Popup Testing Guide

## Build Status
✅ **Build Successful** - webpack compiled successfully with 0 errors

## Extension Files Verified
- ✅ dist/manifest.json (964 bytes)
- ✅ dist/popup.html (4977 bytes) - Valid HTML with proper structure
- ✅ dist/popup.css (9377 bytes) - All styling loaded
- ✅ dist/popup.js (21236 bytes) - Compiled TypeScript
- ✅ dist/background.js (20640 bytes) - Service worker
- ✅ dist/content.js (1465 bytes) - Content script
- ✅ dist/inject.js (1980 bytes) - Injected script
- ✅ dist/images/ - All 3 icons (16x16, 48x48, 128x128)

## HTML Structure Validation
✅ 15 element IDs present in popup.html:
- Tab IDs: requests, api, settings
- Control IDs: clearBtn, requestsContainer, restUrl, restMethod, restBody, sendRestBtn
- GraphQL IDs: graphqlUrl, graphqlQuery, sendGraphQLBtn
- Settings IDs: debounceDelay, enableLogging, saveSettingsBtn

## TypeScript Fixes Applied
✅ Removed 2 references to non-existent `graphqlVariablesTextarea`:
  - Line 231: Removed `const variablesStr = graphqlVariablesTextarea.value.trim();`
  - Line 277: Removed `graphqlVariablesTextarea.value = "";`
✅ Removed unused `variables` handling code (8 lines)
✅ Updated GraphQL payload to not include undefined variables field

## How to Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to: `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

2. **Load Unpacked Extension**
   - Click "Load unpacked"
   - Select: `/Users/weerachaiplodkaew/Documents/projects/debounce-network/dist`
   - Extension should appear in the list with icon

3. **Test Popup**
   - Click extension icon in Chrome toolbar
   - Popup should display with 3 tabs:
     - 📊 Requests (shows network requests)
     - 🔗 API (REST and GraphQL sender)
     - ⚙️ Settings (extension configuration)

## Debug Logs to Check

Open Chrome DevTools (`F12`) and check the Console for:
- Popup script initialization: `[Popup Init]` messages
- DOM element checks: Missing element warnings
- Network request captures

## Expected Behavior

### Requests Tab
- Shows captured network requests
- Clear button to remove all requests

### API Tab
- **REST Section:**
  - URL input
  - Method dropdown (GET, POST, etc.)
  - Body textarea for request body
  - Send button
  
- **GraphQL Section:**
  - URL input
  - Query textarea
  - Send button
  - Note: Variables field removed (not in current UI)

### Settings Tab
- Debounce delay input (milliseconds)
- Enable logging checkbox
- Save Settings button

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Extension doesn't load | Check dist/manifest.json is valid JSON |
| Popup blank | Check dist/popup.html in browser console |
| No network requests shown | Enable logging in Settings tab |
| Click events not working | Check console for `[Popup Init]` debug messages |

## Files to Monitor
- `dist/popup.js` - Main popup script (updated on build)
- `dist/popup.html` - UI template
- `dist/popup.css` - Styling

## Next Steps
1. Load extension in Chrome using steps above
2. Right-click extension icon → "Inspect popup"
3. Check Console tab for debug messages
4. Test each tab's functionality
5. Verify no errors in DevTools console
