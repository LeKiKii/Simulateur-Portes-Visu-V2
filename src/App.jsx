import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ControlHandle } from './components/ControlHandle';
import { Magnifier } from './components/Magnifier';
import { getCSSMatrix } from './utils/math';
import { DOORS, CATEGORIES } from './data/doors';
import { Download, Eye, EyeOff, Move, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

// Virtual dimensions for the door element (high res for quality)
const DOOR_VIRTUAL_W = 1000;
const DOOR_VIRTUAL_H = 2000;

function App() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);

  // Points relative to the container
  const [points, setPoints] = useState([
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 400 },
    { x: 100, y: 400 },
  ]);

  const [isControlsVisible, setIsControlsVisible] = useState(true);

  // Dragging State
  const [draggingIdx, setDraggingIdx] = useState(null); // 0-3 corners, 4 center
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // For center move

  // Refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  // Initialize selected door
  useEffect(() => {
    if (!selectedDoor && DOORS.length > 0) {
      setSelectedDoor(DOORS[0]);
    }
  }, []);

  // Global Pointer Move / Up
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || !canvasRef.current) return;
      e.preventDefault();

      const rect = canvasRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      if (draggingIdx !== null && draggingIdx < 4) {
        // Moving a corner
        setPoints(prev => {
          const next = [...prev];
          next[draggingIdx] = { x: relX, y: relY };
          return next;
        });
      } else if (draggingIdx === 4) {
        // Moving the whole shape (Center)
        // Calculate delta from current center to new mouse pos
        // But easier: maintain an offset.
        // Let's do simple delta for now.
        // We need previous mouse pos... easier to just track delta from start?
        // Let's use the stored offset approach: NewCenter = Mouse - Offset.
        // Actually, we can just calculate the centroid, determine movement delta, and apply to all.

        // Simpler approach for center drag:
        // We need to know where we grabbed it.
        // Let's skip complex center drag logic for a moment and just snap center to mouse?
        // No, that jumps.
        // Let's implement delta logic.
        // This requires storing `lastMousePos`.
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setDraggingIdx(null);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, draggingIdx]);


  // Handle Center Drag logic separately with a ref for last pos to avoid re-renders or complex state
  const lastMousePos = useRef({ x: 0, y: 0 });

  const startDrag = (idx, e) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggingIdx(idx);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // Center drag specific effect
  useEffect(() => {
    if (!isDragging || draggingIdx !== 4) return;

    const handleCenterMove = (e) => {
       const dx = e.clientX - lastMousePos.current.x;
       const dy = e.clientY - lastMousePos.current.y;
       lastMousePos.current = { x: e.clientX, y: e.clientY };

       setPoints(prev => prev.map(p => ({ x: p.x + dx, y: p.y + dy })));
    };

    window.addEventListener('pointermove', handleCenterMove);
    return () => window.removeEventListener('pointermove', handleCenterMove);
  }, [isDragging, draggingIdx]);


  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImg(url);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    // Temporarily hide controls if visible
    const controlsWereVisible = isControlsVisible;
    if (controlsWereVisible) setIsControlsVisible(false);

    // Wait for render cycle (a bit hacky, but safe)
    await new Promise(r => setTimeout(r, 100));

    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true, // For placeholder images
        scale: 2 // High res
      });

      const link = document.createElement('a');
      link.download = 'baies-et-bastide-simulation.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Erreur lors de l'exportation.");
    } finally {
      if (controlsWereVisible) setIsControlsVisible(true);
    }
  };

  const onImageLoad = (e) => {
    // Initialize points to a centered rect
    const w = e.target.width;
    const h = e.target.height;
    // Default 200x400 in center
    const cx = w / 2;
    const cy = h / 2;
    const dw = w * 0.2; // 20% width
    const dh = h * 0.4;

    setPoints([
      { x: cx - dw, y: cy - dh }, // TL
      { x: cx + dw, y: cy - dh }, // TR
      { x: cx + dw, y: cy + dh }, // BR
      { x: cx - dw, y: cy + dh }, // BL
    ]);
  };

  // Calculate Transform
  const transformString = points ? getCSSMatrix(DOOR_VIRTUAL_W, DOOR_VIRTUAL_H, points) : 'none';

  // Centroid for the move handle
  const centroid = points.reduce((acc, p) => ({ x: acc.x + p.x/4, y: acc.y + p.y/4 }), {x:0, y:0});

  // Current Mouse Pos for Magnifier (tracked via another state or ref, let's use global listener or just onDrag)
  // We need to re-render magnifier, so state is needed.
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;
    const updatePointer = (e) => setPointerPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', updatePointer);
    return () => window.removeEventListener('pointermove', updatePointer);
  }, [isDragging]);


  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      <Sidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedDoor={selectedDoor}
        onSelectDoor={setSelectedDoor}
        onUploadPhoto={() => fileInputRef.current?.click()}
      />

      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-slate-100 items-center justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Header */}
        <div className="absolute top-4 right-4 z-30 flex gap-3">
           <button
             onClick={() => setIsControlsVisible(!isControlsVisible)}
             className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors"
           >
             {isControlsVisible ? <EyeOff size={16}/> : <Eye size={16}/>}
             {isControlsVisible ? "Masquer repères" : "Afficher repères"}
           </button>
           <button
             onClick={handleExport}
             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
           >
             <Download size={16}/>
             Exporter
           </button>
        </div>

        {/* Workspace */}
        <div className="relative max-w-full max-h-full p-8 flex items-center justify-center">
            {backgroundImg ? (
               <div
                 ref={canvasRef}
                 className="relative shadow-2xl bg-white select-none inline-block" // inline-block to wrap image
                 style={{ fontSize: 0 }} // Remove whitespace
               >
                 <img
                   ref={imgRef}
                   src={backgroundImg}
                   onLoad={onImageLoad}
                   className="max-w-full max-h-[85vh] object-contain pointer-events-none"
                   alt="Façade"
                   draggable={false}
                 />

                 {/* Door Overlay */}
                 {selectedDoor && (
                   <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div
                        className="origin-top-left absolute top-0 left-0"
                        style={{
                           width: DOOR_VIRTUAL_W,
                           height: DOOR_VIRTUAL_H,
                           transform: transformString,
                           // transformOrigin: '0 0' // Handled in class
                        }}
                      >
                         <img
                           src={selectedDoor.imageSrc}
                           className="w-full h-full object-fill"
                           alt=""
                         />
                      </div>
                   </div>
                 )}

                 {/* Controls Layer */}
                 {selectedDoor && isControlsVisible && (
                    <div className="absolute inset-0 z-20">
                       {/* SVG lines connecting points */}
                       <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                         <path
                           d={`M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} Z`}
                           fill="rgba(37, 99, 235, 0.1)"
                           stroke="#2563eb"
                           strokeWidth="2"
                           strokeDasharray="4 4"
                         />
                       </svg>

                       {/* Handles */}
                       {points.map((p, i) => (
                         <ControlHandle
                           key={i}
                           x={p.x}
                           y={p.y}
                           onMouseDown={(e) => startDrag(i, e)}
                         />
                       ))}

                       {/* Center Handle */}
                       <ControlHandle
                           x={centroid.x}
                           y={centroid.y}
                           cursor="move"
                           onMouseDown={(e) => startDrag(4, e)}
                       />
                       <div className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2" style={{ left: centroid.x, top: centroid.y }}>
                          <Move size={12} className="text-white"/>
                       </div>

                    </div>
                 )}
               </div>
            ) : (
               <div
                 onClick={() => fileInputRef.current?.click()}
                 className="w-[600px] h-[400px] bg-slate-200 border-4 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200/80 transition-colors"
               >
                 <ImageIcon size={64} className="mb-4 opacity-50"/>
                 <p className="text-xl font-medium">Glissez une photo ou cliquez pour importer</p>
               </div>
            )}
        </div>

        {/* Magnifier (Global, outside canvas to not be clipped if using overflow-hidden, but we need clipping for export... actually Magnifier is fixed) */}
        {isDragging && backgroundImg && canvasRef.current && (
           <Magnifier
              x={pointerPos.x}
              y={pointerPos.y}
              imageSrc={backgroundImg}
              containerRect={canvasRef.current.getBoundingClientRect()}
              zoom={2}
           />
        )}
      </main>
    </div>
  );
}

export default App;
