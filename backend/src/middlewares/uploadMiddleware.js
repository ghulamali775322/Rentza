import multer from "multer";
import path from "path";

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This points to the uploads folder at the root (outside src)
    cb(null, "uploads/listings/"); 
  },
  filename: (req, file, cb) => {
    // Unique name: timestamp + original filename
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|webp/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, webp) are allowed!"));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

export default upload;