const fs = require('fs')
const fileName = './dist/manifest.json'
const file = require(fileName)
    
delete file.browser_specific_settings
    
fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
  if (err) return console.log(err)
  console.log(JSON.stringify(file))
  console.log('writing to ' + fileName)
})
