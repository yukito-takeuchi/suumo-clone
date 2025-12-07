const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export const getImageUrl = (imagePath: string): string => {
  // If it's already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a base64 data URL, return as-is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // If it's a relative path, prepend backend URL
  if (imagePath.startsWith('/')) {
    return `${BACKEND_URL}${imagePath}`;
  }

  // Otherwise, assume it's relative and prepend /uploads/
  return `${BACKEND_URL}/uploads/${imagePath}`;
};
