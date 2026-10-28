import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Shield,
  Trash2,
  Download,
  Save,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Check,
  Plus,
  X,
  Sliders,
  Sparkles,
  Layers,
  Copy,
  RotateCcw,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Paintbrush,
  PenTool,
  Scissors,
  Sun,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Heart,
  Sparkle,
  Feather,
} from 'lucide-react';
import './PaintVisualizer.css';

// 5 Core Signature Swatches
const CORE_SWATCHES = [
  { id: 'coral', name: 'Coral Bloom', hex: '#FF6B53', desc: 'Vibrant warm coral' },
  { id: 'ochre', name: 'Sunshine Ochre', hex: '#F7B731', desc: 'Golden sunlit warmth' },
  { id: 'teal', name: 'Coastal Teal', hex: '#1E8C96', desc: 'Deep Mediterranean sea tone' },
  { id: 'sage', name: 'Leafy Sage', hex: '#48A279', desc: 'Calming botanical herb green' },
  { id: 'cerulean', name: 'Sky Cerulean', hex: '#4EA8DE', desc: 'Fresh airy coastal sky blue' },
];

// Expanded Studio Signature Swatches for Full Browser View
const EXPANDED_SIGNATURE_SWATCHES = [
  { id: 'coral', name: 'Coral Bloom', hex: '#FF6B53', desc: 'Vibrant warm coral' },
  { id: 'ochre', name: 'Sunshine Ochre', hex: '#F7B731', desc: 'Golden sunlit warmth' },
  { id: 'teal', name: 'Coastal Teal', hex: '#1E8C96', desc: 'Deep Mediterranean sea tone' },
  { id: 'sage', name: 'Leafy Sage', hex: '#48A279', desc: 'Calming botanical herb green' },
  { id: 'cerulean', name: 'Sky Cerulean', hex: '#4EA8DE', desc: 'Fresh airy coastal sky blue' },
  { id: 'terracotta-raw', name: 'Raw Terracotta', hex: '#C77965', desc: 'Sun-baked clay' },
  { id: 'slate-deep', name: 'Deep Slate', hex: '#5F7D95', desc: 'Nordic mineral blue' },
  { id: 'moss-deep', name: 'Deep Moss', hex: '#2D4739', desc: 'Lush evergreen shade' },
  { id: 'cinnamon-warm', name: 'Warm Cinnamon', hex: '#A85D48', desc: 'Spiced clay red' },
  { id: 'graphite-soft', name: 'Soft Graphite', hex: '#4A453E', desc: 'Modern grounding charcoal' },
];

// Curated Designer Palettes
const CURATED_PALETTES = [
  {
    name: 'Warm Earth & Terracotta',
    slug: 'warm-earth',
    colors: ['#C77965', '#D9A38F', '#E5D0B8', '#F4EDE1'],
    accent: '#C77965',
    swatches: [
      { name: 'Raw Terracotta', hex: '#C77965' },
      { name: 'Blush Clay', hex: '#D9A38F' },
      { name: 'Sand Dune', hex: '#E5D0B8' },
      { name: 'Warm Cream', hex: '#F4EDE1' },
    ],
  },
  {
    name: 'Nordic Neutrals',
    slug: 'nordic-neutrals',
    colors: ['#5F7D95', '#9EBBCB', '#B7B7B7', '#FFFFFF'],
    accent: '#5F7D95',
    swatches: [
      { name: 'Nordic Slate', hex: '#5F7D95' },
      { name: 'Glacier Mist', hex: '#9EBBCB' },
      { name: 'Pebble Grey', hex: '#B7B7B7' },
      { name: 'Pure Chalk', hex: '#FFFFFF' },
    ],
  },
  {
    name: 'Botanical Greens',
    slug: 'botanical-greens',
    colors: ['#839B76', '#B7C9A8', '#A3B899', '#2D5A43'],
    accent: '#48A279',
    swatches: [
      { name: 'Olive Grove', hex: '#839B76' },
      { name: 'Matcha Foam', hex: '#B7C9A8' },
      { name: 'Sage Leaf', hex: '#A3B899' },
      { name: 'Deep Forest', hex: '#2D5A43' },
    ],
  },
  {
    name: 'Modern Artisanal',
    slug: 'modern-artisanal',
    colors: ['#C6A15B', '#D6C5E8', '#E76F51', '#1D3557'],
    accent: '#E76F51',
    swatches: [
      { name: 'Artisan Gold', hex: '#C6A15B' },
      { name: 'Lavender Haze', hex: '#D6C5E8' },
      { name: 'Spiced Ember', hex: '#E76F51' },
      { name: 'Midnight Navy', hex: '#1D3557' },
    ],
  },
];

// Preset Scandinavian Living Room
const DEFAULT_PRESET = {
  id: 'scandinavian-living',
  name: 'Scandinavian Living Room',
  url: '/assets/images/hero-living-room.jpg',
  initialWalls: [
    {
      id: 'preset-wall-1',
      name: 'Wall 1',
      points: [
        { x: 48, y: 32 },
        { x: 976, y: 32 },
        { x: 976, y: 485 },
        { x: 48, y: 485 },
      ],
      cutouts: [],
      color: '#FF6B53',
      finish: 'realistic',
      pattern: 'solid',
      opacity: 70,
      visible: true,
    },
  ],
};

// Helper: Standard ray-casting point-in-polygon test
function pointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

// Helper: Check if a point is inside a wall but outside any of its cutouts
function isPointInsideWall(point, wall) {
  if (!pointInPolygon(point, wall.points)) return false;
  if (wall.cutouts && wall.cutouts.length > 0) {
    for (const cutout of wall.cutouts) {
      if (pointInPolygon(point, cutout)) {
        return false;
      }
    }
  }
  return true;
}

// Distance from point P to line segment AB
function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

// Check if click point is on or near any boundary edge or corner vertex of wall
function isPointNearWallBoundary(point, wall, tolerance = 24) {
  if (!wall.points || wall.points.length < 2) return false;
  // Check corner vertex distance
  for (const pt of wall.points) {
    if (Math.hypot(point.x - pt.x, point.y - pt.y) <= tolerance) {
      return true;
    }
  }
  // Check boundary line distance
  for (let i = 0; i < wall.points.length; i++) {
    const nextIdx = (i + 1) % wall.points.length;
    if (distToSegment(point, wall.points[i], wall.points[nextIdx]) <= tolerance) {
      return true;
    }
  }
  return false;
}

// Helper: Find color name from hex
function getColorName(hex, palettes = CURATED_PALETTES) {
  const normalized = (hex || '').toUpperCase();
  const match = CORE_SWATCHES.find((s) => s.hex.toUpperCase() === normalized);
  if (match) return match.name;
  for (const pal of palettes) {
    if (pal.swatches && pal.swatches.length > 0) {
      const swatchMatch = pal.swatches.find((s) => s.hex?.toUpperCase() === normalized);
      if (swatchMatch) return swatchMatch.name;
    }
    const colorList = pal.colors || (pal.swatches ? pal.swatches.map((s) => s.hex) : []);
    if (colorList.some((c) => c.toUpperCase() === normalized)) {
      return pal.name.split(' ')[0] + ' Tint';
    }
  }
  return 'Custom Shade';
}

// Artist Palette Silhouette SVG Component
function ArtistPaletteGraphic({ color = '#FF6B53', size = 56, daubs = [] }) {
  return (
    <svg
      width={size}
      height={(size * 48) / 60}
      viewBox="0 0 60 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Painter's Kidney Palette Contour */}
      <path
        d="M28 2C14 2 3 12 3 24C3 33 9 39 16 41C21 42.5 24 38 27 36C30 34 34 35 36 38C39 42 43 45 49 43C56 40 59 31 58 22C57 10 44 2 28 2Z"
        fill={color}
      />
      {/* Thumb Hole */}
      <ellipse cx="44" cy="30" rx="4.5" ry="5.5" fill="#FAF7F2" />
      {/* Optional multi-colored Daubs */}
      {daubs && daubs.length > 0 ? (
        daubs.map((dColor, idx) => {
          const positions = [
            { cx: 14, cy: 15, r: 3.5 },
            { cx: 24, cy: 10, r: 3.5 },
            { cx: 34, cy: 11, r: 3.5 },
            { cx: 44, cy: 16, r: 3.5 },
          ];
          const pos = positions[idx] || positions[0];
          return (
            <circle
              key={idx}
              cx={pos.cx}
              cy={pos.cy}
              r={pos.r}
              fill={dColor}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1"
            />
          );
        })
      ) : (
        /* Subtle natural light sheen */
        <path
          d="M12 20C12 14 18 8 26 6"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function PaintVisualizer() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const imageUrlRef = useRef('');
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  // 4 Studio Experience Modes: 'edit' | 'finish' | 'compare'
  const [viewMode, setViewMode] = useState('edit');

  // Room Image State (Defaults to Scandinavian Living Room preset)
  const [imageUrl, setImageUrl] = useState(DEFAULT_PRESET.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState(DEFAULT_PRESET.name);

  // Paint Color & Finish State
  const [selectedColor, setSelectedColor] = useState('#FF6B53');
  const [customHexInput, setCustomHexInput] = useState('#FF6B53');
  const [selectedPattern, setSelectedPattern] = useState('solid');
  const [paintFinish, setPaintFinish] = useState('realistic');
  const [opacity, setOpacity] = useState(70);

  // Wall Geometry & Cutout State
  const [walls, setWalls] = useState(() => JSON.parse(JSON.stringify(DEFAULT_PRESET.initialWalls)));
  const [currentPoints, setCurrentPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCutoutPoints, setCurrentCutoutPoints] = useState([]);
  const [isDrawingCutout, setIsDrawingCutout] = useState(false);
  const [selectedWallId, setSelectedWallId] = useState(DEFAULT_PRESET.initialWalls[0].id);
  const [isEditingVertices, setIsEditingVertices] = useState(false);
  const [isDraggingVertex, setIsDraggingVertex] = useState(false);

  // Undo / Redo History Stack
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Zoom / Viewport scale
  const [zoomLevel, setZoomLevel] = useState(100);

  // Active Saved Makeover Tracking
  const [activeDesignId, setActiveDesignId] = useState(null);

  // Palette Navigation & Expanded Explorer States (Fix for Bug 3)
  const [activePaletteSlug, setActivePaletteSlug] = useState('warm-earth');
  const [showPaletteCatalogModal, setShowPaletteCatalogModal] = useState(false);
  const [isSignatureExpanded, setIsSignatureExpanded] = useState(false);
  const [canvasCursor, setCanvasCursor] = useState('default');

  // Modals & In-Flight Operation States
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMakeoverName, setSaveMakeoverName] = useState('');
  const [saveMode, setSaveMode] = useState('update'); // 'update' | 'new'
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [designToDelete, setDesignToDelete] = useState(null);
  const [isDeletingDesign, setIsDeletingDesign] = useState(false);

  // Status & Clipboard Feedback
  const [statusMessage, setStatusMessage] = useState({
    text: 'Welcome to Paint Studio. Design your space, your way.',
    type: 'info',
  });
  const [copiedHex, setCopiedHex] = useState(false);

  // Palette Collections (seeded with curated designer palettes, updated dynamically from backend)
  const [paletteCollections, setPaletteCollections] = useState(CURATED_PALETTES);

  // Saved Designs Storage
  const [savedDesigns, setSavedDesigns] = useState(() => {
    try {
      const stored = localStorage.getItem('wallPaintDesigns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore initial localStorage read error
    }
    return [];
  });

  const setFeedback = (text, type = 'info') => {
    setStatusMessage({ text, type });
  };

  // Push to Undo Stack before state mutations
  const recordHistory = useCallback(() => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(walls))].slice(-15));
    setRedoStack([]);
  }, [walls]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(walls))]);
    setUndoStack((prev) => prev.slice(0, -1));
    setWalls(previous);
    if (previous.length > 0) {
      setSelectedWallId(previous[0].id);
      setSelectedColor(previous[0].color);
    }
    setFeedback('Action undone.', 'info');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(walls))]);
    setRedoStack((prev) => prev.slice(0, -1));
    setWalls(next);
    if (next.length > 0) {
      setSelectedWallId(next[0].id);
      setSelectedColor(next[0].color);
    }
    setFeedback('Action redone.', 'info');
  };

  // Re-fetch backend saved designs and update state & cache
  const fetchBackendDesigns = useCallback(async () => {
    try {
      const res = await API.get('/paint/designs');
      if (res.data?.designs && Array.isArray(res.data.designs)) {
        const backendList = res.data.designs.map((d) => ({
          id: d._id || d.id,
          name: d.name,
          savedAt: d.updatedAt || d.createdAt || d.savedAt,
          thumbnail: d.thumbnail,
          roomImage: d.roomImage,
          walls: d.walls,
          isCloud: true,
        }));
        setSavedDesigns(backendList);
        try {
          localStorage.setItem('wallPaintDesigns', JSON.stringify(backendList.slice(0, 10)));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Backend designs fetch fallback to localStorage:', err.message);
    }
  }, []);

  // Fetch backend dynamic palettes, claim guest designs if authenticated, and fetch saved makeovers on mount
  useEffect(() => {
    const initData = async () => {
      // 1. Fetch dynamic palettes from backend
      try {
        const palRes = await API.get('/paint/palettes');
        if (palRes.data?.palettes && Array.isArray(palRes.data.palettes) && palRes.data.palettes.length > 0) {
          const formatted = palRes.data.palettes.map((p) => {
            const swatches =
              Array.isArray(p.swatches) && p.swatches.length > 0
                ? p.swatches
                : (p.colors || []).map((c, i) => ({ name: `${p.name} Tone ${i + 1}`, hex: c }));
            const colors = swatches.length > 0 ? swatches.map((s) => s.hex) : (p.colors || []);
            const accent = p.accent || colors[0] || '#FF6B53';
            return {
              id: p._id || p.id || p.slug,
              name: p.name,
              slug: p.slug,
              colors,
              accent,
              swatches,
              description: p.description,
            };
          });
          setPaletteCollections(formatted);
        }
      } catch {
        // Fallback to static CURATED_PALETTES
      }

      // 2. Claim guest designs if user is authenticated
      const token = localStorage.getItem('token');
      const guestSession = localStorage.getItem('paint_guest_session_id');
      if (token && guestSession) {
        try {
          await API.post('/paint/designs/claim', { guestSessionId: guestSession });
        } catch {
          // Non-blocking
        }
      }

      // 3. Fetch designs for current session / user
      await fetchBackendDesigns();
    };

    initData();
  }, [fetchBackendDesigns]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  // Global pointer-up listener so vertex dragging never freezes if pointer leaves canvas
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        setIsDraggingVertex(false);
        setCanvasCursor('default');
      }
    };
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, []);

  // Load Image into HTMLImageElement
  useEffect(() => {
    if (!imageUrl) {
      imageRef.current = null;
      return;
    }

    const image = new Image();
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      image.crossOrigin = 'anonymous';
    }

    image.onload = () => {
      imageRef.current = image;
      setImageLoaded(true);

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }
      setFeedback(`Room photo ready (${image.naturalWidth} × ${image.naturalHeight}px).`, 'success');
    };

    image.onerror = () => {
      setImageLoaded(false);
      setFeedback('Could not load this photo. Please try a different image.', 'error');
    };

    image.src = imageUrl;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [imageUrl]);

  // Load Scandinavian Living Room Preset
  const loadPresetRoom = useCallback((preset = DEFAULT_PRESET) => {
    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = '';
    }

    setActiveDesignId(null);
    setImageUrl(preset.url);
    setImageName(preset.name);
    setImageLoaded(false);

    const cloned = JSON.parse(JSON.stringify(preset.initialWalls || []));
    setWalls(cloned);
    setUndoStack([]);
    setRedoStack([]);

    if (cloned.length > 0) {
      setSelectedWallId(cloned[0].id);
      setSelectedColor(cloned[0].color);
      setCustomHexInput(cloned[0].color);
      setPaintFinish(cloned[0].finish || 'realistic');
      setOpacity(cloned[0].opacity || 70);
    } else {
      setSelectedWallId(null);
    }

    setCurrentPoints([]);
    setCurrentCutoutPoints([]);
    setIsDrawing(false);
    setIsDrawingCutout(false);
    setIsEditingVertices(false);
    setViewMode('edit');
    setFeedback(`Loaded ${preset.name} preset!`, 'success');
  }, []);

  // Upload Photo Handler
  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback('Please upload a valid image file (JPEG, PNG, WebP).', 'error');
      event.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setFeedback('Please choose an image under 20 MB.', 'error');
      event.target.value = '';
      return;
    }

    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    imageUrlRef.current = objectUrl;
    setImageLoaded(false);
    setImageUrl(objectUrl);
    setImageName(file.name.replace(/\.[^/.]+$/, ''));
    setActiveDesignId(null);
    setWalls([]);
    setCurrentPoints([]);
    setCurrentCutoutPoints([]);
    setIsDrawing(false);
    setIsDrawingCutout(false);
    setIsEditingVertices(false);
    setSelectedWallId(null);
    setViewMode('edit');
    setUndoStack([]);
    setRedoStack([]);
    setFeedback(`Uploaded "${file.name}". Ready to outline walls.`, 'success');
    event.target.value = '';
  };

  // ─────────────────────────────────────────────────────────────────────────
  // NEW DESIGN WORKFLOW (With Safe Confirmation)
  // ─────────────────────────────────────────────────────────────────────────
  const handleInitiateNewDesign = () => {
    // If there is working project content, confirm before clearing
    if (walls.length > 0 || isDrawing || isDrawingCutout) {
      setShowNewDesignModal(true);
    } else {
      executeResetNewDesign();
    }
  };

  const executeResetNewDesign = () => {
    setActiveDesignId(null);
    setImageName(DEFAULT_PRESET.name);
    setWalls([]);
    setCurrentPoints([]);
    setCurrentCutoutPoints([]);
    setIsDrawing(false);
    setIsDrawingCutout(false);
    setIsEditingVertices(false);
    setSelectedWallId(null);
    setSelectedColor('#FF6B53');
    setCustomHexInput('#FF6B53');
    setPaintFinish('realistic');
    setOpacity(70);
    setSelectedPattern('solid');
    setViewMode('edit');
    setUndoStack([]);
    setRedoStack([]);
    setShowNewDesignModal(false);
    setFeedback('Fresh new design started! Click "Draw Wall" to outline a wall.', 'success');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCENE RENDERER: Multi-Pass True-to-Life Canvas Compositing
  // ─────────────────────────────────────────────────────────────────────────
  const drawScene = useCallback(
    (ctx, width, height, image, options = {}) => {
      const { showGuides = true } = options;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      // 1. Render all painted walls with cutouts punched out
      walls.forEach((wall) => {
        if (wall.visible === false) return;
        if (!wall.points || wall.points.length < 3) return;

        ctx.save();
        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Outer wall boundary
        ctx.moveTo(wall.points[0].x, wall.points[0].y);
        for (let i = 1; i < wall.points.length; i++) {
          ctx.lineTo(wall.points[i].x, wall.points[i].y);
        }
        ctx.closePath();

        // Punch out foreground object cutouts
        if (wall.cutouts && wall.cutouts.length > 0) {
          wall.cutouts.forEach((cutout) => {
            if (cutout && cutout.length >= 3) {
              ctx.moveTo(cutout[0].x, cutout[0].y);
              for (let i = 1; i < cutout.length; i++) {
                ctx.lineTo(cutout[i].x, cutout[i].y);
              }
              ctx.closePath();
            }
          });
        }

        const finish = wall.finish || 'realistic';
        const alpha = (wall.opacity ?? 70) / 100;

        // Smooth anti-aliased fill preserving photo textures and clean object boundaries
        if (finish === 'classic') {
          // Flat solid paint overlay
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = alpha;
          ctx.fillStyle = wall.color;
          ctx.fill('evenodd');
        } else if (finish === 'matte') {
          // Matte: Deep velvety shade with low specular reflection
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = Math.min(1, alpha * 1.12);
          ctx.fillStyle = wall.color;
          ctx.fill('evenodd');

          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = wall.color;
          ctx.fill('evenodd');
        } else if (finish === 'satin') {
          // Satin: Gentle interior sheen preserving daylight highlights
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = Math.min(1, alpha * 0.98);
          ctx.fillStyle = wall.color;
          ctx.fill('evenodd');

          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = alpha * 0.22;
          ctx.fillStyle = wall.color;
          ctx.fill('evenodd');
        } else {
          // Realistic (Default): Dual-pass multiply + soft-light
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = Math.min(1, alpha * 1.05);
          ctx.fillStyle = wall.color;
          ctx.fill('evenodd');

          ctx.globalCompositeOperation = 'soft-light';
          ctx.globalAlpha = alpha * 0.65;
          ctx.fillStyle = wall.color;
          ctx.fill('evenodd');
        }

        // Optional surface patterns (clip path only if non-solid pattern is chosen)
        if (wall.pattern && wall.pattern !== 'solid') {
          ctx.clip('evenodd');
          if (wall.pattern === 'stripes') {
            ctx.globalCompositeOperation = finish === 'classic' ? 'source-over' : 'overlay';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = Math.max(2, width / 180);
            ctx.globalAlpha = Math.min(0.65, alpha * 0.7);

            for (let x = -height; x < width; x += Math.max(14, width / 22)) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x + height, height);
              ctx.stroke();
            }
          } else if (wall.pattern === 'dots') {
            ctx.globalCompositeOperation = finish === 'classic' ? 'source-over' : 'overlay';
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = Math.min(0.7, alpha * 0.75);

            const spacing = Math.max(12, width / 28);
            for (let y = spacing; y < height; y += spacing) {
              for (let x = spacing; x < width; x += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, Math.max(1.5, width / 300), 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }

        ctx.restore();

        // 2. Stroke outlines & vertex handles (Shown only when explicitly editing vertices or dragging)
        const shouldShowWallGuides =
          showGuides && (isEditingVertices || isDraggingVertex) && wall.id === selectedWallId;

        if (shouldShowWallGuides) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(wall.points[0].x, wall.points[0].y);
          for (let i = 1; i < wall.points.length; i++) {
            ctx.lineTo(wall.points[i].x, wall.points[i].y);
          }
          ctx.closePath();

          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = Math.max(2.5, width / 380);
          ctx.stroke();

          // Cutouts stroke
          if (wall.cutouts && wall.cutouts.length > 0) {
            wall.cutouts.forEach((cutout) => {
              if (cutout.length >= 3) {
                ctx.beginPath();
                ctx.moveTo(cutout[0].x, cutout[0].y);
                for (let i = 1; i < cutout.length; i++) {
                  ctx.lineTo(cutout[i].x, cutout[i].y);
                }
                ctx.closePath();
                ctx.strokeStyle = '#F59E0B';
                ctx.lineWidth = Math.max(2, width / 440);
                ctx.setLineDash([6, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
              }
            });
          }

          // Draggable handles for selected wall vertices
          const handleRadius = Math.max(5.5, width / 160);
          wall.points.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, handleRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = '#2563EB';
            ctx.lineWidth = Math.max(2.5, width / 380);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(2, handleRadius * 0.4), 0, Math.PI * 2);
            ctx.fillStyle = '#2563EB';
            ctx.fill();
          });

          ctx.restore();
        } else if (showGuides && isDrawingCutout && wall.id === selectedWallId && wall.cutouts?.length > 0) {
          // Contextual display of existing cutouts while drawing a new cutout
          ctx.save();
          wall.cutouts.forEach((cutout) => {
            if (cutout.length >= 3) {
              ctx.beginPath();
              ctx.moveTo(cutout[0].x, cutout[0].y);
              for (let i = 1; i < cutout.length; i++) {
                ctx.lineTo(cutout[i].x, cutout[i].y);
              }
              ctx.closePath();
              ctx.strokeStyle = '#F59E0B';
              ctx.lineWidth = Math.max(2, width / 440);
              ctx.setLineDash([6, 4]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });
          ctx.restore();
        }
      });

      // 3. Active Wall Drawing Path
      if (showGuides && currentPoints.length > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }

        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = Math.max(2.5, width / 360);
        ctx.setLineDash([8, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        const handleRadius = Math.max(5, width / 150);
        currentPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, handleRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = Math.max(2, width / 380);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 4. Active Cutout Drawing Path
      if (showGuides && currentCutoutPoints.length > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(currentCutoutPoints[0].x, currentCutoutPoints[0].y);
        for (let i = 1; i < currentCutoutPoints.length; i++) {
          ctx.lineTo(currentCutoutPoints[i].x, currentCutoutPoints[i].y);
        }

        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = Math.max(2.5, width / 360);
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const handleRadius = Math.max(5, width / 150);
        currentCutoutPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, handleRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#FEF3C7';
          ctx.fill();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = Math.max(2, width / 380);
          ctx.stroke();
        });
        ctx.restore();
      }
    },
    [walls, selectedWallId, currentPoints, currentCutoutPoints, isEditingVertices, isDraggingVertex, isDrawingCutout]
  );

  // Redraw Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;

    if (!canvas || !ctx || !image || !imageLoaded) return;

    if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
    }

    // Guides only shown in Edit mode
    drawScene(ctx, canvas.width, canvas.height, image, {
      showGuides: viewMode === 'edit',
    });
  }, [drawScene, imageLoaded, viewMode]);

  // Screen to Canvas Coordinates Mapper
  const getCanvasCoords = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = event.clientX ?? touch?.clientX;
    const clientY = event.clientY ?? touch?.clientY;

    if (clientX === undefined || clientY === undefined) return null;

    const x = Math.max(
      0,
      Math.min(canvas.width, ((clientX - rect.left) / rect.width) * canvas.width)
    );
    const y = Math.max(
      0,
      Math.min(canvas.height, ((clientY - rect.top) / rect.height) * canvas.height)
    );

    return { x, y, rect, clientX, clientY };
  }, []);

  // Pointer Down (Vertex Grab or Normal Click)
  const handlePointerDown = (event) => {
    if (event.cancelable) event.preventDefault();
    if (viewMode !== 'edit' || isDrawing || isDrawingCutout) return;

    const coords = getCanvasCoords(event);
    if (!coords || !canvasRef.current) return;

    // Check if user is clicking directly on any vertex of the selected wall
    const selectedWall = walls.find((w) => w.id === selectedWallId);
    if (selectedWall && selectedWall.visible !== false && selectedWall.points?.length > 0) {
      const scaleX = coords.rect.width / canvasRef.current.width;
      const scaleY = coords.rect.height / canvasRef.current.height;
      const isTouch = Boolean(event.touches || event.changedTouches);
      const screenTolerance = isTouch ? 32 : 22;

      for (let i = 0; i < selectedWall.points.length; i++) {
        const pt = selectedWall.points[i];
        const screenDist = Math.hypot((pt.x - coords.x) * scaleX, (pt.y - coords.y) * scaleY);

        if (screenDist <= screenTolerance) {
          recordHistory();
          dragRef.current = {
            wallId: selectedWall.id,
            pointIndex: i,
            startX: coords.x,
            startY: coords.y,
            hasMoved: false,
          };
          setIsDraggingVertex(true);
          setIsEditingVertices(true);
          setCanvasCursor('grabbing');
          return;
        }
      }
    }
  };

  // Pointer Move (Live Vertex Dragging & Dynamic Cursor Hover Feedback)
  const handlePointerMove = (event) => {
    const coords = getCanvasCoords(event);
    if (!coords || !canvasRef.current) return;

    // Handle Active Vertex Dragging
    const drag = dragRef.current;
    if (drag) {
      if (event.cancelable) event.preventDefault();
      const dx = Math.abs(coords.x - drag.startX);
      const dy = Math.abs(coords.y - drag.startY);
      if (dx > 2 || dy > 2) {
        drag.hasMoved = true;
      }

      const { wallId, pointIndex } = drag;

      setWalls((prev) =>
        prev.map((w) => {
          if (w.id !== wallId) return w;
          const newPoints = [...w.points];
          newPoints[pointIndex] = { x: coords.x, y: coords.y };
          return { ...w, points: newPoints };
        })
      );
      setCanvasCursor('grabbing');
      return;
    }

    // Dynamic Cursor Feedback for visual clarity
    if (viewMode !== 'edit') {
      setCanvasCursor('default');
      return;
    }

    if (isDrawing || isDrawingCutout) {
      setCanvasCursor('crosshair');
      return;
    }

    const point = { x: coords.x, y: coords.y };
    const selectedWall = walls.find((w) => w.id === selectedWallId);

    // If hovering over selected wall vertex handle: 'grab'
    if (selectedWall && selectedWall.visible !== false && selectedWall.points?.length > 0) {
      const scaleX = coords.rect.width / canvasRef.current.width;
      const scaleY = coords.rect.height / canvasRef.current.height;
      const isOverVertex = selectedWall.points.some(
        (pt) => Math.hypot((pt.x - coords.x) * scaleX, (pt.y - coords.y) * scaleY) <= 20
      );
      if (isOverVertex) {
        setCanvasCursor('grab');
        return;
      }
    }

    // If hovering over any wall interior or boundary: 'pointer'
    const isOverAnyWall = walls.some(
      (w) => w.visible !== false && (isPointInsideWall(point, w) || isPointNearWallBoundary(point, w, 24))
    );
    if (isOverAnyWall) {
      setCanvasCursor('pointer');
      return;
    }

    setCanvasCursor('default');
  };

  // Pointer Up (Finalize Drag or Handle Click)
  const handlePointerUp = (event) => {
    if (dragRef.current) {
      const hasMoved = dragRef.current.hasMoved;
      dragRef.current = null;
      setIsDraggingVertex(false);
      setCanvasCursor('default');

      if (hasMoved) {
        setFeedback('Corner vertex adjusted. Paint realigned.', 'info');
        return;
      }
    }

    handleCanvasClick(event);
  };

  // Canvas Click (Add point or Select wall)
  const handleCanvasClick = (event) => {
    if (viewMode !== 'edit') return;

    const coords = getCanvasCoords(event);
    if (!coords || !imageRef.current) return;
    const point = { x: coords.x, y: coords.y };

    if (isDrawing) {
      setCurrentPoints((prev) => [...prev, point]);
      setFeedback(`Point #${currentPoints.length + 1} added. Click corners, then "Finish Wall".`, 'info');
      return;
    }

    if (isDrawingCutout) {
      setCurrentCutoutPoints((prev) => [...prev, point]);
      setFeedback(`Cutout point #${currentCutoutPoints.length + 1} added. Outline object, then "Finish Cutout".`, 'info');
      return;
    }

    // Select wall by clicking inside it or on its boundary/corners
    const isTouch = Boolean(event.touches || event.changedTouches);
    const boundaryTolerance = isTouch ? 32 : 26;
    const clickedWall = [...walls]
      .reverse()
      .find((wall) => wall.visible !== false && (isPointInsideWall(point, wall) || isPointNearWallBoundary(point, wall, boundaryTolerance)));

    if (clickedWall) {
      setSelectedWallId(clickedWall.id);
      setSelectedColor(clickedWall.color);
      setCustomHexInput(clickedWall.color);
      setSelectedPattern(clickedWall.pattern);
      setPaintFinish(clickedWall.finish || 'realistic');
      setOpacity(clickedWall.opacity ?? 70);
      setFeedback(`Selected "${clickedWall.name}". Choose any color or click "Edit Vertex" to adjust corners.`, 'success');
    } else {
      setSelectedWallId(null);
      setIsEditingVertices(false);
      setFeedback('Click inside an outlined wall or edge to select it, or click "Draw Wall".', 'info');
    }
  };

  // Wall Creation Handlers
  const startDrawingWall = () => {
    setViewMode('edit');
    setIsDrawing(true);
    setIsDrawingCutout(false);
    setIsEditingVertices(false);
    setSelectedWallId(null);
    setCurrentPoints([]);
    setFeedback('Click around the corners of your wall on the room photo.', 'info');
  };

  const finishWall = () => {
    if (currentPoints.length < 3) {
      setFeedback('Mark at least 3 corner points to form a wall polygon.', 'error');
      return;
    }

    recordHistory();
    const wallNumber = walls.length + 1;
    const newWall = {
      id: `wall-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `Wall ${wallNumber}`,
      points: currentPoints,
      cutouts: [],
      color: selectedColor,
      pattern: selectedPattern,
      finish: paintFinish,
      opacity,
      visible: true,
    };

    setWalls((prev) => [...prev, newWall]);
    setSelectedWallId(newWall.id);
    setCurrentPoints([]);
    setIsDrawing(false);
    setIsEditingVertices(false);
    setFeedback(`Wall ${wallNumber} created! Pick any designer swatch to paint.`, 'success');
  };

  const undoPoint = () => {
    setCurrentPoints((prev) => prev.slice(0, -1));
  };

  const cancelDrawing = () => {
    setCurrentPoints([]);
    setIsDrawing(false);
    setFeedback('Wall drawing cancelled.', 'info');
  };

  // Cutout Tool Handlers
  const startDrawingCutout = () => {
    if (!selectedWallId) {
      setFeedback('Select a wall first before adding an object cutout.', 'error');
      return;
    }
    setViewMode('edit');
    setIsDrawingCutout(true);
    setIsDrawing(false);
    setIsEditingVertices(false);
    setCurrentCutoutPoints([]);
    setFeedback('Click around the edges of the picture frame, TV, window, or lamp to protect it.', 'info');
  };

  const finishCutout = () => {
    if (currentCutoutPoints.length < 3) {
      setFeedback('Mark at least 3 points around the object to protect it.', 'error');
      return;
    }
    if (!selectedWallId) return;

    recordHistory();
    setWalls((prev) =>
      prev.map((w) =>
        w.id === selectedWallId
          ? { ...w, cutouts: [...(w.cutouts || []), currentCutoutPoints] }
          : w
      )
    );

    setCurrentCutoutPoints([]);
    setIsDrawingCutout(false);
    setFeedback('Protected cutout saved! Area is now preserved from paint.', 'success');
  };

  const cancelCutout = () => {
    setCurrentCutoutPoints([]);
    setIsDrawingCutout(false);
    setFeedback('Cutout cancelled.', 'info');
  };

  // Color & Finish Application
  const applyColorToWall = (newColor) => {
    setSelectedColor(newColor);
    setCustomHexInput(newColor);

    if (selectedWallId) {
      recordHistory();
      setWalls((prev) =>
        prev.map((w) => (w.id === selectedWallId ? { ...w, color: newColor } : w))
      );
      setFeedback(`Wall updated with ${getColorName(newColor, paletteCollections)} (${newColor.toUpperCase()}).`, 'success');
    }
  };

  const handleCustomHexChange = (val) => {
    setCustomHexInput(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      applyColorToWall(val);
    }
  };

  const updateFinish = (finish) => {
    setPaintFinish(finish);
    if (selectedWallId) {
      recordHistory();
      setWalls((prev) =>
        prev.map((w) => (w.id === selectedWallId ? { ...w, finish } : w))
      );
      setFeedback(`Paint finish set to ${finish.charAt(0).toUpperCase() + finish.slice(1)}.`, 'info');
    }
  };

  const updateOpacity = (val) => {
    setOpacity(val);
    if (selectedWallId) {
      setWalls((prev) =>
        prev.map((w) => (w.id === selectedWallId ? { ...w, opacity: val } : w))
      );
    }
  };

  const updatePattern = (pattern) => {
    setSelectedPattern(pattern);
    if (selectedWallId) {
      recordHistory();
      setWalls((prev) =>
        prev.map((w) => (w.id === selectedWallId ? { ...w, pattern } : w))
      );
    }
  };

  const toggleWallVisibility = (id) => {
    setWalls((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: w.visible === false ? true : false } : w))
    );
  };

  const deleteWall = (id) => {
    recordHistory();
    setWalls((prev) => prev.filter((w) => w.id !== id));
    if (selectedWallId === id) setSelectedWallId(null);
    setFeedback('Wall removed.', 'info');
  };

  const copyHexToClipboard = () => {
    navigator.clipboard.writeText(selectedColor);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  // High-Resolution PNG Export (Guaranteed 100% clean)
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) {
      setFeedback('Please load a room photo first.', 'error');
      return;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');

    drawScene(exportCtx, canvas.width, canvas.height, image, { showGuides: false });

    const cleanName = imageName ? imageName.replace(/\.[^/.]+$/, '') : 'room-makeover';
    const link = document.createElement('a');
    link.download = `${cleanName}-paint-studio.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    setFeedback('High-resolution clean room makeover downloaded!', 'success');
  };

  // Generate a durable image data URI or URL for reliable cross-session persistence
  const getDurableRoomImage = () => {
    if (!imageUrl) return '';
    // If it's already a preset URL or a data URI, keep it directly
    if (!imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    // If it's a transient blob URL, encode the loaded image to an optimized JPEG data URI
    if (imageRef.current) {
      try {
        const tempCanvas = document.createElement('canvas');
        const maxDim = 1600;
        let w = imageRef.current.naturalWidth || imageRef.current.width || 1200;
        let h = imageRef.current.naturalHeight || imageRef.current.height || 800;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(imageRef.current, 0, 0, w, h);
        return tempCanvas.toDataURL('image/jpeg', 0.82);
      } catch (err) {
        console.warn('Could not generate durable room image data URI:', err);
      }
    }
    return '';
  };

  // Generate a lightweight thumbnail of the current composite scene
  const generateThumbnail = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return '';
    const maxDim = 360;
    const scale = Math.min(1, maxDim / Math.max(canvas.width, canvas.height));
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = Math.max(1, Math.round(canvas.width * scale));
    thumbCanvas.height = Math.max(1, Math.round(canvas.height * scale));
    const thumbCtx = thumbCanvas.getContext('2d');
    drawScene(thumbCtx, thumbCanvas.width, thumbCanvas.height, image, { showGuides: false });
    return thumbCanvas.toDataURL('image/jpeg', 0.8);
  };

  // Open Save / Update Modal with current design metadata
  const openSaveModal = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) {
      setFeedback('Please load a room photo first before saving.', 'error');
      return;
    }
    setSaveMakeoverName(imageName || 'My Room Makeover');
    setSaveMode(activeDesignId ? 'update' : 'new');
    setShowSaveModal(true);
  };

  // Execute Save / Update Makeover (MongoDB Atlas + LocalStorage Fallback)
  const executeSaveMakeover = async () => {
    if (!canvasRef.current || !imageRef.current) {
      setFeedback('Please load a room photo first before saving.', 'error');
      return;
    }

    const nameToSave = saveMakeoverName.trim() || imageName || 'My Room Makeover';
    setIsSavingDesign(true);

    try {
      const thumbnailData = generateThumbnail();
      const durableRoomImage = getDurableRoomImage();

      const payload = {
        name: nameToSave,
        roomImage: durableRoomImage || thumbnailData,
        thumbnail: thumbnailData,
        walls,
        primaryColor: selectedColor,
        primaryColorName: getColorName(selectedColor, paletteCollections),
        finish: paintFinish,
        notes: `Paint Studio makeover with ${walls.length} wall(s).`,
      };

      const isUpdating = Boolean(activeDesignId && saveMode === 'update');
      let savedDesign = null;

      if (isUpdating) {
        payload.id = activeDesignId;
        const res = await API.put(`/paint/designs/${activeDesignId}`, payload);
        savedDesign = res.data?.design;
      } else {
        const res = await API.post('/paint/designs', payload);
        savedDesign = res.data?.design;
      }

      if (!savedDesign) {
        throw new Error('Server did not return a valid saved design record.');
      }

      const newId = savedDesign._id || savedDesign.id;
      setActiveDesignId(newId);
      setImageName(savedDesign.name || nameToSave);

      // If roomImage was converted from blob to a durable data URI, update state
      if (savedDesign.roomImage && savedDesign.roomImage.startsWith('data:') && imageUrl.startsWith('blob:')) {
        setImageUrl(savedDesign.roomImage);
      }

      setShowSaveModal(false);
      setFeedback(
        `Makeover "${savedDesign.name}" ${isUpdating ? 'updated' : 'saved'} successfully to database!`,
        'success'
      );

      // Re-fetch backend list to ensure UI stays perfectly synchronized
      await fetchBackendDesigns();
    } catch (err) {
      console.error('Error saving makeover:', err);
      const errorMsg =
        err.response?.data?.message || err.message || 'Could not save makeover. Please check connection and try again.';
      setFeedback(errorMsg, 'error');
    } finally {
      setIsSavingDesign(false);
    }
  };

  // Load and restore a saved makeover into the visualizer
  const loadSavedDesign = async (designItem) => {
    if (!designItem) return;

    try {
      let fullDesign = designItem;
      const isCloudId = designItem.isCloud || (designItem.id && !designItem.id.toString().startsWith('local-'));

      if (isCloudId) {
        try {
          const res = await API.get(`/paint/designs/${designItem.id || designItem._id}`);
          if (res.data?.design) {
            fullDesign = res.data.design;
          }
        } catch (fetchErr) {
          console.warn('Could not fetch fresh design details from API, loading cached copy:', fetchErr.message);
          if (!fullDesign || !Array.isArray(fullDesign.walls) || fullDesign.walls.length === 0) {
            setFeedback(
              `Could not load saved makeover: ${fetchErr.response?.data?.message || fetchErr.message}`,
              'error'
            );
            return;
          }
        }
      }

      // 1. Mark as active design and restore name
      setActiveDesignId(fullDesign._id || fullDesign.id);
      setImageName(fullDesign.name || 'Room Makeover');

      // 2. Restore room photo reliably
      const targetImage = fullDesign.roomImage || fullDesign.thumbnail;
      if (targetImage) {
        if (targetImage !== imageUrl) {
          if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrlRef.current);
            imageUrlRef.current = '';
          }
          setImageLoaded(false);
          setImageUrl(targetImage);
        } else {
          // If image URL hasn't changed (e.g. preset photo), ensure canvas dimensions and imageLoaded
          if (imageRef.current) {
            const canvas = canvasRef.current;
            if (canvas && imageRef.current.naturalWidth) {
              canvas.width = imageRef.current.naturalWidth;
              canvas.height = imageRef.current.naturalHeight;
            }
            setImageLoaded(true);
          }
        }
      }

      // 3. Restore walls, cutouts, opacity, and finishes
      const restoredWalls = (fullDesign.walls || []).map((w, idx) => ({
        id: w.id || `wall-${Date.now()}-${idx}`,
        name: w.name || `Wall ${idx + 1}`,
        points: Array.isArray(w.points) ? w.points.map((p) => ({ x: Number(p.x), y: Number(p.y) })) : [],
        cutouts: Array.isArray(w.cutouts)
          ? w.cutouts.map((c) =>
              Array.isArray(c) ? c.map((p) => ({ x: Number(p.x), y: Number(p.y) })) : []
            )
          : [],
        color: w.color || '#FF6B53',
        colorName: w.colorName || getColorName(w.color || '#FF6B53', paletteCollections),
        pattern: w.pattern || 'solid',
        finish: w.finish || 'realistic',
        opacity: typeof w.opacity === 'number' ? w.opacity : 70,
        visible: w.visible !== false,
      }));

      setWalls(restoredWalls);

      if (restoredWalls.length > 0) {
        setSelectedWallId(restoredWalls[0].id);
        setSelectedColor(restoredWalls[0].color);
        setCustomHexInput(restoredWalls[0].color);
        setSelectedPattern(restoredWalls[0].pattern);
        setOpacity(restoredWalls[0].opacity);
        setPaintFinish(restoredWalls[0].finish);
      } else {
        setSelectedWallId(null);
      }

      // 4. Reset temporary drawing/cutout and edit states
      setCurrentPoints([]);
      setCurrentCutoutPoints([]);
      setIsDrawing(false);
      setIsDrawingCutout(false);
      setIsEditingVertices(false);
      setViewMode('edit');
      setUndoStack([]);
      setRedoStack([]);

      setFeedback(
        `Restored makeover "${fullDesign.name}" with ${restoredWalls.length} wall(s).`,
        'success'
      );
    } catch (err) {
      console.error('Error restoring saved makeover:', err);
      setFeedback(`Could not load makeover "${designItem.name || 'Room Makeover'}".`, 'error');
    }
  };

  // Delete Makeover (MongoDB Cloud + LocalStorage)
  const executeDeleteDesign = async (design) => {
    if (!design) return;
    setIsDeletingDesign(true);

    try {
      const designId = design.id || design._id;
      const isCloudId = design.isCloud || (designId && !designId.toString().startsWith('local-'));

      if (isCloudId) {
        try {
          await API.delete(`/paint/designs/${designId}`);
        } catch (apiErr) {
          // If already removed from server (404), proceed to remove locally
          if (apiErr.response && apiErr.response.status !== 404) {
            throw apiErr;
          }
        }
      }

      // If active design was deleted, reset activeDesignId
      if (activeDesignId === designId) {
        setActiveDesignId(null);
      }

      // Remove from localStorage fallback
      let stored = [];
      try {
        stored = JSON.parse(localStorage.getItem('wallPaintDesigns') || '[]');
        if (!Array.isArray(stored)) stored = [];
      } catch {
        stored = [];
      }
      const updated = stored.filter((d) => (d.id || d._id) !== designId);
      localStorage.setItem('wallPaintDesigns', JSON.stringify(updated));

      // Refresh list from backend
      await fetchBackendDesigns();

      setFeedback(`Makeover "${design.name}" deleted successfully.`, 'info');
      setDesignToDelete(null);
    } catch (err) {
      console.error('Delete makeover error:', err);
      setFeedback(
        err.response?.data?.message || `Could not delete makeover "${design.name}". Please try again.`,
        'error'
      );
    } finally {
      setIsDeletingDesign(false);
    }
  };

  const selectedWall = walls.find((w) => w.id === selectedWallId);

  return (
    <div className="paint-visualizer-workspace">
      {/* Main Website Navigation Bar */}
      <Navbar />

      {/* ═════════════════════════════════════════════════════════════════
          HEADER: Artistic Branding, Floating Pill Toolbar & Tagline
      ══════════════════════════════════════════════════════════════════ */}
      <header className="paint-header-strip">
        {/* Left Branding */}
        <div className="paint-brand-cluster">
          <Link to="/" className="paint-back-link" title="Return to Home">
            <ArrowLeft size={16} />
          </Link>
          <div className="paint-brand-title-wrap">
            <div className="paint-brand-heading">
              <span className="paint-brand-palette-icon">🎨</span>
              <h1 className="paint-script-title">Paint Studio</h1>
            </div>
            <p className="paint-script-tagline">Design Your Space, Your Way</p>
          </div>
        </div>

        {/* Center Floating Pill Toolbar */}
        <nav className="paint-floating-toolbar" aria-label="Studio Actions Toolbar">
          {/* 1. NEW DESIGN (Distinct Coral Circular Dab Button) */}
          <button
            type="button"
            className="paint-btn-dab-new"
            onClick={handleInitiateNewDesign}
            title="Start a fresh new design project"
          >
            <Plus size={18} strokeWidth={2.6} />
            <span>New</span>
          </button>

          {/* Upload Room */}
          <button
            type="button"
            className="paint-tool-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload room photo"
          >
            <Upload size={17} />
            <span>Upload</span>
          </button>

          {/* Room Presets */}
          <button
            type="button"
            className="paint-tool-btn"
            onClick={() => loadPresetRoom(DEFAULT_PRESET)}
            title="Load Scandinavian Living Room preset"
          >
            <ImageIcon size={17} />
            <span>Rooms</span>
          </button>

          <span className="paint-toolbar-divider" />

          {/* Draw Wall */}
          <button
            type="button"
            className={`paint-tool-btn ${isDrawing ? 'paint-tool-active' : ''}`}
            onClick={startDrawingWall}
            disabled={viewMode !== 'edit'}
            title="Draw polygon wall boundary"
          >
            <PenTool size={17} />
            <span>Draw Wall</span>
          </button>

          {/* Edit Vertex */}
          <button
            type="button"
            className={`paint-tool-btn ${isEditingVertices ? 'paint-tool-active' : ''}`}
            onClick={() => {
              setViewMode('edit');
              setIsEditingVertices((v) => {
                const next = !v;
                if (next) {
                  setFeedback('Vertex editing enabled. Drag any corner handle on the selected wall.', 'info');
                } else {
                  setFeedback('Vertex editing disabled. Clean wall view.', 'info');
                }
                return next;
              });
            }}
            disabled={viewMode !== 'edit' || !selectedWallId}
            title={isEditingVertices ? 'Done editing vertices' : 'Adjust wall corners and molding'}
          >
            <Sliders size={17} />
            <span>{isEditingVertices ? 'Done Editing' : 'Edit Vertex'}</span>
          </button>

          {/* Cutout */}
          <button
            type="button"
            className={`paint-tool-btn ${isDrawingCutout ? 'paint-tool-active' : ''}`}
            onClick={startDrawingCutout}
            disabled={viewMode !== 'edit' || !selectedWallId}
            title="Protect picture frames, windows, or TVs"
          >
            <Scissors size={17} />
            <span>Cutout</span>
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            className="paint-tool-btn"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Undo last change"
          >
            <Undo2 size={16} />
            <span>Undo</span>
          </button>
          <button
            type="button"
            className="paint-tool-btn"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo change"
          >
            <Redo2 size={16} />
            <span>Redo</span>
          </button>

          <span className="paint-toolbar-divider" />

          {/* COMPARE MODE (Rich Deep Teal Organic Button) */}
          <button
            type="button"
            className={`paint-btn-dab-compare ${viewMode === 'compare' ? 'paint-dab-active' : ''}`}
            onClick={() => setViewMode(viewMode === 'compare' ? 'edit' : 'compare')}
            title="Compare Original (Before) vs Painted (After)"
          >
            <Eye size={16} />
            <span>{viewMode === 'compare' ? 'Editing' : 'Compare'}</span>
          </button>

          {/* FINISH DESIGN (Prominent Mode Toggle) */}
          <button
            type="button"
            className={`paint-btn-dab-finish ${viewMode === 'finish' ? 'paint-dab-active' : ''}`}
            onClick={() => setViewMode(viewMode === 'finish' ? 'edit' : 'finish')}
            title="View presentation-ready finished room without guides"
          >
            <Sparkles size={16} />
            <span>{viewMode === 'finish' ? 'Back to Edit' : 'Finish Design'}</span>
          </button>

          {/* SAVE MAKEOVER (Terracotta Paint-Dab Button) */}
          <button
            type="button"
            className="paint-btn-dab-save"
            onClick={openSaveModal}
            title={activeDesignId ? 'Update saved makeover or save as new' : 'Save makeover to database'}
          >
            <Save size={16} />
            <span>{activeDesignId ? 'Update/Save' : 'Save'}</span>
          </button>

          {/* EXPORT RENDER (Golden / Ochre Button) */}
          <button
            type="button"
            className="paint-btn-dab-export"
            onClick={downloadImage}
            title="Download clean high-resolution render"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          {/* Clear / Reset selected wall */}
          {selectedWallId && (
            <button
              type="button"
              className="paint-btn-icon-trash"
              onClick={() => deleteWall(selectedWallId)}
              title="Delete selected wall"
            >
              <Trash2 size={16} />
            </button>
          )}
        </nav>

        {/* Right Accent Script Badge */}
        <div className="paint-header-right-accent">
          <div className="paint-script-pill">
            <span>Better Walls, Brighter Moods</span>
          </div>
          <div className="paint-avatar-disc" title="Studio Designer Profile">
            <span>🎨</span>
          </div>
        </div>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="paint-hidden-input"
        onChange={handleUpload}
      />

      {/* Mode Notification / Feedback Banner */}
      <div className={`paint-notification-ribbon paint-ribbon-${statusMessage.type}`}>
        <span className="paint-ribbon-dot" />
        <span className="paint-ribbon-text">{statusMessage.text}</span>
        {viewMode === 'finish' && (
          <span className="paint-mode-tag">✨ Presentation Mode Active</span>
        )}
        {viewMode === 'compare' && (
          <span className="paint-mode-tag">👁️ Side-by-Side Comparison</span>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          MAIN THREE-PART STUDIO WORKSPACE
      ══════════════════════════════════════════════════════════════════ */}
      <main className={`paint-main-grid paint-mode-${viewMode}`}>
        {/* ─────────────────────────────────────────────────────────────
            LEFT RAIL: Room & Wall Tools (Hidden in Finish Design Mode)
        ────────────────────────────────────────────────────────────── */}
        {viewMode !== 'finish' && (
          <aside className="paint-rail-left">
            {/* Card 1: Choose a Room */}
            <section className="paint-card-artistic">
              <div className="paint-card-header-art">
                <span className="paint-card-icon">🏠</span>
                <h3 className="paint-card-title">Choose a Room</h3>
              </div>

              {/* Preset Thumbnail Card */}
              <div
                className="paint-preset-thumb-card"
                onClick={() => loadPresetRoom(DEFAULT_PRESET)}
                title="Click to load Scandinavian Living Room"
              >
                <img
                  src="/assets/images/hero-living-room.jpg"
                  alt="Scandinavian Living Room"
                  className="paint-preset-thumb-img"
                />
                <span className="paint-preset-label">Scandinavian Living Room</span>
              </div>

              {/* Upload Your Own */}
              <div
                className="paint-upload-dashed-box"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} className="paint-upload-icon-art" />
                <span className="paint-upload-main-text">Upload Your Own</span>
                <span className="paint-upload-sub-text">JPG, PNG (Max 10MB)</span>
              </div>
            </section>

            {/* Card 2: Wall Tools */}
            <section className="paint-card-artistic">
              <div className="paint-card-header-art">
                <span className="paint-card-icon">📐</span>
                <h3 className="paint-card-title">Wall Tools</h3>
              </div>

              <div className="paint-tools-vertical">
                <button
                  type="button"
                  className={`paint-tool-row-btn ${isDrawing ? 'paint-tool-row-active' : ''}`}
                  onClick={startDrawingWall}
                >
                  <PenTool size={16} />
                  <span>Draw Wall</span>
                </button>

                <button
                  type="button"
                  className={`paint-tool-row-btn ${isEditingVertices ? 'paint-tool-row-active' : ''}`}
                  onClick={() => {
                    setViewMode('edit');
                    setIsEditingVertices((v) => {
                      const next = !v;
                      if (next) {
                        setFeedback('Vertex editing enabled. Drag any corner handle on the selected wall.', 'info');
                      } else {
                        setFeedback('Vertex editing disabled. Clean wall view.', 'info');
                      }
                      return next;
                    });
                  }}
                  disabled={!selectedWallId}
                  title={isEditingVertices ? 'Done editing vertices' : 'Adjust corner vertices'}
                >
                  <Sliders size={16} />
                  <span>{isEditingVertices ? 'Done Adjusting' : 'Adjust Corners'}</span>
                </button>

                <button
                  type="button"
                  className={`paint-tool-row-btn ${isDrawingCutout ? 'paint-tool-row-active' : ''}`}
                  onClick={startDrawingCutout}
                  disabled={!selectedWallId}
                >
                  <Scissors size={16} />
                  <span>Protect Objects (Cutout)</span>
                </button>
              </div>

              {/* Active Drawing Guide Controls */}
              {isDrawing && (
                <div className="paint-active-draw-box">
                  <div className="paint-draw-status">
                    <span className="paint-pulse-dot" />
                    <span>Outlining ({currentPoints.length} points)</span>
                  </div>
                  <div className="paint-draw-actions">
                    <button
                      type="button"
                      className="paint-btn-draw-confirm"
                      onClick={finishWall}
                    >
                      <Check size={14} /> Finish Wall
                    </button>
                    <button
                      type="button"
                      className="paint-btn-draw-cancel"
                      onClick={undoPoint}
                      disabled={currentPoints.length === 0}
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      className="paint-btn-draw-cancel"
                      onClick={cancelDrawing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {isDrawingCutout && (
                <div className="paint-active-draw-box paint-draw-amber">
                  <div className="paint-draw-status">
                    <span className="paint-pulse-dot paint-dot-amber" />
                    <span>Tracing Cutout ({currentCutoutPoints.length} points)</span>
                  </div>
                  <div className="paint-draw-actions">
                    <button
                      type="button"
                      className="paint-btn-draw-confirm paint-confirm-amber"
                      onClick={finishCutout}
                    >
                      <Check size={14} /> Finish Cutout
                    </button>
                    <button
                      type="button"
                      className="paint-btn-draw-cancel"
                      onClick={cancelCutout}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Card 3: Wall Layers */}
            <section className="paint-card-artistic">
              <div className="paint-card-header-art">
                <span className="paint-card-icon">🥞</span>
                <h3 className="paint-card-title">Wall Layers</h3>
                <span className="paint-layers-count">{walls.length}</span>
              </div>

              <div className="paint-layers-list">
                {walls.map((wall, idx) => {
                  const isSelected = wall.id === selectedWallId;
                  return (
                    <div
                      key={wall.id}
                      className={`paint-layer-card ${isSelected ? 'paint-layer-card-selected' : ''}`}
                      onClick={() => {
                        setSelectedWallId(wall.id);
                        setSelectedColor(wall.color);
                        setCustomHexInput(wall.color);
                        setPaintFinish(wall.finish || 'realistic');
                        setOpacity(wall.opacity ?? 70);
                      }}
                    >
                      <span
                        className="paint-layer-color-circle"
                        style={{ backgroundColor: wall.color }}
                      />
                      <span className="paint-layer-name">{wall.name || `Wall ${idx + 1}`}</span>

                      <div className="paint-layer-row-actions">
                        <button
                          type="button"
                          className="paint-btn-layer-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWallVisibility(wall.id);
                          }}
                          title={wall.visible !== false ? 'Hide wall paint' : 'Show wall paint'}
                        >
                          {wall.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          type="button"
                          className="paint-btn-layer-icon paint-btn-trash"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWall(wall.id);
                          }}
                          title="Delete wall"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="paint-btn-add-wall"
                onClick={startDrawingWall}
              >
                <Plus size={15} />
                <span>Add Wall</span>
              </button>
            </section>

            {/* CARD 4: Saved Makeovers Library */}
            {savedDesigns.length > 0 && (
              <section className="paint-card-artistic">
                <div className="paint-card-header-art">
                  <span className="paint-card-icon">📁</span>
                  <h3 className="paint-card-title">Saved Makeovers</h3>
                  <span className="paint-layers-count">{savedDesigns.length}</span>
                </div>
                <div className="paint-saved-list-card">
                  {savedDesigns.map((item) => {
                    const itemId = item.id || item._id;
                    const isActive = activeDesignId && activeDesignId === itemId;
                    return (
                      <div
                        key={itemId}
                        className={`paint-saved-card-row ${isActive ? 'paint-saved-card-active' : ''}`}
                        onClick={() => loadSavedDesign(item)}
                        style={{ cursor: 'pointer' }}
                        title={`Click to load makeover "${item.name}"`}
                      >
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="paint-saved-card-thumb" />
                        ) : (
                          <div className="paint-saved-card-thumb-placeholder">🎨</div>
                        )}
                        <div className="paint-saved-card-meta">
                          <span className="paint-saved-card-title" title={item.name}>
                            {item.name}
                            {isActive && <span className="paint-active-badge">(Loaded)</span>}
                          </span>
                          <span className="paint-saved-card-subtitle">
                            {item.walls?.length || 0} wall(s)
                          </span>
                        </div>
                        <div className="paint-saved-card-actions">
                          <button
                            type="button"
                            className="paint-btn-saved-load"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadSavedDesign(item);
                            }}
                            title={`Load makeover "${item.name}"`}
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            className="paint-btn-saved-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDesignToDelete(item);
                            }}
                            title={`Delete makeover "${item.name}"`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </aside>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CENTER VIEWPORT: Main Canvas & Before/After Strips
        ────────────────────────────────────────────────────────────── */}
        <section className={`paint-center-col ${viewMode === 'finish' ? 'paint-center-immersive' : ''}`}>
          {/* Main Room Canvas Card */}
          <div className="paint-canvas-lux-card">
            {/* FINISH DESIGN Presentation Header Overlay */}
            {viewMode === 'finish' && (
              <div className="paint-finish-presentation-bar">
                <div className="paint-finish-title-block">
                  <Sparkles size={18} className="text-amber-500" />
                  <h4>Finished Room Presentation</h4>
                  <span>Clean presentation mode without guides or dots</span>
                </div>
                <div className="paint-finish-action-row">
                  <button
                    type="button"
                    className="paint-btn-finish-return"
                    onClick={() => setViewMode('edit')}
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    className="paint-btn-finish-sub"
                    onClick={() => setViewMode('compare')}
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    className="paint-btn-finish-sub"
                    onClick={openSaveModal}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="paint-btn-finish-accent"
                    onClick={downloadImage}
                  >
                    Export Render
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Mount Container */}
            <div className="paint-canvas-viewport">
              {viewMode === 'compare' ? (
                /* Dedicated Side-by-Side Comparison Mode */
                <div className="paint-side-by-side-compare">
                  <div className="paint-compare-half">
                    <span className="paint-compare-badge">ORIGINAL (BEFORE)</span>
                    <img
                      src={imageUrl}
                      alt="Original Room Before"
                      className="paint-compare-img"
                    />
                  </div>
                  <div className="paint-compare-half">
                    <span className="paint-compare-badge paint-badge-after">PAINTED (AFTER)</span>
                    <canvas ref={canvasRef} className="paint-canvas-painted" />
                  </div>
                </div>
              ) : (
                /* Live Canvas (Edit & Finish Design Mode) */
                <canvas
                  ref={canvasRef}
                  className={`paint-main-canvas ${
                    isDraggingVertex
                      ? 'paint-cursor-grabbing'
                      : isDrawing || isDrawingCutout
                      ? 'paint-cursor-crosshair'
                      : ''
                  }`}
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    cursor: canvasCursor,
                  }}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                />
              )}
            </div>

            {/* Bottom Floating Canvas Controls (Zoom / Fullscreen) */}
            <div className="paint-canvas-floating-controls">
              <button
                type="button"
                className="paint-zoom-btn"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                title="Zoom out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="paint-zoom-label">{zoomLevel}%</span>
              <button
                type="button"
                className="paint-zoom-btn"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                title="Zoom in"
              >
                <ZoomIn size={13} />
              </button>
              <span className="paint-zoom-sep" />
              <button
                type="button"
                className="paint-zoom-btn"
                onClick={() => setZoomLevel(100)}
                title="Fit to screen"
              >
                <Maximize2 size={13} />
              </button>
              {selectedWall && (
                <>
                  <span className="paint-zoom-sep" />
                  <span className="paint-zoom-wall-pill" title={`Active wall: ${selectedWall.name}`}>
                    {selectedWall.name || 'Wall'} ({selectedWall.finish || paintFinish})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* EDIT MODE: Reference's Smaller Before/After Preview Strip Beneath Canvas */}
          {viewMode === 'edit' && imageUrl && (
            <div className="paint-bottom-compare-strip">
              <div
                className="paint-compare-strip-view"
                onClick={() => setViewMode('compare')}
                title="Click to view full comparison mode"
              >
                <div className="paint-strip-before">
                  <span className="paint-strip-pill-badge">ORIGINAL (BEFORE)</span>
                  <img
                    src={imageUrl}
                    alt="Before"
                    className="paint-strip-thumb"
                  />
                </div>
                <div className="paint-strip-divider-handle">
                  <span className="paint-strip-handle-circle">+</span>
                </div>
                <div className="paint-strip-after">
                  <span className="paint-strip-pill-badge paint-badge-coral">PAINTED (AFTER)</span>
                  <img
                    src={imageUrl}
                    alt="After preview"
                    className="paint-strip-thumb"
                  />
                  {/* Subtle color wash indicator */}
                  <div
                    className="paint-strip-wash"
                    style={{ backgroundColor: selectedColor, opacity: 0.55 }}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT RAIL: Artist-Inspired Color Laboratory (Hidden in Finish Mode)
        ────────────────────────────────────────────────────────────── */}
        {viewMode !== 'finish' && (
          <aside className="paint-rail-right">
            {/* Header: Color Laboratory */}
            <section className="paint-card-artistic">
              <div className="paint-card-header-art">
                <span className="paint-card-icon">🎨</span>
                <div>
                  <h3 className="paint-card-title">Color Laboratory</h3>
                  <p className="paint-card-sub">Colors that breathe life into your space</p>
                </div>
              </div>

              {/* Active Color Card: Artist Kidney Palette Silhouette */}
              <div className="paint-active-palette-card">
                <ArtistPaletteGraphic color={selectedColor} size={58} />
                <div className="paint-active-color-meta">
                  <h4 className="paint-active-swatch-name">{getColorName(selectedColor, paletteCollections)}</h4>
                  <div className="paint-hex-copy-pill" onClick={copyHexToClipboard}>
                    <span>{selectedColor.toUpperCase()}</span>
                    <Copy size={13} />
                    {copiedHex && <span className="paint-copied-bubble">Copied!</span>}
                  </div>
                </div>
              </div>

              {/* Signature Colors Section */}
              <div className="paint-lab-section">
                <div
                  className="paint-section-row"
                  onClick={() => setIsSignatureExpanded((v) => !v)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="paint-section-label">Signature Colors</h4>
                  <ChevronRight
                    size={15}
                    className={`paint-section-arrow ${isSignatureExpanded ? 'paint-arrow-rotated' : ''}`}
                  />
                </div>

                <div className="paint-signature-swatches-grid">
                  {(isSignatureExpanded ? EXPANDED_SIGNATURE_SWATCHES : CORE_SWATCHES).map((swatch) => {
                    const isSelected = selectedColor.toUpperCase() === swatch.hex.toUpperCase();
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        className={`paint-swatch-col-btn ${isSelected ? 'paint-swatch-col-active' : ''}`}
                        onClick={() => applyColorToWall(swatch.hex)}
                        title={`${swatch.name} (${swatch.hex})`}
                      >
                        <span
                          className="paint-swatch-bubble"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className="paint-swatch-label-name">{swatch.name}</span>
                        <span className="paint-swatch-label-hex">{swatch.hex}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Curated Palettes (Artist Palette Silhouettes with Color Daubs) */}
              <div className="paint-lab-section">
                <div className="paint-section-row">
                  <h4 className="paint-section-label">Curated Palettes</h4>
                  <span
                    className="paint-view-all-link"
                    onClick={() => setShowPaletteCatalogModal(true)}
                    role="button"
                    tabIndex={0}
                  >
                    View All
                  </span>
                </div>

                <div className="paint-curated-palettes-grid">
                  {paletteCollections.map((pal) => {
                    const palSlug = pal.slug || pal.id || pal.name;
                    const isPaletteActive = activePaletteSlug === palSlug;
                    return (
                      <div
                        key={palSlug}
                        className={`paint-palette-daub-item ${isPaletteActive ? 'paint-palette-daub-active' : ''}`}
                        onClick={() => {
                          setActivePaletteSlug(palSlug);
                          applyColorToWall(pal.accent || (pal.colors && pal.colors[0]));
                        }}
                        title={`View ${pal.name} swatches and apply accent`}
                      >
                        <div className="paint-palette-svg-wrap">
                          <ArtistPaletteGraphic color="#EDE7DD" size={54} daubs={pal.colors || []} />
                        </div>
                        <span className="paint-palette-daub-name">{pal.name}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Active Palette Swatches Strip */}
                {(() => {
                  const activePal =
                    paletteCollections.find((p) => (p.slug || p.id || p.name) === activePaletteSlug) ||
                    paletteCollections[0];
                  if (!activePal) return null;
                  const swatches =
                    activePal.swatches && activePal.swatches.length > 0
                      ? activePal.swatches
                      : (activePal.colors || []).map((c, i) => ({ name: `Tone ${i + 1}`, hex: c }));

                  return (
                    <div className="paint-active-palette-swatches-box">
                      <div className="paint-active-palette-meta-row">
                        <span className="paint-active-palette-title">{activePal.name} Shades</span>
                        <button
                          type="button"
                          className="paint-btn-browse-all-link"
                          onClick={() => setShowPaletteCatalogModal(true)}
                        >
                          Catalog ↗
                        </button>
                      </div>
                      <div className="paint-swatches-chip-grid">
                        {swatches.map((swatch, sIdx) => {
                          const isChipActive = selectedColor.toUpperCase() === swatch.hex.toUpperCase();
                          return (
                            <button
                              key={swatch.hex + sIdx}
                              type="button"
                              className={`paint-swatch-chip-btn ${isChipActive ? 'paint-chip-active' : ''}`}
                              onClick={() => applyColorToWall(swatch.hex)}
                              title={`Select ${swatch.name} (${swatch.hex})`}
                            >
                              <span className="paint-chip-color" style={{ backgroundColor: swatch.hex }} />
                              <span className="paint-chip-name">{swatch.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Custom Color Input */}
              <div className="paint-lab-section">
                <h4 className="paint-section-label">Custom Color</h4>
                <div className="paint-custom-hex-box">
                  <input
                    type="color"
                    className="paint-picker-native"
                    value={selectedColor}
                    onChange={(e) => applyColorToWall(e.target.value)}
                  />
                  <input
                    type="text"
                    className="paint-hex-text-box"
                    value={customHexInput}
                    onChange={(e) => handleCustomHexChange(e.target.value)}
                    placeholder="#8E44AD"
                    maxLength={7}
                  />
                  <PenTool size={14} className="paint-hex-icon" />
                </div>
              </div>

              {/* Finish & Lighting */}
              <div className="paint-lab-section">
                <h4 className="paint-section-label">Finish & Lighting</h4>
                <div className="paint-finish-segmented-bar">
                  {[
                    { id: 'realistic', label: 'Realistic' },
                    { id: 'matte', label: 'Matte' },
                    { id: 'satin', label: 'Satin' },
                    { id: 'classic', label: 'Classic' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`paint-finish-segment ${paintFinish === f.id ? 'paint-segment-active' : ''}`}
                      onClick={() => updateFinish(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="paint-lab-section">
                <div className="paint-slider-row">
                  <h4 className="paint-section-label">Opacity</h4>
                  <span className="paint-slider-readout">{opacity}%</span>
                </div>
                <input
                  type="range"
                  className="paint-art-slider"
                  min="15"
                  max="100"
                  value={opacity}
                  onChange={(e) => updateOpacity(Number(e.target.value))}
                />
              </div>

              {/* Surface Pattern */}
              <div className="paint-lab-section">
                <h4 className="paint-section-label">Surface Pattern</h4>
                <div className="paint-pattern-circles-row">
                  {[
                    { id: 'solid', label: 'Solid', icon: '◐' },
                    { id: 'stripes', label: 'Stripes', icon: '▤' },
                    { id: 'dots', label: 'Polka Dots', icon: '⁖' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`paint-pattern-circle-btn ${selectedPattern === p.id ? 'paint-pattern-selected' : ''}`}
                      onClick={() => updatePattern(p.id)}
                    >
                      <span className="paint-pattern-glyph">{p.icon}</span>
                      <span className="paint-pattern-text">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom Right Decorative Graphic (Reference Matching) */}
            <div className="paint-leaf-quote-card">
              <span className="paint-leaf-icon">🌿</span>
              <p className="paint-quote-script">Small changes, Big feelings. ♡</p>
            </div>
          </aside>
        )}
      </main>

      {/* ═════════════════════════════════════════════════════════════════
          REFERENCE FOOTER: Educational & Value Cards
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="paint-studio-bottom-footer">
        <div className="paint-footer-columns">
          {/* Card 1: Beautiful. Functional. Yours. */}
          <div className="paint-footer-card">
            <h3 className="paint-footer-card-title">Beautiful. Functional. Yours.</h3>
            <p className="paint-footer-card-desc">
              A more expressive, premium look for Paint Studio — designed to feel like a creative space, not just a tool.
            </p>
            <div className="paint-value-pills-grid">
              <div className="paint-value-pill">
                <Heart size={14} className="text-rose-500" />
                <span>More Personality</span>
              </div>
              <div className="paint-value-pill">
                <Sparkle size={14} className="text-amber-500" />
                <span>Clearer Actions</span>
              </div>
              <div className="paint-value-pill">
                <Feather size={14} className="text-emerald-500" />
                <span>Better Visual Hierarchy</span>
              </div>
              <div className="paint-value-pill">
                <Sun size={14} className="text-orange-500" />
                <span>A Calmer Workspace</span>
              </div>
            </div>
          </div>

          {/* Card 2: Custom Shape Buttons */}
          <div className="paint-footer-card">
            <h3 className="paint-footer-card-title">Custom Shape Buttons</h3>
            <p className="paint-footer-card-desc">
              No more plain rectangles. Each action has a distinct shape and color, making tools feel intuitive and delightful.
            </p>
            <div className="paint-footer-buttons-preview">
              <div className="paint-mini-dab paint-mini-new">
                <Plus size={12} />
                <span>New</span>
              </div>
              <div className="paint-mini-dab paint-mini-compare">
                <Eye size={12} />
                <span>Compare</span>
              </div>
              <div className="paint-mini-dab paint-mini-save">
                <Save size={12} />
                <span>Save</span>
              </div>
              <div className="paint-mini-dab paint-mini-export">
                <Download size={12} />
                <span>Export</span>
              </div>
            </div>
          </div>

          {/* Card 3: Art Palette Colors */}
          <div className="paint-footer-card">
            <h3 className="paint-footer-card-title">Art Palette Colors</h3>
            <p className="paint-footer-card-desc">
              Real paint palette style for color selection. It feels natural, creative, and inspiring.
            </p>
            <div className="paint-footer-palette-art">
              <ArtistPaletteGraphic color="#FAF3E6" size={80} daubs={['#FF6B53', '#F7B731', '#1E8C96', '#48A279']} />
            </div>
          </div>

          {/* Card 4: Expressive UI Elements */}
          <div className="paint-footer-card">
            <h3 className="paint-footer-card-title">Expressive UI Elements</h3>
            <p className="paint-footer-card-desc">
              Thoughtful shapes, soft textures, and creative typography give the studio a premium, emotional feel.
            </p>
            <div className="paint-footer-script-badge">
              <span className="paint-script-footer-brand">Paint Studio ♡</span>
              <span className="paint-footer-steps">Design &nbsp;→&nbsp; Paint &nbsp;→&nbsp; Feel</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═════════════════════════════════════════════════════════════════
          NEW DESIGN CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showNewDesignModal && (
        <div className="paint-modal-backdrop" onClick={() => setShowNewDesignModal(false)}>
          <div className="paint-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="paint-modal-header">
              <span className="paint-modal-icon">🎨</span>
              <h3 className="paint-modal-title">Start a New Design?</h3>
            </div>
            <p className="paint-modal-body">
              Starting a new design will clear your current working wall polygons and paint layers
              for this session.
            </p>
            <p className="paint-modal-sub">
              Your previously saved makeovers in the library will remain completely safe.
            </p>
            <div className="paint-modal-actions">
              <button
                type="button"
                className="paint-btn-modal-cancel"
                onClick={() => setShowNewDesignModal(false)}
              >
                Keep Current Work
              </button>
              <button
                type="button"
                className="paint-btn-modal-confirm"
                onClick={executeResetNewDesign}
              >
                Yes, Start New Design
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          DELETE MAKEOVER CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {designToDelete && (
        <div
          className="paint-modal-backdrop"
          onClick={() => !isDeletingDesign && setDesignToDelete(null)}
        >
          <div className="paint-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="paint-modal-header">
              <span className="paint-modal-icon">🗑️</span>
              <h3 className="paint-modal-title">Delete Saved Makeover?</h3>
            </div>
            <p className="paint-modal-body">
              Are you sure you want to permanently delete <strong>"{designToDelete.name}"</strong>?
              This makeover will be removed from your saved library and database.
            </p>
            <p className="paint-modal-sub">
              This action cannot be undone. Other saved designs and palettes will remain unaffected.
            </p>
            <div className="paint-modal-actions">
              <button
                type="button"
                className="paint-btn-modal-cancel"
                onClick={() => setDesignToDelete(null)}
                disabled={isDeletingDesign}
              >
                Cancel
              </button>
              <button
                type="button"
                className="paint-btn-modal-delete"
                onClick={() => executeDeleteDesign(designToDelete)}
                disabled={isDeletingDesign}
              >
                {isDeletingDesign ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═════════════════════════════════════════════════════════════════
          SAVE / UPDATE MAKEOVER MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showSaveModal && (
        <div
          className="paint-modal-backdrop"
          onClick={() => !isSavingDesign && setShowSaveModal(false)}
        >
          <div className="paint-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="paint-modal-header">
              <span className="paint-modal-icon">💾</span>
              <h3 className="paint-modal-title">
                {activeDesignId && saveMode === 'update' ? 'Update Saved Makeover' : 'Save Room Makeover'}
              </h3>
            </div>
            <p className="paint-modal-body">
              Save your room photo, wall polygon boundaries, cutout areas, and paint finishes.
            </p>

            <div className="paint-modal-field">
              <label className="paint-modal-label">Makeover Name</label>
              <input
                type="text"
                className="paint-modal-input"
                value={saveMakeoverName}
                onChange={(e) => setSaveMakeoverName(e.target.value)}
                placeholder="e.g., Living Room Warm Terracotta"
                maxLength={60}
                autoFocus
              />
            </div>

            {activeDesignId && (
              <div className="paint-modal-radio-group">
                <label className="paint-modal-radio-label">
                  <input
                    type="radio"
                    name="saveMode"
                    value="update"
                    checked={saveMode === 'update'}
                    onChange={() => setSaveMode('update')}
                  />
                  <span>Update existing makeover record</span>
                </label>
                <label className="paint-modal-radio-label">
                  <input
                    type="radio"
                    name="saveMode"
                    value="new"
                    checked={saveMode === 'new'}
                    onChange={() => setSaveMode('new')}
                  />
                  <span>Save as a fresh new copy</span>
                </label>
              </div>
            )}

            <div className="paint-modal-meta-pills">
              <span className="paint-meta-pill">🧱 {walls.length} Wall(s)</span>
              <span className="paint-meta-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: selectedColor,
                    display: 'inline-block',
                  }}
                />
                {selectedColor.toUpperCase()}
              </span>
              <span className="paint-meta-pill">✨ {paintFinish} finish</span>
            </div>

            <div className="paint-modal-actions">
              <button
                type="button"
                className="paint-btn-modal-cancel"
                onClick={() => setShowSaveModal(false)}
                disabled={isSavingDesign}
              >
                Cancel
              </button>
              <button
                type="button"
                className="paint-btn-modal-confirm"
                onClick={executeSaveMakeover}
                disabled={isSavingDesign}
              >
                {isSavingDesign
                  ? 'Saving to Database...'
                  : activeDesignId && saveMode === 'update'
                  ? 'Update Makeover'
                  : 'Save Makeover'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═════════════════════════════════════════════════════════════════
          CURATED PALETTES CATALOG BROWSER MODAL (Fix for Bug 3)
      ══════════════════════════════════════════════════════════════════ */}
      {showPaletteCatalogModal && (
        <div className="paint-modal-backdrop" onClick={() => setShowPaletteCatalogModal(false)}>
          <div
            className="paint-modal-dialog paint-palette-catalog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="paint-modal-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="paint-modal-icon">🎨</span>
                <div>
                  <h3 className="paint-modal-title" style={{ margin: 0 }}>Curated Color Palettes</h3>
                  <p className="paint-modal-sub" style={{ margin: '2px 0 0', fontSize: '13px' }}>
                    Explore complete designer harmonies and swatches
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="paint-btn-modal-cancel"
                style={{ padding: '6px 12px' }}
                onClick={() => setShowPaletteCatalogModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="paint-catalog-palettes-list">
              {paletteCollections.map((pal) => {
                const swatches =
                  pal.swatches && pal.swatches.length > 0
                    ? pal.swatches
                    : (pal.colors || []).map((c, i) => ({ name: `Tone ${i + 1}`, hex: c }));
                return (
                  <div key={pal.slug || pal.id || pal.name} className="paint-catalog-palette-card">
                    <div className="paint-catalog-palette-header">
                      <div className="paint-catalog-pal-left">
                        <ArtistPaletteGraphic color="#FAF7F2" size={42} daubs={pal.colors || []} />
                        <div>
                          <h4 className="paint-catalog-pal-name">{pal.name}</h4>
                          {pal.description && (
                            <p className="paint-catalog-pal-desc">{pal.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="paint-btn-apply-accent"
                        onClick={() => {
                          setActivePaletteSlug(pal.slug || pal.id);
                          applyColorToWall(pal.accent || (pal.colors && pal.colors[0]));
                          setShowPaletteCatalogModal(false);
                        }}
                      >
                        Use Palette Accent
                      </button>
                    </div>

                    <div className="paint-catalog-swatches-grid">
                      {swatches.map((swatch, sIdx) => {
                        const isSelected = selectedColor.toUpperCase() === swatch.hex.toUpperCase();
                        return (
                          <button
                            key={swatch.hex + sIdx}
                            type="button"
                            className={`paint-catalog-swatch-item ${
                              isSelected ? 'paint-cat-swatch-active' : ''
                            }`}
                            onClick={() => {
                              setActivePaletteSlug(pal.slug || pal.id);
                              applyColorToWall(swatch.hex);
                              setShowPaletteCatalogModal(false);
                            }}
                            title={`Paint wall with ${swatch.name} (${swatch.hex})`}
                          >
                            <span
                              className="paint-cat-swatch-circle"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="paint-cat-swatch-name">{swatch.name}</span>
                            <span className="paint-cat-swatch-hex">{swatch.hex}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="paint-modal-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="paint-btn-modal-confirm"
                onClick={() => setShowPaletteCatalogModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
