
import React from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { UploadedImage, Logo } from '@/pages/Index';
import { WatermarkPosition } from '@/types/watermark';

interface PreviewPanelProps {
  images: UploadedImage[];
  selectedLogo: Logo;
  watermarkPosition: WatermarkPosition;
  selectedImageId: string | null;
  onImageSelect: (imageId: string | null) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  images,
  selectedLogo,
  watermarkPosition,
  selectedImageId,
  onImageSelect
}) => {
  const selectedImage = selectedImageId 
    ? images.find(img => img.id === selectedImageId)
    : images[0];

  const currentIndex = selectedImage 
    ? images.findIndex(img => img.id === selectedImage.id)
    : 0;

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageSelect(images[prevIndex].id);
  };

  const goToNext = () => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageSelect(images[nextIndex].id);
  };

  const getLogoPositionStyle = () => {
    const baseStyle = "absolute w-16 h-16 opacity-70";
    switch (watermarkPosition) {
      case 'top-left':
        return `${baseStyle} top-4 left-4`;
      case 'top-right':
        return `${baseStyle} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyle} bottom-4 left-4`;
      case 'bottom-right':
        return `${baseStyle} bottom-4 right-4`;
    }
  };

  if (!selectedImage) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Eye className="h-5 w-5" />
        <span>Preview da Marca d'Água</span>
      </h3>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview Principal */}
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
            <img
              src={selectedImage.preview}
              alt={selectedImage.file.name}
              className="w-full h-full object-contain"
            />
            <img
              src={selectedLogo.preview}
              alt="Logo preview"
              className={`${getLogoPositionStyle()} object-contain`}
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrevious}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Anterior</span>
              </button>

              <span className="text-sm text-gray-600">
                {currentIndex + 1} de {images.length}
              </span>

              <button
                onClick={goToNext}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span>Próximo</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Selecionar Imagem</h4>
          <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => onImageSelect(image.id)}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage.id === image.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
