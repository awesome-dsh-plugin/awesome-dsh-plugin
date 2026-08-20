import * as restart from "../packages/dsh-plugin-restart/lib/index.js";
import * as sessionId from "../packages/dsh-plugin-session-id/lib/index.js";
import * as tavily from "../packages/dsh-plugin-web-search-tavily/lib/index.js";

export function apply(ctx, config) {
  ctx.plugin(sessionId);
  ctx.plugin(restart);
  ctx.plugin(tavily, config);
}

export * from "../packages/dsh-plugin-web-search-tavily/lib/index.js";
