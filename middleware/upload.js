const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create destination directory if it doesn't exist
const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = 'public/uploads/';
    
    // Determine upload folder based on file type
    if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'eventBanner' || file.fieldname === 'eventImage') {
      uploadPath += 'events/';
    } else if (file.fieldname === 'speakerPhoto') {
      uploadPath += 'speakers/';
    } else if (file.fieldname === 'attendeePhoto') {
      uploadPath += 'attendees/';
    } else {
      uploadPath += 'misc/';
    }
    
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Generate unique filename with original extension
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uuidv4()}${fileExtension}`);
  }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Error handler middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.flash('error_msg', 'File size is too large. Maximum 5MB allowed.');
    } else {
      req.flash('error_msg', `Upload error: ${err.message}`);
    }
    return res.redirect(req.headers.referer || '/');
  } else if (err) {
    req.flash('error_msg', err.message);
    return res.redirect(req.headers.referer || '/');
  }
  next();
};

module.exports = { upload, handleUploadError };