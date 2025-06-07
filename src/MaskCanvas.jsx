import React, { useRef, useState } from 'react';

function MaskCanvas({ imageSrc, onMaskChange, rect, setRect }) {
  const canvasRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState(null);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setStart({ x, y });
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(511, Math.round(e.clientX - rect.left)));
    const y = Math.max(0, Math.min(511, Math.round(e.clientY - rect.top)));
    setRect({ x1: start.x, y1: start.y, x2: x, y2: y });
  };

  const handleMouseUp = () => {
    setDragging(false);
    if (rect) {
      // Normalize coordinates for 512x512 display
      const x1 = Math.max(0, Math.min(511, rect.x1));
      const y1 = Math.max(0, Math.min(511, rect.y1));
      const x2 = Math.max(0, Math.min(511, rect.x2));
      const y2 = Math.max(0, Math.min(511, rect.y2));
      
      // Scale coordinates to 256x256 for API
      const scaledCoords = {
        x1: Math.round(Math.min(x1, x2) / 2),
        y1: Math.round(Math.min(y1, y2) / 2),
        x2: Math.round(Math.max(x1, x2) / 2),
        y2: Math.round(Math.max(y1, y2) / 2)
      };
      
      onMaskChange(scaledCoords);
    }
  };

  return (
    <div className="mask-canvas-wrapper">
      <div style={{ position: 'relative', width: 512, height: 512, margin: '0 auto' }}>
        <img
          src={imageSrc}
          alt="To mask"
          width={512}
          height={512}
          style={{ display: 'block', borderRadius: 8 }}
        />
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className="mask-canvas"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            cursor: 'crosshair',
            borderRadius: 8
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {rect && (
          <svg
            width={512}
            height={512}
            style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
          >
            <rect
              x={Math.min(rect.x1, rect.x2)}
              y={Math.min(rect.y1, rect.y2)}
              width={Math.abs(rect.x2 - rect.x1)}
              height={Math.abs(rect.y2 - rect.y1)}
              fill="rgba(0, 0, 0, 0.3)"
              stroke="#1976d2"
              strokeWidth={2}
              rx={6}
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export default MaskCanvas; 