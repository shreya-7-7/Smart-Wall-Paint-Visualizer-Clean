import React from 'react'
import { getDesignLayout } from '../data/designSamples'

/**
 * Renders the actual 2D layout as a thumbnail for design cards.
 * Uses getDesignLayout to show updated layouts when user has edited and saved.
 */
const DesignThumbnail = ({ designId, designData = null, className = '' }) => {
  // Use passed data or look up in sample catalog
  const layout = designData || getDesignLayout(designId)
  if (!layout) return null

  // Use saved thumbnail if available (shows exact edited design)
  if (layout.thumbnail) {
    return (
      <img
        src={layout.thumbnail}
        alt={layout.name}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#F9F7F4' }}
      />
    )
  }

  const { roomSize, furniture } = layout
  const wt = roomSize.wallThickness || 20
  const rx = roomSize.x || 100
  const ry = roomSize.y || 50
  const rw = roomSize.width || 600
  const rh = roomSize.height || 400
  const roomName = roomSize.roomName || 'Rectangular Suite'

  // Dimensions in meters (layout uses cm)
  const widthM = (rw / 100).toFixed(1)
  const heightM = (rh / 100).toFixed(1)
  const areaM2 = ((rw * rh) / 10000).toFixed(2)

  // Bounding box: room + walls
  const totalW = rw + wt * 2
  const totalH = rh + wt * 2
  const innerX = wt
  const innerY = wt

  // Scale to fit ~400x220 viewport with padding
  const pad = 12
  const maxW = 400 - pad * 2
  const maxH = 220 - pad * 2
  const scale = Math.min(maxW / totalW, maxH / totalH)
  const viewW = totalW * scale + pad * 2
  const viewH = totalH * scale + pad * 2

  const toSvg = (x, y) => ({
    x: pad + x * scale,
    y: pad + y * scale
  })

  // Room floor (inner)
  let floorPoints = []
  if (roomSize.isPoly && roomSize.points && roomSize.points.length > 0) {
    floorPoints = roomSize.points.map(p => toSvg(p.x + wt, p.y + wt));
  } else {
    floorPoints = [
      toSvg(innerX, innerY),
      toSvg(innerX + rw, innerY),
      toSvg(innerX + rw, innerY + rh),
      toSvg(innerX, innerY + rh)
    ]
  }
  const floorPath = floorPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  // Grid lines (faint, 40cm spacing)
  const gridLines = []
  const gridStep = 40
  for (let gx = innerX + gridStep; gx < innerX + rw; gx += gridStep) {
    gridLines.push(
      <line key={`v-${gx}`} x1={toSvg(gx, innerY).x} y1={toSvg(gx, innerY).y} x2={toSvg(gx, innerY + rh).x} y2={toSvg(gx, innerY + rh).y} stroke="#000" strokeWidth={0.3} opacity={0.06} />
    )
  }
  for (let gy = innerY + gridStep; gy < innerY + rh; gy += gridStep) {
    gridLines.push(
      <line key={`h-${gy}`} x1={toSvg(innerX, gy).x} y1={toSvg(innerX, gy).y} x2={toSvg(innerX + rw, gy).x} y2={toSvg(innerX + rw, gy).y} stroke="#000" strokeWidth={0.3} opacity={0.06} />
    )
  }

  // Center point for room label
  const centerX = pad + (innerX + rw / 2) * scale
  const centerY = pad + (innerY + rh / 2) * scale

  return (
    <svg
      className={className}
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block', background: '#F9F7F4' }}
    >
      {/* Outer border (thin light grey) */}
      <rect x={pad} y={pad} width={totalW * scale} height={totalH * scale} fill="none" stroke="#e2e8f0" strokeWidth={1} />

      {/* Floor with grid */}
      <path d={floorPath} fill={roomSize.floorColor || '#f3efe8'} stroke={roomSize.wallColor || '#e5e7eb'} strokeWidth={Math.max(1, wt * scale * 0.5)} />
      <g>{gridLines}</g>

      {/* Dimension - top edge (width) */}
      <text x={pad + (totalW * scale) / 2} y={pad - 4} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="600">{widthM} m</text>
      {/* Dimension - left edge (height) */}
      <text x={pad - 6} y={pad + (totalH * scale) / 2} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="600" transform={`rotate(-90, ${pad - 6}, ${pad + (totalH * scale) / 2})`}>{heightM} m</text>

      {/* Room name and area in center */}
      <text x={centerX} y={centerY - 6} textAnchor="middle" fontSize={10} fill="#374151" fontWeight="600">{roomName}</text>
      <text x={centerX} y={centerY + 8} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="500">{areaM2} m²</text>

      {/* Furniture - dark grey rectangles with labels */}
      {furniture.map((f, idx) => {
        const fx = f.x - rx
        const fy = f.y - ry
        const fw = f.width
        const fh = f.height
        const rot = f.rotation || 0

        const cx = fx + fw / 2
        const cy = fy + fh / 2
        const sc = toSvg(cx, cy)
        const p0 = toSvg(fx, fy)
        const p1 = toSvg(fx + fw, fy)
        const p2 = toSvg(fx + fw, fy + fh)
        const p3 = toSvg(fx, fy + fh)

        const rotate = (px, py, deg) => {
          const rad = (deg * Math.PI) / 180
          const cos = Math.cos(rad)
          const sin = Math.sin(rad)
          const dx = px - sc.x
          const dy = py - sc.y
          return { x: sc.x + dx * cos - dy * sin, y: sc.y + dx * sin + dy * cos }
        }

        const pts = [p0, p1, p2, p3].map(p => rotate(p.x, p.y, rot))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

        // Label - truncate if needed, scale by furniture size
        const label = (f.name || '').length > 18 ? f.name.slice(0, 15) + '…' : f.name
        const fontSize = Math.min(8, Math.max(6, Math.min(fw, fh) / 8))

        return (
          <g key={f.clientId || f.id || `f-${idx}`}>
            <path
              d={path}
              fill={f.isStructural ? '#94a3b8' : '#4b5563'}
              fillOpacity={f.isStructural ? 0.5 : 0.6}
              stroke="#374151"
              strokeWidth={0.8}
              strokeOpacity={0.8}
            />
            <text
              x={sc.x}
              y={sc.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fill="#1f2937"
              fontWeight="500"
              transform={rot !== 0 ? `rotate(${rot}, ${sc.x}, ${sc.y})` : ''}
              style={{ pointerEvents: 'none' }}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default DesignThumbnail
