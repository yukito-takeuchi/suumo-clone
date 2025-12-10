import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// GCS or Local storage based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Google Cloud Storage setup
let storage: Storage | null = null;
let bucketName: string | null = null;

if (isProduction && process.env.GCS_BUCKET_NAME) {
  bucketName = process.env.GCS_BUCKET_NAME;

  // GCS credentials from environment variable
  if (process.env.GCS_CREDENTIALS) {
    // Parse JSON string from environment variable
    const credentials = JSON.parse(process.env.GCS_CREDENTIALS);
    storage = new Storage({
      projectId: credentials.project_id,
      credentials,
    });
  } else {
    console.warn('GCS_CREDENTIALS not found. Using default credentials.');
    storage = new Storage();
  }
}

// Multer storage configuration
export const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // For local development
      cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// Upload file to GCS (called after multer processes the file)
export const uploadToGCS = async (localFilePath: string, filename: string): Promise<string> => {
  if (!isProduction || !storage || !bucketName) {
    // Return local file URL for development
    return `/uploads/${filename}`;
  }

  try {
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);

    // Upload file
    await bucket.upload(localFilePath, {
      destination: filename,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make file public
    await blob.makePublic();

    // Return public URL
    return `https://storage.googleapis.com/${bucketName}/${filename}`;
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

// Delete file from GCS
export const deleteFromGCS = async (fileUrl: string): Promise<void> => {
  if (!isProduction || !storage || !bucketName) {
    return; // Skip for local development
  }

  try {
    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    if (!filename) return;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);

    await file.delete();
    console.log(`Deleted file from GCS: ${filename}`);
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    // Don't throw error for deletion failures
  }
};

export { storage, bucketName };
