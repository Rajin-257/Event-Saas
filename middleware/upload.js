const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './public/uploads/';
    
    // Set upload path based on file type
    if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'eventImage') {
      uploadPath += 'events/';
    } else if (file.fieldname === 'productImage') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'sponsorLogo') {
      uploadPath += 'sponsors/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif|webp/;
  
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new Error('Error: Images Only!'), false);
  }
};

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload;