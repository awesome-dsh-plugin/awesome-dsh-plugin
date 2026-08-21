import { createUserMessage } from "@deepseek-ai/dsh-llm";

export const name = "dsh-current-time";

// Weekday names are indexed by Date#getDay (0 = Sunday) and written out here
// rather than read from a locale: DSH runs on hosts without zh_CN installed,
// where toLocaleDateString would silently fall back to English.
const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function pad(value) {
  return String(value).padStart(2, "0");
}

/**
 * Render the host's current wall-clock reading as one reminder line.
 *
 * Exported for tests: the reminder text is the plugin's whole contract with the
 * model, so its shape is worth asserting without driving a live agent step.
 */
export function formatCurrentTime(now = new Date()) {
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const weekday = WEEKDAYS[now.getDay()];

  // getTimezoneOffset is minutes *behind* UTC, so the sign flips for display.
  const offsetMinutes = -now.getTimezoneOffset();
  const sign = offsetMinutes < 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  const offset = `UTC${sign}${pad(Math.floor(absolute / 60))}${pad(absolute % 60)}`;

  let zone = "";
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    // A host without full ICU data still gets the numeric offset above.
    zone = "";
  }
  const where = zone ? `${offset}，${zone}` : offset;

  // The reminder is a durable message, so earlier turns keep their own stamps
  // in history. The closing sentence is what stops the model from reading a
  // stale one as "now".
  return `<system-reminder>当前时间：${date} ${weekday} ${time}（${where}）。这是本轮开始时的真实时刻，每轮自动刷新；请以最近的一条为准，不要根据对话历史推断当前日期或时间。</system-reminder>`;
}

function currentTimeMessage() {
  return createUserMessage({
    content: [{ type: "text", text: formatCurrentTime() }],
    source: { kind: "plugin", plugin: name },
  });
}

export function apply(ctx) {
  ctx.on("agent/pre-step", async ({ step }, next) => {
    const decision = await next();

    // One stamp per turn. `agent/pre-step` also fires for every later step of a
    // tool-call loop, and stamping those would bury the transcript in near
    // identical readings without telling the model anything new.
    if (step !== 1) return decision;

    // A rejected or empty first step is not entering a request, so there is
    // nothing for the reading to accompany.
    if (decision.kind !== "enter" || decision.messages.length === 0) return decision;

    // Append rather than splice: the reading belongs after the prompt it
    // describes, so the freshest timestamp is the last thing the model reads.
    return {
      kind: "enter",
      messages: [...decision.messages, currentTimeMessage()],
    };
  });
}
