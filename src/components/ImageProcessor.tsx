
import React, { useState } from 'react';
import { Play, Download, Settings, Eye, AlertCircle } from 'lucide-react';
import { UploadedImage, Logo } from '@/pages/Index';
import { WatermarkPosition } from '@/types/watermark';
import { PositionSelector } from '@/components/PositionSelector';
import { PreviewPanel } from '@/components/PreviewPanel';
import { DownloadManager } from '@/components/DownloadManager';
import { processImageWithWatermark } from '@/utils/imageProcessor';

interface ImageProcessorProps {
  images: UploadedImage[];
  selectedLogo: Logo | null;
  watermarkPosition: WatermarkPosition;
  onPositionChange: (position: WatermarkPosition) => void;
  onImageProcessed: (imageId: string, processedUrl: string) => void;
  onLogoSelect: () => void;
}

export const ImageProcessor: React.FC<ImageProcessorProps> = ({
  images,
  selectedLogo,
  watermarkPosition,
  onPositionChange,
  onImageProcessed,
  onLogoSelect
}) => {
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const processAllImages = async () => {
    if (!selectedLogo || images.length === 0) return;

    setProcessing(true);
    setProcessingProgress(0);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        const processedUrl = await processImageWithWatermark(
          image.file,
          selectedLogo.file,
          watermarkPosition
        );
        onImageProcessed(image.id, processedUrl);
        setProcessingProgress(((i + 1) / images.length) * 100);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    setProcessing(false);
  };

  const processedImages = images.filter(img => img.processed);
  const canProcess = selectedLogo && images.length > 0 && !processing;

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-xl p-8 shadow-md border max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma imagem carregada
          </h3>
          <p className="text-gray-600 mb-4">
            Faça upload de imagens para começar o processamento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-white rounded-xl p-6 shadow-md border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configurações da Marca d'Água</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Logo Selecionada
            </label>
            {selectedLogo ? (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <img
                  src={selectedLogo.preview}
                  alt={selectedLogo.name}
                  className="w-12 h-12 object-contain bg-white rounded border"
                />
                <div className="flex-1">
                  <p className="font-medium text-green-800">{selectedLogo.name}</p>
                  <p className="text-sm text-green-600">Logo selecionada</p>
                </div>
                <button
                  onClick={onLogoSelect}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Alterar
                </button>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-gray-600 mb-2">Nenhuma logo selecionada</p>
                <button
                  onClick={onLogoSelect}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Selecionar Logo
                </button>
              </div>
            )}
          </div>

          {/* Position Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Posição da Marca d'Água
            </label>
            <PositionSelector
              position={watermarkPosition}
              onChange={onPositionChange}
            />
          </div>
        </div>

        {/* Process Button */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {images.length} imagem(ns) para processar
            {processedImages.length > 0 && (
              <span className="ml-2 text-green-600">
                • {processedImages.length} processada(s)
              </span>
            )}
          </div>
          
          <button
            onClick={processAllImages}
            disabled={!canProcess}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all ${
              canProcess
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="h-4 w-4" />
            <span>
              {processing ? 'Processando...' : 'Processar Todas'}
            </span>
          </button>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progresso</span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(processingProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      {selectedLogo && (
        <PreviewPanel
          images={images}
          selectedLogo={selectedLogo}
          watermarkPosition={watermarkPosition}
          selectedImageId={selectedImageId}
          onImageSelect={setSelectedImageId}
        />
      )}

      {/* Download Manager */}
      {processedImages.length > 0 && (
        <DownloadManager images={processedImages} />
      )}
    </div>
  );
};
