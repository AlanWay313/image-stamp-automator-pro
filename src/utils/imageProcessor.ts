
import { WatermarkPosition, WatermarkOptions } from '@/types/watermark';

export const processImageWithWatermark = async (
  imageFile: File,
  logoFile: File,
  position: WatermarkPosition,
  options?: Partial<WatermarkOptions>
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
      
      // Calculate logo size
      const logoScale = options?.scale || 0.1;
      const logoMaxWidth = canvas.width * logoScale;
      const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
      const logoWidth = Math.min(logoMaxWidth, logo.naturalWidth * logoScale);
      const logoHeight = logoWidth / logoAspectRatio;
      
      // Calculate logo position
      const margin = Math.min(canvas.width, canvas.height) * (options?.margin || 0.02);
      let x, y;
      
      if (position === 'custom' && options?.customPosition) {
        // Custom positioning (percentage based)
        x = (options.customPosition.x / 100) * canvas.width - logoWidth / 2;
        y = (options.customPosition.y / 100) * canvas.height - logoHeight / 2;
      } else {
        // Predefined positions
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
      }
      
      // Ensure logo stays within bounds
      x = Math.max(0, Math.min(x, canvas.width - logoWidth));
      y = Math.max(0, Math.min(y, canvas.height - logoHeight));
      
      // Set logo opacity
      ctx.globalAlpha = options?.opacity || 0.8;
      
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
      }, 'image/png', 0.95);
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

export const processImageWithCustomWatermark = async (
  imageFile: File,
  logoFile: File,
  logoPosition: { x: number; y: number },
  logoScale: number,
  logoOpacity: number
): Promise<string> => {
  return processImageWithWatermark(imageFile, logoFile, 'custom', {
    customPosition: logoPosition,
    scale: logoScale,
    opacity: logoOpacity,
    position: 'custom'
  });
};
