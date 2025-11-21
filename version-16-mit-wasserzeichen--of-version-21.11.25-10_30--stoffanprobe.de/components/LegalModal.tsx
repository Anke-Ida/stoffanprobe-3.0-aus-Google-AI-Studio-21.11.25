import React from "react";

interface LegalModalProps {
  title: string;
  text: string;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, text, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div
        className="bg-[#FFFFF5] rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[#532418] mb-4">{title}</h2>

        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {text}
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Schließen
        </button>
      </div>
    </div>
  );
};

export default LegalModal;
