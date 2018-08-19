/* Simple small background script for integrity purposes

  Integrity stuff:
    - Ensure that the sync storage is up to date with the 0.1.9 scheme (store token username)
*/

// Run whenever the extension is installed / updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Running Integrity Tests');
  console.log('Testing that sync storage is up to date (0.1.9)');
  chrome.storage.sync.get(['personalAccessToken', 'personalAccessTokenOwner'], async (result) => {
    // Ensure that the owner is set if the token is set, or set it otherwise
    let personalAccessToken: string = result.personalAccessToken || '';
    let personalAccessTokenOwner: string = result.personalAccessTokenOwner || '';

    if (personalAccessTokenOwner === '' && personalAccessToken !== '') {
      console.log('Data found to not match the structure for 0.1.9. Fixing.');
      const headers: HeadersInit = {Authorization: `token ${personalAccessToken}`};
      const url = "https://api.github.com/user";
      let username: string | null = null;
      try {
        const response = await fetch(url, {headers});
        if (response.ok) {
          const data = await response.json();
          username = data.login;
        }
        // If not okay, we'll leave the username as null
      }
      catch (e) {
        // If there's an error then the token is likely invalid
      }
      // Store that back in the sync storage
      chrome.storage.sync.set({personalAccessTokenOwner: username});
    }
  })
})
