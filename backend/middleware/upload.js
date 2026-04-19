// Feature: smart-diagnosis-center
// Upload Middleware — Multer disk storage for report uploads

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseId = req.body.caseId || req.params.caseId || 'unknown';
    const dir = path.join('uploads', 'reports', caseId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export default upload;
