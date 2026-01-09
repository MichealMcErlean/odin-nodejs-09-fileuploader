const multer = require('multer');
const upload = require('./multer.js')

const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('fileinput');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      req.flash('error', `Multer Error: ${err.message}`);
      return res.redirect('back');
    } else if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    next();
  });
};

module.exports = handleUpload