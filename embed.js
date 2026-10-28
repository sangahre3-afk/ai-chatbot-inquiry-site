/*
 * AI 상담 챗봇 + 상담 신청 폼 삽입 스크립트 (아임웹 등 어느 사이트에나)
 *
 *   <script src="https://sangahre3-afk.github.io/ai-chatbot-inquiry-site/embed.js"></script>
 *
 * - 스크립트를 넣은 자리에 상담 신청 폼이 들어가고, 화면 오른쪽 아래에 AI 상담 버튼이 고정된다.
 * - data-source="블로그" 처럼 붙이면 신청·상담 기록과 텔레그램 알림에 신청 경로로 표시된다 (없으면 "아임웹").
 * - widget.js 로 불러오면 챗봇 버튼만 넣는다 (embed.js 와 같은 파일, 빌드할 때 복사됨).
 * - data-form="off" 를 붙이면 챗봇 버튼만, data-chat="off" 를 붙이면 신청 폼만 넣는다.
 * - 내용과 디자인은 이 사이트에서 바뀌므로, 아임웹에 넣은 코드는 다시 고칠 필요가 없다.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var base = script.src.replace(/(embed|widget)\.js.*$/, "");
  var chatOnly = /widget\.js/.test(script.src);
  var origin = new URL(base).origin;
  var source = (script.getAttribute("data-source") || "아임웹").slice(0, 50);
  var query = "?source=" + encodeURIComponent(source);
  var BRAND = "#ec7a2d";
  var formFrame = null;

  if (!chatOnly && script.getAttribute("data-form") !== "off") {
    formFrame = document.createElement("iframe");
    formFrame.src = base + "form/" + query;
    formFrame.title = "상담 신청";
    formFrame.setAttribute("loading", "lazy");
    formFrame.style.cssText = "display:block;width:100%;height:1100px;border:0;background:transparent;overflow:hidden";
    formFrame.setAttribute("scrolling", "no");
    script.parentNode.insertBefore(formFrame, script);
  }

  var chat = null;
  if (script.getAttribute("data-chat") !== "off" && !window.__aiConsultChat) {
    window.__aiConsultChat = true;
    chat = createChat();
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== origin || !e.data || typeof e.data.type !== "string") return;
    if (e.data.type === "ai-consult:height" && formFrame && e.source === formFrame.contentWindow) {
      formFrame.style.height = Math.ceil(e.data.height) + "px";
    } else if (e.data.type === "ai-consult:close" && chat) {
      chat.close();
    } else if (e.data.type === "ai-consult:goto-form") {
      if (chat) chat.close();
      var target = formFrame || document.querySelector("iframe[src^='" + base + "form/']");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.open(base + query, "_blank", "noopener");
    }
  });

  function createChat() {
    var Z = 2147483000;
    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "AI 상담 열기");
    button.style.cssText =
      "position:fixed;right:20px;bottom:20px;z-index:" + Z + ";width:60px;height:60px;border:0;border-radius:50%;" +
      "background:" + BRAND + ";color:#fff;font-size:26px;line-height:60px;cursor:pointer;" +
      "box-shadow:0 6px 20px rgba(0,0,0,.2);padding:0";
    button.textContent = "💬";

    var panel = document.createElement("iframe");
    panel.title = "AI 상담";
    panel.style.cssText =
      "position:fixed;right:20px;bottom:92px;z-index:" + Z + ";width:380px;max-width:calc(100vw - 24px);" +
      "height:600px;max-height:calc(100vh - 120px);border:1px solid #e4e4e7;border-radius:16px;background:#fff;" +
      "box-shadow:0 12px 40px rgba(0,0,0,.18);display:none";

    var isOpen = false;
    function layout() {
      if (window.innerWidth < 480) {
        panel.style.right = "12px";
        panel.style.width = "calc(100vw - 24px)";
      } else {
        panel.style.right = "20px";
        panel.style.width = "380px";
      }
    }
    function open() {
      if (!panel.src) panel.src = base + "chat/" + query;
      layout();
      panel.style.display = "block";
      button.textContent = "✕";
      button.setAttribute("aria-label", "AI 상담 닫기");
      isOpen = true;
    }
    function close() {
      panel.style.display = "none";
      button.textContent = "💬";
      button.setAttribute("aria-label", "AI 상담 열기");
      isOpen = false;
    }
    button.addEventListener("click", function () {
      if (isOpen) close();
      else open();
    });
    window.addEventListener("resize", layout);

    function mount() {
      document.body.appendChild(panel);
      document.body.appendChild(button);
    }
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
    return { open: open, close: close };
  }
})();
