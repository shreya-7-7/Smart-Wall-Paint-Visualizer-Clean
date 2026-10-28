import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer, Arc, Line, Image, Circle } from 'react-konva';
import useImage from 'use-image';

const THEME_BROWN = "#8d6e63";

// Math helper to snap structural items to the nearest wall line
const pointToSegmentDist = (px, py, x1, y1, x2, y2) => {
  let l2 = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
  if (l2 === 0) return { t: 0, x: x1, y: y1, dist: Math.hypot(px-x1, py-y1), wall: {x1,y1,x2,y2} };
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  let projX = x1 + t * (x2 - x1);
  let projY = y1 + t * (y2 - y1);
  return { x: projX, y: projY, dist: Math.hypot(px-projX, py-projY), wall: {x1, y1, x2, y2} };
};

const FurnitureNode = ({ shapeProps, isSelected, onSelect, onChange, snapToGrid, walls, floorColor, roomSize }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [image] = useImage(shapeProps.image);

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const name = shapeProps.name || '';
  const isDoor = name.toLowerCase().includes('door');
  const isWindow = name.toLowerCase().includes('window');
  const isStructural = shapeProps.isStructural;

  // Robust Mutual Exclusion Detection
  const lowerName = name.toLowerCase();
  const lowerType = (shapeProps.type || '').toLowerCase();
  const lowerCat = (shapeProps.category || '').toLowerCase();

  const isDining = lowerName.includes('dining') || lowerName.includes('set') || lowerCat.includes('dining');
  const isBed = !isDining && (lowerName.includes('bed') || lowerType.includes('bed'));
  const isKitchen = !isDining && !isBed && (lowerName.includes('kitchen') || lowerName.includes('pantry') || lowerName.includes('cabinet') || lowerCat.includes('kitchen'));
  // Prioritize Table/Desk names to avoid sofa-type overlaps
  const isTable = !isDining && !isBed && !isKitchen && (lowerName.includes('table') || lowerName.includes('desk') || lowerType.includes('table'));
  const isSofa = !isDining && !isBed && !isKitchen && !isTable && (lowerName.includes('sofa') || lowerName.includes('couch') || lowerType.includes('sofa'));
  const isChair = !isDining && !isBed && !isKitchen && !isTable && !isSofa && (lowerName.includes('chair') || lowerName.includes('stool') || lowerType.includes('chair'));

  return (
    <React.Fragment>
      <Group
        onClick={(e) => { e.cancelBubble = true; onSelect(); }} 
        onTap={(e) => { e.cancelBubble = true; onSelect(); }} 
        ref={shapeRef} 
        x={shapeProps.x} y={shapeProps.y} 
        rotation={shapeProps.rotation}
        // Center Origin is required for doors to align to walls properly
        offsetX={isStructural ? shapeProps.width / 2 : 0} 
        offsetY={isStructural ? shapeProps.height / 2 : 0}
        draggable
        onDragMove={(e) => {
          const node = e.target;
          const wt = roomSize?.wallThickness || 20;

          const getOrientedPoints = (target) => {
            const rad = (target.rotation() || 0) * Math.PI / 180;
            const w = shapeProps.width;
            const h = shapeProps.height;
            const ox = isStructural ? w/2 : 0;
            const oy = isStructural ? h/2 : 0;
            const basePoints = [
              { x: -ox, y: -oy }, { x: w - ox, y: -oy },
              { x: w - ox, y: h - oy }, { x: -ox, y: h - oy },
              { x: w/2 - ox, y: -oy }, { x: w/2 - ox, y: h - oy },
              { x: -ox, y: h/2 - oy }, { x: w - ox, y: h/2 - oy }
            ];
            return basePoints.map(p => ({
              x: (target.x() + p.x * Math.cos(rad) - p.y * Math.sin(rad)) - roomSize.x - wt,
              y: (target.y() + p.x * Math.sin(rad) + p.y * Math.cos(rad)) - roomSize.y - wt
            }));
          };

          const isPointInPoly = (pt, poly) => {
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
              const intersect = ((poly[i].y > pt.y) !== (poly[j].y > pt.y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x);
              if (intersect) inside = !inside;
            }
            return inside;
          };

          if (isStructural && walls && walls.length > 0) {
            let minDist = Infinity;
            let closest = null;
            walls.forEach(w => {
              const res = pointToSegmentDist(node.x(), node.y(), w.x1, w.y1, w.x2, w.y2);
              if (res.dist < minDist) { minDist = res.dist; closest = res; }
            });
            if (minDist < 40) {
              node.position({ x: closest.x, y: closest.y });
              let angle = Math.atan2(closest.wall.y2 - closest.wall.y1, closest.wall.x2 - closest.wall.x1) * 180 / Math.PI;
              node.rotation(angle);
            }
          } else if (!isStructural && roomSize) {
            const pts = getOrientedPoints(node);
            let breached = false;
            if (roomSize.isPoly) {
              breached = !pts.every(p => isPointInPoly(p, roomSize.points));
            } else {
              const m = 1; 
              breached = pts.some(p => p.x < -m || p.x > roomSize.width + m || p.y < -m || p.y > roomSize.height + m);
            }

            if (breached) {
              const lastSafe = node.getAttr('lastValidState');
              if (lastSafe) { node.position(lastSafe.pos); node.rotation(lastSafe.rot); }
            } else {
              node.setAttr('lastValidState', { pos: node.position(), rot: node.rotation() });
            }
          }
        }}
        onDragEnd={(e) => {
          e.cancelBubble = true;
          let newX = e.target.x();
          let newY = e.target.y();
          let newRot = e.target.rotation();

          if (isStructural && walls && walls.length > 0) {
            let minDist = Infinity;
            let closest = null;
            walls.forEach(w => {
              const res = pointToSegmentDist(newX, newY, w.x1, w.y1, w.x2, w.y2);
              if (res.dist < minDist) { minDist = res.dist; closest = res; }
            });
            if (minDist < 40) {
              newX = closest.x;
              newY = closest.y;
              newRot = Math.atan2(closest.wall.y2 - closest.wall.y1, closest.wall.x2 - closest.wall.x1) * 180 / Math.PI;
            }
          } else if (snapToGrid && !isStructural) {
            newX = Math.round(newX / 20) * 20;
            newY = Math.round(newY / 20) * 20;
          }
          onChange({ ...shapeProps, x: newX, y: newY, rotation: newRot });
        }}
        onTransform={(e) => {
          const node = e.target;
          const wt = roomSize?.wallThickness || 20;
          if (isStructural || !roomSize) return;

          const rad = (node.rotation() || 0) * Math.PI / 180;
          const w = shapeProps.width;
          const h = shapeProps.height;
          const ox = 0, oy = 0; 

          const basePoints = [
            { x: -ox, y: -oy }, { x: w - ox, y: -oy },
            { x: w - ox, y: h - oy }, { x: -ox, y: h - oy },
            { x: w/2 - ox, y: -oy }, { x: w/2 - ox, y: h - oy },
            { x: -ox, y: h/2 - oy }, { x: w - ox, y: h/2 - oy }
          ];
          const pts = basePoints.map(p => ({
            x: (node.x() + p.x * Math.cos(rad) - p.y * Math.sin(rad)) - roomSize.x - wt,
            y: (node.y() + p.x * Math.sin(rad) + p.y * Math.cos(rad)) - roomSize.y - wt
          }));

          let breached = false;
          const isPointInPoly = (pt, poly) => {
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
              const intersect = ((poly[i].y > pt.y) !== (poly[j].y > pt.y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x);
              if (intersect) inside = !inside;
            }
            return inside;
          };

          if (roomSize.isPoly) {
            breached = !pts.every(p => isPointInPoly(p, roomSize.points));
          } else {
            const m = 1;
            breached = pts.some(p => p.x < -m || p.x > roomSize.width + m || p.y < -m || p.y > roomSize.height + m);
          }

          if (breached) {
            const lastSafe = node.getAttr('lastValidState');
            if (lastSafe) { node.rotation(lastSafe.rot); }
            node.setAttr('isBreached', true);
          } else {
            node.setAttr('lastValidState', { pos: node.position(), rot: node.rotation() });
            node.setAttr('isBreached', false);
          }
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // Reset internal scales to 1, apply to width/height for state consistency
          node.scaleX(1); node.scaleY(1);
          onChange({
             ...shapeProps,
             x: node.x(), y: node.y(),
             rotation: node.rotation(),
             width: Math.max(20, Math.round(shapeProps.width * scaleX)),
             height: Math.max(20, Math.round(shapeProps.height * scaleY)),
          });
        }}
      >
        {isStructural ? (
          /* STRUCTURAL OPENING (Cuts the wall visually by masking it with floor color) */
          <Group>
            <Rect width={shapeProps.width} height={shapeProps.height} fill={floorColor || "#f3efe8"} />
            
            {/* Window specific design */}
            {isWindow && (
              <>
                <Line points={[0, 0, 0, shapeProps.height]} stroke="#64748b" strokeWidth={2} />
                <Line points={[shapeProps.width, 0, shapeProps.width, shapeProps.height]} stroke="#64748b" strokeWidth={2} />
                <Rect x={0} y={shapeProps.height/2 - 2} width={shapeProps.width} height={4} fill="#cbd5e1" />
                <Line points={[0, shapeProps.height/2, shapeProps.width, shapeProps.height/2]} stroke="#94a3b8" strokeWidth={1} />
              </>
            )}

            {/* Professional CAD Door specific design */}
            {isDoor && (
              <>
                {/* Door Jambs (Small frame edges on the wall) */}
                <Rect x={0} y={0} width={3} height={shapeProps.height} fill="#78350f" />
                <Rect x={shapeProps.width - 3} y={0} width={3} height={shapeProps.height} fill="#78350f" />
                
                {/* Soft Swing Area Fill */}
                <Arc
                  x={shapeProps.swingLeft ? 0 : shapeProps.width}
                  y={shapeProps.swingOut ? 0 : shapeProps.height}
                  innerRadius={0}
                  outerRadius={shapeProps.width}
                  angle={90}
                  rotation={ shapeProps.swingLeft ? (shapeProps.swingOut ? 0 : 270) : (shapeProps.swingOut ? 90 : 180) }
                  fill="#e2e8f0"
                  opacity={0.5}
                />

                {/* Door Swing Arc (Dashed Line) */}
                <Arc
                  x={shapeProps.swingLeft ? 0 : shapeProps.width}
                  y={shapeProps.swingOut ? 0 : shapeProps.height}
                  innerRadius={shapeProps.width}
                  outerRadius={shapeProps.width}
                  angle={90}
                  rotation={ shapeProps.swingLeft ? (shapeProps.swingOut ? 0 : 270) : (shapeProps.swingOut ? 90 : 180) }
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  dash={[5, 5]}
                />
                
                {/* Door Leaf (Solid Panel) */}
                <Line 
                  points={[
                    shapeProps.swingLeft ? 0 : shapeProps.width, 
                    shapeProps.swingOut ? 0 : shapeProps.height, 
                    shapeProps.swingLeft ? 0 : shapeProps.width, 
                    shapeProps.swingOut ? shapeProps.width : shapeProps.height - shapeProps.width
                  ]} 
                  stroke="#78350f" 
                  strokeWidth={3.5} 
                  lineCap="round" 
                />
              </>
            )}
            {shapeProps.isColliding && <Rect width={shapeProps.width} height={shapeProps.height} fill="#fee2e2" opacity={0.8} />}
          </Group>
        ) : (
          <Group>
            {/* The Precision Structural Footprint */}
            <Rect
              width={shapeProps.width} height={shapeProps.height}
              fill={shapeProps.isColliding ? "#fee2e2" : (isDining || isSofa ? "transparent" : (isTable ? "#ffffff" : "#2d2a28"))}
              stroke={(isSofa || isDining) ? "transparent" : "#000000"} strokeWidth={2}
              cornerRadius={2}
              opacity={isTable ? 1 : 0.95}
            />
            
            {/* PROCEDURAL ARCHITECTURAL GEOMETRY */}
            <Group listening={false}>
              {isSofa && (
                <>
                  {/* Padded Backrest Area */}
                  <Rect x={0} y={0} width={shapeProps.width} height={18} fill="#2d2a28" stroke="#000000" strokeWidth={2} cornerRadius={[4, 4, 0, 0]} />
                  
                  {/* Left Armrest */}
                  <Rect 
                    x={0} y={0} width={18} 
                    height={((lowerName.includes('velvet') || lowerName.includes('sectional')) && !lowerName.includes('compact')) ? shapeProps.height * 0.55 : shapeProps.height} 
                    fill="#33302e" stroke="#000000" strokeWidth={2} cornerRadius={[10, 2, 2, 10]} 
                  />
                  
                  {/* The CHAISE LOUNGE DETECTION (Excluding 'Compact' models) */}
                  {( (lowerName.includes('velvet') || lowerName.includes('sectional') || lowerName.includes('chaise')) && !lowerName.includes('compact') ) ? (
                    <>
                      {/* Main Seating - SHALLOWER DEPTH */}
                      <Rect 
                        x={18} y={18} 
                        width={(shapeProps.width - 36) * 0.65} height={shapeProps.height * 0.55 - 18} 
                        fill="#2d2a28" stroke="#000000" strokeWidth={2} 
                      />
                      
                      {/* Floating Cushion Splits for 3-seater Sectionals */}
                      <Line points={[shapeProps.width*0.35, 18, shapeProps.width*0.35, shapeProps.height*0.55]} stroke="#000000" strokeWidth={1} opacity={0.6} />
                      <Line points={[shapeProps.width*0.65, 18, shapeProps.width*0.65, shapeProps.height-5]} stroke="#000000" strokeWidth={1} opacity={0.6} />
                      
                      {/* The LONG CHAISE CUSHION (FULL DEPTH) */}
                      <Rect 
                        x={18 + (shapeProps.width - 36) * 0.65} y={18} 
                        width={(shapeProps.width - 36) * 0.35 + 18} height={shapeProps.height - 18} 
                        fill="#2d2a28" stroke="#000000" strokeWidth={2} cornerRadius={[0, 4, 8, 0]}
                      />
                      
                      {/* Right Armrest (Pushed back) */}
                      <Rect x={shapeProps.width - 15} y={0} width={15} height={30} fill="#33302e" stroke="#000000" strokeWidth={2} cornerRadius={[2, 8, 2, 2]} />
                    </>
                  ) : (
                    <>
                      {/* Standard Symmetry for Compact Sectionals / Straight Couches */}
                      <Rect x={18} y={18} width={shapeProps.width - 36} height={shapeProps.height - 18} fill="#2d2a28" stroke="#000000" strokeWidth={2} />
                      <Rect x={shapeProps.width - 18} y={0} width={18} height={shapeProps.height} fill="#33302e" stroke="#000000" strokeWidth={2} cornerRadius={[2, 10, 10, 2]} />
                      
                      {/* 2-Cushion Split for Compact/Standard Couches */}
                      <Line points={[shapeProps.width/2, 18, shapeProps.width/2, shapeProps.height-5]} stroke="#000000" strokeWidth={1} opacity={0.6} />
                    </>
                  )}
                </>
              )}

              {isChair && (
                <>
                  {/* Curved Wingback Chair Symbol */}
                  <Rect x={0} y={0} width={shapeProps.width} height={15} fill="#ffffff" opacity={0.4} stroke="#000000" strokeWidth={1.5} cornerRadius={[10, 10, 0, 0]} />
                  {/* Matching Styled Arms */}
                  <Rect x={0} y={15} width={12} height={shapeProps.height-20} fill="#ffffff" opacity={0.3} stroke="#000000" strokeWidth={1.2} cornerRadius={[0, 5, 5, 0]} />
                  <Rect x={shapeProps.width-12} y={15} width={12} height={shapeProps.height-20} fill="#ffffff" opacity={0.3} stroke="#000000" strokeWidth={1.2} cornerRadius={[5, 0, 0, 5]} />
                  {/* Seat Detail */}
                  <Circle x={shapeProps.width/2} y={shapeProps.height*0.55} radius={shapeProps.width*0.25} stroke="#000000" strokeWidth={0.5} opacity={0.2} dash={[2, 2]} />
                </>
              )}

              {/* DINING SET SYMBOL (Multi-Chair Table) */}
              {isDining && (
                <>
                  {lowerName.includes('grand') || lowerName.includes('ensemble') || shapeProps.width === shapeProps.height ? (
                    /* CIRCULAR / OCTAGONAL DINING SET (Grand/Ensemble style) */
                    <>
                      {/* Calculated dimensions based on the circle table */}
                      {(() => {
                        const radius = Math.min(shapeProps.width, shapeProps.height) / 2 - 5;
                        const centerX = shapeProps.width / 2;
                        const centerY = shapeProps.height / 2;
                        return (
                          <>
                            {/* Top Chair */}
                            <Rect x={centerX - 10} y={centerY - radius - 8} width={20} height={12} fill="#2d2a28" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                            {/* Bottom Chair */}
                            <Rect x={centerX - 10} y={centerY + radius - 4} width={20} height={12} fill="#2d2a28" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                            {/* Left Chair */}
                            <Rect x={centerX - radius - 8} y={centerY - 10} width={12} height={20} fill="#2d2a28" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                            {/* Right Chair */}
                            <Rect x={centerX + radius - 4} y={centerY - 10} width={12} height={20} fill="#2d2a28" stroke="#000000" strokeWidth={1} cornerRadius={2} />

                            {/* The Round/Octagonal Table Surface */}
                            <Circle 
                              x={centerX} y={centerY} 
                              radius={radius}
                              fill="#2d2a28" stroke="#000000" strokeWidth={2}
                            />
                            <Circle 
                              x={centerX} y={centerY} 
                              radius={radius - 7}
                              stroke="#000000" strokeWidth={0.5} opacity={0.3} dash={[4, 2]}
                            />
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    /* RECTANGULAR DINING SET */
                    <>
                      {/* Chairs - Top and Bottom Pairs */}
                      <Rect x={20} y={-8} width={20} height={12} fill="#f1f5f9" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                      <Rect x={shapeProps.width-40} y={-8} width={20} height={12} fill="#f1f5f9" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                      <Rect x={20} y={shapeProps.height-4} width={20} height={12} fill="#f1f5f9" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                      <Rect x={shapeProps.width-40} y={shapeProps.height-4} width={20} height={12} fill="#f1f5f9" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                      
                      {/* Chairs - Left and Right Ends */}
                      <Rect x={-8} y={shapeProps.height/2 - 10} width={12} height={20} fill="#f1f5f9" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                      <Rect x={shapeProps.width-4} y={shapeProps.height/2 - 10} width={12} height={20} fill="#f1f5f9" stroke="#000000" strokeWidth={1} cornerRadius={2} />

                      {/* Table Surface with Double Inset */}
                      <Rect 
                        x={4} y={4} width={shapeProps.width-8} height={shapeProps.height-8} 
                        fill="#ffffff" stroke="#000000" strokeWidth={1.5} cornerRadius={2} 
                      />
                      <Rect x={12} y={12} width={shapeProps.width-24} height={shapeProps.height-24} stroke="#000000" strokeWidth={0.5} opacity={0.2} dash={[4, 2]} />
                    </>
                  )}
                </>
              )}

              {/* KITCHEN / PANTRY CABINETS (Modular Suite) */}
              {isKitchen && (
                <>
                  {/* Global Unit Backing */}
                  <Rect width={shapeProps.width} height={shapeProps.height} fill="#2d2a28" stroke="#000000" strokeWidth={2} />

                  {/* 1. TALL PANTRY UNIT (Left) */}
                  <Group>
                    <Rect width={shapeProps.width * 0.25} height={shapeProps.height} fill="#33302e" stroke="#000000" strokeWidth={1.5} />
                    <Line points={[5, 5, shapeProps.width * 0.25 - 5, 5]} stroke="#ffffff" opacity={0.1} />
                  </Group>

                  {/* 2. MAIN COUNTERTOP AREA (Middle/Right) */}
                  <Group x={shapeProps.width * 0.25}>
                    {/* Lower Cabinets/Counter */}
                    <Rect width={shapeProps.width * 0.75} height={shapeProps.height} fill="#2d2a28" />
                    
                    {/* Upper Cabinets (Shallower depth at the back) */}
                    <Rect width={shapeProps.width * 0.75} height={shapeProps.height * 0.4} fill="#3b3735" stroke="#000000" strokeWidth={1} />
                    
                    {/* Countertop Front Edge */}
                    <Rect y={shapeProps.height * 0.4} width={shapeProps.width * 0.75} height={shapeProps.height * 0.6} fill="#2d2a28" stroke="#000000" strokeWidth={1} />

                    {/* Stove / Hob Unit (Centered in the remaining space) */}
                    <Group x={(shapeProps.width * 0.75) / 2 - 25} y={shapeProps.height * 0.5}>
                      <Rect width={50} height={35} fill="#1a1a1a" stroke="#000000" strokeWidth={1} cornerRadius={2} />
                      <Circle x={14} y={10} radius={5} stroke="#ffffff" strokeWidth={0.5} opacity={0.4} />
                      <Circle x={36} y={10} radius={5} stroke="#ffffff" strokeWidth={0.5} opacity={0.4} />
                      <Circle x={14} y={25} radius={6} stroke="#ffffff" strokeWidth={0.5} opacity={0.4} />
                      <Circle x={36} y={25} radius={6} stroke="#ffffff" strokeWidth={0.5} opacity={0.4} />
                    </Group>

                    {/* Range Hood (Represented by a trapezoid outline over the stove) */}
                    <Line 
                      points={[
                        (shapeProps.width * 0.75) / 2 - 20, 0, 
                        (shapeProps.width * 0.75) / 2 + 20, 0,
                        (shapeProps.width * 0.75) / 2 + 25, shapeProps.height * 0.4,
                        (shapeProps.width * 0.75) / 2 - 25, shapeProps.height * 0.4,
                        (shapeProps.width * 0.75) / 2 - 20, 0
                      ]} 
                      stroke="#ffffff" strokeWidth={1} opacity={0.2} fill="#3b3735"
                    />

                    {/* Vertical Cabinet Gaps */}
                    <Line points={[shapeProps.width * 0.35, 0, shapeProps.width * 0.35, shapeProps.height]} stroke="#000000" strokeWidth={1} opacity={0.3} />
                    <Line points={[shapeProps.width * 0.55, 0, shapeProps.width * 0.55, shapeProps.height]} stroke="#000000" strokeWidth={1} opacity={0.3} />
                  </Group>
                </>
              )}

              {/* TABLE/DESK (Standalone) */}
              {isTable && (
                <>
                  <Rect 
                    width={shapeProps.width} height={shapeProps.height} 
                    fill="#2d2a28" stroke="#000000" strokeWidth={2} 
                    cornerRadius={2}
                  />
                  {/* Subtle Inset for Minimalist texture */}
                  <Rect 
                    x={4} y={4} width={shapeProps.width-8} height={shapeProps.height-8} 
                    stroke="#000000" strokeWidth={0.5} opacity={0.2} 
                  />
                </>
              )}

              {isBed && (
                <>
                  <Rect x={0} y={0} width={shapeProps.width} height={15} fill="#1e293b" opacity={0.2} />
                  <Rect x={10} y={15} width={shapeProps.width/2 - 15} height={40} fill="#ffffff" opacity={0.8} cornerRadius={12} stroke="#000000" strokeWidth={1.4} />
                  <Rect x={shapeProps.width/2 + 5} y={15} width={shapeProps.width/2 - 15} height={40} fill="#ffffff" opacity={0.8} cornerRadius={12} stroke="#000000" strokeWidth={1.4} />
                  <Line points={[0, 65, shapeProps.width, 65]} stroke="#000000" strokeWidth={2} opacity={0.4} dash={[10, 5]} />
                </>
              )}
            </Group>

            {/* Collision Highlight */}
            {shapeProps.isColliding && (
              <Rect width={shapeProps.width} height={shapeProps.height} fill="#ef4444" opacity={0.3} stroke="#ef4444" strokeWidth={4} />
            )}

            <Text
              text={shapeProps.isColliding ? "OVERLAP" : name}
              width={shapeProps.width} height={shapeProps.height}
              align="center" verticalAlign="middle" 
              fill="white"
              fontSize={10} fontStyle="bold" shadowColor="black" shadowBlur={2} shadowOpacity={0.8}
            />
          </Group>
        )}

        {/* Live CM Dimensions for regular furniture */}
        {isSelected && !isStructural && (
          <Group listening={false}>
            {/* Standard Object Dimensions */}
            <Line points={[0, -15, 0, -5]} stroke="#3b82f6" strokeWidth={1} />
            <Line points={[shapeProps.width, -15, shapeProps.width, -5]} stroke="#3b82f6" strokeWidth={1} />
            <Line points={[0, -10, shapeProps.width, -10]} stroke="#3b82f6" strokeWidth={1} />
            <Rect x={shapeProps.width/2 - 20} y={-18} width={40} height={16} fill="#ffffff" cornerRadius={2} />
            <Text x={shapeProps.width/2 - 20} y={-14} width={40} text={`${Math.round(shapeProps.width)}cm`} align="center" fill="#3b82f6" fontSize={10} fontStyle="bold" />

            <Line points={[-15, 0, -5, 0]} stroke="#3b82f6" strokeWidth={1} />
            <Line points={[-15, shapeProps.height, -5, shapeProps.height]} stroke="#3b82f6" strokeWidth={1} />
            <Line points={[-10, 0, -10, shapeProps.height]} stroke="#3b82f6" strokeWidth={1} />
            <Group x={-10} y={shapeProps.height/2} rotation={-90}>
              <Rect x={-20} y={-8} width={40} height={16} fill="#ffffff" cornerRadius={2} />
              <Text x={-20} y={-4} width={40} text={`${Math.round(shapeProps.height)}cm`} align="center" fill="#3b82f6" fontSize={10} fontStyle="bold" />
            </Group>

            {/* WALL PROXIMITY GUIDES (The 'Talking' Feature) */}
            {roomSize && !roomSize.isPoly && (
              <>
                {/* Distance to Top Wall */}
                <Line points={[shapeProps.width/2, 0, shapeProps.width/2, roomSize.y + (roomSize.wallThickness||20) - shapeProps.y]} stroke="#3b82f6" strokeWidth={0.5} dash={[5, 5]} opacity={0.6} />
                <Text 
                  x={shapeProps.width/2 + 5} 
                  y={(roomSize.y + (roomSize.wallThickness||20) - shapeProps.y) / 2} 
                  text={`${Math.abs(Math.round(shapeProps.y - roomSize.y - (roomSize.wallThickness||20)))}cm`} 
                  fill="#3b82f6" fontSize={9} 
                />

                {/* Distance to Left Wall */}
                <Line points={[0, shapeProps.height/2, roomSize.x + (roomSize.wallThickness||20) - shapeProps.x, shapeProps.height/2]} stroke="#3b82f6" strokeWidth={0.5} dash={[5, 5]} opacity={0.6} />
                <Text 
                  x={(roomSize.x + (roomSize.wallThickness||20) - shapeProps.x) / 2} 
                  y={shapeProps.height/2 + 5} 
                  text={`${Math.abs(Math.round(shapeProps.x - roomSize.x - (roomSize.wallThickness||20)))}cm`} 
                  fill="#3b82f6" fontSize={9} 
                />
              </>
            )}
          </Group>
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef} 
          rotateEnabled={!isStructural}
          enabledAnchors={isStructural ? ['middle-left', 'middle-right'] : ['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorFill="#ffffff" anchorStroke={THEME_BROWN} anchorSize={10} borderStroke={THEME_BROWN}
        />
      )}
    </React.Fragment>
  );
};

export default FurnitureNode;