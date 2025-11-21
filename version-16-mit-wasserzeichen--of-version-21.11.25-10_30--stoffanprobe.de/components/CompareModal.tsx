import React from "react";
import CompareSlider from "./CompareSlider";

interface CompareModalProps {
  isOpen: boolean;
  originalUrl: string;
  variantUrl: string;
  onClose: () => void;
}

const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  originalUrl,
  variantUrl,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black bg-white/80 rounded-full p-2 shadow hover:bg-white"
        >
          ✕
        </button>

        <CompareSlider
          beforeUrl={originalUrl}
          afterUrl={variantUrl}
        />
      </div>
    </div>
  );
};

export default CompareModal;