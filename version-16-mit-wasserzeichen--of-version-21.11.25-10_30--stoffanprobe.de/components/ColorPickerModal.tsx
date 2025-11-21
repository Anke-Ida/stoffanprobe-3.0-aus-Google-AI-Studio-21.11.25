
import React, { useState } from "react";
import { ralColors } from "../data/ralColors";
import { RALColor } from "../types";

interface Props {
  onClose: () => void;
  onSelect: (color: RALColor) => void;
}

const ColorPickerModal: React.FC<Props> = ({ onClose, onSelect }) => {
  const [search, setSearch] = useState("");

  const filtered = ralColors.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4 text-[#532418]">Wandfarbe wählen (RAL)</h2>

        <input
          type="text"
          placeholder="Suchen: z. B. 9010, Weiß, Beige…"
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF954F] transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((color) => (
                <div
                  key={color.code}
                  className="cursor-pointer border bg-white rounded-md overflow-hidden hover:ring-2 hover:ring-[#FF954F] transition"
                  onClick={() => onSelect(color)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(color)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Farbe auswählen: ${color.name} ${color.code}`}
                >
                  <div className="h-16" style={{ backgroundColor: color.hex }} />
                  <div className="p-2 text-center">
                    <p className="text-xs font-bold text-gray-800 truncate">{color.code}</p>
                    <p className="text-[10px] text-gray-600 truncate">{color.name}</p>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
                 <p className="text-center text-gray-500 py-8">
                    Keine Farben für "{search}" gefunden.
                </p>
            )}
        </div>

        <button
          className="mt-6 w-full bg-gray-200 py-2 rounded-md hover:bg-gray-300 text-gray-800 font-semibold"
          onClick={onClose}
        >
          Schließen
        </button>
      </div>
    </div>
  );
};

export default ColorPickerModal;