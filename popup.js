document.addEventListener("DOMContentLoaded", () => {
  const configureBtn = document.getElementById("configure-btn");

  configureBtn.addEventListener("click", () => {
    // Opens the options page defined in manifest.json
    chrome.runtime.openOptionsPage();
  });
});
