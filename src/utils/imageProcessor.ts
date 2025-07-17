
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
      
      // Set canvas size to match the original image exactly - NO BORDERS
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      // Clear canvas and draw the original image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Calculate logo size
      const logoScale = options?.scale || 0.15;
      const logoWidth = Math.min(canvas.width * logoScale, logo.naturalWidth);
      const logoHeight = (logoWidth / logo.naturalWidth) * logo.naturalHeight;
      
      // Calculate logo position
      const margin = Math.min(canvas.width, canvas.height) * 0.02;
      let x, y;
      
      if (position === 'custom' && options?.customPosition) {
        // Use exact pixel coordinates for custom positioning
        x = options.customPosition.x;
        y = options.customPosition.y;
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
      
      // Ensure logo stays within canvas bounds
      x = Math.max(0, Math.min(x, canvas.width - logoWidth));
      y = Math.max(0, Math.min(y, canvas.height - logoHeight));
      
      // Apply logo opacity and draw
      ctx.globalAlpha = options?.opacity || 0.9;
      ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0;
      
      // Convert to blob with high quality
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Could not create blob'));
        }
      }, 'image/png', 1.0);
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
    
    // Load images
    image.src = URL.createObjectURL(imageFile);
    logo.src = URL.createObjectURL(logoFile);
  });
};

// Updated function for custom positioning with exact coordinates
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
    opacity: logoOpacity
  });
};
