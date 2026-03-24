import multer from "multer";
import path from "path";

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.baseUrl.includes("listing")) {
      cb(null, "uploads/listings/");
    } else if (req.baseUrl.includes("user")) {
      cb(null, "uploads/profiles/");
    } else {
      cb(null, "uploads/");
    }
  },
  // 🔥 ADD THIS BLOCK (THIS IS YOUR MISSING PIECE)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg/.png
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + ext); // ✅ FIXED
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
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

export default upload;
