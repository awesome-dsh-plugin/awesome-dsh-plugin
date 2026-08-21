export declare const name = "dsh-current-time";
/**
 * Render the host's current wall-clock reading as one `<system-reminder>` line.
 * @param now - clock reading to render; defaults to the current time.
 */
export declare function formatCurrentTime(now?: Date): string;
export declare function apply(ctx: import("@deepseek-ai/cordis").Context): void;
