
export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface WatermarkOptions {
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  margin: number;
}
