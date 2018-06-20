# graph-hub
Browser extension that adds little language pie charts to a user's profile page on GitHub

## Plans
Add the graph div to the sidebar. (element for sidebar; `$('div[itemtype="http://schema.org/Person"]')` if jQuery is usable)

Hit the API (if no value has been cached) for all the user's projects and get all the languages and the number of times each is used.

Then get percentages of each language and create a pie chart using the language colours as provided by GitHub.

Cache anything that's important to the generation of it to avoid over-using the API.
