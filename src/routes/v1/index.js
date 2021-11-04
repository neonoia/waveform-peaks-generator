const express = require('express');
const waveformRoute = require('./waveform.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/',
    route: waveformRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
