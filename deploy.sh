# Write message stating which version is being deployed
echo "Deploying github-user-languages $(jq '.version' package.json) to the Web Store!"

# Build the production code
npm run build

# Create the distribution zipfile
cd dist
zip -r ../dist.zip *
cd ..

# Deploy to Chrome Web Store
ACCESS_TOKEN=$(curl "https://accounts.google.com/o/oauth2/token" -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T dist.zip -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST -v "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish"
