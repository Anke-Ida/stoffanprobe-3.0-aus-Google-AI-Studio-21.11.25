import React from 'react';
import { PresetType } from '../types';
import { CurtainIcon, WallpaperIcon, CarpetIcon, AccessoryIcon, FurnitureIcon } from './Icon';

interface PresetButtonsProps {
  onPresetSelect: (preset: PresetType) => void;
  selectedPreset: PresetType | null;
}

const presets: { name: PresetType; icon: React.ReactNode }[] = [
  { name: 'Gardine', icon: <CurtainIcon /> },
  { name: 'Tapete', icon: <WallpaperIcon /> },
  { name: 'Teppich', icon: <CarpetIcon /> },
  { name: 'Accessoire', icon: <AccessoryIcon /> },
  { name: 'Möbel', icon: <FurnitureIcon /> },
];

const PresetButtons: React.FC<PresetButtonsProps> = ({ onPresetSelect, selectedPreset }) => {
  return (
    <>
      {presets.map(({ name, icon }) => {
        const isSelected = selectedPreset === name;
        return (
          <button
            key={name}
            onClick={() => onPresetSelect(name)}
            className={`
              group flex flex-col items-center justify-center
              w-28 h-24 bg-white rounded-xl shadow-sm
              hover:shadow-lg transition-shadow duration-200
              border-2
              ${isSelected ? 'border-[#FF954F]' : 'border-transparent hover:border-[#FF954F]/50'}
            `}
          >
            <div className="w-10 h-10 text-[#FF954F] mb-2 transition-transform duration-300 group-hover:scale-110">
              {icon}
            </div>
            <span className="font-medium text-sm text-[#532418]">{name}</span>
          </button>
        )
      })}
    </>
  );
};

export default PresetButtons;