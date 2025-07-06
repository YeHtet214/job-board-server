// import multer from "multer";

// const storage = multer.memoryStorage();
// export const uploadResume = multer({ storage }).single('resume');

// src/utils/multer.ts
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/msword"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})