import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Check, Sparkles, Palette, Layers, Heart, Home, X } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Navbar from '../components/Navbar';
import './AboutUs.css';

const DEMO_SWATCHES = [
  { id: 'coral', name: 'Coral Bloom', hex: '#FF6B53' },
  { id: 'ochre', name: 'Sunshine Ochre', hex: '#F7B731' },
  { id: 'teal', name: 'Coastal Teal', hex: '#1E8C96' },
  { id: 'sage', name: 'Leafy Sage', hex: '#48A279' },
  { id: 'cerulean', name: 'Sky Cerulean', hex: '#4EA8DE' },
];

const AboutUs = () => {
  const navigate = useNavigate();
  const [selectedSwatch, setSelectedSwatch] = useState(DEMO_SWATCHES[0]);
  const [isAfterMode, setIsAfterMode] = useState(true);
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState(false);

  const handleLaunchStudio = () => {
    navigate('/paint-visualizer');
  };

  const handleWatchDemo = () => {
    setIsDemoPanelOpen(true);
  };

  return (
    <div className="about-page">
      <Navbar />

      <main className="about-main-content">
        {/* ═══════════════════════════════════════════════════════════
            HERO SECTION — Recreated Exactly from Reference Image
        ════════════════════════════════════════════════════════════ */}
        <section className="reference-hero" aria-label="Hero Introduction">
          {/* Panoramic Room Background Container */}
          <div className="hero-panoramic-container">
            <ImageWithFallback
              src="/assets/images/hero-living-room.jpg"
              alt="Bright sunlit living room with modern Scandinavian interior design"
              className="hero-panoramic-img"
            />

            {/* Single Unified Paint Overlay Image (Pixel-Aligned, Protected Silhouette) */}
            <img
              src={`/assets/images/hero-overlay-${selectedSwatch.id}.png`}
              alt=""
              className={`hero-paint-overlay ${isAfterMode ? 'active' : ''}`}
              aria-hidden="true"
            />

            {/* Seamless Left Edge Blend Gradient */}
            <div className="hero-left-blend-mask" aria-hidden="true" />
          </div>

          {/* ─── Hero Content Over Left Wall ───────────────────────── */}
          <div className="hero-content-left">
            <div className="hero-category-tracker">
              PAINT &nbsp;/&nbsp; VISUALIZE &nbsp;/&nbsp; TRANSFORM
            </div>

            <h1 className="hero-headline">
              Bring Your Walls<br />
              to Life With<br />
              <span className="hero-headline-accent">Real Color.</span>
            </h1>

            <p className="hero-subtitle">
              Upload your room, explore colors, and see how a new shade can completely change the feel of your space.
            </p>

            <div className="hero-actions-row">
              <button
                type="button"
                className="hero-primary-cta"
                onClick={handleLaunchStudio}
              >
                <span>Open Paint Studio</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="hero-secondary-cta"
                onClick={handleWatchDemo}
                title="Play the signature paint pour animation"
              >
                <Play size={14} className="play-icon-fill" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Whimsical Handwritten Script Annotation */}
            <div className="hero-handwritten-note" aria-hidden="true">
              <span>Small change.</span>
              <span>Big vibe.</span>
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none" className="curved-arrow-svg">
                <path d="M4 2C4 10 14 16 20 16M20 16L16 11M20 16L17 19" stroke="#3D3833" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* ─── Floating Compact Color Selector Card (Top-Right, Open on Demand) ─── */}
          <div
            id="demo-swatch-panel"
            className={`hero-floating-swatch-card ${isDemoPanelOpen ? 'panel-open' : ''}`}
            role="region"
            aria-label="Room color preview panel"
            aria-hidden={!isDemoPanelOpen}
          >
            <div className="swatch-card-header-row">
              <div className="swatch-card-header">Try a color on this room</div>
              <button
                type="button"
                className="swatch-card-close-btn"
                onClick={() => setIsDemoPanelOpen(false)}
                title="Close demo color panel"
                aria-label="Close demo color panel"
              >
                <X size={14} />
              </button>
            </div>

            <div className="swatch-rows-list" role="radiogroup" aria-label="Color options">
              {DEMO_SWATCHES.map((swatch) => {
                const isSelected = selectedSwatch.id === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`swatch-row-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSwatch(swatch);
                      setIsAfterMode(true);
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${swatch.name}`}
                  >
                    <div className="swatch-dot" style={{ backgroundColor: swatch.hex }} />
                    <span className="swatch-row-name">{swatch.name}</span>
                    {isSelected && <Check size={14} className="swatch-row-check" />}
                  </button>
                );
              })}
            </div>

            {/* Segmented Before / After Toggle Pill */}
            <div className="segmented-toggle-bar" role="group" aria-label="Before and after toggle">
              <button
                type="button"
                className={`segmented-btn ${!isAfterMode ? 'active' : ''}`}
                onClick={() => setIsAfterMode(false)}
              >
                Before
              </button>
              <button
                type="button"
                className={`segmented-btn ${isAfterMode ? 'active' : ''}`}
                onClick={() => setIsAfterMode(true)}
              >
                After
              </button>
            </div>
          </div>

          {/* ─── Yellow Demo Room Splash Badge (Click to Open on Demand) ─── */}
          <button
            type="button"
            className={`hero-demo-splash-badge ${isDemoPanelOpen ? 'badge-open' : ''}`}
            onClick={() => setIsDemoPanelOpen(prev => !prev)}
            aria-expanded={isDemoPanelOpen}
            aria-controls="demo-swatch-panel"
            aria-label="Toggle Demo Room paint preview panel"
          >
            <div className="splash-badge-title">
              <span className="splash-badge-icon">✦</span>
              <strong>{isDemoPanelOpen ? 'Close Demo Room' : 'Demo Room'}</strong>
            </div>
            <p className="splash-badge-text">
              {isDemoPanelOpen
                ? 'Click to close panel and view full living room photo.'
                : 'Click to preview paint shades on this wall.'}
            </p>
          </button>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 2 — "HOW IT WORKS" (Connected Steps + Studio Card)
        ════════════════════════════════════════════════════════════ */}
        <section className="how-it-works-section" id="how-it-works" aria-label="How it works">
          <div className="how-it-works-container">
            {/* Left Column: Heading + 3 Connected Steps */}
            <div className="how-it-works-left">
              <div className="section-eyebrow-tracked">HOW IT WORKS</div>
              <h2 className="how-it-works-title">From Photo to<br />Your Perfect Palette</h2>
              <p className="how-it-works-subtitle">
                Turn your space into something you love. It's simple, creative and completely in your hands.
              </p>

              {/* Connected 3-Step Horizontal Cards */}
              <div className="steps-connected-row">
                {/* Step 1 */}
                <div className="step-connected-card">
                  <div className="step-number-badge">01</div>
                  <div className="step-thumb-wrap">
                    <img
                      src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=320&q=80"
                      alt="Room photo upload sample"
                      className="step-thumb-img"
                    />
                    <div className="step-thumb-mini-badge">
                      <Home size={12} />
                    </div>
                  </div>
                  <h3 className="step-card-title">Upload Photo</h3>
                  <p className="step-card-desc">Choose a clear photo of your room or space.</p>
                </div>

                {/* Curved Connector Arrow 1 */}
                <div className="steps-connector-arrow" aria-hidden="true">
                  <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
                    <path d="M2 12C12 4 24 4 34 12" stroke="#E2D8CC" strokeWidth="2" strokeDasharray="3 3" />
                    <path d="M30 8L35 12L30 16" stroke="#C2B8AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="step-connected-card">
                  <div className="step-number-badge">02</div>
                  <div className="step-thumb-wrap step-thumb-masked">
                    <img
                      src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=320&q=80"
                      alt="Room outlining mask sample"
                      className="step-thumb-img"
                    />
                    {/* Pink/Coral Polygon Outline Overlay */}
                    <div className="step-thumb-outline-overlay" />
                    <div className="step-cursor-indicator">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#1F1D1A" strokeWidth="2">
                        <polygon points="3 3 10 21 14 13 22 9 3 3" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="step-card-title">Outline &amp; Mask Walls</h3>
                  <p className="step-card-desc">Select the walls you want to paint with precision.</p>
                </div>

                {/* Curved Connector Arrow 2 */}
                <div className="steps-connector-arrow" aria-hidden="true">
                  <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
                    <path d="M2 12C12 4 24 4 34 12" stroke="#E2D8CC" strokeWidth="2" strokeDasharray="3 3" />
                    <path d="M30 8L35 12L30 16" stroke="#C2B8AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="step-connected-card">
                  <div className="step-number-badge">03</div>
                  <div className="step-thumb-wrap">
                    <img
                      src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=320&q=80"
                      alt="Finished painted room comparison"
                      className="step-thumb-img"
                    />
                    <div className="step-thumb-teal-overlay" />
                    <div className="step-thumb-mini-badge">
                      <Check size={12} />
                    </div>
                  </div>
                  <h3 className="step-card-title">Compare &amp; Export</h3>
                  <p className="step-card-desc">See the result, try different colors and save your favorite.</p>
                </div>
              </div>

              {/* Playful Handwritten Annotation 2 */}
              <div className="how-handwritten-note" aria-hidden="true">
                <span>Your space,</span>
                <span>your rules.</span>
                <svg width="22" height="18" viewBox="0 0 24 20" fill="none" className="curved-arrow-svg">
                  <path d="M4 2C4 10 14 16 20 16M20 16L16 11M20 16L17 19" stroke="#5A5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Right Column: Architectural Olive Studio Card */}
            <div className="paint-studio-feature-card">
              <div className="studio-card-content">
                <div className="studio-card-tag">THE PAINT STUDIO</div>
                <h3 className="studio-card-heading">Real Rooms.<br />Real Possibilities.</h3>
                <p className="studio-card-sub">
                  Upload your own space and create your custom color story with our Paint Studio.
                </p>
                <button
                  type="button"
                  className="studio-card-btn"
                  onClick={handleLaunchStudio}
                >
                  <span>Launch Paint Studio</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Sunlit Dining Room Photograph */}
              <div className="studio-card-image-wrap">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=85"
                  alt="Modern Scandinavian dining space with wooden furniture"
                  className="studio-card-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 3 — "MORE THAN JUST A COLOR CHANGE" (Mint Ribbon)
        ════════════════════════════════════════════════════════════ */}
        <section className="mint-ribbon-section" id="capabilities" aria-label="Visualizer features">
          {/* Decorative Corner Paint Splashes */}
          <div className="mint-splash splash-bottom-left" aria-hidden="true" />
          <div className="mint-splash splash-top-right" aria-hidden="true" />

          <div className="mint-ribbon-container">
            {/* Left Header */}
            <div className="mint-header-wrap">
              <div className="mint-eyebrow">MORE THAN JUST A COLOR CHANGE</div>
              <h2 className="mint-title">A Creative Way to Redesign Your Space.</h2>
            </div>

            {/* Right 4 Horizontal Feature Badges */}
            <div className="mint-features-grid">
              {/* Feature 1 */}
              <div className="mint-feature-item">
                <div className="mint-icon-wrap icon-coral">
                  <Palette size={18} />
                </div>
                <div className="mint-feature-text">
                  <h4 className="mint-feature-title">Realistic Previews</h4>
                  <p className="mint-feature-desc">See how colors look in natural lighting and shadows.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="mint-feature-item">
                <div className="mint-icon-wrap icon-sage">
                  <Layers size={18} />
                </div>
                <div className="mint-feature-text">
                  <h4 className="mint-feature-title">Multiple Rooms</h4>
                  <p className="mint-feature-desc">Explore different spaces — living rooms, bedrooms, kitchens and more.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="mint-feature-item">
                <div className="mint-icon-wrap icon-ochre">
                  <Sparkles size={18} />
                </div>
                <div className="mint-feature-text">
                  <h4 className="mint-feature-title">Texture &amp; Finish</h4>
                  <p className="mint-feature-desc">Compare matte, satin, and other finishes for the perfect look.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="mint-feature-item">
                <div className="mint-icon-wrap icon-blue">
                  <Heart size={18} />
                </div>
                <div className="mint-feature-text">
                  <h4 className="mint-feature-title">Save &amp; Share</h4>
                  <p className="mint-feature-desc">Keep your favorite designs and share them with friends or family.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════ */}
        <footer className="editorial-footer">
          <div className="footer-container">
            <div className="footer-brand">Wall Paint Visualizer</div>
            <div className="footer-links">
              <button type="button" onClick={() => navigate('/paint-visualizer')} className="footer-link-btn">Paint Studio</button>
              <button type="button" onClick={() => navigate('/inspiration')} className="footer-link-btn">Inspiration</button>
              <button type="button" onClick={() => navigate('/admin-dashboard')} className="footer-link-btn">Admin Dashboard</button>
              <button type="button" onClick={() => navigate('/login')} className="footer-link-btn">Sign In</button>
            </div>
            <p className="footer-copyright">&copy; 2026 Wall Paint Visualizer. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AboutUs;
