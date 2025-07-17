import { Button } from "@/components/ui/button"
import React, { useState } from 'react';
import { Play, Download, Settings, Eye, AlertCircle, Edit3, Sparkles } from 'lucide-react';
import { UploadedImage, Logo } from '@/pages/Index';
import { WatermarkPosition } from '@/types/watermark';
import { PositionSelector } from '@/components/PositionSelector';
import { PreviewPanel } from '@/components/PreviewPanel';
import { DownloadManager } from '@/components/DownloadManager';
import { VisualEditor } from '@/components/VisualEditor';
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
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  const editingImage = editingImageId ? images.find(img => img.id === editingImageId) : null;

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

  const handleVisualEditorSave = (processedUrl: string) => {
    if (editingImageId) {
      onImageProcessed(editingImageId, processedUrl);
      setEditingImageId(null);
    }
  };

  const processedImages = images.filter(img => img.processed);
  const canProcess = selectedLogo && images.length > 0 && !processing;

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-muted/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma imagem carregada
          </h3>
          <p className="text-muted-foreground">
            Faça upload de imagens para começar o processamento
          </p>
        </div>
      </div>
    );
  }

  // Visual Editor Mode
  if (editingImageId && editingImage && selectedLogo) {
    return (
      <VisualEditor
        image={editingImage}
        logo={selectedLogo}
        onSave={handleVisualEditorSave}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Processar Imagens</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Configure sua marca d'água e processe suas imagens automaticamente ou use o editor visual para controle total
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-primary">{images.length}</div>
          <div className="text-sm text-muted-foreground">Imagens carregadas</div>
        </div>
        <div className="bg-card border rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{processedImages.length}</div>
          <div className="text-sm text-muted-foreground">Processadas</div>
        </div>
        <div className="bg-card border rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {selectedLogo ? '1' : '0'}
          </div>
          <div className="text-sm text-muted-foreground">Logo selecionada</div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurações da Marca d'Água</span>
          </h3>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Logo Selection */}
            <div>
              <label className="block text-sm font-medium mb-4">
                Logo Selecionada
              </label>
              {selectedLogo ? (
                <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center p-2">
                    <img
                      src={selectedLogo.preview}
                      alt={selectedLogo.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{selectedLogo.name}</p>
                    <p className="text-sm text-green-600">Pronta para uso</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogoSelect}
                  >
                    Alterar
                  </Button>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-muted rounded-lg text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-3">Nenhuma logo selecionada</p>
                  <Button onClick={onLogoSelect}>
                    Selecionar Logo
                  </Button>
                </div>
              )}
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium mb-4">
                Posição da Marca d'Água
              </label>
              <PositionSelector
                position={watermarkPosition}
                onChange={onPositionChange}
              />
            </div>
          </div>

          {/* Process Actions */}
          <div className="mt-8 flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">
                {images.length} imagem(ns) para processar
              </span>
              {processedImages.length > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  • {processedImages.length} processada(s)
                </span>
              )}
            </div>
            
            <Button
              onClick={processAllImages}
              disabled={!canProcess}
              size="lg"
              className="px-8"
            >
              <Play className="h-4 w-4 mr-2" />
              {processing ? 'Processando...' : 'Processar Todas'}
            </Button>
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-sm font-medium text-primary">
                  {Math.round(processingProgress)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Grid */}
      {selectedLogo && (
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Suas Imagens</span>
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() => setEditingImageId(image.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                  
                  <p className="mt-2 text-xs text-muted-foreground truncate">
                    {image.file.name}
                  </p>
                  
                  {image.processed && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
