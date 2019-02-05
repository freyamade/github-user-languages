// Add listeners to the elements in popup.html to update the sync storage when changes are made

interface ISyncData {
  showLegend : boolean
  personalAccessToken : string
  personalAccessTokenOwner : string
}

// Helper methods
async function getUsernameForToken(token: string) : Promise<string | null> {
  // If there's no token, the username has to be null
  if (token === '') {
    return null
  }
  const headers : HeadersInit = {Authorization: `token ${token}`}
  const url = 'https://api.github.com/user'
  let username : string | null = null
  try {
    const response = await fetch(url, {headers})
    if (response.ok) {
      const data = await response.json()
      username = data.login
      console.log(username)
    }
    // If not okay, we'll leave the username as null
  }
  catch (e) {
    // If there's an error then the token is likely invalid
  }
  return username
}

// Get the old data of both of these values
chrome.storage.sync.get(['showLegend', 'personalAccessToken', 'personalAccessTokenOwner'], (result: ISyncData) => {
  setup(result)
})

async function setup(result: ISyncData) {
  const chartLegendCheck : HTMLInputElement = document.getElementById('show-legend') as HTMLInputElement
  const personalTokenInput : HTMLInputElement = document.getElementById('personal-access-token') as HTMLInputElement

  const showLegend = result.showLegend || false
  const personalAccessToken : string = result.personalAccessToken || ''
  const personalAccessTokenOwner : string = result.personalAccessTokenOwner || ''

  // Set up the initial values of the inputs based on the storage read values
  chartLegendCheck.checked = showLegend
  personalTokenInput.value = personalAccessToken

  // Add event listeners to get the values when they change
  chartLegendCheck.addEventListener('click', () => {
    // Store the new value of the checkbox in sync storage
    chrome.storage.sync.set({showLegend: chartLegendCheck.checked})
  }, false)

  personalTokenInput.addEventListener('change', async () => {
    // Get the username for the Token as well, this will allow private repos to be included on the user's own page
    const token = personalTokenInput.value
    const username = await getUsernameForToken(token)
    const storedData = {
      personalAccessToken: token,
      personalAccessTokenOwner: username,
    }
    console.log('setting data', storedData)
    chrome.storage.sync.set(storedData)
  }, false)

  // Now enable the inputs for user input
  chartLegendCheck.disabled = false
  personalTokenInput.disabled = false
}

// Set up a listener for a click on the link to open a tab to generate a token
const tokenUrl = 'https://github.com/settings/tokens/new?description=GitHub%20User%20Languages&scopes=repo'
document.getElementById('get-token').addEventListener('click', () => {
  chrome.tabs.create({ url: tokenUrl })
}, false)
