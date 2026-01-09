const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['text/markdown', 'text/x-markdown'];
  const allowedExts = ['.md', '.markdown'];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Only Markdown (.md) files are allowed!', false));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {fileSize: 5 * 1024 * 1024}
})

module.exports = upload;