const { exec } = require("child_process");
const MultipartDownload = require("multipart-download");
const os = require("os");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();
const app = express();

let tempDir = os.homedir() + "\\audiowaveform-server";
if (os.platform() != "win32") {
  tempDir = os.homedir() + "/audiowaveform-server";
}

app.use("/", router);

var jsonParser = bodyParser.json();

router.post("/waveform", jsonParser, (req, res) => {
  if (req.body.url) {
    const url = req.body.url;
    
    try {
      new MultipartDownload()
        .start(url, {
          numOfConnections: 3,
          saveDirectory: tempDir,
          headers: { accept: "audio/*" },
        })
        .on("end", (filePath) => {
          console.log("Downloaded file: " + filePath);
          runAudiowaveform(res, filePath, tempDir);
        });
    } catch (err) {
      handleError(res, err);
    }
  } else {
    handleError(res, { error: '"url" parameter not found' });
  }
});

app.listen(5005, () => {
  exec("audiowaveform -v", (error) => {
    error
      ? app.close(() => {
          console.log("Audiowaveform not on path. Closing server.");
        })
      : console.log("Found Audiowaveform on path");
  });

  exec("python -V", (error) => {
    error
      ? app.close(() => {
          console.log("Python not on path. Closing server.");
        })
      : console.log("Found Python on path");
  });

  !fs.existsSync(tempDir) &&
    fs.mkdir(tempDir, (error) => {
      error
        ? app.close(() => {
            console.log("Error creating temp folder: " + JSON.stringify(error));
          })
        : console.log("Created temp folder: " + tempDir);
    });
});

function runAudiowaveform(response, filePath, tempDir) {
  let filename = filePath
    .split("\\")
    [filePath.split("\\").length - 1].split(".")[0];
  let outFile = tempDir + "\\" + filename + ".json";

  if (os.platform() != "win32") {
    filename = filePath
      .split("/")
      [filePath.split("/").length - 1].split(".")[0];
    outFile = tempDir + "/" + filename + ".json";
  }

  const cmd =
    "audiowaveform -i " +
    filePath +
    " -o " +
    outFile +
    " --pixels-per-second 20 --bits 8";

  execCmd(response, cmd, () => {
    runScaleFile(response, outFile, () => {
      cleanup(filePath);
      cleanup(outFile);
    });
  });
}

function runScaleFile(response, audiowaveformJsonFile, callback) {
  const cmd = "python ./src/scale.py " + audiowaveformJsonFile;

  execCmd(response, cmd, () => {
    fs.readFile(audiowaveformJsonFile, (error, data) => {
      if (error) {
        handleError(response, error);
      } else {
        console.log("Done generating waveform file: " + audiowaveformJsonFile);
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.end(data);
      }

      callback();
    });
  });
}

function cleanup(filePath) {
  fs.unlink(filePath, (error) => {
    error
      ? console.log("Error deleting file: " + filePath + " " + error)
      : console.log("Deleted file: " + filePath);
  });
}

function execCmd(res, cmd, callback) {
  console.log("Exec: " + cmd);

  exec(cmd, (error, stdout, stderror) => {
    console.log(stdout);
    if (error) {
      handleError(res, error);
      return;
    }
    stderror && console.log(stderror);

    callback(stdout);
  });
}

function handleError(res, message) {
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(message));
}
