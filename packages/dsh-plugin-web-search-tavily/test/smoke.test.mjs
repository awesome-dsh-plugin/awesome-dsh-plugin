import { test } from "node:test";
import assert from "node:assert/strict";

test("host entry exports name/inject/apply", async () => {
  const mod = await import("../lib/index.js");
  assert.equal(mod.name, "web-search-tavily");
  assert.deepEqual(mod.inject, ["web"]);
  assert.equal(typeof mod.apply, "function");
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
