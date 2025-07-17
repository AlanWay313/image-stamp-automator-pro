import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas as FabricCanvas, Image as FabricImage, StaticCanvas } from 'fabric';
import { UploadedImage, Logo } from '@/pages/Index';
import { Button } from "@/components/ui/button";
import { Slider } from '@/components/ui/slider';
import { Download, RotateCcw, Move, Palette, Settings2, X, Trash2 } from 'lucide-react';

interface VisualEditorProps {
  image: UploadedImage;
  logo: Logo;
  onSave: (processedImage: string) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  image,
  logo,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const backgroundImageRef = useRef<FabricImage | null>(null);
  const logoImageRef = useRef<FabricImage | null>(null);
  
  const [logoScale, setLogoScale] = useState(0.15);
  const [logoOpacity, setLogoOpacity] = useState(0.9);
  const [canvasReady, setCanvasReady] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
  const [hasLogo, setHasLogo] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
      uniformScaling: true,
      centeredScaling: true,
    });

    fabricCanvasRef.current = canvas;

    // Load background image
    FabricImage.fromURL(image.preview, {
      crossOrigin: 'anonymous'
    }).then((backgroundImg) => {
      if (!fabricCanvasRef.current) return;
      
      // Set canvas size to match image exactly
      const canvasWidth = backgroundImg.width || 800;
      const canvasHeight = backgroundImg.height || 600;
      
      canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight
      });

      // Scale background image to fit canvas exactly
      backgroundImg.scaleToWidth(canvasWidth);
      backgroundImg.scaleToHeight(canvasHeight);
      backgroundImg.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        hoverCursor: 'default',
        moveCursor: 'default'
      });

      canvas.add(backgroundImg);
      backgroundImageRef.current = backgroundImg;
      
      // Add logo after background is loaded
      addLogoToCanvas();
      setCanvasReady(true);
    });

    // Handle logo selection
    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject === logoImageRef.current) {
        updateLogoPosition(activeObject);
      }
    });

    canvas.on('selection:updated', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject === logoImageRef.current) {
        updateLogoPosition(activeObject);
      }
    });

    canvas.on('object:moving', (e) => {
      if (e.target === logoImageRef.current) {
        updateLogoPosition(e.target);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [image.preview]);

  const updateLogoPosition = (logoObject: any) => {
    if (logoObject) {
      setLogoPosition({
        x: logoObject.left || 0,
        y: logoObject.top || 0
      });
    }
  };

  const addLogoToCanvas = () => {
    if (!fabricCanvasRef.current || !logo.preview) return;

    FabricImage.fromURL(logo.preview, {
      crossOrigin: 'anonymous'
    }).then((logoImg) => {
      if (!fabricCanvasRef.current) return;

      // Remove existing logo if any
      if (logoImageRef.current) {
        fabricCanvasRef.current.remove(logoImageRef.current);
      }

      // Calculate logo size
      const canvasWidth = fabricCanvasRef.current.width || 800;
      const canvasHeight = fabricCanvasRef.current.height || 600;
      const logoWidth = (logoImg.width || 100) * logoScale;
      
      logoImg.scaleToWidth(logoWidth);
      logoImg.set({
        left: canvasWidth - logoWidth - 20,
        top: canvasHeight - (logoImg.getScaledHeight() || 50) - 20,
        opacity: logoOpacity,
        selectable: true,
        evented: true,
        cornerColor: '#2563eb',
        cornerSize: 12,
        transparentCorners: false,
        borderColor: '#2563eb',
        borderScaleFactor: 2,
        hasRotatingPoint: false
      });

      fabricCanvasRef.current.add(logoImg);
      logoImageRef.current = logoImg;
      setHasLogo(true);
      
      // Auto-select the logo
      fabricCanvasRef.current.setActiveObject(logoImg);
      fabricCanvasRef.current.renderAll();
      
      updateLogoPosition(logoImg);
    });
  };

  // Update logo scale
  useEffect(() => {
    if (logoImageRef.current && fabricCanvasRef.current) {
      const logoWidth = (logoImageRef.current.width || 100) * logoScale;
      logoImageRef.current.scaleToWidth(logoWidth);
      fabricCanvasRef.current.renderAll();
    }
  }, [logoScale]);

  // Update logo opacity
  useEffect(() => {
    if (logoImageRef.current && fabricCanvasRef.current) {
      logoImageRef.current.set({ opacity: logoOpacity });
      fabricCanvasRef.current.renderAll();
    }
  }, [logoOpacity]);

  const removeLogo = () => {
    if (logoImageRef.current && fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(logoImageRef.current);
      logoImageRef.current = null;
      setHasLogo(false);
      fabricCanvasRef.current.renderAll();
    }
  };

  const resetSettings = () => {
    setLogoScale(0.15);
    setLogoOpacity(0.9);
    if (fabricCanvasRef.current) {
      addLogoToCanvas();
    }
  };

  const saveImage = () => {
    if (!fabricCanvasRef.current) return;

    // Export as high quality image directly from the main canvas
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    // Convert to blob and save
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        onSave(url);
      });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Editor Visual</h2>
              <p className="text-muted-foreground">
                Arraste a logo para posicioná-la na imagem
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button variant="outline" onClick={removeLogo} disabled={!hasLogo}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remover Logo
              </Button>
              <Button onClick={saveImage} disabled={!canvasReady}>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Move className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{image.file.name}</span>
                  </div>
                  {hasLogo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeLogo}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-muted/30 flex justify-center">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="border border-muted-foreground/20 rounded-lg shadow-lg bg-white max-w-full max-h-[600px] object-contain"
                  />
                  
                  {!canvasReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Carregando editor...</p>
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
                    max={0.5}
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
                  <span className="font-mono">{Math.round(logoPosition.x)}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Y:</span>
                  <span className="font-mono">{Math.round(logoPosition.y)}px</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Como usar</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Arraste a logo para posicioná-la</li>
                <li>• Use os controles para ajustar tamanho</li>
                <li>• Clique em "Remover Logo" para apagar</li>
                <li>• Salve quando estiver satisfeito</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
