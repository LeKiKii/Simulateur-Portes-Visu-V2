import React from 'react';
import { CATEGORIES, DOORS } from '../data/doors';
import { PanelLeft, Upload } from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar({ selectedCategory, onSelectCategory, selectedDoor, onSelectDoor, onUploadPhoto }) {
  const filteredDoors = DOORS.filter(d => d.category === selectedCategory);

  return (
    <aside className="w-[300px] h-full bg-white border-r border-gray-200 flex flex-col shrink-0 z-20 shadow-xl">
      <div className="h-16 bg-blue-600 flex items-center px-6 text-white shadow-md shrink-0">
        <PanelLeft className="w-6 h-6 mr-3" />
        <h1 className="font-bold text-xl tracking-tight">Baies & Bastide</h1>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto border-b border-gray-200 shrink-0 bg-white scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={clsx(
              "flex-1 py-4 text-sm font-semibold transition-all relative",
              selectedCategory === cat
                ? "text-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            )}
          >
            {cat}
            {selectedCategory === cat && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>

      {/* Door Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        <div className="grid grid-cols-2 gap-4">
          {filteredDoors.map(door => (
            <div
              key={door.id}
              onClick={() => onSelectDoor(door)}
              className={clsx(
                "cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 aspect-[2/3] relative group bg-white shadow-sm",
                selectedDoor?.id === door.id
                  ? "border-blue-600 ring-4 ring-blue-50 shadow-blue-100 transform scale-[1.02]"
                  : "border-transparent hover:border-blue-300 hover:shadow-md"
              )}
            >
              <div className="w-full h-full p-2 flex items-center justify-center">
                 <img src={door.imageSrc} alt={door.name} className="max-w-full max-h-full object-contain drop-shadow-sm" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-2 text-center transition-transform translate-y-full group-hover:translate-y-0">
                <p className="text-xs font-medium text-gray-900 truncate">{door.name}</p>
              </div>

              {selectedDoor?.id === door.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shadow-sm">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white shrink-0">
        <button
          onClick={onUploadPhoto}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm"
        >
          <Upload size={18} />
          Importer une façade
        </button>
      </div>
    </aside>
  );
}
