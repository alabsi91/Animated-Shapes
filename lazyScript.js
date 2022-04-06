const fs = require('fs');
const dir = 'node_modules\\react-scripts\\config\\webpack.config.js';
const config = fs.readFileSync('webpack.config.js', 'utf8');
fs.writeFileSync(dir, config, 'utf8');
