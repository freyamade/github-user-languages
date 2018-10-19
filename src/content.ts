// This script is excuted directly from inside the page
import { Chart } from 'chart.js'
import { Data, ICachedData, IColorData, IRepoData, ITokenData } from './data'

class LanguageDisplay {
  private canvas : HTMLCanvasElement
  private container : HTMLDivElement
  private data : Data
  private isOrg : boolean = false
  // Special extra div that the canvas needs to be drawn into on org pages
  private orgDiv: HTMLDivElement
  private parent : HTMLDivElement
  private username : string

  constructor(username : string) {
    this.username = username
    // Fetch the lang data now
    this.parent = document.querySelector('div[itemtype="http://schema.org/Person"]')
    // Handling for orgs
    if (this.parent === null) {
      // Org page, set the flag as such
      this.isOrg = true
      this.parent = document.querySelector('div.col-4.float-right.pl-4')
    }
    this.canvas = null
    this.container = null
    // Get the personal access token from sync storage and fetch data
    chrome.storage.sync.get(['personalAccessToken', 'personalAccessTokenOwner'], (result) => {
      const token: string = result.personalAccessToken || ''
      const tokenOwner: string | null = result.personalAccessTokenOwner || null
      const tokenData: ITokenData = {
        token,
        username: tokenOwner,
      }
      this.data = new Data(username, this.isOrg, tokenData)
      this.getData()
    })
  }

  private async getData() {
    // Fetch the color data from the json file
    // Use the promise provided by the Data class to get all necessary data
    try {
      const values = await this.data.getData()
      // 0 -> color data, 1 -> repo data
      const colorData: IColorData = values[0]
      const repoData: IRepoData = values[1]
      // If the repoData is empty, don't go any further
      if (this.data.emptyAccount) {
        return
      }
      // Cache the repoData we just got, if we need to
      if (!this.data.repoDataFromCache) {
        this.cacheData(repoData)
      }
      // Build the graph
      this.build(colorData, repoData)
    } catch (e) {
      // This is where we need to add the error display
      // Create the container, add it to the page and then add an error message to it
      this.container = this.createContainer()
      this.parent.appendChild(this.container)
      // Create an error message
      const errorMessage = document.createTextNode(
        'An error occurred when fetching data from the GitHub API. This could be due to rate-limiting.' +
        ' Please try again later or add a personal access token for increase API usage (coming soon).',
      )
      this.parent.appendChild(errorMessage)
      console.error(`gh-user-langs: Error creating graph: ${e}`)
    }
  }

  private cacheData(data : IRepoData) {
    // Store the repo data in the cache for the username
    const cachedAt: number = new Date().valueOf()
    const value: ICachedData = {
      cachedAt,
      data,
    }
    const cacheData = {}
    cacheData[this.username] = value
    chrome.storage.local.set(cacheData)
  }

  private createContainer() {
    const div = document.createElement('div')
    const header = document.createElement('h4')
    const headerText = document.createTextNode('Languages')
    header.appendChild(headerText)
    if (this.isOrg) {
      // Need to create an extra div for the Box-body class
      this.orgDiv = document.createElement('div')
      // Set up the classes
      this.orgDiv.classList.add('Box-body')
      div.classList.add('Box', 'mb-3')
      header.classList.add('f4', 'mb-2', 'text-normal')
      // Add the inner div to the outer one
      this.orgDiv.appendChild(header)
      div.appendChild(this.orgDiv)
    }
    else {
      div.classList.add('border-top', 'py-3', 'clearfix')
      header.classList.add('mb-1', 'h4')
      div.appendChild(header)
    }
    return div
  }

  private createCanvas(width : number) {
    // Round width down to the nearest 50
    width = Math.floor(width / 50) * 50
    // Create the canvas to put the chart in
    const canvas = document.createElement('canvas')
    // Before creating the Charts.js thing ensure that we set the
    // width and height to be the computed width of the containing div
    canvas.id = 'github-user-languages-language-chart'
    canvas.width = width
    canvas.height = width
    // Save the canvas
    return canvas
  }

  private build(colorData : IColorData, repoData : IRepoData) {
    this.container = this.createContainer()
    this.parent.appendChild(this.container)
    // Get the width and height of the container and use it to build the canvas
    const width = +(window.getComputedStyle(this.container).width.split('px')[0])
    this.canvas = this.createCanvas(width)
    if (this.isOrg) {
      this.orgDiv.appendChild(this.canvas)
    }
    else {
      this.container.appendChild(this.canvas)
    }
    // Get whether or not we should draw the legend from the sync storage and draw the chart
    chrome.storage.sync.get(['showLegend'], (result) => {
      const showLegend = result.showLegend || false
      this.draw(colorData, repoData, showLegend)
    })
  }

  private draw(colorData: IColorData, repoData: IRepoData, showLegend: boolean) {
    // Create the pie chart and populate it with the repo data
    const counts = []
    const colors = []
    const langs = []
    for (const prop of Object.keys(repoData).sort()) {
      if (repoData.hasOwnProperty(prop)) {
        // Prop is one of the languages
        langs.push(prop)
        counts.push(repoData[prop])
        colors.push(colorData[prop] || '#ededed')
      }
    }
    const chart = new Chart(this.canvas, {
      data: {
        datasets: [{
          backgroundColor: colors,
          data: counts,
          label: 'Repo Count',
        }],
        labels: langs,
      },
      options: {
        legend: {
          display: showLegend,
        },
      },
      type: 'pie',
    })

    // Add event listeners to get the slice that was clicked on
    // Will redirect to a list of the user's repos of that language
    this.canvas.onclick = (e) => {
      // Have to encode it in case of C++ and C#
      const slice = chart.getElementsAtEvent(e)[0]
      if (slice === undefined) { return }
      const language = encodeURIComponent(langs[slice._index].toLowerCase())
      // Redirect to the user's list of that language
      window.location.href = `https://github.com/${this.username}?tab=repositories&language=${language}`
    }

    // Set up a listener for changes to the `showLegend` key of storage
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if ('showLegend' in changes) {
        // Update the chart to set the legend display to the newValue of the storage
        chart.options.legend.display = changes.showLegend.newValue
        chart.update()
      }
    })
  }

}

// Get the profile name for the current page, if the current page is an account page
// The profile name will get retrieved from location.pathname
let profileName : string | null = null
let path = window.location.pathname.substr(1)
// Trim the trailing slash if there is one
if (path[path.length - 1] === "/") {
  path = path.slice(0, -1)
}
// The page is correct if the length of path.split is 1 and the first item isn't the empty string
const splitPath = path.split('/')
if (splitPath.length === 1 && splitPath[0].length !== 0) {
  profileName = splitPath[0]
}
// If profileName is not null, draw the chart
if (profileName !== null) {
  const graph = new LanguageDisplay(profileName)
}
