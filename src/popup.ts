// Add listeners to the elements to do stuff when they are edited
const chartLegendCheck: HTMLInputElement = <HTMLInputElement> document.getElementById('show-legend');
const personalTokenInput: HTMLInputElement = <HTMLInputElement> document.getElementById('personal-access-token');
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
})
