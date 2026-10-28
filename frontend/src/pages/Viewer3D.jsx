import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, PivotControls } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, Sofa, Maximize, Palette, Trash2, Sun, Download, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { toast } from 'sonner';
import './Viewer3D.css';

/**
 * ARCHITECTURAL GRADE 3D ENGINE (V9 - BIM SUPREME EDITOR)
 * - 100% CAD Coordinate Sync (Top-Left Anchor)
 * - Real-time Boundary Ghosting
 * - Hard-Constraint Enforced Dragging
 */

const FINISH_COLORS = [
  { hex: '#3E2723', label: 'Dark Walnut' },
  { hex: '#795548', label: 'Medium Brown' },
  { hex: '#A1887F', label: 'Light Tan' },
  { hex: '#5D4037', label: 'Mahogany' },
  { hex: '#212121', label: 'Matte Black' },
];

// ===================================
// UTILS: POINT & POLYGON LOGIC
// ===================================
function getCleanPoints(roomSize, wt) {
  if (roomSize.isPoly && roomSize.points) {
    return roomSize.points.map(p => ({ x: p.x + wt, y: p.y + wt }));
  }
  const w = roomSize.width || 600, h = roomSize.height || 400;
  return [{ x: wt, y: wt }, { x: w + wt, y: wt }, { x: w + wt, y: h + wt }, { x: wt, y: h + wt }];
}

function isPointInPoly(p, poly) {
  let isInside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > p.y) !== (yj > p.y)) && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

// ====================================================
// COMPONENT 1: FURNITURE (Interactive & Boundary-Aware)
// ====================================================
function FurnitureModel({ f, isSelected, roomSize, roomOffset, scale = 0.01, shadowIntensity = 0.75, onUpdate, onSelect, onDragToggle }) {
  const [isValid, setIsValid] = useState(true);

  const getModelPath = () => {
    if (f.modelPath) return f.modelPath;
    const n = (f.name || '').toLowerCase();
    const t = (f.type || '').toLowerCase();
    if (n.includes('bed') || t.includes('bed')) return '/assets/models/Bed.glb';
    if (n.includes('table') || t.includes('table')) return '/assets/models/Coffee Table.glb';
    return '/assets/models/Sofa.glb';
  };

  const { scene } = useGLTF(getModelPath());

  const mesh = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((node) => {
      if (node.isMesh) {
        node.material = node.material.clone();
        node.material.color.set(isValid ? (f.color || '#ffffff') : '#ff4444');
        node.material.transparent = true;
        node.material.opacity = isValid ? 1.0 : 0.4;
        node.castShadow = true; // Enable shadow casting
        node.receiveShadow = true;
      }
    });

    const b = new THREE.Box3().setFromObject(cloned);
    const ctr = new THREE.Vector3();
    b.getCenter(ctr);
    cloned.position.sub(new THREE.Vector3(ctr.x, b.min.y, ctr.z));

    const w = new THREE.Group();
    w.add(cloned);
    const s = new THREE.Vector3();
    b.getSize(s);
    w.scale.set((f.width * scale) / s.x, ((f.modelHeight || 90) * scale) / s.y, (f.height * scale) / s.z);
    return w;
  }, [scene, f.width, f.height, f.modelHeight, scale, f.color, isValid]);

  const posX = (f.x - (roomSize.x || 0) - roomOffset.centerX + (f.width / 2)) * scale;
  const posZ = (f.y - (roomSize.y || 0) - roomOffset.centerY + (f.height / 2)) * scale;

  // BIM-GRADE BOUNDARY LOGIC (Matches Designer.jsx Top-Left Anchor)
  const checkValidation = (deltaX, deltaZ) => {
    const candidateX = f.x + deltaX;
    const candidateY = f.y + deltaZ;
    const wt = roomSize.wallThickness || 20;
    const pts = getCleanPoints(roomSize, wt);

    const rad = (f.rotation || 0) * Math.PI / 180;
    const w = f.width;
    const h = f.height;

    // Regular furniture rotates around Top-Left (f.x, f.y) in this CAD system
    // So relative points are (0,0), (w,0), (w,h), (0,h)
    const corners = [
      { x: 0, y: 0 }, { x: w, y: 0 },
      { x: w, y: h }, { x: 0, y: h }
    ].map(p => {
      const rx = p.x * Math.cos(rad) - p.y * Math.sin(rad);
      const ry = p.x * Math.sin(rad) + p.y * Math.cos(rad);
      return {
        x: candidateX + rx,
        y: candidateY + ry
      };
    });

    return corners.every(c => isPointInPoly({ x: c.x - (roomSize.x || 0), y: c.y - (roomSize.y || 0) }, pts));
  };

  return (
    <group position={[posX, 0.02, posZ]} rotation={[0, -f.rotation * (Math.PI / 180), 0]}>
      <PivotControls
        visible={isSelected}
        activeAxes={[true, false, true]}
        disableRotations={false}
        depthTest={false}
        fixed={false}
        scale={2.2} // Larger for easier free-drag
        lineWidth={4}
        anchor={[0, 0, 0]}
        onDragStart={() => onDragToggle(false)}
        onDrag={(matrix) => {
          const pos = new THREE.Vector3();
          const q = new THREE.Quaternion();
          const s = new THREE.Vector3();
          matrix.decompose(pos, q, s);
          setIsValid(checkValidation(pos.x / scale, pos.z / scale));
        }}
        onDragEnd={(matrix) => {
          onDragToggle(true);
          const pos = new THREE.Vector3();
          const rot = new THREE.Quaternion();
          const scl = new THREE.Vector3();
          matrix.decompose(pos, rot, scl);

          const dx = pos.x / scale;
          const dz = pos.z / scale;

          const euler = new THREE.Euler().setFromQuaternion(rot);
          const rotationDeg = Math.round(((euler.y * (180 / Math.PI)) % 360 + 360) % 360);

          const updates = {};
          if (checkValidation(dx, dz)) {
            updates.x = f.x + dx;
            updates.y = f.y + dz;
          } else {
            toast.error("Invalid move: Furniture must stay inside the room.");
            setIsValid(true);
          }
          updates.rotation = rotationDeg;
          onUpdate(f.id, updates);
        }}
      >
        <primitive object={mesh} onClick={(e) => { e.stopPropagation(); onSelect(f.id); }} />
      </PivotControls>
    </group>
  );
}

// ====================================================
// COMPONENT 2: ADAPTIVE WALL
// ====================================================
function AdaptiveWall({ p1, p2, offset, h, wt, color }) {
  const meshRef = useRef();
  const [opacity, setOpacity] = useState(1);
  const scale = 0.01;
  const len = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * scale;
  const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);

  useFrame(({ camera }) => {
    if (!meshRef.current) return;
    const wp = new THREE.Vector3().setFromMatrixPosition(meshRef.current.matrixWorld);
    const center = new THREE.Vector3(0, h / 2, 0);
    const toCenter = new THREE.Vector3().subVectors(center, wp).normalize();
    let outwardNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(meshRef.current.quaternion);
    if (outwardNormal.dot(toCenter) > 0) outwardNormal.multiplyScalar(-1);
    const toCam = new THREE.Vector3().subVectors(camera.position, wp).normalize();
    const target = (toCam.dot(outwardNormal) > 0.2 && camera.position.distanceTo(wp) < camera.position.distanceTo(center)) ? 0.1 : 1.0;
    setOpacity(THREE.MathUtils.lerp(opacity, target, 0.15));
  });

  return (
    <mesh ref={meshRef} position={[((p1.x + p2.x) / 2 - offset.centerX) * scale, h / 2, ((p1.y + p2.y) / 2 - offset.centerY) * scale]} rotation={[0, -ang, 0]}>
      <boxGeometry args={[len + wt, h, wt]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} visible={opacity > 0.02} roughness={0.9} />
    </mesh>
  );
}

// ====================================================
// COMPONENT 3: ARCHITECTURE (Floor & Walls)
// ====================================================
const RoomArchitecture = ({ roomSize, roomOffset, furniture, selectedId, shadowIntensity = 0.75, onUpdate, onSelect, onDragToggle }) => {
  const scale = 0.01;
  const pts = useMemo(() => getCleanPoints(roomSize, roomSize.wallThickness || 20), [roomSize]);

  const floorMeshes = useMemo(() => {
    const xs = [...new Set(pts.map(p => p.x))].sort((a, b) => a - b);
    const ys = [...new Set(pts.map(p => p.y))].sort((a, b) => a - b);
    const rects = [];
    for (let i = 0; i < xs.length - 1; i++) {
      for (let j = 0; j < ys.length - 1; j++) {
        if (isPointInPoly({ x: (xs[i] + xs[i + 1]) / 2, y: (ys[j] + ys[j + 1]) / 2 }, pts)) {
          rects.push({ cx: (xs[i] + xs[i + 1]) / 2, cy: (ys[j] + ys[j + 1]) / 2, w: xs[i + 1] - xs[i], h: ys[j + 1] - ys[j] });
        }
      }
    }
    return rects.map((r, i) => (
      <mesh key={i} position={[(r.cx - roomOffset.centerX) * scale, 0, (r.cy - roomOffset.centerY) * scale]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[r.w * scale, r.h * scale]} />
        <meshStandardMaterial color={roomSize.floorColor || '#d4b483'} roughness={0.7} />
      </mesh>
    ));
  }, [pts, roomOffset, roomSize.floorColor]);

  return (
    <group onPointerMissed={() => onSelect(null)}>
      {floorMeshes}
      {/* Shadow receiver plane covering entire floor */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={() => onSelect(null)}>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={shadowIntensity * 0.6} />
      </mesh>
      {pts.map((p1, i) => <AdaptiveWall key={i} p1={p1} p2={pts[(i + 1) % pts.length]} offset={roomOffset} h={2.5} wt={(roomSize.wallThickness || 20) * scale} color={roomSize.wallColor || '#ffffff'} />)}
      {furniture.map(f => !f.isStructural && (
        <FurnitureModel
          key={f.id} f={f} isSelected={selectedId === f.id}
          roomSize={roomSize} roomOffset={roomOffset}
          shadowIntensity={shadowIntensity}
          onUpdate={onUpdate} onSelect={onSelect} onDragToggle={onDragToggle}
        />
      ))}
    </group>
  );
};

// SceneReady: signals when Suspense has resolved (3D models loaded)
function SceneReady({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

// ====================================================
// MAIN PAGE: VIEWER 3D STUDIO
// ====================================================
const Viewer3D = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomSize, furniture: initialFurniture, designId } = location.state || { roomSize: { width: 600, height: 400 }, furniture: [], designId: null };
  const [furniture, setFurniture] = useState(initialFurniture);
  const [selectedId, setSelectedId] = useState(null);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [shadowIntensity, setShadowIntensity] = useState(0.75);
  const [is3DLoading, setIs3DLoading] = useState(true);
  const glRef = useRef(null);

  const roomOffset = useMemo(() => {
    const p = getCleanPoints(roomSize, roomSize.wallThickness || 20);
    const xs = p.map(pt => pt.x);
    const ys = p.map(pt => pt.y);
    return { centerX: (Math.min(...xs) + Math.max(...xs)) / 2, centerY: (Math.min(...ys) + Math.max(...ys)) / 2 };
  }, [roomSize]);

  const updateFurniture = (id, updates) => {
    setFurniture(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const selectedItem = furniture.find(f => f.id === selectedId);

  const handleExportPlan = () => {
    const canvas = glRef.current?.domElement;
    if (!canvas) {
      toast.error('Canvas not ready. Please try again.');
      return;
    }
    try {
      const uri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${roomSize.roomName || '3D_Design'}_Export.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('3D view exported successfully!');
    } catch (err) {
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eef2f6', position: 'relative', overflow: 'hidden' }}>
      {/* HUD OVERLAY */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}><Navbar /></div>
        <div style={{ padding: '80px 40px 0', display: 'flex', justifyContent: 'space-between', pointerEvents: 'auto' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', padding: '24px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 15px 40px rgba(0,0,0,0.05)' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: '#1a202c' }}>{roomSize.roomName || '3D Studio'}</h1>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(139, 115, 85, 0.08)', padding: '5px 12px', borderRadius: '10px' }}>
                <Maximize size={16} color="#8B7355" /><span style={{ color: '#8B7355', fontSize: '11px', fontWeight: 'bold' }}>SUPREME BIM ACTIVATED</span>
              </div>
            </div>
          </div>
          <div className="viewer-hud-actions">
            <button onClick={handleExportPlan} className="viewer-hud-btn viewer-hud-btn-outline">
              <Download size={18} /> Export Plan
            </button>
            <button
              onClick={() => {
                const targetUrl = designId ? `/designer?id=${designId}` : '/designer';
                navigate(targetUrl, {
                  state: {
                    directRoomSize: roomSize,
                    directFurniture: furniture,
                    designName: roomSize.roomName,
                    designId: designId
                  }
                });
              }}
              className="viewer-hud-btn viewer-hud-btn-primary"
            >
              <ArrowLeft size={18} /> Return to 2D
            </button>
          </div>
        </div>
      </div>

      {/* 3D LOADING OVERLAY */}
      {is3DLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(238, 242, 246, 0.95)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 50, gap: 16
        }}>
          <Loader2 size={48} color="#8B7355" style={{ animation: 'viewer3d-spin 1s linear infinite' }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1a202c' }}>Loading 3D view...</span>
          <span style={{ fontSize: 13, color: '#64748b' }}>Preparing models and environment</span>
        </div>
      )}

      {/* 3D CORE */}
      <Canvas shadows dpr={[1, 2]} camera={{ position: [15, 15, 15], fov: 32 }} gl={{ preserveDrawingBuffer: true }} onCreated={({ gl }) => { glRef.current = gl; }}>
        <Suspense fallback={null}>
          <RoomArchitecture roomSize={roomSize} roomOffset={roomOffset} furniture={furniture} selectedId={selectedId} shadowIntensity={shadowIntensity} onUpdate={updateFurniture} onSelect={setSelectedId} onDragToggle={setControlsEnabled} />
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[15, 30, 15]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
            shadow-bias={-0.0001}
          />
          <OrbitControls enabled={controlsEnabled} makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.2} minDistance={5} maxDistance={45} />
          <SceneReady onReady={() => setIs3DLoading(false)} />
        </Suspense>
      </Canvas>

      {/* SELECTION HUD */}
      {selectedId && selectedItem && (
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <div style={{ background: 'white', padding: '20px 30px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '900', color: '#1a202c', fontSize: '14px' }}>{selectedItem.name}</span>
              <button onClick={() => { setFurniture(f => f.filter(i => i.id !== selectedId)); setSelectedId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}><Trash2 size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {FINISH_COLORS.map(({ hex, label }) => (
                <button
                  key={hex} title={label}
                  onClick={() => updateFurniture(selectedId, { color: hex })}
                  style={{ width: '28px', height: '28px', background: hex, borderRadius: '50%', border: selectedItem.color === hex ? '3px solid #3b82f6' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                />
              ))}
              {furniture.filter(f => !f.isStructural).length > 1 && (
                <button
                  onClick={() => {
                    const color = selectedItem.color || FINISH_COLORS[0].hex;
                    setFurniture(prev => prev.map(f => f.isStructural ? f : { ...f, color }));
                    toast.success(`Applied colour to all ${furniture.filter(f => !f.isStructural).length} furniture items.`);
                  }}
                  style={{ marginLeft: 8, padding: '6px 12px', fontSize: '11px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                >
                  Apply to All
                </button>
              )}
            </div>
            </div>
            <div style={{ fontSize: '11px', color: '#a0aec0', textAlign: 'center', fontWeight: 'bold' }}>DRAG TO MOVE · USE RINGS TO ROTATE</div>
          </div>
        </div>
      )}

      {/* HUD BOTTOM BAR + SHADING CONTROLS */}
      <div style={{ position: 'absolute', bottom: '20px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '12px 25px', borderRadius: '30px', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
          <span style={{ color: '#1a202c', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>BIM COLLISION GUARD ACTIVE</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: '14px 24px', borderRadius: '20px', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Sun size={18} color="#8B7355" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.5px' }}>SHADOW INTENSITY</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={shadowIntensity}
                onChange={e => {
                  const newValue = parseFloat(e.target.value);
                  console.log("🔆 Global shadow intensity changed to:", newValue);
                  setShadowIntensity(newValue);
                }}
                style={{ width: '120px', accentColor: '#8B7355' }}
              />
            </div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', minWidth: 36 }}>{Math.round(shadowIntensity * 100)}%</span>
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes viewer3d-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Viewer3D;
