window.__ModuleLoader__.load({
  id: "@moon16u/dsh-pocket",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");
    var IconCopyOutline16 = require("@deepseek-ai/dsh-client-ui-primitives").IconCopyOutline16;
    var IconCheckOutline16 = require("@deepseek-ai/dsh-client-ui-primitives").IconCheckOutline16;

    var NS = "session-id";

    var zh = {
      "label": "Session ID",
      "copy": "复制会话 ID",
      "copied": "已复制",
      "copyFailed": "复制失败",
    };

    var en = {
      "label": "Session ID",
      "copy": "Copy session ID",
      "copied": "Copied",
      "copyFailed": "Copy failed",
    };

    var css = ".dsh-session-id-copy{border:1px solid var(--dsw-alias-border-l2);min-width:111px;height:32px;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);cursor:pointer;background:0 0;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:400;line-height:20px;display:inline-flex}.dsh-session-id-copy:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dsh-session-id-copy:disabled{color:var(--dsw-alias-label-dimmed);cursor:wait}.dsh-session-id-copy span,.dsh-session-id-copy svg{flex:none}.dsh-session-id-copy span{white-space:nowrap}";

    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"@moon16u/dsh-pocket/SessionIdAction.module.css\"]") === null) {
      var tag = document.createElement("style");
      tag.dataset.plugin = "@moon16u/dsh-pocket";
      tag.dataset.pluginCss = "@moon16u/dsh-pocket/SessionIdAction.module.css";
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    function SessionIdAction(props) {
      var sessionId = props.sessionId;
      var t = props.t;
      var useState = React.useState, useRef = React.useRef;
      var copiedState = useState(false), copied = copiedState[0], setCopied = copiedState[1];
      var timerRef = useRef(null);

      function resetTimer() {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }

      function cleanup() {
        resetTimer();
      }

      React.useEffect(function () {
        return cleanup;
      }, []);

      async function copy() {
        var text = String(sessionId);
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
          } else {
            var textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            var ok = document.execCommand("copy");
            textarea.remove();
            if (!ok) throw new Error("execCommand copy failed");
          }
          setCopied(true);
          resetTimer();
          timerRef.current = setTimeout(function () { setCopied(false); }, 2000);
        } catch (e) {
          setCopied(false);
          console.error("[dsh-session-id] copy failed", e);
        }
      }

      return React.createElement("button", {
        type: "button",
        "data-session-id-copy": "",
        "aria-label": copied ? t("copied") : t("copy"),
        title: copied ? t("copied") : t("copy"),
        className: "dsh-session-id-copy",
        onClick: copy,
      },
        React.createElement("span", null, t("label")),
        copied ? React.createElement(IconCheckOutline16, { size: 12 }) : React.createElement(IconCopyOutline16, { size: 12 }));
    }

    var inject = ["slots", "locale"];

    function apply(ctx) {
      ctx.effect(function () {
        return ctx.locale.register(NS, { zh: zh, en: en });
      }, "dsh-session-id: dictionaries");

      ctx.slots.inject("conversation.session.header.utilities", function () {
        return ctx.slots.register({
          name: "conversation.session.header.utilities",
          id: "dsh-session-id",
          order: -1,
          locale: NS,
        }, SessionIdAction);
      });
    }

    exports.SessionIdAction = SessionIdAction;
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
