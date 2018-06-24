// Class for handling the fetch of repo and color data, be it from cache or the API
// Allows the content script to be agnostic as to where the data is coming from as this class will use promises

const CACHE_THRESHOLD = 36e5; // 1 hour

interface ICachedData {
  cachedAt : number;
  data : object;
}

interface IAPIRepoData {
  language: string;
}

export class Data {
  public repoDataFromCache : boolean = false;
  private username : string;

  constructor(username : string) {
    this.username = username;
  }

  public getData() : Promise<object[]> {
    // Gets both the color data and repo data and returns a Promise that will resolve to get both of them
    // Calling .then on this should get back an array of two values; color and repo data respectively
    return Promise.all([this.getColorData(), this.getRepoData()]);
  }

  private async getColorData() : Promise<JSON> {
    const url = chrome.runtime.getURL('colors.json');
    return (await fetch(url)).json();
  }

  private checkCache() : Promise<ICachedData> {
    // Create a promise to retrieve the key from cache, or reject if it's not there
    return new Promise((resolve, reject) => {
      // return reject(); // Uncomment this to turn off cache reads when in development
      chrome.storage.local.get([this.username], (result) => {
        // If the data isn't there, result will be an empty object
        if (Object.keys(result).length < 1) {
          // If we get to this point, there was nothing in cache or the cache was invalid
          return reject();
        }
        // We have a cached object, so check time of cache
        const cachedData = result[this.username];
        if (new Date().valueOf() - cachedData.cachedAt < CACHE_THRESHOLD) {
          // We can use the cached version
          return resolve(cachedData);
        }

        return reject();
      });
    });
  }

  // Fetches the repo data either from cache or from the API and returns a Promise for the data
  private async getRepoData() : Promise<object> {
    try {
      // Check if the user's data is in the cache
      const cachedData = await this.checkCache();
      this.repoDataFromCache = true;
      return Promise.resolve(cachedData.data);
    } catch (e) {
      // Data wasn't in cache so get new data
      return this.fetchRepoData();
    }
  }

  private updateRepoData(repoData : object, json : IAPIRepoData[]) : object {
    for (const repo of json) {
      if (repo.language === null) { continue; }
      let count = repoData[repo.language] || 0;
      count++;
      repoData[repo.language] = count;
    }
    return repoData;
  }

  // Helper method to get the next url to go to
  private getNextUrlFromHeader(header : string) {
    if (header === null) { return null; }
    const regex = /\<(.*)\>/;
    // The header can contain many URLs, separated by commas, each with a rel
    // We want only the one that contains rel="next"
    for (const url of header.split(', ')) {
      if (url.includes('rel="next"')) {
        // We need to retrive the actual URL part using regex
        return regex.exec(url)[1];
      }
    }
    return null;
  }

  // Fetch repository data from the API
  private async fetchRepoData() : Promise<object> {
    let url = `https://api.github.com/users/${this.username}/repos?page=1&per_page=50`;
    let linkHeader : string;
    let repoData: object = {};
    const headerRegex = /\<(.*)\>; rel="next"/;
    // Use Promise.resolve to wait for the result
    let response = await fetch(url)
    linkHeader = response.headers.get('link');
    let data = await response.json();
    // From this JSON response, compile repoData (to reduce memory usage) and then see if there's more to fetch
    repoData = this.updateRepoData(repoData, data);
    // Now loop through the link headers, fetching more data and updating the repos dict
    url = this.getNextUrlFromHeader(linkHeader);
    while (url !== null) {
      // Send a request and update the repo data again
      let response = await fetch(url)
      linkHeader = response.headers.get('link');
      data = await response.json();
      repoData = this.updateRepoData(repoData, data);
      url = this.getNextUrlFromHeader(linkHeader);
    }
    // Still gonna return a promise
    return Promise.resolve(repoData);
  }
}
