// Background service worker for Vase
// Tracks website usage, enforces time limits, and downtime rules

let activeTabId = null;
let startTime = null;

// Listen for tab activation
chrome.tabs.onActivated.addListener(activeInfo => {
  if (activeTabId !== null && startTime !== null) {
    logTime(activeTabId);
  }
  activeTabId = activeInfo.tabId;
  startTime = Date.now();
});

// Listen for tab updates (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    activeTabId = tabId;
    startTime = Date.now();
    checkRules(tab.url);
  }
});

// When tab is closed
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === activeTabId && startTime !== null) {
    logTime(tabId);
    activeTabId = null;
    startTime = null;
  }
});

// Log time spent on a tab
function logTime(tabId) {
  const duration = Math.floor((Date.now() - startTime) / 1000); // seconds
  chrome.tabs.get(tabId, tab => {
    if (chrome.runtime.lastError || !tab || !tab.url) return;
    const domain = extractDomain(tab.url);

    chrome.storage.sync.get(["usage"], data => {
      const usage = data.usage || {};
      usage[domain] = (usage[domain] || 0) + duration;
      chrome.storage.sync.set({ usage });
    });
  });
}

// Check rules for a given URL
function checkRules(url) {
  const domain = extractDomain(url);

  chrome.storage.sync.get(["websites", "dailyLimit", "resetTime", "downtime", "usage"], data => {
    if (!data.websites || !data.websites.includes(domain)) return;

    const usage = data.usage || {};
    const usedSeconds = usage[domain] || 0;
    const dailyLimit = parseInt(data.dailyLimit || "0", 10) * 60; // minutes → seconds

    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5); // HH:MM

    const downtime = data.downtime || { start: "", end: "" };
    const inDowntime = downtime.start && downtime.end &&
      currentTime >= downtime.start && currentTime < downtime.end;

    if (dailyLimit && usedSeconds >= dailyLimit) {
      injectOverlay(domain, "limit");
    } else if (inDowntime) {
      injectOverlay(domain, "downtime", downtime.end);
    }
  });
}

// Inject overlay into the page
function injectOverlay(domain, type, downtimeEnd = null) {
  let message = "";
  if (type === "limit") {
    message = "You exceeded your time limit. Try to use TIMEYOUCANUSE, but not during DOWNTIME.";
  } else if (type === "downtime") {
    message = `Take a moment, it's downtime. Use this website at ${downtimeEnd}.`;
  }

  chrome.scripting.executeScript({
    target: { tabId: activeTabId },
    func: (msg) => {
      const overlay = document.createElement("div");
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
      overlay.innerHTML = `
        <img src="${chrome.runtime.getURL("vase.png")}" style="width:120px;height:120px;margin-bottom:20px;">
        <p style="font-size:18px;color:#333;text-align:center;max-width:400px;">${msg}</p>
      `;
      document.body.innerHTML = "";
      document.body.appendChild(overlay);
    },
    args: [message]
  });
}

// Helper: extract domain from URL
function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}
