/**
 * Host-side entry for @moon16u/dsh-plugin-session-id.
 *
 * This plugin is UI-only: the session id is supplied by the DSH client
 * runtime, so the host half has no behavior. The empty apply exists so the
 * package appears in cordis.yml / the plugin loader and the browser bundle
 * can be discovered through exports["./client"].
 */
export function apply() {}
