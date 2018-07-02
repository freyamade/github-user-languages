// Open up the CHANGELOG on an update when not in dev mode
const inDev = !('update_url' in chrome.runtime.getManifest());

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "update" && !inDev) {
    chrome.tabs.create({url: 'https://github.com/crnbrdrck/github-user-languages/blob/master/CHANGELOG.md'});
  }
});
