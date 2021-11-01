function getOutFile(filePath, tempDir, rate) {
  const filename = filePath
    .split("/")
    [filePath.split("/").length - 1].split(".")[0];

  return `${tempDir}/${filename}-${rate}.json`;
}

module.exports = getOutFile;
