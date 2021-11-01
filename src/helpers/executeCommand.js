const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function executeCommand(cmd) {
  console.log("Exec: " + cmd);

  try {
    return await exec(cmd);
  } catch (err) {
    console.log(err);
  }
}

module.exports = executeCommand;
