const os = require("os");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const { DownloaderHelper } = require("node-downloader-helper");

const { generateAudiowaveform } = require("./helpers/generateAudiowaveform");
const cleanupFile = require("./helpers/cleanupFile");

const router = express.Router();
const app = express();

let tempDir = os.homedir() + "\\audiowaveform-server";
if (os.platform() != "win32") {
  tempDir = os.homedir() + "/audiowaveform-server";
}

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

app.use("/", router);

var jsonParser = bodyParser.json();

router.post("/waveform", jsonParser, (req, res) => {
  const handleError = (error) => {
    let errorMessage = JSON.stringify({ error: error });
    console.log(errorMessage);

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(errorMessage);
  };

  if (!req.body.url || req.body.url === "") {
    return handleError('"url" parameter not found or invalid');
  }

  if (!req.body.pixelPerSecond) {
    return handleError('"pixelPerSecond" parameter not found');
  }

  // Extract parameter
  const url = req.body.url;
  const pixelPerSecond = req.body.pixelPerSecond;

  const handleDownloadEnded = async (result) => {
    try {
      console.log("Downloaded file: " + result.filePath);
      const generated = await generateAudiowaveform(
        result.filePath,
        tempDir,
        pixelPerSecond
      );

      // Cleanup downloaded file
      await cleanupFile(result.filePath);

      // Send response
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.end(JSON.stringify(generated));
    } catch (error) {
      return handleError(error);
    }
  };

  const dl = new DownloaderHelper(url, tempDir);
  dl.on("end", handleDownloadEnded);
  dl.on("error", handleError);
  dl.start();
});

app.listen(5005, () => {
  exec("audiowaveform -v", (error) => {
    error
      ? app.close(() =>
          console.log("Audiowaveform not on path. Closing server.")
        )
      : console.log("Found Audiowaveform on path");
  });

  !fs.existsSync(tempDir) &&
    fs.mkdir(tempDir, (error) => {
      error
        ? app.close(() =>
            console.log("Error creating temp folder: " + JSON.stringify(error))
          )
        : console.log("Created temp folder: " + tempDir);
    });
});
