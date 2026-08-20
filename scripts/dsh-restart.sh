#!/usr/bin/env bash
# ============================================================================
# ⚠️  dsh-restart.sh  —  MUST BE RUN FROM AN EXTERNAL SHELL, NOT INSIDE DSH  ⚠️
# ============================================================================
# This script restarts the DSH web process by killing it and starting a new
# one. If you run it from inside a DSH session (Agent bash tool), it kills the
# very process executing the command before the tool result is durably saved,
# which leaves the conversation stuck / unresponsive.
#
# Correct usage:
#   1. In a normal terminal OUTSIDE DSH:
#        bash ~/dsh-pouch/scripts/dsh-restart.sh          # prod
#        bash ~/dsh-pouch/scripts/dsh-restart.sh dev      # dev
#   2. From inside DSH, use the safe interfaces instead:
#        /dsh-restart                     (command, fixed 3s delay)
#        dsh_restart                      (agent tool, fixed 3s delay)
#   3. If you are inside DSH but must call this script directly, strip the
#      DSH shell marker so it runs as an external command (add a delay so the
#      tool result can be saved first):
#        env -u DSH_SHELL DSH_RESTART_ALLOWED=1 \
#          bash ~/dsh-pouch/scripts/dsh-restart.sh --delay 3000
#
# The first invocation spawns a detached worker (setsid + nohup) and returns
# immediately. The worker performs the kill/start sequence and writes progress
# to ~/.dsh/dsh-restart.log (prod) or ~/.dsh-dev/dsh-restart.log (dev).
#
# Usage:
#   dsh-restart.sh                # production: dsh --profile web (default port 3080)
#   dsh-restart.sh dev            # dev: DSH_HOME=~/.dsh-dev dsh web --port 18888
#   dsh-restart.sh --port 8080    # production on another port
#   dsh-restart.sh --explain      # print environment/usage guidance and exit
# ============================================================================
set -euo pipefail

# --explain: print the guidance embedded above and exit without doing anything.
if [[ "${1:-}" == "--explain" ]]; then
  sed -n '2,27p' "$0"
  exit 0
fi

# Refuse to run the restart launcher directly from inside a DSH shell.
# A direct bash tool call would kill the very DSH process that is executing
# this command before the tool result is durably recorded, leaving the
# conversation stuck with an unresolved tool call in the UI.
# The /dsh-restart command and dsh_restart tool schedule a detached helper
# with DSH_RESTART_ALLOWED=1, so they are still permitted.
if [[ "${DSH_RESTART_ALLOWED:-}" != "1" && -n "${DSH_SHELL:-}" ]]; then
  echo "error: refusing to restart DSH from inside a DSH session" >&2
  echo >&2
  echo "This script must run in an EXTERNAL shell. Inside DSH, use:" >&2
  echo "  /dsh-restart          (command, fixed 3s delay)" >&2
  echo "  dsh_restart           (agent tool, fixed 3s delay)" >&2
  echo >&2
  echo "If you intentionally want to call this script from the current bash" >&2
  echo "tool, strip the DSH marker and allow it (add a delay so the tool" >&2
  echo "result is saved before DSH restarts):" >&2
  echo "  env -u DSH_SHELL DSH_RESTART_ALLOWED=1 \\" >&2
  echo "    bash '$0' --delay 3000" >&2
  echo >&2
  echo "Run 'bash $0 --explain' for the full usage banner." >&2
  exit 1
fi

if [[ "${DSH_RESTART_DETACHED:-}" != "1" ]]; then
  # --- launcher mode: re-exec self as a detached worker and return ---
  MODE="${1:-prod}"
  if [[ "$MODE" == "dev" ]]; then
    PROFILE_HOME="$HOME/.dsh-dev"
  else
    PROFILE_HOME="$HOME/.dsh"
  fi
  LOG="$PROFILE_HOME/dsh-restart.log"
  mkdir -p "$PROFILE_HOME"
  : > "$LOG"
  nohup setsid env DSH_RESTART_DETACHED=1 bash "$0" "$@" >>"$LOG" 2>&1 < /dev/null &
  echo "dsh-restart worker launched (pid $!), see $LOG"
  exit 0
fi

# --- worker mode: this process is already detached, do the real work ---
# Normalize arguments so --delay/--port can appear before or after mode.
ARGS=("$@")
DELAY_MS=0
MODE="prod"
PORT_ARG=""
EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --delay)
      DELAY_MS="${2:-0}"
      shift 2
      ;;
    --port)
      PORT_ARG="$2"
      shift 2
      ;;
    dev)
      MODE="dev"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

if [[ "$MODE" == "dev" ]]; then
  EXTRA_ARGS=(--port 18888)
  PROFILE_HOME="$HOME/.dsh-dev"
  PROFILE_DIR="$PROFILE_HOME/profiles/web"
  PORT=18888
else
  PROFILE_HOME="$HOME/.dsh"
  PROFILE_DIR="$PROFILE_HOME/profiles/web"
  PORT=3080
  if [[ -n "$PORT_ARG" ]]; then
    PORT="$PORT_ARG"
    EXTRA_ARGS=(--port "$PORT_ARG")
  fi
fi

if [[ "$DELAY_MS" -gt 0 ]]; then
  echo "waiting ${DELAY_MS}ms before restart"
  sleep "$(awk "BEGIN { print $DELAY_MS / 1000 }")"
fi

if [[ ! -d "$PROFILE_DIR" ]]; then
  echo "error: profile directory not found: $PROFILE_DIR" >&2
  exit 1
fi

echo "=== dsh-restart worker $(date '+%F %T') ==="
echo "mode: $MODE  profile: $PROFILE_HOME  port: $PORT"

# Find the currently running DSH web process bound to the target profile.
PIDS=""
if [[ "$MODE" == "dev" ]]; then
  PIDS=$(pgrep -f 'dsh web --port 18888' || true)
else
  PIDS=$(pgrep -f 'dsh --profile web' || true)
fi

if [[ -n "$PIDS" ]]; then
  echo "stopping DSH: $PIDS"
  kill $PIDS 2>/dev/null || true
  # Wait for the old process(es) to exit and release the port.
  for _ in $(seq 1 50); do
    ALIVE=0
    for pid in $PIDS; do
      if kill -0 "$pid" 2>/dev/null; then ALIVE=1; fi
    done
    if [[ "$ALIVE" == "0" ]]; then break; fi
    sleep 0.2
  done
  sleep 1
else
  echo "no existing DSH process found, starting fresh"
fi

# Make Node's built-in fetch honor HTTP(S)_PROXY/NO_PROXY. This is required
# for providers such as Google Gemini that are only reachable through the
# local proxy (e.g. 127.0.0.1:10808). Node's fetch does not read proxy env
# vars unless --use-env-proxy is enabled.
if [[ -z "${NODE_OPTIONS:-}" ]]; then
  export NODE_OPTIONS="--use-env-proxy"
else
  case " $NODE_OPTIONS " in
    *" --use-env-proxy "*) : ;;
    *) export NODE_OPTIONS="$NODE_OPTIONS --use-env-proxy" ;;
  esac
fi

echo "starting DSH ($MODE)  NODE_OPTIONS=$NODE_OPTIONS"
DSH_EXEC="${DSH_BIN:-$(which dsh 2>/dev/null || echo "$HOME/node/bin/dsh")}"
if [[ "$MODE" == "dev" ]]; then
  cd "${DSH_WORKSPACE:-$PWD}"
  DSH_HOME="$PROFILE_HOME" \
  nohup setsid "$DSH_EXEC" web "${EXTRA_ARGS[@]}" >>"$PROFILE_HOME/dsh-web.out.log" 2>&1 < /dev/null &
else
  cd "${DSH_WORKSPACE:-$HOME}"
  DSH_HOME="$PROFILE_HOME" \
  nohup setsid "$DSH_EXEC" --profile web "${EXTRA_ARGS[@]}" >>"$PROFILE_HOME/dsh-web.out.log" 2>&1 < /dev/null &
fi

NEW_PID=$!
echo "launched pid: $NEW_PID"
echo "$NEW_PID" > "$PROFILE_HOME/dsh-restart.pid"

# Wait until the web server responds.
for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then
    echo "DSH is up at http://127.0.0.1:$PORT/"
    exit 0
  fi
  if ! kill -0 "$NEW_PID" 2>/dev/null; then
    echo "error: DSH exited during startup, see $PROFILE_HOME/dsh-web.out.log" >&2
    tail -50 "$PROFILE_HOME/dsh-web.out.log" >&2 || true
    exit 1
  fi
  sleep 0.5
done
echo "error: DSH did not become ready within 30s" >&2
tail -50 "$PROFILE_HOME/dsh-web.out.log" >&2 || true
exit 1
