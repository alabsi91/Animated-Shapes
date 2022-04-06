const fs = require('fs');
const dir = 'node_modules\\react-scripts\\config\\webpack.config.js';
const config = fs.readFileSync(dir, 'utf8');
const myConfig = `{
  test: /\\.lazy\\.css$/i,
  use: [{ loader: 'style-loader', options: { injectType: 'lazyStyleTag' } }, 'css-loader']},\n`;
let regIndex = config.match(/exclude: cssModuleRegex/);
if (regIndex) {
  regIndex = regIndex.index;
  let newConfig = insertStr(regIndex + 650, myConfig, config);
  newConfig = replaceBetween(regIndex, regIndex + 24, 'exclude: /\\.lazy\\.css$/,', newConfig);

  fs.writeFileSync(dir, newConfig, 'utf8');

  function replaceBetween(start, end, what, str) {
    return str.substring(0, start) + what + str.substring(end);
  }
  function insertStr(offset, text, str) {
    return str.substring(0, offset) + text + str.substring(offset);
  }
}
