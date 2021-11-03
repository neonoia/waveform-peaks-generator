const util = require("util");
const readFile = util.promisify(require("fs").readFile);

const cleanupFile = require("./cleanupFile");
const executeCommand = require("./executeCommand");
const getOutFile = require("./getOutFile");

function getMax(arr) {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
        max = arr[len] > max ? arr[len] : max;
    }
    return max;
}

const generateAudiowaveform = async function (filePath, tempDir, pixelPerSecond) {
  let result = {};

  const outFile = getOutFile(filePath, tempDir, pixelPerSecond);
  const command = `audiowaveform -i ${filePath} -o ${outFile} --pixels-per-second ${pixelPerSecond} --bits 8`;

  try {
    await executeCommand(command);
    const buffer = await readFile(outFile);

    if (buffer) {
      console.log(
        `Done generating waveform file: ${outFile} --pixels-per-second ${pixelPerSecond}`
      );

      // Normalize and filter peaks
      const { data } = JSON.parse(buffer.toString());
      const max = getMax(data);
      const normalizedPeaks = data
        .filter((_, index) => index % 2 !== 0);

      for (let i = 0; i < normalizedPeaks.length; i++) {
        normalizedPeaks[i] = Math.round((normalizedPeaks[i] / max) * 100) / 100;
      }

      result = {
        peaks: normalizedPeaks,
        pixelPerSecond: pixelPerSecond,
      };

      // Cleanup genepixelPerSecondd file
      await cleanupFile(outFile);
    }
  } catch (error) {
    console.log(error);
  }

  return result;
};

exports.generateAudiowaveform = generateAudiowaveform;
