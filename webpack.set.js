const fs = require('fs');
const dir = 'node_modules/react-scripts/config/webpack.config.js';
require('colors');

fs.copyFile('webpack.config.js', dir, err => {
  if (err) throw err;
  console.log('\nwebpack.config.js'.green, 'copied to'.yellow, 'node_modules/react-scripts/config/webpack.config.js\n'.green);
});
