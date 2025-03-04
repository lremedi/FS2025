const fs = require('fs');
const path = require('path');

const resourcesPath = path.join(__dirname, 'resources');

if (!fs.existsSync(resourcesPath)) {
  fs.mkdirSync(resourcesPath);
  console.log('resources folder created');
} else {
  console.log('resources folder already exists');
}