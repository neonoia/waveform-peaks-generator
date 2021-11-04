const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { waveformService } = require('../services');

const generateWaveform = catchAsync(async (req, res) => {
  const result = await waveformService.generateAudioWaveform(req);
  res.status(httpStatus.CREATED).send({ ...result });
});

module.exports = {
  generateWaveform,
};
