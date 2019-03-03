const scripts = require('./scripts');

const args = process.argv.slice(2);
const scriptsObjs = getScriptsObjs(args);

scriptsObjs.forEach(so => {
  console.log('Executing ' + so.name);
  scripts[so.name](so.params);
});

function getScriptsObjs(args) {
  let scriptObjs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i][0] == '-') {
      const lastElem = scriptObjs[scriptObjs.length - 1];
      if (!lastElem) {
        console.log('Error');
        return;
      }
      const paramsArr = args[i].substr(1).split('=');
      lastElem.params[paramsArr[0]] = paramsArr[1];
    }
    else {
      scriptObjs.push({name: args[i], params: {}});
    }
  }

  return scriptObjs;
}