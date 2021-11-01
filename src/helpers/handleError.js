function handleError(res, message) {
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(message));
}

module.exports = handleError;
