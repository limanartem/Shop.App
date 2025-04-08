import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUpload from '../ImageUpload';

// Mock the FileReader API
class MockFileReader {
  onload: (() => void) | null = null;
  readAsDataURL(blob: Blob) {
    if (this.onload) {
      // Mock a base64 data URL
      // @ts-ignore - mocking the result property
      this.result = 'data:image/png;base64,mockImageData';
      setTimeout(() => this.onload && this.onload(), 0);
    }
  }
}

// Replace the global FileReader with our mock
global.FileReader = MockFileReader as any;

describe('ImageUpload Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    initialImages: [],
    onChange: mockOnChange,
    maxImages: 3,
    cdnUrl: 'http://localhost:3005/public'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with no initial images', () => {
    // Arrange & Act
    render(<ImageUpload {...defaultProps} />);
    
    // Assert
    expect(screen.getByText('Add Image')).toBeInTheDocument();
    expect(screen.getByText('Product Images')).toBeInTheDocument();
    expect(screen.getByText(/Upload up to 3 images/)).toBeInTheDocument();
    
    // No images should be visible
    const imagePreviews = screen.queryAllByRole('img');
    expect(imagePreviews.length).toBe(0);
  });

  test('renders with initial images', () => {
    // Arrange
    const initialImages = ['/image1.png', '/image2.png'];
    
    // Act
    render(
      <ImageUpload 
        {...defaultProps} 
        initialImages={initialImages} 
      />
    );
    
    // Assert
    const imagePreviews = screen.getAllByRole('img');
    expect(imagePreviews.length).toBe(2);
    
    // Add Image button should still be visible since maxImages is 3
    expect(screen.getByText('Add Image')).toBeInTheDocument();
  });

  test('does not show Add Image button when max images reached', () => {
    // Arrange
    const initialImages = ['/image1.png', '/image2.png', '/image3.png'];
    
    // Act
    render(
      <ImageUpload 
        {...defaultProps} 
        initialImages={initialImages} 
      />
    );
    
    // Assert
    const imagePreviews = screen.getAllByRole('img');
    expect(imagePreviews.length).toBe(3);
    
    // Add Image button should not be visible since maxImages is 3
    expect(screen.queryByText('Add Image')).not.toBeInTheDocument();
  });

  test('allows user to remove an image', async () => {
    // Arrange
    const initialImages = ['/image1.png', '/image2.png'];
    
    // Act
    render(
      <ImageUpload 
        {...defaultProps} 
        initialImages={initialImages} 
      />
    );
    
    // Click the delete button on the first image
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);
    
    // Assert
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(['/image2.png']);
    });
  });

  test('allows user to add an image', async () => {
    // Arrange
    render(<ImageUpload {...defaultProps} />);
    
    // Act - click the add image button
    fireEvent.click(screen.getByText('Add Image'));
    
    // Create a mock file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    // Get the hidden file input and trigger a change event
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    
    // We need to use a different approach since the input is hidden
    Object.defineProperty(fileInput!, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput!);
    
    // Assert
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(['data:image/png;base64,mockImageData']);
    });
  });

  test('shows correct preview URLs for images', () => {
    // Arrange
    const initialImages = [
      'data:image/png;base64,alreadyDataUrl', // Already a data URL
      '/image-path.png' // Path that needs prefixing with cdnUrl
    ];
    
    // Act
    render(
      <ImageUpload 
        {...defaultProps} 
        initialImages={initialImages} 
      />
    );
    
    // Assert
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'data:image/png;base64,alreadyDataUrl');
    expect(images[1]).toHaveAttribute('src', 'http://localhost:3005/public/image-path.png');
  });

  test('alerts when trying to add more than max images', async () => {
    // Arrange
    const initialImages = ['/image1.png', '/image2.png'];
    
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Act
    render(
      <ImageUpload 
        {...defaultProps} 
        initialImages={initialImages} 
      />
    );
    
    // Click add image
    fireEvent.click(screen.getByText('Add Image'));
    
    // Create mock files (more than allowed)
    const files = [
      new File(['dummy1'], 'test1.png', { type: 'image/png' }),
      new File(['dummy2'], 'test2.png', { type: 'image/png' })
    ];
    
    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]');
    
    // Simulate selecting too many files
    Object.defineProperty(fileInput!, 'files', {
      value: files
    });
    
    fireEvent.change(fileInput!);
    
    // Assert
    expect(alertMock).toHaveBeenCalledWith('You can only upload a maximum of 3 images.');
    
    // Clean up
    alertMock.mockRestore();
  });
});
