import React from "react";

interface VariantCardProps {
  imageUrl: string;
  title: string;
  isOriginal?: boolean;
  isLarge?: boolean;
  onClick?: () => void;
}

const VariantCard: React.FC<VariantCardProps> = ({
  imageUrl,
  title,
  isOriginal = false,
  isLarge = false,
  onClick,
}) => {
  const cardClasses = isLarge
    ? "group relative overflow-hidden rounded-xl shadow-lg bg-white animate-fade-in cursor-pointer"
    : "group relative overflow-hidden rounded-lg shadow-md bg-white animate-fade-in transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer";

  const imageClasses = isLarge
    ? "w-full h-auto object-contain"
    : "w-full h-48 object-cover";

  const safeImageUrl = imageUrl || "";

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`Variante ansehen: ${title}`}
      onClick={handleClick}
    >
      <img src={safeImageUrl} alt={title} className={imageClasses} />

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <h3 className="text-white font-semibold truncate">
          {isOriginal && (
            <span className="text-xs font-bold uppercase tracking-wider bg-[#FF954F] text-white px-2 py-1 rounded-full mr-2">
              Original
            </span>
          )}
          {title}
        </h3>
      </div>
    </div>
  );
};

export default VariantCard;