document.addEventListener("DOMContentLoaded", () => {
  const websiteList = document.getElementById("websiteList");
  const addButton = document.getElementById("addWebsite");

  // Load existing websites
  chrome.storage.sync.get(["websites"], data => {
    const websites = data.websites || [];
    websites.forEach(domain => addWebsiteRow(domain));
  });

  // Add new website
  addButton.addEventListener("click", () => {
    const input = document.getElementById("websiteInput");
    const domain = input.value.trim();
    if (!domain) return;

    chrome.storage.sync.get(["websites"], data => {
      const websites = data.websites || [];
      if (!websites.includes(domain)) {
        websites.push(domain);
        chrome.storage.sync.set({ websites }, () => {
          addWebsiteRow(domain);
          input.value = "";
        });
      }
    });
  });

  // Helper: add row with remove button
  function addWebsiteRow(domain) {
    const row = document.createElement("li");
    row.textContent = domain;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginLeft = "10px";
    removeBtn.addEventListener("click", () => {
      chrome.storage.sync.get(["websites"], data => {
        let websites = data.websites || [];
        websites = websites.filter(d => d !== domain);
        chrome.storage.sync.set({ websites }, () => {
          row.remove();
        });
      });
    });

    row.appendChild(removeBtn);
    websiteList.appendChild(row);
  }
});
