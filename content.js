// Content script for Vase
// Injects overlay when background.js tells us to block a site

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "SHOW_OVERLAY") {
    showOverlay(request.message);
  }
});

function showOverlay(message) {
  // Remove any existing overlay
  const existing = document.getElementById("vase-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "vase-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(255,255,255,0.95)";
  overlay.style.zIndex = "999999";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.fontFamily = "system-ui, sans-serif";

  overlay.innerHTML = `
    <img src="${chrome.runtime.getURL("vase.png")}" 
         alt="Vase" 
         style="width:120px;height:120px;margin-bottom:20px;animation: breathe 3s infinite;">
    <p style="font-size:18px;color:#333;text-align:center;max-width:400px;">${message}</p>
  `;

  document.body.innerHTML = "";
  document.body.appendChild(overlay);

  // Add breathing animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes breathe {
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }
  `;
  document.head.appendChild(style);
}
