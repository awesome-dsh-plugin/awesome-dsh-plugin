# @moon16u/dsh-plugin-web-search-tavily

Tavily-backed web search provider for the DeepSeek Harness capability seam (`ctx.web`).

## Features
- Implements official `ctx.web.registerSearchProvider`.
- Secure credential resolution via `TAVILY_API_KEY` environment variable or DSH Credentials service.
- Full support for search depth, max results, and answer synthesis mapping.

## Installation
```bash
cd ~/.dsh/profiles/web
pnpm add file:<path-to-dsh-pouch>/packages/dsh-plugin-web-search-tavily
```

## Configuration (cordis.patch.yml)
```yaml
- id: web
  config:
    searchProvider: tavily
- insert:
    - id: web-search-tavily
      name: '@moon16u/dsh-plugin-web-search-tavily'
      config:
        apiKeyEnv: TAVILY_API_KEY
        baseURL: https://api.tavily.com/search
        searchDepth: basic
        maxResults: 5
```
