// Add listeners to the elements in popup.html to update the sync storage when changes are made
const chartLegendCheck: HTMLInputElement = document.getElementById('show-legend') as HTMLInputElement;
const personalTokenInput: HTMLInputElement = document.getElementById('personal-access-token') as HTMLInputElement;
let showLegend: boolean;
let personalAccessToken: string;

// Get the old data of both of these values
chrome.storage.sync.get(['showLegend', 'personalAccessToken'], (result) => {
  showLegend = result.showLegend || false;
  personalAccessToken = result.personalAccessToken || '';

  // Set up the initial values of the inputs based on the storage read values
  chartLegendCheck.checked = showLegend;
  personalTokenInput.value = personalAccessToken;

  // Add event listeners to get the values when they change
  chartLegendCheck.addEventListener('click', () => {
    // Store the new value of the checkbox in sync storage
    chrome.storage.sync.set({showLegend: chartLegendCheck.checked});
  }, false);

  personalTokenInput.addEventListener('change', () => {
    chrome.storage.sync.set({personalAccessToken: personalTokenInput.value});
  }, false);

  // Now enable the inputs for user input
  chartLegendCheck.disabled = false;
  personalTokenInput.disabled = false;
});

// Set up a listener for a click on the link to open a tab to generate a token
const tokenUrl = 'https://github.com/settings/tokens/new?description=GitHub%20User%20Languages';
document.getElementById('get-token').addEventListener('click', () => {
  chrome.tabs.create({ url: tokenUrl });
}, false);
