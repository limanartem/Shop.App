import React, { useState, useRef } from 'react';
import { Box, IconButton, Typography, Stack, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface ImageUploadProps {
  initialImages?: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  cdnUrl: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  initialImages = [], 
  onChange, 
  maxImages = 5,
  cdnUrl
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [previewImages, setPreviewImages] = useState<string[]>(
    initialImages.map(url => url.startsWith('data:') ? url : `${cdnUrl}${url}`)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Check if adding new files exceeds maxImages limit
      if (images.length + newFiles.length > maxImages) {
        alert(`You can only upload a maximum of ${maxImages} images.`);
        return;
      }
      
      // Create preview URLs and data URLs for the images
      const newPreviewUrls: string[] = [];
      const newImageUrls: string[] = [];
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          newPreviewUrls.push(dataUrl);
          newImageUrls.push(dataUrl);
          
          // When all files are processed, update state
          if (newPreviewUrls.length === newFiles.length) {
            const updatedPreviews = [...previewImages, ...newPreviewUrls];
            const updatedImages = [...images, ...newImageUrls];
            setPreviewImages(updatedPreviews);
            setImages(updatedImages);
            onChange(updatedImages);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedPreviewImages = [...previewImages];
    const updatedImages = [...images];
    
    updatedPreviewImages.splice(index, 1);
    updatedImages.splice(index, 1);
    
    setPreviewImages(updatedPreviewImages);
    setImages(updatedImages);
    onChange(updatedImages);
  };

  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Product Images
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
        {previewImages.map((preview, index) => (
          <Paper 
            key={index} 
            sx={{ 
              width: 120, 
              height: 120, 
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={preview} 
              alt={`Product preview ${index + 1}`} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                objectFit: 'contain'
              }} 
            />
            <IconButton 
              size="small" 
              sx={{ 
                position: 'absolute', 
                top: 2, 
                right: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
              onClick={() => handleRemoveImage(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Paper>
        ))}
        
        {images.length < maxImages && (
          <Paper 
            sx={{ 
              width: 120, 
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px dashed #ccc'
            }}
            onClick={handleAddImageClick}
          >
            <Stack direction="column" alignItems="center" spacing={1}>
              <AddPhotoAlternateIcon />
              <Typography variant="caption">Add Image</Typography>
            </Stack>
          </Paper>
        )}
      </Stack>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Upload up to {maxImages} images. Supported formats: JPG, PNG, GIF.
      </Typography>
    </Box>
  );
};

export default ImageUpload;
