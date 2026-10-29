import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, SlidersHorizontal, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import './PaintInspiration.css';

const PALETTES = [
  {
    id: 'terracotta-warmth',
    category: 'Warm Terracottas',
    title: 'Earth & Terracotta',
    subtitle: 'Grounding, sunset-inspired tones that add warmth and tactile depth to open spaces.',
    roomImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    roomLabel: 'Living Room Accent Wall',
    swatches: [
      { name: 'Warm Terracotta', hex: '#C86446', finish: 'Matte' },
      { name: 'Sunset Clay', hex: '#E07A5F', finish: 'Eggshell' },
      { name: 'Linen Sand', hex: '#F4EDE1', finish: 'Satin' },
    ],
  },
  {
    id: 'botanical-sage',
    category: 'Calming Sages',
    title: 'Botanical Harmony',
    subtitle: 'Restorative eucalyptus and olive greens that evoke tranquil, nature-forward rooms.',
    roomImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    roomLabel: 'Bedroom Sanctuary',
    swatches: [
      { name: 'Leafy Sage', hex: '#48A279', finish: 'Eggshell' },
      { name: 'Muted Eucalyptus', hex: '#7A9A82', finish: 'Matte' },
      { name: 'Morning Mist', hex: '#D8E2DC', finish: 'Satin' },
    ],
  },
  {
    id: 'coastal-teal',
    category: 'Coastal Teals',
    title: 'Deep Ocean & Teal',
    subtitle: 'Sophisticated jewel tones that bring dramatic architectural depth to dining and studies.',
    roomImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    roomLabel: 'Dining Room Focal Wall',
    swatches: [
      { name: 'Coastal Teal', hex: '#1E8C96', finish: 'Satin' },
      { name: 'Maritime Blue', hex: '#385A6E', finish: 'Matte' },
      { name: 'Sea Salt', hex: '#EBF2EE', finish: 'Eggshell' },
    ],
  },
  {
    id: 'sunlit-ochre',
    category: 'Sunlit Ochres',
    title: 'Golden Hour Ochre',
    subtitle: 'Vibrant golden hues that catch natural sunlight and brighten north-facing rooms.',
    roomImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    roomLabel: 'Sunroom & Breakfast Nook',
    swatches: [
      { name: 'Sunshine Ochre', hex: '#F7B731', finish: 'Matte' },
      { name: 'Mustard Velvet', hex: '#D4A34E', finish: 'Eggshell' },
      { name: 'Ivory Cream', hex: '#FAF8F5', finish: 'Satin' },
    ],
  },
  {
    id: 'dusty-rose',
    category: 'Moody Accents',
    title: 'Dusty Rose & Terracotta Blush',
    subtitle: 'Gentle, romantic undertones that soften clean Scandinavian and mid-century lines.',
    roomImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    roomLabel: 'Cozy Reading Corner',
    swatches: [
      { name: 'Dusty Rose', hex: '#C48B8B', finish: 'Eggshell' },
      { name: 'Alabaster Blush', hex: '#E5D0B8', finish: 'Matte' },
      { name: 'Chalk White', hex: '#FDFBF8', finish: 'Satin' },
    ],
  },
  {
    id: 'architectural-charcoal',
    category: 'Moody Accents',
    title: 'Architectural Charcoal & Slate',
    subtitle: 'Crisp, contemporary dark neutrals creating striking contrast for gallery walls.',
    roomImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    roomLabel: 'Modern Media Room',
    swatches: [
      { name: 'Smoky Charcoal', hex: '#2B2723', finish: 'Matte' },
      { name: 'Slate Gray', hex: '#635D56', finish: 'Eggshell' },
      { name: 'Pale Bone', hex: '#ECE4DA', finish: 'Satin' },
    ],
  },
];

const CATEGORIES = ['All', 'Warm Terracottas', 'Calming Sages', 'Coastal Teals', 'Sunlit Ochres', 'Moody Accents'];

const PaintInspiration = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedHex, setCopiedHex] = useState(null);

  const filteredPalettes = selectedCategory === 'All'
    ? PALETTES
    : PALETTES.filter(p => p.category === selectedCategory);

  const handleCopyHex = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleTryInStudio = (hexColor) => {
    navigate('/paint-visualizer', { state: { initialColor: hexColor } });
  };

  return (
    <div className="paint-inspiration-page">
      <Navbar />

      <main className="inspiration-content-wrapper">
        {/* ─── Hero Header ────────────────────────────────────────── */}
        <section className="inspiration-hero-header">
          <div className="inspiration-hero-inner">
            <span className="inspiration-eyebrow">WALL PAINT INSPIRATION &amp; PALETTES</span>
            <h1 className="inspiration-main-title">
              Room Color Stories &amp;<br />
              <span className="inspiration-title-accent">Curated Combinations.</span>
            </h1>
            <p className="inspiration-main-subtitle">
              Explore harmonized wall paint palettes, accent wall ideas, and real room examples. Click any shade to copy its hex code or launch it directly into Paint Studio.
            </p>

            {/* Category Filter Pills */}
            <div className="inspiration-category-pills" role="tablist" aria-label="Color categories">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Palettes Grid ──────────────────────────────────────── */}
        <section className="inspiration-grid-section">
          <div className="inspiration-grid-container">
            <div className="palettes-cards-grid">
              {filteredPalettes.map(palette => (
                <article key={palette.id} className="palette-card">
                  {/* Room Image Preview */}
                  <div className="palette-image-wrap">
                    <img
                      src={palette.roomImage}
                      alt={palette.title}
                      className="palette-room-img"
                      loading="lazy"
                    />
                    <div className="palette-room-badge">
                      <Eye size={12} />
                      <span>{palette.roomLabel}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="palette-card-body">
                    <div className="palette-category-tag">{palette.category}</div>
                    <h2 className="palette-card-title">{palette.title}</h2>
                    <p className="palette-card-sub">{palette.subtitle}</p>

                    {/* Swatches List */}
                    <div className="palette-swatches-row" role="region" aria-label="Palette colors">
                      {palette.swatches.map(swatch => {
                        const isCopied = copiedHex === swatch.hex;
                        return (
                          <div
                            key={swatch.name}
                            className="swatch-item-card"
                            onClick={() => handleCopyHex(swatch.hex)}
                            title={`Click to copy hex ${swatch.hex}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && handleCopyHex(swatch.hex)}
                          >
                            <div
                              className="swatch-color-pill"
                              style={{ backgroundColor: swatch.hex }}
                            >
                              {isCopied && <Check size={14} className="swatch-copied-icon" />}
                            </div>
                            <div className="swatch-info">
                              <span className="swatch-name">{swatch.name}</span>
                              <span className="swatch-meta">{swatch.hex} • {swatch.finish}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Bar */}
                    <div className="palette-action-bar">
                      <button
                        type="button"
                        className="palette-try-btn"
                        onClick={() => handleTryInStudio(palette.swatches[0].hex)}
                        title="Try this color story in Paint Studio"
                      >
                        <Sparkles size={14} />
                        <span>Try in Paint Studio</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Design Tips Banner ─────────────────────────────────── */}
        <section className="inspiration-tips-section">
          <div className="tips-container">
            <div className="tips-card">
              <div className="tips-icon-wrap">
                <SlidersHorizontal size={24} />
              </div>
              <div className="tips-text">
                <h3 className="tips-title">How to Choose an Accent Wall</h3>
                <p className="tips-desc">
                  Accent walls work best on walls with natural focal points—such as behind a headboard in a bedroom, framing a sofa, or centering around an architectural window or fireplace. Avoid choosing a wall broken up by multiple doors or irregular angles.
                </p>
              </div>
              <button
                type="button"
                className="tips-action-btn"
                onClick={() => navigate('/paint-visualizer')}
              >
                <span>Launch Visualizer</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Standard Editorial Footer ──────────────────────────── */}
      <footer className="editorial-footer">
        <div className="footer-container">
          <div className="footer-brand">Wall Paint Visualizer</div>
          <div className="footer-links">
            <button type="button" onClick={() => navigate('/')} className="footer-link-btn">Home</button>
            <button type="button" onClick={() => navigate('/paint-visualizer')} className="footer-link-btn">Paint Studio</button>
            <button type="button" onClick={() => navigate('/about')} className="footer-link-btn">About</button>
          </div>
          <p className="footer-copyright">&copy; 2026 Wall Paint Visualizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PaintInspiration;
