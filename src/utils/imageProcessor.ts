
import { WatermarkPosition } from '@/types/watermark';

export const processImageWithWatermark = async (
  imageFile: File,
  logoFile: File,
  position: WatermarkPosition
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const image = new Image();
    const logo = new Image();
    
    let imageLoaded = false;
    let logoLoaded = false;
    
    const processImages = () => {
      if (!imageLoaded || !logoLoaded) return;
      
      // Set canvas size to match the original image
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      // Draw the original image
      ctx.drawImage(image, 0, 0);
      
      // Calculate logo size (10% of image width, maintaining aspect ratio)
      const logoMaxWidth = canvas.width * 0.1;
      const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
      const logoWidth = Math.min(logoMaxWidth, logo.naturalWidth);
      const logoHeight = logoWidth / logoAspectRatio;
      
      // Calculate logo position with margin
      const margin = Math.min(canvas.width, canvas.height) * 0.02;
      let x, y;
      
      switch (position) {
        case 'top-left':
          x = margin;
          y = margin;
          break;
        case 'top-right':
          x = canvas.width - logoWidth - margin;
          y = margin;
          break;
        case 'bottom-left':
          x = margin;
          y = canvas.height - logoHeight - margin;
          break;
        case 'bottom-right':
          x = canvas.width - logoWidth - margin;
          y = canvas.height - logoHeight - margin;
          break;
        default:
          x = canvas.width - logoWidth - margin;
          y = canvas.height - logoHeight - margin;
      }
      
      // Set logo opacity
      ctx.globalAlpha = 0.8;
      
      // Draw the logo
      ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      
      // Reset opacity
      ctx.globalAlpha = 1.0;
      
      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Could not create blob'));
        }
      }, 'image/png', 0.9);
    };
    
    image.onload = () => {
      imageLoaded = true;
      processImages();
    };
    
    logo.onload = () => {
      logoLoaded = true;
      processImages();
    };
    
    image.onerror = () => reject(new Error('Failed to load image'));
    logo.onerror = () => reject(new Error('Failed to load logo'));
    
    // Load the images
    image.src = URL.createObjectURL(imageFile);
    logo.src = URL.createObjectURL(logoFile);
  });
};
