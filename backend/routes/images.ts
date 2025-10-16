import express, { Request, Response } from 'express';
import multer from 'multer';
import { checkUserAuthToken } from '../middleware/userAuth.js';
import { uploadEventImage, deleteEventImage, getImageMetadata } from '../services/imageStorage.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

// Configure multer for memory storage (we'll upload directly to Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'));
    }
  }
});

// POST /images/upload - Upload event image
router.post('/upload', 
  checkUserAuthToken, 
  upload.single('image'), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('=== IMAGE UPLOAD ROUTE CALLED ===');
      console.log('User:', req.user?.uid);
      console.log('File:', req.file?.originalname);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      if (!req.user?.uid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Upload image to Firebase Storage
      const uploadResult = await uploadEventImage(req.file.buffer, {
        eventId: req.body.eventId || undefined,
        organizerId: req.user.uid,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size
      });

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          error: uploadResult.error || 'Failed to upload image'
        });
      }

      res.json({
        success: true,
        data: {
          imageUrl: uploadResult.imageUrl,
          originalName: req.file.originalname,
          size: req.file.size,
          contentType: req.file.mimetype
        },
        message: 'Image uploaded successfully'
      });

    } catch (error) {
      console.error('❌ Error in image upload route:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// DELETE /images/delete - Delete event image
router.delete('/delete', 
  checkUserAuthToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('=== IMAGE DELETE ROUTE CALLED ===');
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required'
        });
      }

      if (!req.user?.uid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // TODO: Add authorization check - only allow organizer to delete their images
      // For now, we'll allow any authenticated user to delete any image
      // In production, you should verify the user owns the event

      const deleted = await deleteEventImage(imageUrl);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete image'
        });
      }

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });

    } catch (error) {
      console.error('❌ Error in image delete route:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /images/metadata/:imageUrl - Get image metadata
router.get('/metadata', 
  checkUserAuthToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { imageUrl } = req.query;

      if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required'
        });
      }

      const metadata = await getImageMetadata(imageUrl);

      if (!metadata) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      res.json({
        success: true,
        data: metadata,
        message: 'Image metadata retrieved successfully'
      });

    } catch (error) {
      console.error('❌ Error in image metadata route:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
