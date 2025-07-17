
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadedImage, Logo } from '@/pages/Index';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Move, Palette, Settings2 } from 'lucide-react';

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
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [logoPosition, setLogoPosition] = useState({ x: 80, y: 80 });
  const [logoScale, setLogoScale] = useState(0.15);
  const [logoOpacity, setLogoOpacity] = useState(0.9);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, dragOffset: { x: 0, y: 0 } });
  
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [logoElement, setLogoElement] = useState<HTMLImageElement | null>(null);
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageElement(img);
    img.src = image.preview;

    const logoImg = new Image();
    logoImg.onload = () => setLogoElement(logoImg);
    logoImg.src = logo.preview;
  }, [image.preview, logo.preview]);

  const drawCanvas = useCallback((canvas: HTMLCanvasElement, scale: number = 1) => {
    if (!imageElement || !logoElement) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    if (scale === 1) {
      // Original size for final export
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
    } else {
      // Scaled size for display
      canvas.width = imageElement.naturalWidth * scale;
      canvas.height = imageElement.naturalHeight * scale;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    // Calculate logo dimensions
    const logoWidth = logoElement.naturalWidth * logoScale * scale;
    const logoHeight = logoElement.naturalHeight * logoScale * scale;
    
    // Calculate logo position
    const logoX = (logoPosition.x / 100) * canvas.width - logoWidth / 2;
    const logoY = (logoPosition.y / 100) * canvas.height - logoHeight / 2;
    
    // Draw logo with opacity
    ctx.save();
    ctx.globalAlpha = logoOpacity;
    ctx.drawImage(logoElement, logoX, logoY, logoWidth, logoHeight);
    ctx.restore();
  }, [imageElement, logoElement, logoPosition, logoScale, logoOpacity]);

  const updateDisplayCanvas = useCallback(() => {
    if (!displayCanvasRef.current || !containerRef.current || !imageElement) return;
    
    const container = containerRef.current;
    const maxWidth = container.clientWidth - 40;
    const maxHeight = 600;
    
    const scale = Math.min(
      maxWidth / imageElement.naturalWidth,
      maxHeight / imageElement.naturalHeight,
      1
    );
    
    setDisplayScale(scale);
    drawCanvas(displayCanvasRef.current, scale);
  }, [drawCanvas, imageElement]);

  const updateOriginalCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    drawCanvas(canvasRef.current, 1);
  }, [drawCanvas]);

  useEffect(() => {
    updateDisplayCanvas();
    updateOriginalCanvas();
  }, [updateDisplayCanvas, updateOriginalCanvas]);

  useEffect(() => {
    const handleResize = () => updateDisplayCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDisplayCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDragState({
      isDragging: true,
      dragOffset: {
        x: x - logoPosition.x,
        y: y - logoPosition.y
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState.isDragging) return;
    
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setLogoPosition({
      x: Math.max(5, Math.min(95, x - dragState.dragOffset.x)),
      y: Math.max(5, Math.min(95, y - dragState.dragOffset.y))
    });
  };

  const handleMouseUp = () => {
    setDragState({ isDragging: false, dragOffset: { x: 0, y: 0 } });
  };

  const resetSettings = () => {
    setLogoPosition({ x: 80, y: 80 });
    setLogoScale(0.15);
    setLogoOpacity(0.9);
  };

  const saveImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onSave(url);
      }
    }, 'image/png', 0.95);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Editor Visual</h2>
              <p className="text-muted-foreground">Posicione e ajuste sua marca d'água</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={saveImage}>
                <Download className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Move className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{image.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    • Arraste a logo para posicioná-la
                  </span>
                </div>
              </div>
              
              <div ref={containerRef} className="p-6 bg-muted/30">
                <div className="relative mx-auto w-fit">
                  <canvas
                    ref={displayCanvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={`rounded-lg shadow-lg border bg-white ${
                      dragState.isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
                    }`}
                    style={{ 
                      display: 'block',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                  
                  {/* Overlay instructions */}
                  {!dragState.isDragging && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
                      <div className="bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border">
                        <p className="text-xs font-medium">Clique e arraste para mover a logo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            {/* Logo Preview */}
            <div className="bg-card rounded-xl border shadow-sm p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Logo Atual
              </h4>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center p-4">
                <img
                  src={logo.preview}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ opacity: logoOpacity }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center truncate">
                {logo.name}
              </p>
            </div>

            {/* Controls */}
            <div className="bg-card rounded-xl border shadow-sm p-4">
              <h4 className="font-semibold mb-4 flex items-center">
                <Settings2 className="h-4 w-4 mr-2" />
                Ajustes
              </h4>
              
              <div className="space-y-6">
                {/* Size Control */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tamanho: {Math.round(logoScale * 100)}%
                  </label>
                  <Slider
                    value={[logoScale]}
                    onValueChange={(value) => setLogoScale(value[0])}
                    min={0.05}
                    max={0.4}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                {/* Opacity Control */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Opacidade: {Math.round(logoOpacity * 100)}%
                  </label>
                  <Slider
                    value={[logoOpacity]}
                    onValueChange={(value) => setLogoOpacity(value[0])}
                    min={0.1}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Position Info */}
            <div className="bg-card rounded-xl border shadow-sm p-4">
              <h4 className="font-semibold mb-3">Posição</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">X:</span>
                  <span className="font-mono">{Math.round(logoPosition.x)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Y:</span>
                  <span className="font-mono">{Math.round(logoPosition.y)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
