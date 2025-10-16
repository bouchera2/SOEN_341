import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'paid' | 'free';
  capacity: number;
  tags: string[];
  imageUrl?: string;
}

interface CreateEventFormProps {
  onEventCreated?: () => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'free',
    capacity: 0,
    tags: [],
    imageUrl: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(category) 
        ? prev.tags.filter(tag => tag !== category)
        : [...prev.tags, category]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setErrorMessage('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      console.log('📤 Uploading image...');

      const formData = new FormData();
      formData.append('image', file);

      const token = await user?.getIdToken();
      const response = await fetch('http://localhost:3002/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Image uploaded successfully:', result.data.imageUrl);
      return result.data.imageUrl;

    } catch (error) {
      console.error('❌ Error uploading image:', error);
      setErrorMessage('Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // First check if user still has permission (double-check)
      const permissionResponse = await fetch('http://localhost:3002/permissions/event-creation', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });

      if (permissionResponse.status === 403) {
        setSubmitStatus('error');
        setErrorMessage('You no longer have permission to create events. Please contact an administrator.');
        return;
      }

      // Upload image first if one is selected
      let imageUrl = formData.imageUrl;
      if (selectedImage && !imageUrl) {
        const uploadedImageUrl = await uploadImage(selectedImage);
        if (!uploadedImageUrl) {
          setSubmitStatus('error');
          setErrorMessage('Failed to upload image. Please try again.');
          return;
        }
        imageUrl = uploadedImageUrl;
      }

      const eventData = {
        ...formData,
        imageUrl,
        organizer: user?.uid || '',
        attendees: [],
        bookedCount: 0
      };

      const response = await fetch('http://localhost:3002/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          type: 'free',
          capacity: 0,
          tags: [],
          imageUrl: undefined
        });
        setSelectedImage(null);
        setImagePreview(null);
        // Call the callback if provided
        if (onEventCreated) {
          onEventCreated();
        }
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || result.details || 'Failed to create event');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="create-event-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-container">
        <h2 className="form-title">Create New Event</h2>
        <p className="form-subtitle">Fill out the details below to create your event</p>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe your event"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Event location"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Event Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                placeholder="Maximum attendees"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Event Categories</label>
            <div className="category-checkboxes">
              {["Sports", "Technology", "Music", "Competition"].map((category) => (
                <label key={category} className="category-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="category-checkbox"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">{category}</span>
                </label>
              ))}
            </div>
            <small>Select one or more categories for your event</small>
          </div>

          <div className="form-group">
            <label htmlFor="image">Event Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="image-input"
              />
              <label htmlFor="image" className="image-upload-label">
                {isUploadingImage ? (
                  <div className="uploading-state">
                    <div className="loading-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="upload-icon">📷</div>
                    <span>Choose Image</span>
                    <small>JPEG, PNG, GIF, WebP (max 5MB)</small>
                  </div>
                )}
              </label>
              
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="remove-image-btn"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="success-message">
              ✅ Event created successfully!
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="error-message">
              ❌ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || isUploadingImage}
          >
            {isUploadingImage ? 'Uploading Image...' : isSubmitting ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateEventForm;
