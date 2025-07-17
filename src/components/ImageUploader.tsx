
import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { UploadedImage } from '@/pages/Index';

interface ImageUploaderProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  uploadedImages: UploadedImage[];
  onClearAll: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesUploaded,
  uploadedImages,
  onClearAll
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelection = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    const newImages: UploadedImage[] = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file)
    }));

    onImagesUploaded(newImages);
  }, [onImagesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelection(e.dataTransfer.files);
  }, [handleFileSelection]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = (imageId: string) => {
    const imageToRemove = uploadedImages.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    // This would need to be passed up to parent component
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-colors ${
            isDragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 transition-colors ${
              isDragOver ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Arraste e solte suas imagens aqui
            </h3>
            <p className="text-gray-600 mb-4">
              Ou clique para selecionar arquivos (JPEG, PNG)
            </p>
          </div>

          <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Selecionar Imagens
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelection(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Imagens Carregadas ({uploadedImages.length})</span>
            </h3>
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 flex items-center space-x-2 px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar Tudo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => removeImage(image.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2 truncate" title={image.file.name}>
                  {image.file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
