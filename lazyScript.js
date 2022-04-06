const fs = require('fs');
const dir = 'node_modules/react-scripts/config/webpack.config.js';

fs.copyFile('webpack.config.js', dir, err => {
  if (err) throw err;
  console.log('webpack.config.js copied to node_modules/react-scripts/config/webpack.config.js');
});
