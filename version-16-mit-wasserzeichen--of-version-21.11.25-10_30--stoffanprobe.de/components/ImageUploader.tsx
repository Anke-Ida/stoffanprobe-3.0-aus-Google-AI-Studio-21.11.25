import React, { useRef, useCallback, useState } from 'react';
import { glassBase, glassOrange, glassOrangeActive } from '../glass';

interface ImageUploaderProps {
  onImageSelect: (imageDataUrl: string) => void;
  imageDataUrl?: string;
  title: string;
  description: string;
  buttonText: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  imageDataUrl,
  title,
  description,
  buttonText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const result = e.target?.result as string | null;
  
      if (result) {
        // SOFORTIGE AUTO-PREVIEW
        onImageSelect(result);
      }
  
      // Wichtig: Input immer resetten, damit gleiche Datei erneut funktioniert
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
        e.stopPropagation();
    }
    fileInputRef.current?.click();
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    onImageSelect('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // Removed scale-[1.03] to prevent layout shifts that cause double-click issues
  const borderStyle = isDragging 
    ? 'border-[#FF954F] shadow-lg' 
    : isHovering 
      ? 'border-white/40 shadow-xl' 
      : 'border-white/20';


  return (
    <div
      className={`${glassBase} ${borderStyle} overflow-hidden`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="w-full h-48 flex items-center justify-center relative rounded-t-3xl overflow-hidden">
        {imageDataUrl ? (
          <>
            <img
              src={imageDataUrl}
              alt={title}
              className="w-full h-full object-cover transition-opacity duration-300 opacity-0"
              onLoad={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "1";
              }}
            />

            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-black/60 z-10 cursor-pointer"
              aria-label="Bild entfernen"
            >
              &times;
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>

            <button onClick={handleClick} className={`${isHovering ? glassOrangeActive : glassOrange} cursor-pointer`}>
              {buttonText}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 text-center">
        <h4 className="text-[#532418] font-semibold">{title}</h4>
        <p className="text-[#67534F] text-xs">{description}</p>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
};

export default ImageUploader;