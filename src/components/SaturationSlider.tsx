import React, { useCallback } from 'react';

interface SaturationSliderProps {
  hue: number;
  saturation: number;
  onChange: (saturation: number) => void;
}

export const SaturationSlider: React.FC<SaturationSliderProps> = ({
  hue,
  saturation,
  onChange
}) => {
  const handleChange = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const container = event.currentTarget;
      const rect = container.getBoundingClientRect();
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      
      const y = clientY - rect.top;
      const newSaturation = 1 - Math.max(0, Math.min(1, y / rect.height));
      
      onChange(newSaturation);
    },
    [onChange]
  );

  return (
    <div className="relative w-8 h-64 rounded-lg overflow-hidden shadow-inner">
      <div
        className="absolute inset-0 cursor-pointer touch-none"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(${hue}, 100%, 50%),
            hsl(${hue}, 0%, 50%))`
        }}
        onMouseDown={handleChange}
        onMouseMove={(e) => e.buttons === 1 && handleChange(e)}
        onTouchStart={(e) => {
          e.preventDefault();
          handleChange(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          handleChange(e);
        }}
      />
      <div
        className="absolute w-full h-2 bg-white border border-gray-200 shadow-sm transform -translate-y-1/2 pointer-events-none"
        style={{
          top: `${(1 - saturation) * 100}%`
        }}
      />
    </div>
  );
};