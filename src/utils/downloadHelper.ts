
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UploadedImage } from '@/pages/Index';

export const downloadSingleImage = (imageUrl: string, originalFileName: string) => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `watermarked_${originalFileName}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAsZip = async (images: UploadedImage[]) => {
  const zip = new JSZip();
  
  for (const image of images) {
    if (image.processed) {
      try {
        const response = await fetch(image.processed);
        const blob = await response.blob();
        zip.file(`watermarked_${image.file.name}`, blob);
      } catch (error) {
        console.error('Error adding image to zip:', error);
      }
    }
  }
  
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `watermarked_images_${Date.now()}.zip`);
  } catch (error) {
    console.error('Error generating zip:', error);
  }
};
