document.addEventListener("DOMContentLoaded", () => {
  const websiteInput = document.getElementById("website-input");
  const addWebsiteBtn = document.getElementById("add-website");
  const websiteList = document.getElementById("website-list");
  const saveBtn = document.getElementById("save-settings");
  const status = document.getElementById("status");

  // Load saved settings
  chrome.storage.sync.get(["websites", "dailyLimit", "resetTime", "downtime"], (data) => {
    if (data.websites) {
      data.websites.forEach(site => addWebsiteToList(site));
    }
    if (data.dailyLimit) document.getElementById("daily-limit").value = data.dailyLimit;
    if (data.resetTime) document.getElementById("reset-time").value = data.resetTime;
    if (data.downtime) {
      document.getElementById("downtime-start").value = data.downtime.start;
      document.getElementById("downtime-end").value = data.downtime.end;
    }
  });

  addWebsiteBtn.addEventListener("click", () => {
    const site = websiteInput.value.trim();
    if (site) {
      addWebsiteToList(site);
      websiteInput.value = "";
    }
  });

  saveBtn.addEventListener("click", () => {
    const websites = Array.from(websiteList.querySelectorAll("li")).map(li => li.textContent);
    const dailyLimit = document.getElementById("daily-limit").value;
    const resetTime = document.getElementById("reset-time").value;
    const downtime = {
      start: document.getElementById("downtime-start").value,
      end: document.getElementById("downtime-end").value
    };

    chrome.storage.sync.set({ websites, dailyLimit, resetTime, downtime }, () => {
      status.textContent = "Settings saved!";
      setTimeout(() => status.textContent = "", 2000);
    });
  });

  function addWebsiteToList(site) {
    const li = document.createElement("li");
    li.textContent = site;
    websiteList.appendChild(li);
  }
});
