import { test } from "node:test";
import assert from "node:assert/strict";

test("host entry exports name/inject/apply", async () => {
  const mod = await import("../lib/index.js");
  assert.equal(mod.name, "web-search-tavily");
  assert.deepEqual(mod.inject, ["web"]);
  assert.equal(typeof mod.apply, "function");
});

function registerProvider(mod, config, get) {
  let provider;
  mod.apply({
    get,
    inject() {},
    web: {
      registerSearchProvider(registered) {
        provider = registered;
      },
    },
  }, config);
  assert.ok(provider, "Tavily provider registered");
  return provider;
}

test("credential service prefers the configured API key reference", async () => {
  const mod = await import("../lib/index.js");
  const resolved = [];
  const credentials = {
    async resolve(ref) {
      resolved.push(ref);
      return ref === "TAVILY_API_KEY" ? { value: "tavily-key" } : { value: "deepseek-key" };
    },
  };
  const provider = registerProvider(mod, { baseURL: "https://api.tavily.com" }, (name) => name === "credentials" ? credentials : void 0);

  assert.equal(await provider.resolveOptions().resolveApiKey(), "tavily-key");
  assert.deepEqual(resolved, ["TAVILY_API_KEY"]);
});

test("credential service falls back to DEEPSEEK_API_KEY", async () => {
  const mod = await import("../lib/index.js");
  const resolved = [];
  const credentials = {
    async resolve(ref) {
      resolved.push(ref);
      return ref === "TAVILY_API_KEY" ? { value: "" } : { value: "deepseek-key" };
    },
  };
  const provider = registerProvider(mod, { baseURL: "https://api.tavily.com" }, (name) => name === "credentials" ? credentials : void 0);

  assert.equal(await provider.resolveOptions().resolveApiKey(), "deepseek-key");
  assert.deepEqual(resolved, ["TAVILY_API_KEY", "DEEPSEEK_API_KEY"]);
});

test("launch environment falls back to DEEPSEEK_API_KEY", async () => {
  const mod = await import("../lib/index.js");
  const requested = [];
  const launchEnvironment = {
    get(ref) {
      requested.push(ref);
      return ref === "DEEPSEEK_API_KEY" ? { value: "deepseek-env-key" } : void 0;
    },
  };
  const provider = registerProvider(mod, { baseURL: "https://api.tavily.com" }, (name) => name === "launchEnvironment" ? launchEnvironment : void 0);

  assert.equal(await provider.resolveOptions().resolveApiKey(), "deepseek-env-key");
  assert.deepEqual(requested, ["TAVILY_API_KEY", "DEEPSEEK_API_KEY"]);
});

test("provider maps Tavily response into WebSearchResult", async () => {
  const mod = await import("../lib/index.js");
  const provider = new mod.TavilySearchProvider(() => ({
    apiKey: "test-key",
    baseURL: "https://api.tavily.com",
    searchDepth: "basic",
    maxResults: 5,
  }));
  assert.equal(provider.id, "tavily");
  assert.equal(provider.available(), true);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://api.tavily.com/search");
    assert.equal(init.method, "POST");
    assert.equal(init.headers.authorization, "Bearer test-key");
    assert.equal(JSON.parse(init.body).query, "hello");
    return new Response(JSON.stringify({
      answer: "summary",
      results: [
        { url: "https://example.com", title: "Example", content: "snippet", published_date: "2026-01-01" },
        { url: "https://example.com", title: "Duplicate", content: "dup" },
      ],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const result = await provider.search({ query: "hello", maxResults: 5 });
    assert.equal(result.content, "summary");
    assert.equal(result.sources.length, 1);
    assert.equal(result.sources[0].url, "https://example.com");
    assert.equal(result.sources[0].title, "Example");
    assert.equal(result.sources[0].snippet, "snippet");
    assert.equal(result.sources[0].publishedAt, "2026-01-01");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
