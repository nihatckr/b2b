"use client";

import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Eskiz",
  afterLabel = "AI Tasarım",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(0); // Start at 0% (full AI image, no sketch visible)
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  // Mouse hareketi ile otomatik takip
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isHovering) return;
    handleMove(e.clientX);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Mouse ayrıldığında 0%'a dön (tamamen AI görseli, eskiz gizli)
    setSliderPosition(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square overflow-hidden rounded-lg select-none cursor-ew-resize"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (AI Generated) - Full Width */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
        {/* Label */}
        <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Original Sketch) - Clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
        {/* Label */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle - Minimal Design */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Minimal Handle Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gray-200">
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-3 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-3 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Instruction Overlay (shown when not hovering) */}
      {!isHovering && sliderPosition === 0 && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none animate-pulse">
          <div className="bg-white/95 px-4 py-2 rounded-lg shadow-lg">
            <p className="text-xs font-medium text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Mouse ile gezinerek karşılaştırın
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
