
export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

export interface WatermarkOptions {
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  margin: number;
  customPosition?: {
    x: number;
    y: number;
  };
}

export interface EditorState {
  selectedImageId: string | null;
  logoPosition: { x: number; y: number };
  logoScale: number;
  logoOpacity: number;
  imageScale: number;
  canvasSize: { width: number; height: number };
}
