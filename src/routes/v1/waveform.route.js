const express = require('express');
const upload = require('../../middlewares/upload');
const waveformController = require('../../controllers/waveform.controller');

const router = express.Router();

router.post('/waveform', upload, waveformController.generateWaveform);

module.exports = router;
