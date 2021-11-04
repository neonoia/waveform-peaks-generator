const httpStatus = require('http-status');
const util = require('util');
const os = require('os');
const { exec } = require('child_process');
const { existsSync, unlink, readFile } = require('fs');

const unlinkPromise = util.promisify(unlink);
const readFilePromise = util.promisify(readFile);
const execPromise = util.promisify(exec);

const ApiError = require('../utils/ApiError');
const getMax = require('../utils/getMax');
const logger = require('../config/logger');

/**
 * Generate audio waveform peaks
 * @param {Object} Request
 * @returns {Promise<WaveformResult>}
 */
const generateAudioWaveform = async (req) => {
  const filePath = `${os.homedir()}/audio/${req.file.filename}`;
  if (!req.file || !existsSync(filePath)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No audio file uploaded');
  }

  if (!req.body.pixelPerSecond) {
    throw new ApiError(httpStatus.BAD_REQUEST, '"pixelPerSecond" parameter not found');
  }

  const { pixelPerSecond } = req.body;
  const outFile = `${filePath.split('.')[0]}.json`;

  let result = {};

  const command = `audiowaveform -i ${filePath} -o ${outFile} --pixels-per-second ${pixelPerSecond} --bits 8`;

  try {
    await execPromise(command);
    const buffer = await readFilePromise(outFile);

    if (buffer) {
      logger.info(`Done generating waveform file: ${outFile} --pixels-per-second ${pixelPerSecond}`);

      // Normalize and filter peaks
      const { data } = JSON.parse(buffer.toString());
      const max = getMax(data);
      const normalizedPeaks = data.filter((_, index) => index % 2 !== 0);

      for (let i = 0; i < normalizedPeaks.length; i += 1) {
        normalizedPeaks[i] = Math.round((normalizedPeaks[i] / max) * 100) / 100;
      }

      result = {
        peaks: normalizedPeaks,
        pixelPerSecond,
      };

      // Cleanup generated file
      await unlinkPromise(outFile);

      // Cleanup downloaded audio
      await unlinkPromise(filePath);
    }
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Error generating waveform. ${JSON.stringify(error)}`);
  }

  return result;
};

module.exports = {
  generateAudioWaveform,
};
