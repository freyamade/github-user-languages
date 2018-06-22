// This script is excuted directly from inside the page
import { Chart } from 'chart.js';

const CACHE_THRESHOLD = 36e5; // 1 hour

class LanguageDisplay {
  private username: string;
  private langData: object;
  private colorData: object;
  private parent: HTMLDivElement;
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;

  constructor(username : string) {
    this.username = username;
    this.langData = null;
    // Check the cache for language data for this user
    this.checkCache();
    // Fetch the lang data now
    this.parent = document.querySelector('div[itemtype="http://schema.org/Person"]');
    // Handling for orgs
    if (this.parent === null) {
      return;
    }
    this.canvas = null;
    this.container = null;
    // Fetch the color data from the json file
    fetch(chrome.runtime.getURL('colors.json')).then((response) => response.json()).then((colorData) => {
      this.colorData = colorData;
      // Now go get the repo data last as it could be ratelimited
      fetch(`https://api.github.com/users/${this.username}/repos`).then((response) =>
        response.json(),
      ).then((repoData) => {
        for (const repo of repoData) {
          if (repo.language === null) { continue; }
          let currentCount = this.langData[repo.language] || 0;
          currentCount++;
          this.langData[repo.language] = currentCount;
        }
        // If all is good, build the graph
        this.build();
      }).catch((e) => console.error(`gh-user-langs: Error retrieving repo data from the GitHub API: ${e}`));
    }).catch((e) => console.error(`gh-user-langs: Error creating graph: ${e}`));
  }

  // Check our 'cache' to see if we have the User already
  private checkCache() {
    chrome.storage.local.get([this.username], (result) => {
      console.log(`${this.username} was cached`);
      let cachedData = result[this.username];
      // Check when it was cached at, if since threshold then update immediately
      if (new Date().valueOf() - cachedData.cachedAt > CACHE_THRESHOLD) {
        await this.fetchLangData();
      }
      else {
        // It's within an hour so use the cached data
        this.langData = cachedData.data;
      }
    });
  }

  private cacheData(data : object) {
    // Store the repo data in the cache for the username
    const cachedAt = new Date().valueOf();
    const key = this.username;
    const cacheData = {
      key: {
          cachedAt: cachedAt,
          data: data
      },
    }
    chrome.storage.local.set(cacheData, () => {
      console.log(`Data for ${this.username} successfully cached`);
    })
  }

  private createContainer() {
    const div = document.createElement('div');
    const header = document.createElement('h4');
    const headerText = document.createTextNode('Languages');
    header.appendChild(headerText);
    div.classList.add('border-top', 'py-3', 'clearfix');
    header.classList.add('mb-1', 'h4');
    div.appendChild(header);
    return div;
  }

  private createCanvas(width : number) {
    // Round width down to the nearest 50
    width = Math.floor(width / 50) * 50;
    // Create the canvas to put the chart in
    const canvas = document.createElement('canvas');
    // Before creating the Charts.js thing ensure that we set the
    // width and height to be the computed width of the containing div
    canvas.id = 'github-user-languages-language-chart';
    canvas.width = width;
    canvas.height = width;
    // Save the canvas
    return canvas;
  }

  private build() {
    this.container = this.createContainer();
    this.parent.appendChild(this.container);
    // Get the width and height of the container and use it to build the canvas
    const width = +(window.getComputedStyle(this.container).width.split('px')[0]);
    this.canvas = this.createCanvas(width);
    this.container.appendChild(this.canvas);
    // Now draw the chart
    this.draw();
  }

  private draw() {
    // Create the pie chart and populate it with the repo data
    const counts = [];
    const colors = [];
    const langs = [];
    for (const prop in this.langData) {
      if (this.langData.hasOwnProperty(prop)) {
        // Prop is one of the languages
        langs.push(prop);
        counts.push(this.langData[prop]);
        colors.push(this.colorData[prop]);
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
          display: false,
        },
      },
      type: 'pie',
    });

    // Add event listeners to get the slice that was clicked on
    // Will redirect to a list of the user's repos of that language
    this.canvas.onclick = (e) => {
      // Have to encode it in case of C++ and C#
      const slice = chart.getElementsAtEvent(e)[0];
      if (slice === undefined) { return; }
      const language = encodeURIComponent(langs[slice._index].toLowerCase());
      // Redirect to the user's list of that language
      window.location.href = `https://github.com/${this.username}?tab=repositories&language=${language}`;
    }
  }

}

// The profile name will get retrieved from location.pathname
const path = window.location.pathname.substr(1);
// It's the profile page if path.split(/).length is 1 or its 2 but the last item is the empty string
// This is a workaround until I can fix the issue with matching trailing slashes in the manifest file
const splitPath = path.split('/');
if (splitPath.length === 1 || (splitPath.length === 2 && splitPath[1] === '')) {
  const profileName = splitPath[0];
  const graph = new LanguageDisplay(profileName);
}
