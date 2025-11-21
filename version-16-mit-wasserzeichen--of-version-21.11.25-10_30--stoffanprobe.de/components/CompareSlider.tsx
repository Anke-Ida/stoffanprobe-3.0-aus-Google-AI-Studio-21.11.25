import React, { useState, useRef } from "react";

interface CompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({
  beforeUrl,
  afterUrl
}) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;

    x = Math.max(0, Math.min(x, rect.width));

    setPosition((x / rect.width) * 100);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const move = (ev: any) =>
      handleMove(ev.touches ? ev.touches[0].clientX : ev.clientX);

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] overflow-hidden rounded-lg"
    >
      <img
        src={beforeUrl}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <img
        src={afterUrl}
        className="absolute inset-0 h-full object-cover"
        style={{ width: `${position}%`, clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow cursor-col-resize"
        style={{ left: `${position}%` }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      />
    </div>
  );
};

export default CompareSlider;