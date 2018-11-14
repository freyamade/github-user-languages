# 1.0.3
- Updated colours json file for new Crystal colour

# 1.0.2
- Automated deployment of extension using the existing CI system

# 1.0.1
- Fixed issue regarding colours for C# and C++ not appearing correctly

# 1.0.0
- Bumping release version to v1.0.0
    - It's been long enough since the previous version came out without issue that I felt it was time to bump to major version 1 and start pushing the plugin a bit more to get some feedback.
- Will hopefully commence work on a Firefox equivalent in the near future
- Fixed an issue where I forgot to uncomment a line that is meant to be commented out when not testing :/

# 0.1.9
- Fixed issue where private repos were not showing up in the chart when a Personal Access Token was added via the popup
- Private repos were only returned via the `/user/repos` endpoint instead of `/users/:username/repos` endpoint
- To this end, the way tokens are stored in sync storage had to be changed a bit. This should hopefully not require anything else from the user however.

# 0.1.8
- Removed the opening of this page when an update is installed
- Fixed issue where requests were being made on pages they shouldn't have been
- Prevented extension from adding anything to a page if the repo data for the account is empty
- Improved design of options page

# 0.1.7
- Added simple settings popup
    - Allows for turning on and off the chart legend on all pages
    - Allows adding a GitHub personal access token to allow more API usage
    - Simply click on the icon in the toolbar to access the settings popup
- Extension now opens a tab briging you here so you can see new changes

# 0.1.6
- Added error handling for when querying the API goes wrong

# 0.1.5
- New logo courtesy of [ihtiht](https://github.com/ihtiht)!

# 0.1.4
- Fixed issues with charts not displaying on Org pages
    - Also was an issue where my HTML wasn't correct on Org pages
    - Somehow I think the two were related

# 0.1.3
- Pie chart now displays on org pages as well as user pages
    - The chart is quite large on org pages because Chart.js tries to fill the container width wise and I've set the height to match the width
    - If this is a problem, please open an issue and we can discuss this further

# 0.1.2
- Added checks to ensure that the extension pulls all of a user's repos using GitHub's pagination
    - Previously the extension would only get the first 30 repos created by the user

# 0.1.1
- Added caching to avoid over-using the GitHub API
    - Currently cache timeout is set to be an hour but will later make this changeable per user
- Due to a difference in ordering between data pulled from cache and from the API, the languages are now drawn in alphabetical order clockwise around the pie chart to keep ordering the same
