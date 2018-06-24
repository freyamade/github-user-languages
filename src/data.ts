// Class for handling the fetch of repo and color data, be it from cache or the API
// Allows the content script to be agnostic as to where the data is coming from as this class will use promises

const CACHE_THRESHOLD = 36e5; // 1 hour

interface ICachedData {
  cachedAt : number;
  data : object;
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

  private async getGenericJsonPromise(url : string) {
    return (await fetch(url)).json();
  }

  private getColorData() : Promise<JSON> {
    const url = chrome.runtime.getURL('colors.json');
    return this.getGenericJsonPromise(url);
  }

  private checkCache() : Promise<ICachedData> {
    // Create a promise to retrieve the key from cache, or reject if it's not there
    return new Promise((resolve, reject) => {
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

  // Fetch repository data from the API
  private async fetchRepoData() : Promise<object> {
    const url = `https://api.github.com/users/${this.username}/repos`;
    // From the generic json response, build a repo data object
    const repoData = {};
    for (const repo of await this.getGenericJsonPromise(url)) {
      if (repo.language === null) { continue; }
      let count = repoData[repo.language] || 0;
      count++;
      repoData[repo.language] = count;
    }
    return Promise.resolve(repoData);
  }
}
