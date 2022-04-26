const fs = require('fs');
const util = require('util');
const readline = require('readline');
require('colors');

const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = util.promisify(fs.exists);

let name;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter Template name: '.cyan, function (result) {
  name = result[0].toUpperCase() + result.slice(1);
  rl.close();
});

rl.on('close', async function () {
  // vaidate name for a valid javascript variable.
  const notAllowed = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
  if (!notAllowed.test(name)) {
    console.log('\nTemplate name must be a valid identifier.\n'.red);
    process.exit(1);
  }

  const isFolderExists = await exists(`./src/${name}`);

  if (isFolderExists) {
    console.log(`\nFolder with the same name already exists. Try with another name.\n`.red);
    process.exit(1);
  }

  await mkdir(`./src/${name}`);

  console.log((`\nCreating ${name} ...`).yellow);

  const js_template = await readFile('./template/template.js', 'utf8');
  await writeFile(`./src/${name}/${name}.js`, js_template.replaceAll('SSSSS', name));

  const css_template = await readFile('./template/template.css', 'utf8');
  await writeFile(`./src/${name}/${name}.lazy.css`, css_template.replaceAll('SSSSS', name));

  // insert card to Home.js
  const homeJs = await readFile('./src/Home/Home.js', 'utf8');
  const match = homeJs.match(/<div className='container'>/);
  const index = match.index + match[0].length;
  const card = `\n      <Card path='${name}' />`;
  const newHomeJs = homeJs.substring(0, index) + card + homeJs.substring(index);
  await writeFile('./src/Home/Home.js', newHomeJs);

  // insert page to index.js
  const indexJs = await readFile('./src/index.js', 'utf8');
  const matchLazy = indexJs.match(/const lazyComponents = {/);
  const matchIndex = matchLazy.index + matchLazy[0].length;
  const page = `\n  ${name}: lazy(() => import('./${name}/${name}')),`;
  const newIndexJs = indexJs.substring(0, matchIndex) + page + indexJs.substring(matchIndex);
  await writeFile('./src/index.js', newIndexJs);

  console.log('\nTemplate created successfully.\n'.green);
  process.exit(0);
});
