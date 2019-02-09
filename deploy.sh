#!/bin/bash

# Write message stating which version is being deployed
echo "Deploying github-user-languages $(jq '.version' package.json) to the Web Stores!"

# Build the production code
echo "Building the Code"
npm run build
echo "Done!"

# Create the distribution zipfile
echo "Building the AMO distribution zip"
cd dist
zip -r ../dist.zip *
cd ..
echo "Done!"

# Deploy to AMO
echo "Deploying to AMO"
npm run deploy-amo
echo "Done!"

# When deploying to the Chrome Store we have to remove the "applications" key from the manifest
echo "Removing the applications key from the manifest for Chrome"
echo $(jq 'del(.applications)' dist/manifest.json) > dist/manifest.json
echo "Done!"

# Re-zip
echo "Building the Chrome distribution zip"
cd dist
zip -r ../dist.zip *
cd ..
echo "Done!"

# Deploy to Chrome Web Store
echo "Deploying to Chrome Web Store"
ACCESS_TOKEN=$(curl "https://accounts.google.com/o/oauth2/token" -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T dist.zip -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST -v "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish"
echo "Done!"
