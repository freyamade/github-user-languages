// Class for handling the fetch of repo and color data, be it from cache or the API
// Allows the content script to be agnostic as to where the data is coming from as this class will use promises
import { GHULError } from './errors'

const CACHE_THRESHOLD = 36e5 // 1 hour

export interface IRepoData {
  [language: string] : number
}

export interface IColorData {
  [language: string] : string
}

export interface ICachedData {
  cachedAt : number
  data : IRepoData
}

export interface ITokenData {
  username : string | null
  token : string
}

interface IAPIRepoData {
  language : string
}

export class Data {
  public repoDataFromCache : boolean = false
  public emptyAccount : boolean = true
  private isOrg : boolean
  private personalToken : ITokenData
  private username : string

  constructor(username: string, isOrg: boolean, token: ITokenData) {
    this.username = username
    this.isOrg = isOrg
    this.personalToken = token
  }

  public getData() : Promise<[IColorData, IRepoData]> {
    // Gets both the color data and repo data and returns a Promise that will resolve to get both of them
    // Calling .then on this should get back an array of two values color and repo data respectively
    return Promise.all([this.getColorData(), this.getRepoData()])
  }

  private async getColorData() : Promise<IColorData> {
    const url = chrome.runtime.getURL('colors.json')
    return (await fetch(url)).json()
  }

  private checkCache() : Promise<ICachedData> {
    // Create a promise to retrieve the key from cache, or reject if it's not there
    return new Promise((resolve, reject) => {
      // return reject() // Uncomment this to turn off cache reads when in development
      chrome.storage.local.get([this.username], (result) => {
        // If the data isn't there, result will be an empty object
        if (Object.keys(result).length < 1) {
          // If we get to this point, there was nothing in cache or the cache was invalid
          return reject()
        }
        // We have a cached object, so check time of cache
        const cachedData : ICachedData = result[this.username]
        if (new Date().valueOf() - cachedData.cachedAt < CACHE_THRESHOLD) {
          // We can use the cached version
          // Set emptyAccount flag to false here too
          this.emptyAccount = false
          return resolve(cachedData)
        }

        return reject()
      })
    })
  }

  // Fetches the repo data either from cache or from the API and returns a Promise for the data
  private async getRepoData() : Promise<IRepoData> {
    try {
      // Check if the user's data is in the cache
      const cachedData = await this.checkCache()
      this.repoDataFromCache = true
      return Promise.resolve(cachedData.data)
    } catch (e) {
      // Data wasn't in cache so get new data
      return this.fetchRepoData()
    }
  }

  private updateRepoData(repoData: IRepoData, json: IAPIRepoData[]) : IRepoData {
    for (const repo of json) {
      if (repo.language === null) { continue }
      let count = repoData[repo.language] || 0
      count++
      repoData[repo.language] = count
      this.emptyAccount = false
    }
    return repoData
  }

  // Helper method to get the next url to go to
  private getNextUrlFromHeader(header: string) {
    if (header === null) { return null }
    const regex = /\<(.*)\>/
    // The header can contain many URLs, separated by commas, each with a rel
    // We want only the one that contains rel="next"
    for (const url of header.split(', ')) {
      if (url.includes('rel="next"')) {
        // We need to retrive the actual URL part using regex
        return regex.exec(url)[1]
      }
    }
    return null
  }

  private generateAPIURL() : string {
    // Generate the correct API URL request given the circumstances of the request
    // Circumstances: Org or User page, and if User page, is it the User using the extension
    const urlBase = 'https://api.github.com'
    const query = 'page=1&per_page=50'
    let url : string
    if (this.isOrg) {
      url = `${urlBase}/orgs/${this.username}/repos?${query}`
    }
    else if (this.username === this.personalToken.username) {
      // Send the request to list the user's own repos
      url = `${urlBase}/user/repos?${query}&affiliation=owner`
    }
    else {
      // Send the request to the normal users endpoint
      url = `${urlBase}/users/${this.username}/repos?${query}`
    }
    return url
  }

  // Fetch repository data from the API
  private async fetchRepoData() : Promise<IRepoData> {
    let url = this.generateAPIURL()
    let linkHeader : string
    let repoData : IRepoData = {}
    const headers : HeadersInit = {}
    if (this.personalToken !== null && this.personalToken.username !== null) {
      headers.Authorization = `token ${this.personalToken.token}`
    }
    const headerRegex = /\<(.*)\> rel="next"/
    // Use Promise.resolve to wait for the result
    let response = await fetch(url, {headers})
    linkHeader = response.headers.get('link')

    // Stumbled across this little error tonight
    if (response.status !== 200 ) {
      console.error(response)
      throw new GHULError(
        `Incorrect status received from GitHub API. Expected 200, received; ${response.status}. ` +
        'See console for more details.',
      )
    }

    let data = await response.json()
    // From this JSON response, compile repoData (to reduce memory usage) and then see if there's more to fetch
    repoData = this.updateRepoData(repoData, data)
    // Now loop through the link headers, fetching more data and updating the repos dict
    url = this.getNextUrlFromHeader(linkHeader)
    while (url !== null) {
      // Send a request and update the repo data again
      response = await fetch(url, {headers})
      linkHeader = response.headers.get('link')
      data = await response.json()
      repoData = this.updateRepoData(repoData, data)
      url = this.getNextUrlFromHeader(linkHeader)
    }
    // Still gonna return a promise
    return Promise.resolve(repoData)
  }
}
