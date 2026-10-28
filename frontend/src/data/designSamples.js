/**
 * Sample 2D design layouts for the Designer.
 * Used when opening designs from the Designs page.
 */
const PLACEHOLDER_IMG = 'https://placehold.co/80x80/e2e8f0/8B7355?text=F';

export const SAMPLE_DESIGN_LAYOUTS = {
  1: {
    name: 'Living Room Layout',
    roomSize: {
      x: 100, y: 50,
      width: 600, height: 500,
      wallThickness: 20,
      floorColor: '#f3efe8', wallColor: '#e5e7eb',
      isPoly: false, points: [],
      roomName: 'Living Room'
    },
    furniture: [
      { id: 's1', name: 'Sofa', type: 'seating', category: 'Living Room', image: PLACEHOLDER_IMG, x: 180, y: 120, width: 200, height: 90, rotation: 0, modelHeight: 75, isStructural: false, swingLeft: false, swingOut: false },
      { id: 't1', name: 'Coffee Table', type: 'table', category: 'Living Room', image: PLACEHOLDER_IMG, x: 220, y: 280, width: 120, height: 60, rotation: 0, modelHeight: 45, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'c1', name: 'Armchair', type: 'seating', category: 'Living Room', image: PLACEHOLDER_IMG, x: 420, y: 130, width: 80, height: 85, rotation: 45, modelHeight: 75, isStructural: false, swingLeft: false, swingOut: false }
    ]
  },
  2: {
    name: 'Bedroom Design',
    roomSize: {
      x: 100, y: 50,
      width: 600, height: 400,
      wallThickness: 20,
      floorColor: '#f5f0eb', wallColor: '#e8e4df',
      isPoly: false, points: [],
      roomName: 'Bedroom'
    },
    furniture: [
      { id: 'b1', name: 'Double Bed', type: 'bed', category: 'Bedroom', image: PLACEHOLDER_IMG, x: 150, y: 100, width: 200, height: 160, rotation: 0, modelHeight: 50, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'n1', name: 'Nightstand', type: 'storage', category: 'Bedroom', image: PLACEHOLDER_IMG, x: 370, y: 130, width: 50, height: 45, rotation: 0, modelHeight: 55, isStructural: false, swingLeft: false, swingOut: false }
    ]
  },
  3: {
    name: 'Modern Apartment',
    roomSize: {
      x: 100, y: 50,
      width: 700, height: 450,
      wallThickness: 20,
      floorColor: '#f8f6f3', wallColor: '#e2e8f0',
      isPoly: false, points: [],
      roomName: 'Open Plan'
    },
    furniture: [
      { id: 'd1', name: 'Dining Table', type: 'table', category: 'Dining Room', image: PLACEHOLDER_IMG, x: 250, y: 80, width: 180, height: 90, rotation: 0, modelHeight: 75, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'k1', name: 'Kitchen Island', type: 'storage', category: 'Kitchen', image: PLACEHOLDER_IMG, x: 100, y: 280, width: 150, height: 80, rotation: 0, modelHeight: 90, isStructural: false, swingLeft: false, swingOut: false }
    ]
  },
  4: {
    name: 'Cozy Kitchen',
    roomSize: {
      x: 100, y: 50,
      width: 500, height: 400,
      wallThickness: 20,
      floorColor: '#faf8f5', wallColor: '#ede9e4',
      isPoly: false, points: [],
      roomName: 'Kitchen'
    },
    furniture: [
      { id: 'cab1', name: 'Kitchen Cabinet', type: 'storage', category: 'Kitchen', image: PLACEHOLDER_IMG, x: 120, y: 100, width: 120, height: 60, rotation: 0, modelHeight: 90, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'tab1', name: 'Kitchen Table', type: 'table', category: 'Kitchen', image: PLACEHOLDER_IMG, x: 280, y: 200, width: 120, height: 80, rotation: 0, modelHeight: 75, isStructural: false, swingLeft: false, swingOut: false }
    ]
  },
  5: {
    name: 'Home Office',
    roomSize: {
      x: 100, y: 50,
      width: 400, height: 350,
      wallThickness: 20,
      floorColor: '#f0eeeb', wallColor: '#e5e7eb',
      isPoly: false, points: [],
      roomName: 'Office'
    },
    furniture: [
      { id: 'desk1', name: 'Desk', type: 'table', category: 'Office', image: PLACEHOLDER_IMG, x: 120, y: 120, width: 150, height: 75, rotation: 0, modelHeight: 75, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'chair1', name: 'Office Chair', type: 'seating', category: 'Office', image: PLACEHOLDER_IMG, x: 180, y: 220, width: 55, height: 55, rotation: 0, modelHeight: 90, isStructural: false, swingLeft: false, swingOut: false }
    ]
  },
  6: {
    name: 'Minimalist Lounge',
    roomSize: {
      x: 100, y: 50,
      width: 550, height: 420,
      wallThickness: 20,
      floorColor: '#fafafa', wallColor: '#e8e8e8',
      isPoly: false, points: [],
      roomName: 'Lounge'
    },
    furniture: [
      { id: 'l1', name: 'L-Shaped Sofa', type: 'seating', category: 'Living Room', image: PLACEHOLDER_IMG, x: 130, y: 100, width: 220, height: 100, rotation: 0, modelHeight: 75, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'p1', name: 'Side Table', type: 'table', category: 'Living Room', image: PLACEHOLDER_IMG, x: 380, y: 150, width: 50, height: 50, rotation: 0, modelHeight: 45, isStructural: false, swingLeft: false, swingOut: false }
    ]
  },
  7: {
    name: 'Elegant Dining Space',
    roomSize: {
      x: 100, y: 50,
      width: 600, height: 450,
      wallThickness: 20,
      floorColor: '#f7f3ef', wallColor: '#e8e4e0',
      isPoly: false, points: [],
      roomName: 'Dining Room'
    },
    furniture: [
      { id: 'dt1', name: 'Dining Table', type: 'table', category: 'Dining Room', image: PLACEHOLDER_IMG, x: 200, y: 130, width: 200, height: 100, rotation: 0, modelHeight: 75, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'dc1', name: 'Dining Chair', type: 'seating', category: 'Dining Room', image: PLACEHOLDER_IMG, x: 210, y: 250, width: 45, height: 50, rotation: 0, modelHeight: 85, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'dc2', name: 'Dining Chair', type: 'seating', category: 'Dining Room', image: PLACEHOLDER_IMG, x: 380, y: 250, width: 45, height: 50, rotation: 180, modelHeight: 85, isStructural: false, swingLeft: false, swingOut: false }
    ]
  },
  8: {
    name: 'Master Suite',
    roomSize: {
      x: 100, y: 50,
      width: 650, height: 480,
      wallThickness: 20,
      floorColor: '#f4f1ed', wallColor: '#e5e2dd',
      isPoly: false, points: [],
      roomName: 'Master Bedroom'
    },
    furniture: [
      { id: 'mb1', name: 'King Bed', type: 'bed', category: 'Bedroom', image: PLACEHOLDER_IMG, x: 180, y: 120, width: 220, height: 200, rotation: 0, modelHeight: 55, isStructural: false, swingLeft: false, swingOut: false },
      { id: 'd1', name: 'Standard Door', type: 'door', category: 'Architecture', image: 'https://placehold.co/80x80/e2e8f0/334155?text=Door', x: 500, y: 50, width: 90, height: 20, rotation: 0, modelHeight: 20, isStructural: true, swingLeft: false, swingOut: false }
    ]
  }
};

/** Tag mapping for designs that don't use roomName as category */
const TAG_OVERRIDE = { 3: 'Apartment' };

/** Design list metadata derived from SAMPLE_DESIGN_LAYOUTS - used by Designs, AdminDesigns, ManageDesigns */
export const SAMPLE_DESIGNS = Object.entries(SAMPLE_DESIGN_LAYOUTS).map(([id, layout]) => ({
  id: Number(id),
  title: layout.name,
  tag: TAG_OVERRIDE[Number(id)] || layout.roomSize?.roomName || 'General',
  lastEdited: 'Sample'
}));

const STORAGE_KEY = 'adminDesignOverrides';

/** Get admin overrides from localStorage */
export function getDesignOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      deletedIds: parsed.deletedIds || [],
      updates: parsed.updates || {},
      layouts: parsed.layouts || {}
    };
  } catch {
    return { deletedIds: [], updates: {}, layouts: {} };
  }
}

/** Save admin overrides to localStorage */
export function setDesignOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

/** Get the full designs list with admin overrides applied */
export function getDesignsList() {
  const overrides = getDesignOverrides();
  return SAMPLE_DESIGNS
    .filter(d => !overrides.deletedIds.includes(d.id))
    .map(d => {
      const upd = overrides.updates[d.id];
      return upd ? { ...d, title: upd.title ?? d.title, tag: upd.tag ?? d.tag } : d;
    });
}

/** Delete a design (admin) */
export function deleteDesign(id) {
  const overrides = getDesignOverrides();
  if (!overrides.deletedIds.includes(id)) {
    overrides.deletedIds.push(id);
    setDesignOverrides(overrides);
  }
}

/** Update design metadata (admin) */
export function updateDesign(id, { title, tag }) {
  const overrides = getDesignOverrides();
  overrides.updates[id] = { ...overrides.updates[id], title, tag };
  setDesignOverrides(overrides);
}

/** Get layout for a design (base + layout overrides). Used by Designer and DesignThumbnail. */
export function getDesignLayout(id) {
  const base = SAMPLE_DESIGN_LAYOUTS[id];
  if (!base) return null;
  const overrides = getDesignOverrides();
  const layoutOverride = overrides.layouts[id];
  if (!layoutOverride) return base;
  return {
    name: layoutOverride.name ?? base.name,
    roomSize: { ...base.roomSize, ...layoutOverride.roomSize },
    furniture: layoutOverride.furniture ?? base.furniture,
    thumbnail: layoutOverride.thumbnail
  };
}

/** Save layout override when user edits and saves a sample design in the Designer. */
export function saveDesignLayout(id, { roomSize, furniture, thumbnail, name }) {
  const overrides = getDesignOverrides();
  overrides.layouts[id] = {
    ...(overrides.layouts[id] || {}),
    roomSize: roomSize || overrides.layouts[id]?.roomSize,
    furniture: furniture || overrides.layouts[id]?.furniture,
    thumbnail: thumbnail || overrides.layouts[id]?.thumbnail,
    name: name || overrides.layouts[id]?.name
  };
  setDesignOverrides(overrides);
}

/** Reset all admin overrides (restore deleted, revert updates and layout changes) */
export function resetDesignOverrides() {
  setDesignOverrides({ deletedIds: [], updates: {}, layouts: {} });
}
