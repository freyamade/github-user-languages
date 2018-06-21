# GitHub User Languages
A little Chrome Extension that draws a pie chart on GitHub User profiles detailing their language breakdown. Built with TypeScript, Chart.js and :heart:.

Recently, I have wanted a little graph that shows the language breakdown of a user right on their profile.

So I decided to make just that!

## Install
### Chrome
Installation is coming soon for Chrome.

If you can't wait though, here's a little guide on how to install it manually;
1. Clone this repo
2. Install the requirements with `npm install` and then build the extension with `npm run build`.
  - This will output the build JS files into the `dist` folder
3. Visit `chrome://extensions` in your browser.
4. Turn on developer mode in the top right corner and hit the *Load unpacked* button
5. Open the `dist` directory that you built files in earlier and it should install the plugin.
6. Visit a [GitHub profile page](https://github.com/crnbrdrck) to ensure that it works.
  - If not, check the console and create an issue here with the error information so I can fix it!

### Firefox
Firefox version is planned but currently not even started, although I doubt there'll be much to change.

## Usage
Just by having the extension installed, it's already working!

Simply visit a User's profile page (why not [mine](https://github.com/crnbrdrck)?) and you'll see something to similar to the following image on the left sidebar: ![github-user-languages demo](./demo.png)

All the colours are pulled from GitHub's official language colours, and hovering over any section will tell you the language and how many repos the user has made in that language. Simple! :smile:

*That TypeScript repo is the one you're in right now by the way!*

## Roadmap

- [x] Draw the pie chart
- [ ] Design an extension icon
- [ ] Make it available on the chrome store
- [ ] Add storage of data for users to avoid over-using the Github API and getting rate limited
- [ ] Create a version for Firefox browsers

## Want to Contribute?
Contributing doesn't just mean writing code!

If you think of anything that could benefit the project, open up an [issue](https://github.com/crnbrdrck/github-user-langs/issues).

I'm also not that great at writing READMEs so help with this one would be very welcome!

## License
MIT
