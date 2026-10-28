import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useBlocker, useBeforeUnload } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Line, Group, Circle } from 'react-konva';
import { getDesignLayout, saveDesignLayout } from '../data/designSamples';
import {
  Search, ChevronDown, Trash2, Box, Undo2, Redo2,
  ZoomIn, ZoomOut, Hand, MousePointer2, Save, Download, Copy,
  Magnet, Maximize, Hammer, Sofa, Settings2, Palette,
  Scissors, Link2, AlignJustify, Eye, EyeOff, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import FurnitureNode from '../components/FurnitureNode';
import { ImageWithFallback } from '../components/ImageWithFallback';
import './Designer.css';

const THEME_BROWN = "#8d6e63";

// Helper to calculate the Area of a custom polygon shape
const getArea = (pts) => {
  let area = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    area += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
  }
  return Math.abs(area / 2);
};

// Calculates the true center of the custom shape so the label never escapes
// Finds a "Safe Visual Center" inside complex shapes (L, T, U) 
// using a "Pole of Inaccessibility" approach to keep labels inside.
const getVisualCenter = (pts) => {
  if (!pts || pts.length < 3) return { x: 0, y: 0 };

  // 1. Calculate Bounding Box
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  // 2. Sample points to find the "deepest" interior point
  let bestX = (minX + maxX) / 2;
  let bestY = (minY + maxY) / 2;
  let maxClearance = -1;

  const isInside = (px, py, poly) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const intersect = ((poly[i].y > py) !== (poly[j].y > py)) && (px < (poly[j].x - poly[i].x) * (py - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const distToEdge = (px, py, p1, p2) => {
    const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
    if (l2 === 0) return Math.sqrt(Math.pow(px - p1.x, 2) + Math.pow(py - p1.y, 2));
    let t = ((px - p1.x) * (p2.x - p1.x) + (py - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(Math.pow(px - (p1.x + t * (p2.x - p1.x)), 2) + Math.pow(py - (p1.y + t * (p2.y - p1.y)), 2));
  };

  // 10x10 Grid Search for efficiency and zero jitter
  for (let ix = 0; ix <= 10; ix++) {
    for (let iy = 0; iy <= 10; iy++) {
      const px = minX + (maxX - minX) * (ix / 10);
      const py = minY + (maxY - minY) * (iy / 10);

      if (isInside(px, py, pts)) {
        let minDist = Infinity;
        for (let i = 0; i < pts.length; i++) {
          minDist = Math.min(minDist, distToEdge(px, py, pts[i], pts[(i + 1) % pts.length]));
        }
        if (minDist > maxClearance) {
          maxClearance = minDist;
          bestX = px;
          bestY = py;
        }
      }
    }
  }

  return { x: bestX, y: bestY };
};

// Precise Oriented Bounding Box for furniture (Calculates actual min/max X/Y based on rotation)
const getFurnitureBounds = (f) => {
  const rad = (f.rotation || 0) * Math.PI / 180;
  const w = f.width;
  const h = f.height;
  const ox = f.isStructural ? w / 2 : 0;
  const oy = f.isStructural ? h / 2 : 0;

  const corners = [
    { x: -ox, y: -oy }, { x: w - ox, y: -oy },
    { x: w - ox, y: h - oy }, { x: -ox, y: h - oy }
  ].map(p => ({
    x: f.x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
    y: f.y + p.x * Math.sin(rad) + p.y * Math.cos(rad)
  }));

  const xs = corners.map(c => c.x);
  const ys = corners.map(c => c.y);
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
    corners
  };
};

const isPointInPolyGlobal = (pt, poly, roomX, roomY, wt) => {
  let inside = false;
  // Convert global point to room-relative coordinate (matching floor drawing)
  const px = pt.x - roomX - wt;
  const py = pt.y - roomY - wt;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const intersect = ((poly[i].y > py) !== (poly[j].y > py)) && (px < (poly[j].x - poly[i].x) * (py - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x);
    if (intersect) inside = !inside;
  }
  return inside;
};

const ROOM_TEMPLATES = [
  {
    id: 'rect',
    name: 'Rectangular Suite',
    description: 'Classic 4-wall standard room.',
    isPoly: false,
    width: 600,
    height: 400
  },
  {
    id: 'l-shape',
    name: 'L-Shaped Gallery',
    description: 'Modern corner-turn open layout.',
    isPoly: true,
    points: [
      { x: 0, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 300 },
      { x: 300, y: 300 }, { x: 300, y: 600 }, { x: 0, y: 600 }
    ]
  },
  {
    id: 't-shape',
    name: 'T-Shaped Studio',
    description: 'Architectural feature room.',
    isPoly: true,
    points: [
      { x: 0, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 0 }, { x: 400, y: 0 },
      { x: 400, y: 200 }, { x: 600, y: 200 }, { x: 600, y: 500 }, { x: 0, y: 500 }
    ]
  },
  {
    id: 'hallway',
    name: 'Gallery Hallway',
    description: 'Narrow connecting corridor.',
    isPoly: false,
    width: 700,
    height: 150
  },
  {
    id: 'square',
    name: 'Square Suite',
    description: 'Perfectly balanced utility room.',
    isPoly: false,
    width: 300,
    height: 300
  },
  {
    id: 'u-shape',
    name: 'U-Shaped Executive',
    description: 'Luxury wrap-around suite.',
    isPoly: true,
    points: [
      { x: 0, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 600 }, { x: 400, y: 600 },
      { x: 400, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 600 }, { x: 0, y: 600 }
    ]
  },
  {
    id: 'open-studio',
    name: 'Grand Open-Concept',
    description: 'Massive pillar-less modern space.',
    isPoly: false,
    width: 900,
    height: 700
  }
];

// The professional "Stretch Arrows" Icon (<->)
const ExtendIcon = ({ x, y, isMovingHorizontal }) => (
  <Group x={x} y={y} rotation={isMovingHorizontal ? 0 : 90} listening={false}>
    <Rect x={-11} y={-11} width={22} height={22} fill="#ffffff" stroke="#3b82f6" strokeWidth={1.5} cornerRadius={4} />
    <Line points={[-6, 0, 6, 0]} stroke="#3b82f6" strokeWidth={2} lineCap="round" />
    <Line points={[-6, 0, -3, -3]} stroke="#3b82f6" strokeWidth={2} lineCap="round" />
    <Line points={[-6, 0, -3, 3]} stroke="#3b82f6" strokeWidth={2} lineCap="round" />
    <Line points={[6, 0, 3, -3]} stroke="#3b82f6" strokeWidth={2} lineCap="round" />
    <Line points={[6, 0, 3, 3]} stroke="#3b82f6" strokeWidth={2} lineCap="round" />
  </Group>
);

// The Unique "Split Wall" Icon
const SplitIcon = ({ x, y, isVertical }) => (
  <Group x={x} y={y} listening={false}>
    <Circle radius={9} fill="#ffffff" stroke="#111827" strokeWidth={2} />
    <Line points={isVertical ? [0, -6, 0, 6] : [-6, 0, 6, 0]} stroke="#111827" strokeWidth={2.5} lineCap="round" />
  </Group>
);

// A clean, architectural mini-preview icon for the sidebar
const RoomPreviewIcon = ({ template }) => {
  const size = 42;
  const padding = 8;
  const innerSize = size - padding * 2;

  let points = [];
  if (template.isPoly) {
    points = template.points;
  } else {
    points = [
      { x: 0, y: 0 }, { x: template.width, y: 0 },
      { x: template.width, y: template.height }, { x: 0, y: template.height }
    ];
  }

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = maxX - minX, h = maxY - minY;
  const scale = Math.min(innerSize / (w || 1), innerSize / (h || 1));

  const scaledPoints = points.map(p => ({
    x: (p.x - minX) * scale + (size - w * scale) / 2,
    y: (p.y - minY) * scale + (size - h * scale) / 2
  }));

  const polyStr = scaledPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '6px',
      background: 'white', border: '1px solid #e2e8f0', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
    }}>
      <svg width={size} height={size} style={{ display: 'block' }}>
        <polygon
          points={polyStr}
          fill={THEME_BROWN} fillOpacity="0.1"
          stroke={THEME_BROWN} strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const Designer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [roomSize, setRoomSize] = useState({
    x: 100, y: 50,
    width: 600, height: 500,
    wallThickness: 20,
    floorColor: '#f3efe8', wallColor: '#e5e7eb',
    isPoly: false, points: [],
    roomName: 'Living Room'
  });

  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbFurniture, setDbFurniture] = useState([]);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [appMode, setAppMode] = useState('layouts'); // Changed from 'build' to 'layouts'
  const [hoveredWall, setHoveredWall] = useState(null);

  // Menu stores EXACT canvas coordinates of the user's mouse click
  const [wallMenu, setWallMenu] = useState({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
  const [confirmModal, setConfirmModal] = useState({ show: false, template: null });

  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanningMode, setIsPanningMode] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState(null);
  const [sampleDesignId, setSampleDesignId] = useState(null);
  const [designName, setDesignName] = useState('My Interior Design');
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioningTo3D, setIsTransitioningTo3D] = useState(false);
  const stageRef = useRef(null);
  const polyDragRef = useRef(null);

  // Unsaved changes: block in-app navigation and warn on browser close/refresh
  const blocker = useBlocker(hasChanges);
  useBeforeUnload((e) => {
    if (hasChanges) e.preventDefault();
  }, { capture: true });

  const furnitureOnFloor = history[historyStep] || [];

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/furniture');
        setDbFurniture(res.data);
      } catch (err) { }
    };

    // Check for incoming design state (from Designs page or 3D Viewer)
    const loadDesignIfAny = async () => {
      const state = location.state || {};

      // CHECK 1: Return from 3D View (Direct State)
      if (state.directRoomSize && state.directFurniture) {
        setRoomSize(state.directRoomSize);
        setHistory([state.directFurniture]);
        setHistoryStep(0);
        if (state.designName) setDesignName(state.designName);
        // Preserve currentDesignId if it was set (for updates after 3D view)
        if (state.designId && !state.designId.startsWith('sample-')) {
          setCurrentDesignId(state.designId);
        } else {
          setCurrentDesignId(null);
        }
        return;
      }

      // CHECK 2: Sample design from Designs page (2D format)
      const sid = state.designId;
      const sampleLayout = sid && getDesignLayout(sid);

      if (sampleLayout) {
        setSampleDesignId(sid);
        setDesignName(state.title || sampleLayout.name);
        setRoomSize(sampleLayout.roomSize);
        setHistory([sampleLayout.furniture]);
        setHistoryStep(0);
        setCurrentDesignId(null); // Clear ID for sample designs
        return;
      }

      // Check for API design via URL (Continue Editing from My Designs)
      const urlParams = new URLSearchParams(window.location.search);
      const designId = urlParams.get('id');
      if (designId && designId !== 'null' && designId !== 'undefined') {
        try {
          const res = await axios.get(`http://localhost:5001/api/designs/${designId}`);
          const d = res.data;
          const furniture = (d.furniture || []).map(f => ({ ...f, id: f.clientId || f.id }));
          setCurrentDesignId(d._id); // Set the design ID for updating
          setDesignName(d.name);
          setRoomSize(d.roomSize);
          setHistory([furniture]);
          setHistoryStep(0);
          console.log("✅ Loaded existing design for editing. ID:", d._id, "Name:", d.name);
        } catch (err) {
          console.error("❌ Failed to load design:", err);
          toast.error("Failed to load design");
          setCurrentDesignId(null);
        }
      } else {
        // No design ID in URL - starting fresh
        setCurrentDesignId(null);
        console.log("🆕 Starting new design (no ID in URL)");
      }
    };

    fetchFurniture();
    loadDesignIfAny();
  }, [location.state, location.search]);

  const applyPhysics = (items) => {
    // Helper: Get oriented corners of a piece of furniture
    const getCorners = (f) => {
      const rad = (f.rotation || 0) * Math.PI / 180;
      const w = f.width;
      const h = f.height;
      const ox = f.isStructural ? w / 2 : 0;
      const oy = f.isStructural ? h / 2 : 0;

      const pts = [
        { x: -ox, y: -oy },
        { x: w - ox, y: -oy },
        { x: w - ox, y: h - oy },
        { x: -ox, y: h - oy }
      ];

      return pts.map(p => ({
        x: f.x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
        y: f.y + p.x * Math.sin(rad) + p.y * Math.cos(rad)
      }));
    };

    // SAT (Separating Axis Theorem) collision detection
    const isIntersecting = (a, b) => {
      const polys = [getCorners(a), getCorners(b)];
      for (let p = 0; p < 2; p++) {
        const poly = polys[p];
        for (let i = 0; i < poly.length; i++) {
          const next = (i + 1) % poly.length;
          const edge = { x: poly[next].x - poly[i].x, y: poly[next].y - poly[i].y };
          const normal = { x: -edge.y, y: edge.x };

          let minA = Infinity, maxA = -Infinity;
          polys[0].forEach(pt => {
            const proj = pt.x * normal.x + pt.y * normal.y;
            minA = Math.min(minA, proj); maxA = Math.max(maxA, proj);
          });

          let minB = Infinity, maxB = -Infinity;
          polys[1].forEach(pt => {
            const proj = pt.x * normal.x + pt.y * normal.y;
            minB = Math.min(minB, proj); maxB = Math.max(maxB, proj);
          });

          if (maxA < minB || maxB < minA) return false;
        }
      }
      return true;
    };

    return items.map(item => {
      let isColliding = false;
      items.forEach(other => {
        if (item.id === other.id) return;
        if (isIntersecting(item, other)) {
          isColliding = true;
        }
      });
      return { ...item, isColliding };
    });
  };

  const commitAction = (newState) => {
    const stateWithPhysics = applyPhysics(newState);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(stateWithPhysics);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setHasChanges(true);
  };

  const handleDuplicate = () => {
    const itemToCopy = furnitureOnFloor.find(f => f.id === selectedId);
    if (itemToCopy) {
      const newItem = { ...itemToCopy, id: Date.now().toString(), x: itemToCopy.x + 30, y: itemToCopy.y + 30 };
      commitAction([...furnitureOnFloor, newItem]);
      setSelectedId(newItem.id);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setIsPanningMode(true); }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
        commitAction(furnitureOnFloor.filter(f => f.id !== selectedId));
        setSelectedId(null);
      }
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); handleDuplicate(); }
    };
    const handleKeyUp = (e) => { if (e.code === 'Space') setIsPanningMode(false); };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [selectedId, furnitureOnFloor, isPanningMode]);

  const handleUndo = () => { if (historyStep > 0) { setHistoryStep(historyStep - 1); setSelectedId(null); setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); } };
  const handleRedo = () => { if (historyStep < history.length - 1) { setHistoryStep(historyStep + 1); setSelectedId(null); setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); } };

  const handleSaveDesign = async () => {
    // Capture Thumbnail (Base64)
    setSelectedId(null);
    setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });

    const uiThumbnail = stageRef.current.toDataURL({ pixelRatio: 0.5 });

    const layoutFurniture = (furnitureOnFloor || []).map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      category: f.category,
      image: f.image,
      x: Math.round(f.x),
      y: Math.round(f.y),
      width: Math.round(f.width),
      height: Math.round(f.height),
      rotation: Math.round(f.rotation || 0),
      modelHeight: Math.round(f.modelHeight || 75),
      modelPath: f.modelPath,
      isStructural: !!f.isStructural,
      swingLeft: !!f.swingLeft,
      swingOut: !!f.swingOut,
      color: f.color,
      shading: f.shading
    }));

    // If editing a sample design from Designs page (not admin), save to Designs section (localStorage)
    const saveToMyDesigns = location.state?.saveToMyDesigns;
    if (sampleDesignId && !saveToMyDesigns) {
      saveDesignLayout(sampleDesignId, {
        roomSize: { ...roomSize, points: roomSize.points || [] },
        furniture: layoutFurniture,
        thumbnail: uiThumbnail,
        name: designName
      });
      setHasChanges(false);
      toast.success("Design updated! Changes will appear in the Designs section.");
      window.dispatchEvent(new CustomEvent('designs-updated'));
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error("Please log in to save your designs.");
      return;
    }

    const userId = user.id || user._id;
    const payload = {
      ...(currentDesignId && { id: currentDesignId }),
      userId,
      name: designName,
      roomSize: { ...roomSize, points: roomSize.points || [] },
      furniture: layoutFurniture.map(f => ({
        clientId: f.id,
        name: f.name,
        type: f.type,
        category: f.category,
        image: f.image,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        rotation: f.rotation,
        modelHeight: f.modelHeight,
        modelPath: f.modelPath,
        isStructural: f.isStructural,
        swingLeft: f.swingLeft,
        swingOut: f.swingOut,
        color: f.color,
        shading: f.shading
      })),
      thumbnail: uiThumbnail
    };

    // Debug logging to verify the ID is included
    if (currentDesignId) {
      console.log("💾 Updating existing design. ID:", currentDesignId, "Name:", designName);
    } else {
      console.log("💾 Creating new design. Name:", designName);
    }

    try {
      setIsSaving(true);
      const res = await axios.post('http://localhost:5001/api/designs', payload);
      const wasUpdate = currentDesignId === res.data._id;
      setCurrentDesignId(res.data._id);
      setHasChanges(false);

      if (wasUpdate) {
        toast.success("Design updated successfully!");
        console.log("✅ Design updated successfully. ID:", res.data._id);
      } else {
        toast.success("Design saved successfully! You can find it in 'My Designs'.");
        console.log("✅ New design created. ID:", res.data._id);
      }

      window.dispatchEvent(new CustomEvent('designs-updated'));
    } catch (err) {
      console.error("Save Error:", err);
      const serverData = err.response?.data;
      const msg = serverData?.message || err.message;
      const detail = serverData?.error ? ` (${serverData.error})` : "";
      toast.error(`Save failed: ${msg}${detail}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1; // More modern zoom speed
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Safety limits for pro CAD feel
    const clampedScale = Math.max(0.2, Math.min(5, newScale));

    setStageScale(clampedScale);
    setStagePos({ x: pointer.x - mousePointTo.x * clampedScale, y: pointer.y - mousePointTo.y * clampedScale });
    setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
  };

  const setManualZoom = (factor) => {
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const newScale = oldScale * factor;
    const clampedScale = Math.max(0.2, Math.min(5, newScale));

    // Zoom into center of screen
    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;
    const mousePointTo = { x: (centerX - stage.x()) / oldScale, y: (centerY - stage.y()) / oldScale };

    setStageScale(clampedScale);
    setStagePos({ x: centerX - mousePointTo.x * clampedScale, y: centerY - mousePointTo.y * clampedScale });
  };

  const handleFitToScreen = () => {
    setStageScale(0.85); // Professional padding
    setStagePos({ x: 80, y: 80 });
  };

  const groupedCatalog = dbFurniture.reduce((acc, item) => {
    const cat = item.category || 'Furnishings';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({
      id: item._id,
      name: item.name,
      type: item.type,
      category: cat, // Added this
      img: item.imagePath || item.image || 'https://placehold.co/100x100?text=Furniture',
      w: Math.round(item.dimensions?.width || 100),
      d: Math.round(item.dimensions?.depth || 100),
      h: Math.round(item.dimensions?.height || 75), // Storage for 3D Tallness
      modelPath: item.modelPath
    });
    return acc;
  }, {});

  if (!groupedCatalog['Architecture']) groupedCatalog['Architecture'] = [];
  groupedCatalog['Architecture'].unshift(
    { id: 'door-1', name: 'Standard Door', img: 'https://placehold.co/80x80/e2e8f0/334155?text=Door', w: 90, d: roomSize.wallThickness, isStructural: true, swingLeft: false, swingOut: false },
    { id: 'win-1', name: 'Glass Window', img: 'https://placehold.co/80x80/e2e8f0/334155?text=Window', w: 120, d: roomSize.wallThickness, isStructural: true }
  );

  const getSelectedItem = () => furnitureOnFloor.find(f => f.id === selectedId);

  const handleDrop = (e) => {
    e.preventDefault();
    const itemDataStr = e.dataTransfer.getData("item");
    if (!itemDataStr) return;
    const itemData = JSON.parse(itemDataStr);

    const stage = stageRef.current;
    stage.setPointersPositions(e);
    const pointer = stage.getPointerPosition();

    const dropX = ((pointer.x - stage.x()) / stageScale) - (itemData.w / 2);
    const dropY = ((pointer.y - stage.y()) / stageScale) - (itemData.d / 2);

    const newItem = {
      id: Date.now().toString(),
      name: itemData.name,
      type: itemData.type,
      category: itemData.category, // Added this
      image: itemData.img,
      x: snapToGrid ? Math.round(dropX / 20) * 20 : Math.round(dropX),
      y: snapToGrid ? Math.round(dropY / 20) * 20 : Math.round(dropY),
      width: itemData.w, height: itemData.d, rotation: 0,
      modelHeight: itemData.h, // Store the 3D Tallness independently
      modelPath: itemData.modelPath,
      isStructural: itemData.isStructural || false,
      swingLeft: itemData.swingLeft || false, swingOut: itemData.swingOut || false
    };

    commitAction([...furnitureOnFloor, newItem]);
    setSelectedId(newItem.id);
  };

  const handlePropertyChange = (property, value) => {
    const finalValue = typeof value === 'boolean' ? value
      : typeof value === 'string' ? value
      : Math.round(value);
    const updated = furnitureOnFloor.map(item =>
      item.id === selectedId ? { ...item, [property]: finalValue } : item
    );
    commitAction(updated);
  };

  const handleRoomConfigChange = (property, value) => {
    setRoomSize(prev => ({ ...prev, [property]: value }));
  };

  const handleApplyTemplate = (tpl) => {
    setConfirmModal({ show: true, template: tpl });
  };

  const executeApplyTemplate = () => {
    const tpl = confirmModal.template;
    if (!tpl) return;

    setRoomSize(prev => ({
      ...prev,
      isPoly: tpl.isPoly,
      width: tpl.width || 600,
      height: tpl.height || 400,
      points: tpl.points || [],
      roomName: tpl.name
    }));

    // HCI FRIENDLY: Clear previous furniture to avoid spatial confusion and outside-the-room bugs
    commitAction([]);
    setConfirmModal({ show: false, template: null });
  };

  const currentX = roomSize.x;
  const currentY = roomSize.y;
  const currentW = roomSize.width;
  const currentH = roomSize.height;
  const wt = Math.max(1, roomSize.wallThickness || 1);
  const innerX = currentX + wt;
  const innerY = currentY + wt;
  const dimOffset = 15;

  const handleWallClick = (e, wallName) => {
    e.cancelBubble = true;
    setSelectedId(null);

    // Captures the EXACT coordinate on the canvas to place the split precisely
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const scale = stage.scaleX();
    const sX = (pointer.x - stage.x()) / scale;
    const sY = (pointer.y - stage.y()) / scale;

    setWallMenu({
      show: true,
      x: e.evt.clientX,
      y: e.evt.clientY,
      stageX: sX,
      stageY: sY,
      wall: wallName
    });
  };

  // =================================================================
  // CAD TOOL LOGIC: SPLIT, CONNECT, DELETE
  // =================================================================
  const executeWallSplit = () => {
    const w = roomSize.width;
    const h = roomSize.height;

    const relX = snapToGrid ? Math.round((wallMenu.stageX - roomSize.x - wt) / 20) * 20 : wallMenu.stageX - roomSize.x - wt;
    const relY = snapToGrid ? Math.round((wallMenu.stageY - roomSize.y - wt) / 20) * 20 : wallMenu.stageY - roomSize.y - wt;

    if (!roomSize.isPoly) {
      let pts = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
      if (wallMenu.wall === 'top') pts.splice(1, 0, { x: Math.max(0, Math.min(relX, w)), y: 0 });
      if (wallMenu.wall === 'right') pts.splice(2, 0, { x: w, y: Math.max(0, Math.min(relY, h)) });
      if (wallMenu.wall === 'bottom') pts.splice(3, 0, { x: Math.max(0, Math.min(relX, w)), y: h });
      if (wallMenu.wall === 'left') pts.splice(4, 0, { x: 0, y: Math.max(0, Math.min(relY, h)) });
      setRoomSize(prev => ({ ...prev, isPoly: true, points: pts }));
    } else {
      const edgeIdx = parseInt(wallMenu.wall);
      if (!isNaN(edgeIdx)) {
        const p1 = roomSize.points[edgeIdx];
        const p2 = roomSize.points[(edgeIdx + 1) % roomSize.points.length];
        const isVert = Math.abs(p1.x - p2.x) < Math.abs(p1.y - p2.y);

        let cX = relX; let cY = relY;
        if (isVert) cY = Math.max(Math.min(p1.y, p2.y), Math.min(Math.max(p1.y, p2.y), cY));
        else cX = Math.max(Math.min(p1.x, p2.x), Math.min(Math.max(p1.x, p2.x), cX));

        const splitPt = isVert ? { x: p1.x, y: cY } : { x: cX, y: p1.y };
        const newPts = [...roomSize.points];
        newPts.splice(edgeIdx + 1, 0, splitPt);
        setRoomSize(prev => ({ ...prev, points: newPts }));
      }
    }
    setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
  };

  const executeConnectWalls = () => {
    if (!roomSize.isPoly) return;
    const edgeIdx = parseInt(wallMenu.wall);
    if (!isNaN(edgeIdx) && roomSize.points.length > 4) {
      let pts = [...roomSize.points];
      const pointToRemove = (edgeIdx + 1) % pts.length;
      pts.splice(pointToRemove, 1);
      setRoomSize(prev => ({ ...prev, points: pts }));
    }
    setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
  };

  const executeDeleteWall = () => {
    if (!roomSize.isPoly) return;
    const edgeIdx = parseInt(wallMenu.wall);
    if (!isNaN(edgeIdx) && roomSize.points.length > 3) {
      let pts = [...roomSize.points];
      pts.splice(edgeIdx, 1);
      setRoomSize(prev => ({ ...prev, points: pts }));
    }
    setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
  };

  return (
    <div className="designer-main-container">
      <Navbar />

      <div className="designer-toolbar">
        <div className="toolbar-group">
          <button className="icon-btn" onClick={handleUndo} disabled={historyStep === 0}><Undo2 size={18} /></button>
          <button className="icon-btn" onClick={handleRedo} disabled={historyStep === history.length - 1}><Redo2 size={18} /></button>
          <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 10px' }}></div>
          <button className={`icon-btn ${!isPanningMode ? 'active' : ''}`} onClick={() => setIsPanningMode(false)}><MousePointer2 size={18} /></button>
          <button className={`icon-btn ${isPanningMode ? 'active' : ''}`} onClick={() => setIsPanningMode(true)}><Hand size={18} /></button>
          <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 10px' }}></div>
          <button className="icon-btn" onClick={() => setManualZoom(1.2)}><ZoomIn size={18} /></button>
          <button className="icon-btn" onClick={() => setManualZoom(1 / 1.2)}><ZoomOut size={18} /></button>
          <button className="icon-btn" onClick={handleFitToScreen} title="Fit to Screen"><Maximize size={16} /></button>
          <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 10px' }}></div>
          <button className={`icon-btn ${snapToGrid ? 'active' : ''}`} onClick={() => setSnapToGrid(!snapToGrid)}><Magnet size={18} color={snapToGrid ? THEME_BROWN : '#94a3b8'} /></button>
        </div>
        <div className="toolbar-group">
          <button className="icon-btn" onClick={() => {
            setSelectedId(null);
            setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
            setTimeout(() => {
              const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
              const link = document.createElement('a'); link.download = 'FloorPlan_Export.png'; link.href = uri;
              document.body.appendChild(link); link.click(); document.body.removeChild(link);
            }, 100);
          }}><Download size={18} style={{ marginRight: '5px' }} /> Export Plan</button>

          <button
            className="icon-btn"
            onClick={() => {
              setIsTransitioningTo3D(true);
              toast.info('Loading 3D view...');
              navigate('/viewer', {
                state: {
                  roomSize,
                  furniture: furnitureOnFloor,
                  designId: currentDesignId || sampleDesignId
                }
              });
            }}
            disabled={isTransitioningTo3D}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            {isTransitioningTo3D ? <Loader2 size={18} className="designer-spinner" style={{ marginRight: '5px' }} /> : <Eye size={18} style={{ marginRight: '5px' }} />}
            3D Render
          </button>

          <button className="btn-save-primary" onClick={handleSaveDesign} disabled={!hasChanges || isSaving}>
            {isSaving ? <Loader2 size={18} className="designer-spinner" /> : <Save size={18} />}
            {isSaving ? ' Saving...' : ' Save Design'}
          </button>
        </div>
      </div>

      <div className="designer-workspace">
        <aside className="sidebar-panel left-sidebar">
          <div style={{ display: 'flex', padding: '15px', gap: '10px', borderBottom: '1px solid #e2e8f0' }}>
            <button
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: appMode === 'layouts' ? THEME_BROWN : '#f1f5f9', color: appMode === 'layouts' ? 'white' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              onClick={() => { setAppMode('layouts'); setSelectedId(null); setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); }}
            ><Maximize size={16} /> Layout</button>
            <button
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: appMode === 'furnish' ? THEME_BROWN : '#f1f5f9', color: appMode === 'furnish' ? 'white' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              onClick={() => { setAppMode('furnish'); setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); }}
            ><Sofa size={16} /> Furnish</button>
          </div>

          <div className="search-container">
            <Search size={18} className="text-light" style={{ position: 'absolute', marginLeft: '10px', marginTop: '10px' }} />
            <input type="text" placeholder="Search catalog..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '35px' }} />
          </div>
          <div className="category-list">
            {appMode === 'layouts' && (
              <>
                <div className="category-header active">
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Maximize size={18} /> Room Blueprints</span>
                  <ChevronDown size={18} />
                </div>
                <div style={{ padding: '5px 15px 15px' }}>
                  {ROOM_TEMPLATES.map(tpl => (
                    <div
                      key={tpl.id}
                      className="layout-tile"
                      onClick={() => handleApplyTemplate(tpl)}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b', marginBottom: '2px' }}>{tpl.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>{tpl.description}</div>
                      </div>
                      <RoomPreviewIcon template={tpl} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {Object.entries(groupedCatalog)
              .filter(([cat]) => appMode === 'layouts' ? cat === 'Architecture' : cat !== 'Architecture')
              .map(([categoryName, items]) => (
                <div key={categoryName}>
                  <div className="category-header active">
                    <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Box size={18} /> {categoryName}</span>
                    <ChevronDown size={18} />
                  </div>
                  <div className="item-grid">
                    {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                      <div key={item.id} className="draggable-item" draggable onDragStart={(e) => { e.dataTransfer.setData("item", JSON.stringify(item)); }}>
                        <ImageWithFallback src={item.img} alt={item.name} />
                        <p>{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </aside>

        <main className={`canvas-area ${isPanningMode ? 'is-panning' : ''}`} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
          <Stage
            width={window.innerWidth - 580} height={window.innerHeight - 120}
            ref={stageRef} scaleX={stageScale} scaleY={stageScale} x={stagePos.x} y={stagePos.y}
            onWheel={handleWheel} draggable={isPanningMode}
            onDragEnd={(e) => { if (e.target === stageRef.current) setStagePos({ x: e.target.x(), y: e.target.y() }); }}
            onMouseDown={e => {
              if (!isPanningMode && (e.target === stageRef.current || e.target.name() === 'bg_canvas' || e.target.name() === 'floor')) {
                setSelectedId(null);
                setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
              }
            }}
          >
            <Layer>
              <Rect name="bg_canvas" x={-5000} y={-5000} width={10000} height={10000} fill="transparent" listening={true} />

              {/* ==================================================== */}
              {/* BRANCH 1: THE SPLIT POLYGON ROOM */}
              {/* ==================================================== */}
              {roomSize.isPoly ? (
                <Group x={roomSize.x} y={roomSize.y}>
                  <Line name="floor" points={roomSize.points.flatMap(p => [p.x + wt, p.y + wt])} fill={roomSize.floorColor} closed />

                  {/* Outer Thick Wall Borders */}
                  <Line points={roomSize.points.flatMap(p => [p.x + wt, p.y + wt])} stroke="#4b5563" strokeWidth={wt + 2} closed listening={false} lineJoin="round" />
                  <Line points={roomSize.points.flatMap(p => [p.x + wt, p.y + wt])} stroke={roomSize.wallColor} strokeWidth={wt} closed listening={false} lineJoin="round" />

                  {/* Clean CAD Black Joints */}
                  {roomSize.points.map((p, i) => (
                    <Group key={`joint-${i}`} x={p.x + wt} y={p.y + wt} listening={false}>
                      <Circle radius={4} fill="#1f2937" />
                    </Group>
                  ))}

                  {/* Room Label & Area (SMART INTERNAL AUTO-POSITION) */}
                  <Group
                    x={getVisualCenter(roomSize.points).x + wt}
                    y={getVisualCenter(roomSize.points).y + wt}
                    listening={false}
                  >
                    <Text text={roomSize.roomName || "Custom Room"} x={-100} y={-15} width={200} align="center" fill="#1f2937" fontSize={18} fontStyle="bold" />
                    <Text text={`${(getArea(roomSize.points) / 10000).toFixed(2)} m²`} x={-100} y={8} width={200} align="center" fill="#6b7280" fontSize={13} fontStyle="bold" />
                  </Group>

                  {/* Dimensions & PERFECTLY STABLE Interactive Edges */}
                  {roomSize.points.map((p, i) => {
                    const nextP = roomSize.points[(i + 1) % roomSize.points.length];
                    const isVert = Math.abs(p.x - nextP.x) < Math.abs(p.y - nextP.y);

                    const dist = Math.hypot(nextP.x - p.x, nextP.y - p.y);
                    const midX = (p.x + nextP.x) / 2 + wt;
                    const midY = (p.y + nextP.y) / 2 + wt;

                    let textAngle = Math.atan2(nextP.y - p.y, nextP.x - p.x) * (180 / Math.PI);
                    if (textAngle > 90 || textAngle < -90) textAngle += 180;

                    const isHov = hoveredWall === i.toString() || wallMenu.wall === i.toString();

                    return (
                      <React.Fragment key={`edge-${i}`}>
                        {/* Dimension Box */}
                        {dist > 40 && (
                          <Group x={midX} y={midY} rotation={textAngle} listening={false}>
                            <Rect x={-25} y={-wt / 2 - 25} width={50} height={18} fill="#ffffff" cornerRadius={4} stroke="#e2e8f0" strokeWidth={1} />
                            <Text x={-25} y={-wt / 2 - 21} width={50} text={`${(dist / 100).toFixed(2)}m`} align="center" fill="#374151" fontSize={10} fontStyle="bold" />
                          </Group>
                        )}

                        {/* Blue Highlight */}
                        <Line points={[p.x + wt, p.y + wt, nextP.x + wt, nextP.y + wt]} stroke="#3b82f6" strokeWidth={wt + 6} opacity={isHov ? 0.6 : 0} lineCap="square" listening={false} />

                        {/* ==================================================== */}
                        {/* TRUE FREE DRAGGING HITBOX (Zero Jitter) */}
                        {/* ==================================================== */}
                        <Line
                          points={[p.x + wt, p.y + wt, nextP.x + wt, nextP.y + wt]}
                          stroke="transparent" strokeWidth={wt + 30}
                          onMouseEnter={() => {
                            setHoveredWall(i.toString());
                            document.body.style.cursor = isVert ? 'ew-resize' : 'ns-resize';
                          }}
                          onMouseLeave={() => { setHoveredWall(null); document.body.style.cursor = 'default'; }}
                          onClick={(e) => handleWallClick(e, i.toString())}
                          draggable
                          onDragStart={e => {
                            e.cancelBubble = true;
                            setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
                            // Snapshot initial points for Absolute Delta Calculation
                            polyDragRef.current = roomSize.points.map(pt => ({ ...pt }));
                          }}
                          onDragMove={e => {
                            e.cancelBubble = true;
                            if (!polyDragRef.current) return;

                            // Calculate Absolute cumulative movement
                            let dx = e.target.x();
                            let dy = e.target.y();

                            // ARCHITECTURAL AXIS LOCK
                            if (isVert) { dy = 0; } else { dx = 0; }

                            // Apply movement to the SNAPSHOT (not the previous frame) 
                            // to ensure perfectly smooth 1:1 control with no acceleration bugs.
                            const newPts = polyDragRef.current.map(pt => ({ ...pt }));
                            newPts[i].x += dx; newPts[i].y += dy;
                            newPts[(i + 1) % newPts.length].x += dx; newPts[(i + 1) % newPts.length].y += dy;

                            // VALIDATION: Does this move leave any furniture outside?
                            const allInside = furnitureOnFloor.every(f => {
                              const bounds = getFurnitureBounds(f);
                              return bounds.corners.every(c => isPointInPolyGlobal(c, newPts, roomSize.x, roomSize.y, wt));
                            });

                            if (allInside) {
                              setRoomSize(prev => ({ ...prev, points: newPts }));
                            } else {
                              // If movement would hit furniture, don't apply the change
                              e.target.position({ x: e.target.x() - (isVert ? dx : 0), y: e.target.y() - (isVert ? 0 : dy) });
                            }
                          }}
                          onDragEnd={e => {
                            e.cancelBubble = true;
                            polyDragRef.current = null;
                            // Final snap-to-grid alignment
                            const newPts = roomSize.points.map(pt => ({
                              x: snapToGrid ? Math.round(pt.x / 20) * 20 : pt.x,
                              y: snapToGrid ? Math.round(pt.y / 20) * 20 : pt.y
                            }));
                            setRoomSize(prev => ({ ...prev, points: newPts }));
                            e.target.position({ x: 0, y: 0 });
                          }}
                        />

                        {/* Visual Wall Guide (Appears on Hover) */}
                        <Line points={[p.x + wt, p.y + wt, nextP.x + wt, nextP.y + wt]} stroke="#3b82f6" strokeWidth={isHov ? 6 : 0} opacity={0.6} lineCap="square" listening={false} />

                        {/* The Extendable 'Stretch' Icon (Architectural Arrows <->) */}
                        {isHov && <ExtendIcon x={midX} y={midY} isMovingHorizontal={isVert} />}

                        {/* Interactive Corner Hitbox (Zero Jitter) */}
                        <Circle
                          x={p.x + wt} y={p.y + wt} radius={12} fill="transparent"
                          draggable
                          onMouseEnter={e => { document.body.style.cursor = 'crosshair'; }}
                          onMouseLeave={e => { document.body.style.cursor = 'default'; }}
                          onDragStart={e => {
                            e.cancelBubble = true;
                            setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
                          }}
                          onDragMove={e => {
                            e.cancelBubble = true;
                            const dx = e.target.x() - (roomSize.points[i].x + wt);
                            const dy = e.target.y() - (roomSize.points[i].y + wt);
                            if (dx === 0 && dy === 0) return;

                            const newPts = roomSize.points.map(pt => ({ ...pt }));
                            newPts[i].x += dx; newPts[i].y += dy;
                            setRoomSize(prev => ({ ...prev, points: newPts }));
                            e.target.position({ x: roomSize.points[i].x + wt, y: roomSize.points[i].y + wt });
                          }}
                          onDragEnd={e => {
                            e.cancelBubble = true;
                            const newPts = roomSize.points.map(pt => ({
                              x: snapToGrid ? Math.round(pt.x / 20) * 20 : pt.x,
                              y: snapToGrid ? Math.round(pt.y / 20) * 20 : pt.y
                            }));
                            setRoomSize(prev => ({ ...prev, points: newPts }));
                          }}
                        />
                      </React.Fragment>
                    )
                  })}
                </Group>
              ) : (

                /* ==================================================== */
                /* BRANCH 2: THE PERFECT BASE RECTANGLE                 */
                /* ==================================================== */
                <>
                  <Rect
                    x={currentX} y={currentY} width={currentW + (wt * 2)} height={currentH + (wt * 2)}
                    fill={roomSize.wallColor} stroke="#6b7280" strokeWidth={2} listening={false}
                  />
                  <Rect name="floor" x={innerX} y={innerY} width={currentW} height={currentH} fill={roomSize.floorColor} stroke="#6b7280" strokeWidth={2} />

                  <Group listening={false}>
                    {Array.from({ length: Math.max(0, Math.floor(currentW / 40)) }).map((_, i) => (
                      <Line key={`v-tile-${i}`} points={[innerX + (i + 1) * 40, innerY, innerX + (i + 1) * 40, innerY + currentH]} stroke="#000000" strokeWidth={1} opacity={0.04} />
                    ))}
                    {Array.from({ length: Math.max(0, Math.floor(currentH / 40)) }).map((_, i) => (
                      <Line key={`h-tile-${i}`} points={[innerX, innerY + (i + 1) * 40, innerX + currentW, innerY + (i + 1) * 40]} stroke="#000000" strokeWidth={1} opacity={0.04} />
                    ))}
                  </Group>

                  <Group x={innerX + currentW / 2} y={innerY + currentH / 2} listening={false}>
                    <Text text={roomSize.roomName || "Living Room"} x={-100} y={-15} width={200} align="center" fill="#1f2937" fontSize={18} fontStyle="bold" />
                    <Text text={`${((currentW * currentH) / 10000).toFixed(2)} m²`} x={-100} y={8} width={200} align="center" fill="#6b7280" fontSize={13} fontStyle="bold" />
                  </Group>

                  <Group listening={false}>
                    <Line points={[innerX - 8, innerY + dimOffset, innerX + currentW + 8, innerY + dimOffset]} stroke="#6b7280" strokeWidth={1} />
                    <Line points={[innerX, innerY, innerX, innerY + dimOffset + 8]} stroke="#6b7280" strokeWidth={1} />
                    <Line points={[innerX + currentW, innerY, innerX + currentW, innerY + dimOffset + 8]} stroke="#6b7280" strokeWidth={1} />
                    <Line points={[innerX - 4, innerY + dimOffset + 4, innerX + 4, innerY + dimOffset - 4]} stroke="#4b5563" strokeWidth={2} />
                    <Line points={[innerX + currentW - 4, innerY + dimOffset + 4, innerX + currentW + 4, innerY + dimOffset - 4]} stroke="#4b5563" strokeWidth={2} />
                    <Rect x={innerX + currentW / 2 - 35} y={innerY + dimOffset - 10} width={70} height={20} fill={roomSize.floorColor} />
                    <Text x={innerX + currentW / 2 - 35} y={innerY + dimOffset - 5} width={70} text={`${Number((currentW / 100).toFixed(2))} m`} align="center" fill="#374151" fontSize={11} fontStyle="bold" />

                    <Line points={[innerX + dimOffset, innerY - 8, innerX + dimOffset, innerY + currentH + 8]} stroke="#6b7280" strokeWidth={1} />
                    <Line points={[innerX, innerY, innerX + dimOffset + 8, innerY]} stroke="#6b7280" strokeWidth={1} />
                    <Line points={[innerX, innerY + currentH, innerX + dimOffset + 8, innerY + currentH]} stroke="#6b7280" strokeWidth={1} />
                    <Line points={[innerX + dimOffset - 4, innerY + 4, innerX + dimOffset + 4, innerY - 4]} stroke="#4b5563" strokeWidth={2} />
                    <Line points={[innerX + dimOffset - 4, innerY + currentH + 4, innerX + dimOffset + 4, innerY + currentH - 4]} stroke="#4b5563" strokeWidth={2} />
                    <Group x={innerX + dimOffset} y={innerY + currentH / 2} rotation={-90}>
                      <Rect x={-35} y={-10} width={70} height={20} fill={roomSize.floorColor} />
                      <Text x={-35} y={-5} width={70} text={`${Number((currentH / 100).toFixed(2))} m`} align="center" fill="#374151" fontSize={11} fontStyle="bold" />
                    </Group>
                  </Group>

                  {/* EXACT MATH: Render Draggable Hitboxes cleanly */}
                  {/* TOP Wall Handle */}
                  <Group
                    x={roomSize.x} y={roomSize.y} draggable
                    onMouseEnter={() => { setHoveredWall('top'); document.body.style.cursor = 'ns-resize'; }}
                    onMouseLeave={() => { setHoveredWall(null); document.body.style.cursor = 'default'; }}
                    onClick={(e) => handleWallClick(e, 'top')}
                    onDragStart={e => { e.cancelBubble = true; setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); }}
                    onDragMove={(e) => {
                      e.cancelBubble = true;
                      const dy = e.target.y() - roomSize.y;
                      e.target.position({ x: roomSize.x, y: roomSize.y });
                      if (dy !== 0) {
                        // Calculate max Y permitted (cannot move past TOP corner of any furniture)
                        const furnitureLimit = furnitureOnFloor.reduce((min, f) => {
                          const b = getFurnitureBounds(f);
                          return Math.min(min, b.minY);
                        }, roomSize.y + roomSize.height + wt);

                        const maxY = Math.min(roomSize.y + roomSize.height - 100, furnitureLimit - wt);
                        let newY = Math.min(maxY, roomSize.y + dy);
                        let newH = roomSize.height + (roomSize.y - newY);
                        setRoomSize(prev => ({ ...prev, y: newY, height: newH }));
                      }
                    }}
                    onDragEnd={(e) => {
                      e.cancelBubble = true;
                      let snapY = snapToGrid ? Math.round(roomSize.y / 20) * 20 : roomSize.y;
                      let snapH = snapToGrid ? Math.round(roomSize.height / 20) * 20 : roomSize.height;
                      setRoomSize(prev => ({ ...prev, y: snapY, height: snapH }));
                      e.target.position({ x: roomSize.x, y: snapY });
                    }}
                  >
                    <Rect x={0} y={-15} width={roomSize.width + wt * 2} height={wt + 30} fill="transparent" />
                    <Rect x={0} y={0} width={roomSize.width + wt * 2} height={wt} fill="#3b82f6" opacity={hoveredWall === 'top' || wallMenu.wall === 'top' ? 0.8 : 0} listening={false} />
                    {(hoveredWall === 'top' || wallMenu.wall === 'top') && <ExtendIcon x={(roomSize.width + wt * 2) / 2} y={wt / 2} isMovingHorizontal={false} />}
                  </Group>

                  {/* LEFT Wall Handle */}
                  <Group
                    x={roomSize.x} y={roomSize.y + wt} draggable
                    onMouseEnter={() => { setHoveredWall('left'); document.body.style.cursor = 'ew-resize'; }}
                    onMouseLeave={() => { setHoveredWall(null); document.body.style.cursor = 'default'; }}
                    onClick={(e) => handleWallClick(e, 'left')}
                    onDragStart={e => { e.cancelBubble = true; setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); }}
                    onDragMove={(e) => {
                      e.cancelBubble = true;
                      const dx = e.target.x() - roomSize.x;
                      e.target.position({ x: roomSize.x, y: roomSize.y + wt });
                      if (dx !== 0) {
                        // Calculate max X permitted (cannot move past LEFT corner of any furniture)
                        const furnitureLimit = furnitureOnFloor.reduce((min, f) => {
                          const b = getFurnitureBounds(f);
                          return Math.min(min, b.minX);
                        }, roomSize.x + roomSize.width + wt);

                        const maxX = Math.min(roomSize.x + roomSize.width - 100, furnitureLimit - wt);
                        let newX = Math.min(maxX, roomSize.x + dx);
                        let newW = roomSize.width + (roomSize.x - newX);
                        setRoomSize(prev => ({ ...prev, x: newX, width: newW }));
                      }
                    }}
                    onDragEnd={(e) => {
                      e.cancelBubble = true;
                      let snapX = snapToGrid ? Math.round(roomSize.x / 20) * 20 : roomSize.x;
                      let snapW = snapToGrid ? Math.round(roomSize.width / 20) * 20 : roomSize.width;
                      setRoomSize(prev => ({ ...prev, x: snapX, width: snapW }));
                      e.target.position({ x: snapX, y: roomSize.y + wt });
                    }}
                  >
                    <Rect x={-15} y={0} width={wt + 30} height={roomSize.height} fill="transparent" />
                    <Rect x={0} y={0} width={wt} height={roomSize.height} fill="#3b82f6" opacity={hoveredWall === 'left' || wallMenu.wall === 'left' ? 0.8 : 0} listening={false} />
                    {(hoveredWall === 'left' || wallMenu.wall === 'left') && <ExtendIcon x={wt / 2} y={roomSize.height / 2} isMovingHorizontal={true} />}
                  </Group>

                  {/* RIGHT Wall Handle */}
                  <Group
                    x={roomSize.x + roomSize.width + wt} y={roomSize.y + wt} draggable
                    onMouseEnter={() => { setHoveredWall('right'); document.body.style.cursor = 'ew-resize'; }}
                    onMouseLeave={() => { setHoveredWall(null); document.body.style.cursor = 'default'; }}
                    onClick={(e) => handleWallClick(e, 'right')}
                    onDragStart={e => { e.cancelBubble = true; setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); }}
                    onDragMove={(e) => {
                      e.cancelBubble = true;
                      const dx = e.target.x() - (roomSize.x + roomSize.width + wt);
                      e.target.position({ x: roomSize.x + roomSize.width + wt, y: roomSize.y + wt });
                      if (dx !== 0) {
                        // Calculate min width (cannot move past RIGHT corner of any furniture)
                        const furnitureLimit = furnitureOnFloor.reduce((max, f) => {
                          const b = getFurnitureBounds(f);
                          return Math.max(max, b.maxX);
                        }, roomSize.x + wt);

                        const minWidth = Math.max(100, furnitureLimit - roomSize.x - wt);
                        setRoomSize(prev => ({ ...prev, width: Math.max(minWidth, prev.width + dx) }));
                      }
                    }}
                    onDragEnd={(e) => {
                      e.cancelBubble = true;
                      let snapW = snapToGrid ? Math.round(roomSize.width / 20) * 20 : roomSize.width;
                      setRoomSize(prev => ({ ...prev, width: snapW }));
                      e.target.position({ x: roomSize.x + snapW + wt, y: roomSize.y + wt });
                    }}
                  >
                    <Rect x={-15} y={0} width={wt + 30} height={roomSize.height} fill="transparent" />
                    <Rect x={0} y={0} width={wt} height={roomSize.height} fill="#3b82f6" opacity={hoveredWall === 'right' || wallMenu.wall === 'right' ? 0.8 : 0} listening={false} />
                    {(hoveredWall === 'right' || wallMenu.wall === 'right') && <ExtendIcon x={wt / 2} y={roomSize.height / 2} isMovingHorizontal={true} />}
                  </Group>

                  {/* BOTTOM Wall Handle */}
                  <Group
                    x={roomSize.x} y={roomSize.y + roomSize.height + wt} draggable
                    onMouseEnter={() => { setHoveredWall('bottom'); document.body.style.cursor = 'ns-resize'; }}
                    onMouseLeave={() => { setHoveredWall(null); document.body.style.cursor = 'default'; }}
                    onClick={(e) => handleWallClick(e, 'bottom')}
                    onDragStart={e => { e.cancelBubble = true; setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); }}
                    onDragMove={(e) => {
                      e.cancelBubble = true;
                      const dy = e.target.y() - (roomSize.y + roomSize.height + wt);
                      e.target.position({ x: roomSize.x, y: roomSize.y + roomSize.height + wt });
                      if (dy !== 0) {
                        // Calculate min height (cannot move past BOTTOM corner of any furniture)
                        const furnitureLimit = furnitureOnFloor.reduce((max, f) => {
                          const b = getFurnitureBounds(f);
                          return Math.max(max, b.maxY);
                        }, roomSize.y + wt);

                        const minHeight = Math.max(100, furnitureLimit - roomSize.y - wt);
                        setRoomSize(prev => ({ ...prev, height: Math.max(minHeight, prev.height + dy) }));
                      }
                    }}
                    onDragEnd={(e) => {
                      e.cancelBubble = true;
                      let snapH = snapToGrid ? Math.round(roomSize.height / 20) * 20 : roomSize.height;
                      setRoomSize(prev => ({ ...prev, height: snapH }));
                      e.target.position({ x: roomSize.x, y: roomSize.y + snapH + wt });
                    }}
                  >
                    <Rect x={0} y={-15} width={roomSize.width + wt * 2} height={wt + 30} fill="transparent" />
                    <Rect x={0} y={0} width={roomSize.width + wt * 2} height={wt} fill="#3b82f6" opacity={hoveredWall === 'bottom' || wallMenu.wall === 'bottom' ? 0.8 : 0} listening={false} />
                    {(hoveredWall === 'bottom' || wallMenu.wall === 'bottom') && <ExtendIcon x={(roomSize.width + wt * 2) / 2} y={wt / 2} isMovingHorizontal={false} />}
                  </Group>
                </>
              )}

              {/* Render Furniture */}
              {furnitureOnFloor.map((f, i) => (
                <FurnitureNode
                  key={f.id} shapeProps={f} snapToGrid={snapToGrid}
                  isSelected={f.id === selectedId && !isPanningMode}
                  onSelect={() => {
                    if (!isPanningMode) {
                      setSelectedId(f.id);
                      setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null });
                    }
                  }}
                  onChange={(newAttrs) => {
                    const updated = [...furnitureOnFloor];
                    updated[i] = newAttrs;
                    commitAction(updated);
                  }}
                  walls={roomSize.isPoly ? [] : [ // Provide walls for non-poly room for constraint logic
                    { x1: roomSize.x, y1: roomSize.y, x2: roomSize.x + roomSize.width + roomSize.wallThickness * 2, y2: roomSize.y },
                    { x1: roomSize.x + roomSize.width + roomSize.wallThickness * 2, y1: roomSize.y, x2: roomSize.x + roomSize.width + roomSize.wallThickness * 2, y2: roomSize.y + roomSize.height + roomSize.wallThickness * 2 },
                    { x1: roomSize.x + roomSize.width + roomSize.wallThickness * 2, y1: roomSize.y + roomSize.height + roomSize.wallThickness * 2, x2: roomSize.x, y2: roomSize.y + roomSize.height + roomSize.wallThickness * 2 },
                    { x1: roomSize.x, y1: roomSize.y + roomSize.height + roomSize.wallThickness * 2, x2: roomSize.x, y2: roomSize.y }
                  ]}
                  floorColor={roomSize.floorColor}
                  roomSize={roomSize}
                />
              ))}
            </Layer>

            {/* OVERLAY LAYER (Non-scaling) */}
            <Layer listening={false}>
              {/* Scale Bar (100cm / 1 Meter Reference) */}
              <Group x={20} y={window.innerHeight - 180}>
                <Rect width={100 * stageScale} height={3} fill="#1e293b" />
                <Line points={[0, -5, 0, 5]} stroke="#1e293b" strokeWidth={1.5} />
                <Line points={[100 * stageScale, -5, 100 * stageScale, 5]} stroke="#1e293b" strokeWidth={1.5} />
                <Text y={10} text="100 cm (1m)" fontSize={10} fontStyle="bold" fill="#64748b" />
              </Group>
            </Layer>
          </Stage>

          {/* === FIXED HTML FLOATING WALL MENU === */}
          {wallMenu.show && (
            <div style={{
              position: 'fixed',
              left: `${wallMenu.x + 15}px`,
              top: `${wallMenu.y - 30}px`,
              backgroundColor: '#1f2937',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              zIndex: 100,
              pointerEvents: 'auto',
              userSelect: 'none'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', opacity: 0.4, marginRight: '4px' }}>
                <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }}></div>
                <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }}></div>
                <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }}></div>
                <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }}></div>
              </div>

              {/* === PRECISE SPLIT TOOL === */}
              <div className="wall-menu-btn" style={menuBtnStyle} onClick={(e) => {
                e.stopPropagation();
                executeWallSplit();
              }}>
                <Scissors size={16} />
                <span>Split Wall</span>
              </div>

              {/* === HEAL / CONNECT TOOL === */}
              <div className="wall-menu-btn" style={menuBtnStyle} onClick={(e) => {
                e.stopPropagation();
                executeConnectWalls();
              }}>
                <Link2 size={16} />
                <span>Connect Walls</span>
              </div>
              <div className="wall-menu-btn" style={menuBtnStyle}>
                <AlignJustify size={16} />
                <span>Align</span>
              </div>

              <div style={{ width: '1px', height: '20px', background: '#374151' }}></div>

              {/* === DELETE WALL TOOL === */}
              <div className="wall-menu-btn" style={menuBtnStyle} onClick={(e) => {
                e.stopPropagation();
                executeDeleteWall();
              }}>
                <Trash2 size={16} />
                <span>Delete</span>
              </div>
              <div className="wall-menu-btn" style={menuBtnStyle} onClick={(e) => { e.stopPropagation(); setWallMenu({ show: false, x: 0, y: 0, stageX: 0, stageY: 0, wall: null }); }}>
                <EyeOff size={16} />
                <span>Hide Menu</span>
              </div>
            </div>
          )}

        </main>

        <aside className="sidebar-panel right-sidebar">
          <div className="panel-header"><h3>Properties</h3></div>
          <div className="properties-list">

            {!selectedId && (
              <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '5px', color: '#1e293b' }}><Settings2 size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Setup Room Configuration</h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>Customize your room labels and dimensions.</p>

                <div className="property-group">
                  <label>Room Label (e.g. Master Bedroom)</label>
                  <input type="text" placeholder="Enter room name..." value={roomSize.roomName} onChange={e => handleRoomConfigChange('roomName', e.target.value)} />
                </div>

                {!roomSize.isPoly && (
                  <>
                    <div className="property-group">
                      <label>Interior Width (m)</label>
                      <input type="number" step="0.01" value={Number((roomSize.width / 100).toFixed(2))} onChange={e => handleRoomConfigChange('width', Number(e.target.value) * 100)} />
                    </div>
                    <div className="property-group">
                      <label>Interior Depth (m)</label>
                      <input type="number" step="0.01" value={Number((roomSize.height / 100).toFixed(2))} onChange={e => handleRoomConfigChange('height', Number(e.target.value) * 100)} />
                    </div>
                  </>
                )}

                <div className="property-group">
                  <label>Wall Thickness (cm)</label>
                  <input type="number" value={roomSize.wallThickness} onChange={e => handleRoomConfigChange('wallThickness', Number(e.target.value))} />
                </div>
              </div>
            )}

            {!selectedId && roomSize.isPoly && (
              <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <h4 style={{ fontSize: '13px', marginBottom: '5px', color: '#475569' }}><Maximize size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Custom Shape Mode</h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>This is a complex layout. Use the wall handles on the grid to stretch and shape the walls manually.</p>
              </div>
            )}

            {!selectedId && (
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '15px', marginTop: roomSize.isPoly ? '0px' : '25px', color: '#1e293b' }}><Palette size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Visual Customization</h4>

                <div className="property-group">
                  <label>Floor Paint Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <input
                      type="color"
                      value={roomSize.floorColor}
                      onChange={e => handleRoomConfigChange('floorColor', e.target.value)}
                      style={{ width: '35px', height: '35px', border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }}>{roomSize.floorColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="property-group">
                  <label>Wall Paint Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <input
                      type="color"
                      value={roomSize.wallColor}
                      onChange={e => handleRoomConfigChange('wallColor', e.target.value)}
                      style={{ width: '35px', height: '35px', border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }}>{roomSize.wallColor.toUpperCase()}</span>
                  </div>
                </div>

              </div>
            )}

            {/* FURNITURE PROPERTIES */}
            {getSelectedItem() && (
              <>
                <div className="property-group">
                  <label>Name</label>
                  <input type="text" value={getSelectedItem().name} onChange={e => handlePropertyChange('name', e.target.value)} />
                </div>
                <div className={`property-group ${!getSelectedItem().isStructural ? 'readonly-field' : ''}`}>
                  <label>{getSelectedItem().isStructural ? "Opening Width (cm)" : "Width (cm)"}</label>
                  <div className="flex-stack">
                    <input
                      type="number"
                      value={Math.round(getSelectedItem().width)}
                      onChange={e => handlePropertyChange('width', Number(e.target.value))}
                      readOnly={!getSelectedItem().isStructural}
                    />
                    <span className="unit-tag">X-Axis</span>
                  </div>
                </div>
                <div className={`property-group ${!getSelectedItem().isStructural ? 'readonly-field' : ''}`}>
                  <label>{getSelectedItem().isStructural ? "Frame Thickness (cm)" : "Depth (cm)"}</label>
                  <div className="flex-stack">
                    <input
                      type="number"
                      value={Math.round(getSelectedItem().height)}
                      onChange={e => handlePropertyChange('height', Number(e.target.value))}
                      readOnly={!getSelectedItem().isStructural}
                    />
                    <span className="unit-tag">Y-Axis</span>
                  </div>
                </div>

                {!getSelectedItem().isStructural && (
                  <>
                    <div className="property-group">
                      <label>3D Model Height (cm)</label>
                      <div className="flex-stack highlight-field">
                        <input
                          type="number"
                          value={Math.round(getSelectedItem().modelHeight || 75)}
                          onChange={e => handlePropertyChange('modelHeight', Number(e.target.value))}
                        />
                        <span className="unit-tag">Z-Axis</span>
                      </div>
                      <p className="field-hint">Actual tallness of the object in 3D mode.</p>
                    </div>

                    <div className="property-group">
                      <label>Rotation (°)</label>
                      <input type="number" min="0" max="360" value={Math.round(getSelectedItem().rotation)} onChange={e => handlePropertyChange('rotation', Number(e.target.value))} />
                    </div>
                  </>
                )}

                {getSelectedItem().name.toLowerCase().includes('door') && (
                  <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '10px' }}>Door Swing Rules</h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <button style={{ flex: 1, padding: '6px', fontSize: '12px', background: !getSelectedItem().swingLeft ? THEME_BROWN : '#fff', color: !getSelectedItem().swingLeft ? '#fff' : '#333', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePropertyChange('swingLeft', false)}>Right</button>
                      <button style={{ flex: 1, padding: '6px', fontSize: '12px', background: getSelectedItem().swingLeft ? THEME_BROWN : '#fff', color: getSelectedItem().swingLeft ? '#fff' : '#333', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePropertyChange('swingLeft', true)}>Left</button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ flex: 1, padding: '6px', fontSize: '12px', background: !getSelectedItem().swingOut ? THEME_BROWN : '#fff', color: !getSelectedItem().swingOut ? '#fff' : '#333', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePropertyChange('swingOut', false)}>Inward</button>
                      <button style={{ flex: 1, padding: '6px', fontSize: '12px', background: getSelectedItem().swingOut ? THEME_BROWN : '#fff', color: getSelectedItem().swingOut ? '#fff' : '#333', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePropertyChange('swingOut', true)}>Outward</button>
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button className="btn-rotate" onClick={handleDuplicate}><Copy size={16} style={{ marginRight: '5px' }} /> Duplicate</button>
                  <button className="btn-delete" onClick={() => { commitAction(furnitureOnFloor.filter(f => f.id !== selectedId)); setSelectedId(null); }}>
                    <Trash2 size={16} style={{ marginRight: '5px' }} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* PRO CONFIRMATION MODAL */}
        {confirmModal.show && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <div style={{
              background: 'white', padding: '30px', borderRadius: '16px',
              width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              animation: 'modalSlide 0.3s ease-out'
            }}>
              <div style={{ background: '#fee2e2', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Hammer size={24} color="#ef4444" />
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: '20px', color: '#111827' }}>Update Room Layout?</h3>
              <p style={{ margin: '0 0 25px', color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                Applying <strong>{confirmModal.template?.name}</strong> will reset your current walls. Any custom architecture or alignment may be lost. Do you wish to proceed?
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setConfirmModal({ show: false, template: null })}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 'bold' }}
                >Cancel</button>
                <button
                  onClick={executeApplyTemplate}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: THEME_BROWN, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >Change Layout</button>
              </div>
            </div>
          </div>
        )}

        {/* UNSAVED CHANGES BLOCKER MODAL */}
        {blocker.state === 'blocked' && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
          }}>
            <div style={{
              background: 'white', padding: '24px', borderRadius: '16px',
              maxWidth: 400, boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', color: '#111827' }}>Unsaved changes</h3>
              <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
                You have unsaved changes. Are you sure you want to leave?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => blocker.reset()}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 600 }}
                >
                  Stay
                </button>
                <button
                  onClick={() => blocker.proceed()}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: THEME_BROWN, color: 'white', cursor: 'pointer', fontWeight: 600 }}
                >
                  Leave anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const menuBtnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  cursor: 'pointer',
  fontSize: '10px',
  color: '#d1d5db',
  transition: 'color 0.2s',
};

export default Designer;