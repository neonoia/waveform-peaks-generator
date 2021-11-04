const multer = require("multer");
const os = require("os");
const mime = require("mime-types");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${os.homedir()}/audio`);
  },
  filename: (req, file, cb) => {
    let ext = mime.extension(file.mimetype);
    ext = ext === "mpga" ? "mp3" : ext;
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage }).single("file");

module.exports = upload;
