import React from 'react';
import { exampleImageData } from './imageData';
import { glassBase } from '../glass';

interface ExampleRoomsProps {
  onSelect: (imageDataUrl: string) => void;
  onSelectWallColor: () => void;
}

const exampleCategories = [
  {
    key: 'wohnzimmer',
    name: 'Wohnzimmer',
    previewImage: exampleImageData.wohnzimmer,
  },
  {
    key: 'schlafzimmer',
    name: 'Schlafzimmer',
    previewImage: exampleImageData.schlafzimmer,
  },
  {
    key: 'esszimmer',
    name: 'Esszimmer',
    previewImage: exampleImageData.esszimmer,
  },
];

const ExampleRooms: React.FC<ExampleRoomsProps> = ({ onSelect, onSelectWallColor }) => {
  return (
    <div className={`${glassBase} p-6 mb-10`}>
      <h3 className="text-lg font-semibold text-center text-[#532418] mb-6">
        Oder mit einem Beispiel starten:
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {exampleCategories.map((cat) => (
          <button
            key={cat.key}
            className={`overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 ${glassBase}`}
            onClick={() => onSelect(cat.previewImage)}
          >
            <div className="w-full h-48 rounded-t-3xl overflow-hidden">
              <img src={cat.previewImage} alt={cat.name} className="w-full h-full object-cover"/>
            </div>
            <div className="p-4 text-center">
              <h4 className="text-[#532418] font-semibold">{cat.name}</h4>
            </div>
          </button>
        ))}

        {/* RAL-Farbe */}
        <button
          onClick={onSelectWallColor}
          className={`overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 ${glassBase}`}
        >
          <div className="w-full h-48 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-20 h-20 grid grid-cols-2 rounded-lg overflow-hidden shadow-md">
              <div style={{ background: "#FFFFFF" }}></div>
              <div style={{ background: "#F6B600" }}></div>
              <div style={{ background: "#0B3C7C" }}></div>
              <div style={{ background: "#4B573E" }}></div>
            </div>

            <p className="font-semibold text-[#532418]">Wandfarbe wählen (RAL)</p>
            <p className="text-xs text-gray-700">RAL-Farbtöne ausprobieren</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ExampleRooms;