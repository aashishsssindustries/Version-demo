import multer from 'multer';
import { Request } from 'express';

// Configure multer for PDF file uploads
// Uses memory storage to keep file in buffer (not saved to disk)
const storage = multer.memoryStorage();

// File filter to accept only PDF files
const fileFilter = (_req: Request, file: any, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

// Create multer instance with configuration
export const uploadPdf = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    }
});

export default uploadPdf;
