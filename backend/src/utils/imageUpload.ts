import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Storage } from '@google-cloud/storage';

// GCS setup
const isProduction = process.env.NODE_ENV === 'production';
const bucketName = process.env.GCS_BUCKET_NAME;

let storage: Storage | null = null;

if (isProduction && bucketName && process.env.GCS_CREDENTIALS) {
  try {
    const credentials = JSON.parse(process.env.GCS_CREDENTIALS);
    storage = new Storage({
      projectId: credentials.project_id,
      credentials,
    });
    console.log('✅ Google Cloud Storage initialized');
  } catch (error) {
    console.error('❌ Failed to initialize GCS:', error);
  }
}

export const saveBase64Image = async (base64String: string): Promise<string> => {
  // If it's already a URL (existing image), return as-is
  if (base64String.startsWith('/uploads/') || base64String.startsWith('http')) {
    return base64String;
  }

  // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const extension = matches[1];
  const data = matches[2];

  // Generate unique filename
  const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;

  // Production: Upload to GCS
  if (isProduction && storage && bucketName) {
    try {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(filename);

      // Convert base64 to buffer
      const buffer = Buffer.from(data, 'base64');

      // Upload to GCS
      await file.save(buffer, {
        metadata: {
          contentType: `image/${extension}`,
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Make file public
      await file.makePublic();

      // Return public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
      console.log(`✅ Uploaded to GCS: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('❌ Failed to upload to GCS:', error);
      throw new Error('Failed to upload image to cloud storage');
    }
  }

  // Development: Save to local file system
  const uploadsDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, data, 'base64');

  return `/uploads/${filename}`;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Production: Delete from GCS
    if (isProduction && storage && bucketName) {
      // Check if it's a GCS URL
      if (imageUrl.includes('storage.googleapis.com')) {
        const filename = imageUrl.split('/').pop();
        if (filename) {
          const bucket = storage.bucket(bucketName);
          const file = bucket.file(filename);
          await file.delete();
          console.log(`✅ Deleted from GCS: ${filename}`);
        }
      }
      return;
    }

    // Development: Delete from local file system
    const filename = path.basename(imageUrl);
    const filepath = path.join(__dirname, '../../public/uploads', filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`✅ Deleted local file: ${filename}`);
    }
  } catch (error) {
    console.error('❌ Failed to delete image:', error);
  }
};
