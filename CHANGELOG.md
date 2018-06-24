# 0.1.2
- Added checks to ensure that the extension pulls all of a user's repos using GitHub's pagination
    - Previously the extension would only get the first 30 repos created by the user

# 0.1.1
- Added caching to avoid over-using the GitHub API
    - Currently cache timeout is set to be an hour but will later make this changeable per user
- Due to a difference in ordering between data pulled from cache and from the API, the languages are now drawn in alphabetical order clockwise around the pie chart to keep ordering the same
