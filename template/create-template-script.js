const fs = require('fs');
const readline = require('readline');
require('colors');

let name;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter Template name: '.cyan, function (result) {
  name = result[0].toUpperCase() + result.slice(1);
  rl.close();
});

rl.on('close', function () {
  console.log(('\nCreating ' + name + ' ...').yellow);

  if (!fs.existsSync(`./src/${name}`)) fs.mkdirSync(`./src/${name}`);
  else {
    console.log('\nTemplate already exists.\nTry another name.'.red);
    process.exit(0);
  }

  fs.readFile('./template/template.js', 'utf8', (err, data) => {
    if (err) throw err;

    const js_template = data.replaceAll('$$$$$', name);
    fs.writeFileSync(`./src/${name}/${name}.js`, js_template);
  });

  fs.readFile('./template/template.css', 'utf8', (err, data) => {
    if (err) throw err;

    const css_template = data.replaceAll('SSSSS', name);
    fs.writeFile(`./src/${name}/${name}.lazy.css`, css_template, err => {
      if (err) throw err;
      console.log('\nTemplate created.'.green);
      process.exit(0);
    });
  });
});
