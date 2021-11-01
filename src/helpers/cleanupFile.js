const util = require('util');
const unlink = util.promisify(require("fs").unlink);

async function cleanupFile(filePath) {
  try {
    return await unlink(filePath);
  } catch (err) {
    console.log(err);
  }
}

module.exports = cleanupFile;
