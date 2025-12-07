import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const saveBase64Image = (base64String: string): string => {
  // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const extension = matches[1];
  const data = matches[2];

  // Generate unique filename
  const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Save file
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, data, 'base64');

  // Return URL
  return `/uploads/${filename}`;
};

export const deleteImage = (imageUrl: string): void => {
  try {
    // Extract filename from URL
    const filename = path.basename(imageUrl);
    const filepath = path.join(__dirname, '../../public/uploads', filename);

    // Delete file if it exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
};
