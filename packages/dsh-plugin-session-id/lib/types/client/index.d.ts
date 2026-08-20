import type { PropsLocale, PropsRuntime } from "@deepseek-ai/dsh-client-ui-slots";

export declare const inject: string[];
export declare function apply(ctx: import("@deepseek-ai/dsh-client-runtime/client").ClientContext): void;

export interface SessionIdActionProps extends PropsRuntime<"conversation.session.header.utilities">, PropsLocale<typeof import("./locales").NS> {}

export declare function SessionIdAction(props: SessionIdActionProps): import("react").JSX.Element;
