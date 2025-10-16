import admin from '../config/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// Configure your Firebase Storage bucket
// Option 1: Use environment variable (recommended for production)
// Option 2: Use default bucket (uses project ID from service account)
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'concoevents.firebasestorage.app';
const bucket = admin.storage().bucket(bucketName);

console.log('📦 Firebase Storage bucket configured:', bucketName);

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface ImageMetadata {
  eventId?: string;
  organizerId: string;
  originalName: string;
  contentType: string;
  size: number;
}

/**
 * Upload an image to Firebase Storage
 * @param imageBuffer - The image file as a buffer
 * @param metadata - Image metadata
 * @returns Promise<ImageUploadResult>
 */
export const uploadEventImage = async (
  imageBuffer: Buffer,
  metadata: ImageMetadata
): Promise<ImageUploadResult> => {
  try {
    // Generate unique filename
    const fileExtension = metadata.originalName.split('.').pop() || 'jpg';
    const fileName = `event_${Date.now()}_${uuidv4().substring(0, 8)}.${fileExtension}`;
    const filePath = `event-images/${fileName}`;

    // Create file reference
    const file = bucket.file(filePath);

    // Upload options
    const uploadOptions = {
      metadata: {
        contentType: metadata.contentType,
        metadata: {
          eventId: metadata.eventId || '',
          organizerId: metadata.organizerId,
          originalName: metadata.originalName,
          uploadedAt: new Date().toISOString()
        }
      },
      resumable: false, // For smaller files
      validation: 'crc32c' // Data integrity check
    };

    // Upload the file
    await file.save(imageBuffer, uploadOptions);

    // Make the file publicly readable
    await file.makePublic();

    // Get the public URL
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log(`✅ Image uploaded successfully: ${imageUrl}`);

    return {
      success: true,
      imageUrl
    };

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The public URL of the image to delete
 * @returns Promise<boolean>
 */
export const deleteEventImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
    const filePath = `event-images/${fileName}`;

    // Delete the file
    await bucket.file(filePath).delete();

    console.log(`✅ Image deleted successfully: ${filePath}`);
    return true;

  } catch (error) {
    console.error('❌ Error deleting image:', error);
    return false;
  }
};

/**
 * Get image metadata from Firebase Storage
 * @param imageUrl - The public URL of the image
 * @returns Promise<any>
 */
export const getImageMetadata = async (imageUrl: string) => {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    const filePath = `event-images/${fileName}`;

    const [metadata] = await bucket.file(filePath).getMetadata();
    return metadata;

  } catch (error) {
    console.error('❌ Error getting image metadata:', error);
    return null;
  }
};
