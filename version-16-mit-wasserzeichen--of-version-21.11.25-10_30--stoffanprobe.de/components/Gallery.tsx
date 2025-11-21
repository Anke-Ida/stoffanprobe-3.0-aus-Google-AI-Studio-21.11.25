import React from "react";
import { Variant } from "../types";
import VariantCard from "./VariantCard";
import { EmailIcon, DownloadIcon, DiscardIcon } from "./Icon";

interface GalleryProps {
  variants: Variant[];
  onVariantSelect: (variant: Variant) => void;
  onEmailAll: () => void;
  onDownloadAll: () => void;
  onDeleteAll: () => void;
}

const Gallery: React.FC<GalleryProps> = ({
  variants,
  onVariantSelect,
  onEmailAll,
  onDownloadAll,
  onDeleteAll,
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const sortedVariants = [...variants].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const buttonClasses =
    "px-4 py-2 text-sm font-semibold text-[#532418] bg-white rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all flex items-center justify-center gap-2";

  return (
    <div className="mt-12 w-full">
      <h3 className="text-xl font-semibold text-center text-[#532418] mb-6 border-b-2 border-[#FF954F]/50 pb-2">
        Gespeicherte Varianten
      </h3>

      <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
        <button onClick={onEmailAll} className={buttonClasses}>
          <EmailIcon /> Galerie senden
        </button>

        <button onClick={onDownloadAll} className={buttonClasses}>
          <DownloadIcon /> Galerie speichern
        </button>

        <button
          onClick={onDeleteAll}
          className={`${buttonClasses} text-red-600 hover:bg-red-50 border-red-200 hover:border-red-400 focus:ring-red-300`}
        >
          <DiscardIcon /> Galerie löschen
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedVariants.map((variant) => (
          <VariantCard
            key={variant.id}
            imageUrl={variant.imageUrl}
            title={variant.preset}
            onClick={() => onVariantSelect(variant)}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;