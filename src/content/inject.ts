/**
 * Injected script that runs in page context
 * Intercepts fetch and XMLHttpRequest
 */

import { getOperationName } from "../utils/graphqlParser";
import { DebounceSettings } from "../utils/storage";

// Store original functions
const originalFetch = window.fetch;
const OriginalXHR = window.XMLHttpRequest;
let debounceSettings: { settings: DebounceSettings } | null = null;

window.postMessage(
  {
    type: "GET_SETTINGS",
  },
  "*",
);

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const message = event.data;

  if (message.type === "SETTINGS_RESPONSE") {
    debounceSettings = message.payload;
  }
});

function configureFetchOptions({
  url,
  body,
}: {
  body: RequestInit["body"];
  url: string;
}) {
  const settings = debounceSettings?.settings;
  const operationName = getOperationName(body as string);

  const shouldDebounce =
    settings?.restUrls.some((v) => {
      return url.includes(v);
    }) || settings?.graphqlOperations?.includes(operationName || "");

  return {
    shouldDebounce,
    debounceDelay: settings?.debounceDelay || 0,
  };
}

window.fetch = function (
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  const url =
    typeof args[0] === "string" ? args[0] : (args[0] as Request).url || "";
  const init = args[1] || {};

  // Return a Promise that handles async logic internally
  return (async () => {
    try {
      const { debounceDelay, shouldDebounce } = configureFetchOptions({
        url,
        body: init.body,
      });

      if (!shouldDebounce) {
        return originalFetch.apply(this, args);
      }

      if (debounceDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, debounceDelay));
      }

      console.log(`[Debounce] Fetching ${url} with delay ${debounceDelay}ms`);

      return originalFetch.apply(this, args);
    } catch (error) {
      console.error("[Debounce] Fetch error:", error);
      return originalFetch.apply(this, args);
    }
  })();
};

/**
 * Intercept XMLHttpRequest
 */
window.XMLHttpRequest = class extends OriginalXHR {
  open(method: string, url: string | URL, ...rest: unknown[]): void {
    this._url = String(url);
    this._method = method.toUpperCase();
    super.open(method, url, ...(rest as []));
  }

  async send(body?: Document | XMLHttpRequestBodyInit | null): Promise<void> {
    try {
      const { debounceDelay, shouldDebounce } = configureFetchOptions({
        url: String(this._url),
        body: body ? String(body) : undefined,
      });

      if (!shouldDebounce) {
        super.send(body);
        return;
      }

      if (debounceDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, debounceDelay));
      }

      console.log(
        `[Debounce] XHR ${this._method} ${this._url} with delay ${debounceDelay}ms`,
      );

      super.send(body);
    } catch (error) {
      console.error("[Debounce] XHR error:", error);
      super.send(body);
    }
  }

  private _url?: string;
  private _method?: string;
} as unknown as typeof XMLHttpRequest;

// Make fetch and XMLHttpRequest non-enumerable
Object.defineProperty(window, "fetch", {
  value: window.fetch,
  writable: true,
  configurable: true,
});

Object.defineProperty(window, "XMLHttpRequest", {
  value: window.XMLHttpRequest,
  writable: true,
  configurable: true,
});
