import React from 'react';

export function ControlHandle({ x, y, onMouseDown, cursor = 'move' }) {
  return (
    <div
      onPointerDown={onMouseDown} // using PointerDown for better touch support
      className="absolute w-5 h-5 bg-orange-600 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 z-40 hover:scale-125 transition-transform"
      style={{
        left: x,
        top: y,
        cursor: cursor,
        touchAction: 'none',
      }}
    />
  );
}
