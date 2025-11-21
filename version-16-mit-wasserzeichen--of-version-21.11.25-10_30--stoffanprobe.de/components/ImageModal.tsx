import React from 'react';
import { Variant } from '../types';
import { DownloadIcon, EmailIcon, DiscardIcon } from './Icon';

interface ImageModalProps {
  variant: Variant;
  originalImageUrl?: string;
  onClose: () => void;
  onDelete: (variantId: string) => void;
  onDownload: (imageUrl: string, filename: string) => void;
  onEmail: (imageUrl: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ variant, originalImageUrl, onClose, onDelete, onDownload, onEmail }) => {
  const { id, imageUrl, preset } = variant;
  const title = `Variante: ${preset}`;
  const filename = `stoffanprobe-variante-${id.substring(0,8)}.png`;
  const secondaryButtonClasses = "px-4 py-2 text-sm font-semibold text-[#532418] bg-white rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all flex items-center justify-center gap-2";


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-[#FFFFF5] rounded-lg shadow-xl p-4 max-w-4xl w-full max-h-[90vh] overflow-auto flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#532418]">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none p-1"
            aria-label="Schließen"
          >
            &times;
          </button>
        </div>
        <div className="flex-grow flex justify-center items-center min-h-0">
            <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain rounded" />
        </div>
        <div className="flex flex-wrap justify-center items-center gap-3 mt-4 flex-shrink-0">
            <button onClick={() => onDownload(imageUrl, filename)} className={secondaryButtonClasses}>
                <DownloadIcon /> Herunterladen
            </button>
            <button onClick={() => onEmail(imageUrl)} className={secondaryButtonClasses}>
                <EmailIcon /> Per E-Mail senden
            </button>
            <button onClick={() => onDelete(id)} className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500">
                <DiscardIcon /> Löschen
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;