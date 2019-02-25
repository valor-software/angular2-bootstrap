'use strict';

const fs = require('fs-extra');
const pathToJSONFile = 'dist/package.json';
const NGX_BOOTSRAP = 'ngx-bootstrap';
const NGX_BOOTSRAP_CI = 'ngx-bootstrap-ci';

changeName();

async function changeName() {
  const packageJson = JSON.parse(fs.readFileSync(pathToJSONFile), 'utf8');

  packageJson.name = (packageJson.name === NGX_BOOTSRAP)
    ? NGX_BOOTSRAP_CI
    : NGX_BOOTSRAP;

  fs.writeFile(pathToJSONFile, JSON.stringify(packageJson, null, 2));

  console.log(`Name of package changed to ${packageJson.name}`);
}
