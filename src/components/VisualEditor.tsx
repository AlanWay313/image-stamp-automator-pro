
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadedImage, Logo } from '@/pages/Index';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface VisualEditorProps {
  image: UploadedImage;
  logo: Logo;
  onSave: (processedImage: string) => void;
}

interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  image,
  logo,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [logoPosition, setLogoPosition] = useState({ x: 50, y: 50 });
  const [logoScale, setLogoScale] = useState(0.1);
  const [logoOpacity, setLogoOpacity] = useState(0.8);
  const [imageScale, setImageScale] = useState(1);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, dragOffset: { x: 0, y: 0 } });
  
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [logoElement, setLogoElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageElement(img);
    img.src = image.preview;

    const logoImg = new Image();
    logoImg.onload = () => setLogoElement(logoImg);
    logoImg.src = logo.preview;
  }, [image.preview, logo.preview]);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageElement || !logoElement) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const maxWidth = containerRect.width - 40;
    const maxHeight = 500;
    
    const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    let canvasWidth = maxWidth;
    let canvasHeight = maxWidth / aspectRatio;
    
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * aspectRatio;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background image
    ctx.save();
    ctx.scale(imageScale, imageScale);
    const scaledWidth = canvasWidth / imageScale;
    const scaledHeight = canvasHeight / imageScale;
    ctx.drawImage(imageElement, 0, 0, scaledWidth, scaledHeight);
    ctx.restore();
    
    // Draw logo
    const logoWidth = logoElement.naturalWidth * logoScale * (canvasWidth / imageElement.naturalWidth);
    const logoHeight = logoElement.naturalHeight * logoScale * (canvasWidth / imageElement.naturalWidth);
    
    const logoX = (logoPosition.x / 100) * canvasWidth - logoWidth / 2;
    const logoY = (logoPosition.y / 100) * canvasHeight - logoHeight / 2;
    
    ctx.save();
    ctx.globalAlpha = logoOpacity;
    ctx.drawImage(logoElement, logoX, logoY, logoWidth, logoHeight);
    ctx.restore();
  }, [imageElement, logoElement, logoPosition, logoScale, logoOpacity, imageScale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;
    
    setDragState({
      isDragging: true,
      dragOffset: {
        x: x - logoPosition.x,
        y: y - logoPosition.y
      }
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState.isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;
    
    setLogoPosition({
      x: Math.max(5, Math.min(95, x - dragState.dragOffset.x)),
      y: Math.max(5, Math.min(95, y - dragState.dragOffset.y))
    });
  };

  const handleCanvasMouseUp = () => {
    setDragState({ isDragging: false, dragOffset: { x: 0, y: 0 } });
  };

  const resetPosition = () => {
    setLogoPosition({ x: 50, y: 50 });
    setLogoScale(0.1);
    setLogoOpacity(0.8);
    setImageScale(1);
  };

  const saveImage = async () => {
    if (!canvasRef.current) return;
    
    // Create a high-resolution canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx || !imageElement || !logoElement) return;
    
    exportCanvas.width = imageElement.naturalWidth;
    exportCanvas.height = imageElement.naturalHeight;
    
    // Draw the original image
    exportCtx.drawImage(imageElement, 0, 0);
    
    // Draw logo at the correct position and scale
    const logoWidth = logoElement.naturalWidth * logoScale;
    const logoHeight = logoElement.naturalHeight * logoScale;
    const logoX = (logoPosition.x / 100) * exportCanvas.width - logoWidth / 2;
    const logoY = (logoPosition.y / 100) * exportCanvas.height - logoHeight / 2;
    
    exportCtx.save();
    exportCtx.globalAlpha = logoOpacity;
    exportCtx.drawImage(logoElement, logoX, logoY, logoWidth, logoHeight);
    exportCtx.restore();
    
    // Convert to blob and save
    exportCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onSave(url);
      }
    }, 'image/png', 0.95);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Editor Visual - {image.file.name}
        </h3>
        <p className="text-sm text-gray-600">
          Arraste a logo pela imagem e ajuste as configurações
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div 
            ref={containerRef}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className={`max-w-full rounded shadow-md ${
                dragState.isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Logo Controls */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Controles da Logo</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho da Logo: {Math.round(logoScale * 100)}%
              </label>
              <Slider
                value={[logoScale]}
                onValueChange={(value) => setLogoScale(value[0])}
                min={0.05}
                max={0.5}
                step={0.01}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacidade: {Math.round(logoOpacity * 100)}%
              </label>
              <Slider
                value={[logoOpacity]}
                onValueChange={(value) => setLogoOpacity(value[0])}
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Image Controls */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Controles da Imagem</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(imageScale * 100)}%
              </label>
              <Slider
                value={[imageScale]}
                onValueChange={(value) => setImageScale(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageScale(Math.min(2, imageScale + 0.1))}
                className="flex-1"
              >
                <ZoomIn className="h-4 w-4 mr-1" />
                Zoom +
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageScale(Math.max(0.5, imageScale - 0.1))}
                className="flex-1"
              >
                <ZoomOut className="h-4 w-4 mr-1" />
                Zoom -
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetPosition}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar Posição
            </Button>
            
            <Button
              onClick={saveImage}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Salvar Imagem
            </Button>
          </div>

          {/* Position Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="text-gray-600">
              <strong>Posição:</strong> {Math.round(logoPosition.x)}%, {Math.round(logoPosition.y)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
