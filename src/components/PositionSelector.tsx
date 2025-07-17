
import React from 'react';
import { WatermarkPosition } from '@/types/watermark';

interface PositionSelectorProps {
  position: WatermarkPosition;
  onChange: (position: WatermarkPosition) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  position,
  onChange
}) => {
  const positions: { value: WatermarkPosition; label: string }[] = [
    { value: 'top-left', label: 'Superior Esquerdo' },
    { value: 'top-right', label: 'Superior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' },
    { value: 'bottom-right', label: 'Inferior Direito' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {positions.map((pos) => (
        <button
          key={pos.value}
          onClick={() => onChange(pos.value)}
          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
            position === pos.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50'
          }`}
        >
          {pos.label}
        </button>
      ))}
    </div>
  );
};
