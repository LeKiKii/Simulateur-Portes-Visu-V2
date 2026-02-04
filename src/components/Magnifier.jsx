import React from 'react';

export function Magnifier({ x, y, imageSrc, containerRect, zoom = 2, size = 120 }) {
  if (!imageSrc || !containerRect) return null;

  const relX = x - containerRect.left;
  const relY = y - containerRect.top;

  return (
    <div
      className="fixed pointer-events-none z-50 border-4 border-white rounded-full overflow-hidden shadow-2xl bg-gray-100"
      style={{
        left: x - size / 2,
        top: y - size - 40,
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `-${relX * zoom - size / 2}px -${relY * zoom - size / 2}px`,
          backgroundSize: `${containerRect.width * zoom}px ${containerRect.height * zoom}px`,
          width: '100%',
          height: '100%',
        }}
      />
      {/* Crosshair */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/50 -translate-y-1/2"></div>
      <div className="absolute top-0 left-1/2 h-full w-[1px] bg-red-500/50 -translate-x-1/2"></div>
    </div>
  );
}
