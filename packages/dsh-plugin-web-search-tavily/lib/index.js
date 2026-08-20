import z from "@deepseek-ai/schemastery";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { WebError } from "@deepseek-ai/dsh-web";

const PROVIDER_ID = "tavily";
const DEFAULT_BASE_URL = "https://api.tavily.com";
const DEFAULT_API_KEY_ENV = "TAVILY_API_KEY";
const DEFAULT_SEARCH_DEPTH = "basic";
const DEFAULT_MAX_RESULTS = 5;
const USER_AGENT = "deepseek-harness/0.1.0 (tavily web search provider)";

const name = "web-search-tavily";
const inject = ["web"];

const Config = z.object({
  apiKey: z.string().role("secret"),
  apiKeyEnv: z.string().role("credential-ref").default(DEFAULT_API_KEY_ENV),
  baseURL: z.string(),
  searchDepth: z.union([z.const("basic"), z.const("advanced"), z.const("fast"), z.const("ultra-fast")]).default(DEFAULT_SEARCH_DEPTH),
  maxResults: z.number().step(1).min(1).max(20).default(DEFAULT_MAX_RESULTS),
});

const SEARCH_BASE_URL_ENV = "TAVILY_SEARCH_BASE_URL";
const WEB_SEARCH_TAVILY_SETTINGS_NAMESPACE = settingsNamespace("web-search-tavily");

function resolveOptions(ctx, config) {
  const apiKeyEnv = credentialRef(config.apiKeyEnv ?? DEFAULT_API_KEY_ENV);
  const literalApiKey = config.apiKey !== void 0 && config.apiKey.length > 0 ? config.apiKey : void 0;
  return {
    ...(literalApiKey !== void 0 ? { apiKey: literalApiKey } : {}),
    resolveApiKey: async () => {
      const credentials = ctx.get("credentials");
      if (credentials !== void 0) return (await credentials.resolve(apiKeyEnv))?.value;
      const ambient = launchEnvironmentOf(ctx).get(apiKeyEnv);
      return ambient !== void 0 && ambient.value.length > 0 ? ambient.value : void 0;
    },
    apiKeyEnv,
    baseURL: config.baseURL ?? launchEnvironmentOf(ctx).get(SEARCH_BASE_URL_ENV)?.value ?? DEFAULT_BASE_URL,
    searchDepth: config.searchDepth ?? DEFAULT_SEARCH_DEPTH,
    maxResults: config.maxResults ?? DEFAULT_MAX_RESULTS,
  };
}

class TavilySearchProvider {
  constructor(resolveOptions) {
    this.id = PROVIDER_ID;
    this.resolveOptions = resolveOptions;
  }

  available() {
    const options = this.resolveOptions();
    return ((options.apiKey?.length ?? 0) > 0 || options.resolveApiKey !== void 0) && URL.canParse(options.baseURL);
  }

  async search(request, signal) {
    const options = this.resolveOptions();
    const apiKey = await this.apiKey(options, signal);
    throwIfAborted(signal);

    const base = options.baseURL.replace(/\/+$/, "");
    const url = new URL(base.endsWith("/search") ? base : base + "/search");
    const body = {
      query: request.query,
      search_depth: options.searchDepth,
      max_results: request.maxResults ?? options.maxResults,
      include_answer: true,
      include_raw_content: false,
    };

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        redirect: "error",
        headers: {
          "authorization": `Bearer ${apiKey}`,
          "content-type": "application/json",
          "accept": "application/json",
          "user-agent": USER_AGENT,
        },
        body: JSON.stringify(body),
        ...(signal !== void 0 ? { signal } : {}),
      });
    } catch (error) {
      if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
      throw new WebError(`Tavily search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
    }

    if (!response.ok) {
      let message = `Tavily API error (HTTP ${response.status})`;
      try {
        const parsed = await response.json();
        const detail = typeof parsed.error === "string" ? parsed.error : parsed.error?.message ?? parsed.message;
        if (detail !== void 0 && detail.length > 0) message = detail;
      } catch (error) {
        if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
      }
      throw new WebError(message, "WEB_PROVIDER_ERROR");
    }

    try {
      return mapTavilyResponse(await response.json());
    } catch (error) {
      if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
      if (error instanceof WebError) throw error;
      throw new WebError(`Tavily returned an unprocessable response body: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
    }
  }

  async apiKey(options, signal) {
    throwIfAborted(signal);
    if (options.apiKey !== void 0 && options.apiKey.length > 0) return options.apiKey;
    let resolved;
    try {
      resolved = await abortable(options.resolveApiKey?.() ?? Promise.resolve(void 0), signal);
    } catch (error) {
      if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
      throw new WebError(`Tavily search credential resolution failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
    }
    if (resolved !== void 0 && resolved.length > 0) return resolved;
    throw new WebError(`Tavily search has no API key for "${options.apiKeyEnv ?? DEFAULT_API_KEY_ENV}"; store it through the credentials service, export it in the launching environment, or set a literal "apiKey" in the web-search-tavily config`, "WEB_PROVIDER_CREDENTIAL_MISSING");
  }
}

function mapTavilyResponse(data) {
  if (!data || !Array.isArray(data.results)) {
    throw new WebError("Tavily returned no results array", "WEB_PROVIDER_ERROR");
  }
  const sources = [];
  const seen = new Set();
  for (const item of data.results) {
    const url = typeof item.url === "string" ? item.url : "";
    if (url.length === 0 || seen.has(url)) continue;
    seen.add(url);
    sources.push({
      url,
      ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
      ...(typeof item.content === "string" && item.content.length > 0 ? { snippet: item.content } : {}),
      ...(typeof item.published_date === "string" && item.published_date.length > 0 ? { publishedAt: item.published_date } : {}),
    });
  }
  const content = typeof data.answer === "string" && data.answer.length > 0 ? data.answer : void 0;
  return {
    ...(content !== void 0 ? { content } : {}),
    sources,
    truncated: false,
  };
}

function abortable(operation, signal) {
  if (signal === void 0) return operation;
  if (signal.aborted) return Promise.reject(aborted(signal));
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(aborted(signal));
    signal.addEventListener("abort", onAbort, { once: true });
    operation.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(new Error(String(error).replace(/^Error: /u, ""), { cause: error }));
      }
    );
  });
}

function throwIfAborted(signal) {
  if (signal?.aborted === true) throw aborted(signal);
}

function aborted(signal, fallback) {
  return new WebError("Tavily search aborted", "WEB_ABORTED", { cause: signal?.aborted === true ? signal.reason : fallback });
}

function isAbortError(error) {
  return error instanceof DOMException && error.name === "AbortError";
}

function apply(ctx, config) {
  let current = () => config;
  installSettingsSection(ctx, WEB_SEARCH_TAVILY_SETTINGS_NAMESPACE, Config, config, {
    setSource: (source) => {
      current = source;
    },
    onChange: () => {},
  });
  ctx.web.registerSearchProvider(new TavilySearchProvider(() => resolveOptions(ctx, current())));
}

export { Config, PROVIDER_ID, TavilySearchProvider, WEB_SEARCH_TAVILY_SETTINGS_NAMESPACE, apply, inject, name };
