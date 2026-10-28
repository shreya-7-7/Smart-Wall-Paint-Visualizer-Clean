import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles, Layers, Sliders, RefreshCw, Palette } from 'lucide-react';
import Navbar from '../components/Navbar';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-dedicated-page">
      <Navbar />

      <main className="about-content-wrapper">
        {/* ─── Hero Header ────────────────────────────────────────── */}
        <section className="about-hero-header">
          <div className="about-hero-inner">
            <span className="about-eyebrow-tracker">ABOUT SMART WALL PAINT VISUALIZER</span>
            <h1 className="about-main-title">
              Taking the Guesswork Out of<br />
              <span className="about-title-accent">Wall Color Decisions.</span>
            </h1>
            <p className="about-main-subtitle">
              A purposeful, web-based visualization tool created to help you preview realistic wall paint colors directly on photographs of your actual rooms before opening a single can of paint.
            </p>

            <div className="about-hero-cta-group">
              <button
                type="button"
                className="about-btn-primary"
                onClick={() => navigate('/paint-visualizer')}
              >
                <span>Open Paint Studio</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="about-btn-secondary"
                onClick={() => navigate('/inspiration')}
              >
                <Palette size={16} />
                <span>Explore Inspiration</span>
              </button>
            </div>
          </div>
        </section>

        {/* ─── Section 1: The Shade Card Problem ──────────────────── */}
        <section className="about-section problem-section">
          <div className="about-section-container">
            <div className="problem-card">
              <div className="problem-icon-wrap">
                <AlertCircle size={28} className="problem-alert-icon" />
              </div>
              <div className="problem-text-content">
                <span className="section-mini-tag">THE PROBLEM WE SOLVE</span>
                <h2 className="section-block-title">Why Choosing Paint from Paper Swatches Fails</h2>
                <p className="section-block-p">
                  Every year, millions of homeowners and renters buy paint cans based entirely on two-inch paper shade cards picked up in paint stores. Under bright fluorescent store lighting, a shade may look soft, neutral, or subtle.
                </p>
                <p className="section-block-p">
                  Once that same color is rolled onto a 12-foot living room wall, it behaves completely differently. Natural sunlight from morning to evening, window directions, ambient room shadows, ceiling bounce, and existing flooring all transform how paint appears in a real interior space.
                </p>
                <div className="problem-stats-row">
                  <div className="problem-stat-box">
                    <div className="stat-number">1 in 3</div>
                    <div className="stat-label">Homeowners express regret over their initial wall color choice</div>
                  </div>
                  <div className="problem-stat-box">
                    <div className="stat-number">300%+</div>
                    <div className="stat-label">Higher cost and effort when rooms must be repainted after the fact</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 2: How It Works (Precision Workflow) ───────── */}
        <section className="about-section workflow-section">
          <div className="about-section-container">
            <div className="section-header-center">
              <span className="section-mini-tag">HOW IT WORKS</span>
              <h2 className="section-block-title">Practical, Controlled Room Visualization</h2>
              <p className="section-block-sub">
                No complex equipment or guesswork required. The application gives you full, manual control over your own room photos.
              </p>
            </div>

            <div className="workflow-grid-4">
              {/* Step 1 */}
              <div className="workflow-card">
                <div className="workflow-num-badge">01</div>
                <div className="workflow-card-icon">
                  <Layers size={22} />
                </div>
                <h3 className="workflow-step-title">Upload Real Room Photos</h3>
                <p className="workflow-step-desc">
                  Take a clear photo of your living room, bedroom, kitchen, or dining area under your room's natural lighting and upload it directly to the studio.
                </p>
              </div>

              {/* Step 2 */}
              <div className="workflow-card">
                <div className="workflow-num-badge">02</div>
                <div className="workflow-card-icon">
                  <Sliders size={22} />
                </div>
                <h3 className="workflow-step-title">Manual Wall Selection</h3>
                <p className="workflow-step-desc">
                  Use the manual polygon outlining tool to define the exact boundaries of the wall you want to paint, outlining cleanly around windows, doors, and furnishings.
                </p>
              </div>

              {/* Step 3 */}
              <div className="workflow-card">
                <div className="workflow-num-badge">03</div>
                <div className="workflow-card-icon">
                  <Sparkles size={22} />
                </div>
                <h3 className="workflow-step-title">Apply &amp; Blend Paint</h3>
                <p className="workflow-step-desc">
                  Select colors from curated swatches or custom palettes. The paint application preserves natural shadows, highlights, and room texture for an authentic preview.
                </p>
              </div>

              {/* Step 4 */}
              <div className="workflow-card">
                <div className="workflow-num-badge">04</div>
                <div className="workflow-card-icon">
                  <RefreshCw size={22} />
                </div>
                <h3 className="workflow-step-title">Before &amp; After Comparison</h3>
                <p className="workflow-step-desc">
                  Toggle seamlessly between your original room and the newly painted variation to evaluate whether the tone truly complements your space and furniture.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: Value & Confidence ──────────────────────── */}
        <section className="about-section value-section">
          <div className="about-section-container">
            <div className="value-split-layout">
              <div className="value-text-col">
                <span className="section-mini-tag">PEACE OF MIND</span>
                <h2 className="section-block-title">
                  Save Time, Prevent Waste, and Paint With Total Confidence
                </h2>
                <p className="section-block-p">
                  Repainting a room because of an unexpected undertone or clashing palette wastes gallons of paint, costly contractor hours, and days of disruption to your home.
                </p>
                <div className="value-checklist">
                  <div className="checklist-item">
                    <CheckCircle2 size={19} className="check-icon" />
                    <span><strong>Eliminate uncertainty:</strong> See exactly how colors look against your specific sofa, flooring, and natural light before spending money.</span>
                  </div>
                  <div className="checklist-item">
                    <CheckCircle2 size={19} className="check-icon" />
                    <span><strong>Reduce material waste:</strong> Avoid opening unused sample pots and discarding full paint cans that end up in landfills.</span>
                  </div>
                  <div className="checklist-item">
                    <CheckCircle2 size={19} className="check-icon" />
                    <span><strong>Harmonize with decor:</strong> Evaluate accent walls and complementary shades that balance with your existing art and textiles.</span>
                  </div>
                  <div className="checklist-item">
                    <CheckCircle2 size={19} className="check-icon" />
                    <span><strong>Share with confidence:</strong> Save your visual comparisons to review with family members, partners, or painting contractors.</span>
                  </div>
                </div>
              </div>

              <div className="value-quote-card">
                <div className="quote-badge">DESIGN PHILOSOPHY</div>
                <blockquote className="quote-body">
                  "Paint is the most transformative design choice in any interior, yet the hardest to predict. Our mission is to make color discovery safe, tactile, and predictable."
                </blockquote>
                <div className="quote-author-meta">
                  <span className="author-name">Smart Wall Paint Visualizer Team</span>
                  <span className="author-role">Human-Centered Interior Color Studio</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 4: Closing CTA Banner ──────────────────────── */}
        <section className="about-cta-banner">
          <div className="cta-banner-card">
            <h2 className="cta-banner-title">Ready to Transform Your Walls?</h2>
            <p className="cta-banner-sub">
              Upload your own room photograph in Paint Studio or explore curated color combinations in Inspiration.
            </p>
            <div className="cta-banner-actions">
              <button
                type="button"
                className="about-btn-primary"
                onClick={() => navigate('/paint-visualizer')}
              >
                <span>Launch Paint Studio</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="about-btn-secondary"
                onClick={() => navigate('/')}
              >
                <span>Return to Home</span>
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
            <button type="button" onClick={() => navigate('/inspiration')} className="footer-link-btn">Inspiration</button>
            <button type="button" onClick={() => navigate('/admin-dashboard')} className="footer-link-btn">Admin Dashboard</button>
          </div>
          <p className="footer-copyright">&copy; 2026 Wall Paint Visualizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
