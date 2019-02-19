![GitHub User Languages Logo](./img/logotype_horizontal.png?raw=true)

[![Travis branch](https://img.shields.io/travis/freyamade/github-user-languages/master.svg?style=flat-square)](https://travis-ci.org/freyamade/github-user-languages)

A little Chrome Extension that draws a pie chart on GitHub User / Org profiles detailing their language breakdown. Built with TypeScript, Chart.js and :heart:.

Recently, I have wanted a little graph that shows the language breakdown of a user or organisation right on their profile.

So I decided to make just that!

## Install
### Chrome
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kikdmnikeponomghepmfipgiijlmfhfl.svg?style=flat-square)](https://chrome.google.com/webstore/detail/github-user-languages/kikdmnikeponomghepmfipgiijlmfhfl)

Click the badge to be taken to the web store page for this plugin!

### Firefox
[![Firefox Add-ons](https://img.shields.io/amo/v/github-user-languages.svg?style=flat-square)](https://addons.mozilla.org/en-US/firefox/addon/github-user-languages/?src=search)

Click the badge to be taken to the web store page for this plugin!

## Usage
Just by having the extension installed, it's already working!

Simply visit a any profile page (both User and Org pages are supported) and you'll see something to similar to the following image on the left sidebar: ![github-user-languages demo](./img/demo.png)

All the colours are pulled from GitHub's official language colours, and hovering over any section will tell you the language and how many repos the user has made in that language. Simple! :smile:

By clicking on one of the segments, you can be redirected to a list of repos by that user in that language!

### Settings
By clicking on the icon in the browser bar, you'll be given a popup with two things;
- A checkbox to control whether or not the chart displays a legend
- A text input to add a personal access token to the GitHub API

The checkbox will toggle whether or not there is a legend displayed alongside the pie chart, which allows you to see what all colours represent without having to hover over them.

The text input allows you to add a GitHub API personal token, which allows for an increase to your rate limit (meaning you can get more information from the API), as well as being able to include your private repos in the chart on your own page.

## Want to Contribute?
Contributing doesn't just mean writing code!

If you think of anything that could benefit the project, open up an [issue](https://github.com/freyamade/github-user-languages/issues).

I'm also not that great at writing READMEs so help with this one would be very welcome!

### Development Process
1. Fork the repo, download your fork and install the dependencies with `npm install`
2. Run `npm run watch` to start the watch and build process
    - This will build the TypeScript into `dist/js`
3. Visit `chrome://extensions` in your browser
4. Turn on Developer Mode
5. Click `Load Unpacked`
6. Open the `dist` folder in the prompt that is displayed
7. The extension should now be loaded from the local directory

#### Notes
- Whenever you make changes to the extension, the JS will compile automatically but you'll need to click the little circle arrow on `chrome://extensions` to reload the extension
- It's probably a good idea to turn off the release version while you're doing development so they don't mess with eachother
- If you want to turn off caching while in development, simply uncomment the `return reject();` at line 55 of `data.ts`

## Boilerplate
Boilerplate used to set up this project can be found at https://github.com/chibat/chrome-extension-typescript-starter

## Contributors
- [freyamade](https://github.com/freyamade): Creator, maintainer
- [Strum355](https://github.com/strum355): Cleaned up promises with async + await, all round TypeScript mentor
- [ihtiht](https://github.com/ihtiht): Designer of the amazing logo :heart:

## License
MIT
