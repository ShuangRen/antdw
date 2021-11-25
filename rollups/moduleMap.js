const fs = require('fs');
const path = require('path');
const componentDir = 'src/components';
const ModuleNames = fs.readdirSync(path.resolve(componentDir));
const ModuleMap = ModuleNames.reduce((prev, name) => {
  prev[name] = `${componentDir}/${name}/index.tsx`;

  return prev;
}, {});

export default ModuleMap;