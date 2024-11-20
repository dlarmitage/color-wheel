import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RotateCcw, Sun, Moon } from 'lucide-react';
import { ColorWheel } from './components/ColorWheel';
import { ColorSlider } from './components/ColorSlider';

function App() {
  const [whiteCenter, setWhiteCenter] = useState(true);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [value, setValue] = useState(1);
  const [position, setPosition] = useState({ x: 1, y: 0 });
  const [showCopied, setShowCopied] = useState(false);
  const [isUserAdjusting, setIsUserAdjusting] = useState(false);

  const toggleCenterMode = useCallback(() => {
    setWhiteCenter(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setHue(0);
    setSaturation(1);
    setValue(1);
    setPosition({ x: 1, y: 0 });
    setWhiteCenter(true);
  }, []);

  const handleColorChange = useCallback(({ hue: h, saturation: s, value: v, position: pos }) => {
    setIsUserAdjusting(true);
    setHue(h);
    setSaturation(s);
    setValue(v);
    setPosition(pos);
    setIsUserAdjusting(false);
  }, []);

  const rgbToHsv = useCallback((r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff === 0) h = 0;
    else if (max === r) h = 60 * ((g - b) / diff % 6);
    else if (max === g) h = 60 * ((b - r) / diff + 2);
    else if (max === b) h = 60 * ((r - g) / diff + 4);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    return { h, s, v };
  }, []);

  const hsvToRgb = useCallback((h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }, []);

  const calculateWheelPosition = useCallback((h: number, s: number, v: number) => {
    const angleRad = (h * Math.PI) / 180;
    let radius;
    
    if (v === 1) {
      radius = s;
    } else {
      radius = v;
    }
    
    return {
      x: Math.cos(angleRad) * radius,
      y: Math.sin(angleRad) * radius
    };
  }, []);

  const handleRgbChange = useCallback((r: number, g: number, b: number) => {
    const { h, s, v } = rgbToHsv(r, g, b);
    
    const shouldBeWhiteCenter = v === 1;
    if (whiteCenter !== shouldBeWhiteCenter) {
      setWhiteCenter(shouldBeWhiteCenter);
    }

    setHue(h);
    setSaturation(s);
    setValue(v);
    setPosition(calculateWheelPosition(h, s, v));
  }, [rgbToHsv, calculateWheelPosition, whiteCenter]);

  const rgb = hsvToRgb(hue, saturation, value);
  const hexColor = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(hexColor);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }, [hexColor]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ColorMine</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCenterMode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {whiteCenter ? <Sun size={18} /> : <Moon size={18} />}
              Center Blend: {whiteCenter ? 'White' : 'Black'}
            </button>
            
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="w-full max-w-md">
            <ColorWheel
              size={Math.min(Math.min(window.innerWidth - 32, 400), window.innerHeight - 300)}
              onChange={handleColorChange}
              hue={hue}
              saturation={saturation}
              value={value}
              whiteCenter={whiteCenter}
              position={position}
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 p-6 bg-gray-50 rounded-xl w-full md:w-auto">
            <div 
              className="w-full h-24 md:w-24 md:h-72 rounded-lg shadow-inner transition-all duration-300" 
              style={{ backgroundColor: hexColor }}
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{hexColor}</span>
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
              {showCopied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <ColorSlider
            label="R"
            value={rgb.r}
            max={255}
            color="#FF0000"
            onChange={(v) => handleRgbChange(v, rgb.g, rgb.b)}
          />
          <ColorSlider
            label="G"
            value={rgb.g}
            max={255}
            color="#00FF00"
            onChange={(v) => handleRgbChange(rgb.r, v, rgb.b)}
          />
          <ColorSlider
            label="B"
            value={rgb.b}
            max={255}
            color="#0000FF"
            onChange={(v) => handleRgbChange(rgb.r, rgb.g, v)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;