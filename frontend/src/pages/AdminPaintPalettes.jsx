import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AdminLayout } from '../components/AdminLayout';
import {
  Plus,
  Trash2,
  Check,
  Palette,
  Sparkles,
  RefreshCw,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminPaintPalettes() {
  const navigate = useNavigate();
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaletteId, setSelectedPaletteId] = useState('');

  // Enforce admin auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    let user = {};
    try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
    if (!token || (role !== 'admin' && user?.role !== 'admin')) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#FF6B53');
  const [newFamily, setNewFamily] = useState('Studio Signatures');
  const [newIsCore, setNewIsCore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status notification state: { type: 'success' | 'error' | 'info', message: '' }
  const [status, setStatus] = useState(null);

  // Edit swatch state
  const [editingSwatch, setEditingSwatch] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete loading state
  const [deletingId, setDeletingId] = useState(null);

  const fetchPalettes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/paint/palettes');
      if (res.data && res.data.palettes) {
        setPalettes(res.data.palettes);
        if (res.data.palettes.length > 0 && !selectedPaletteId) {
          const first = res.data.palettes[0];
          setSelectedPaletteId(first._id || first.slug);
        }
      }
    } catch (err) {
      console.error('Failed to load paint palettes:', err);
      setStatus({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Failed to load paint palettes from backend. Check that server is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPalettes();
  }, []);

  // Update selectedPaletteId if currently selected is invalid and palettes exist
  useEffect(() => {
    if (palettes.length > 0 && !selectedPaletteId) {
      const first = palettes[0];
      setSelectedPaletteId(first._id || first.slug);
    }
  }, [palettes, selectedPaletteId]);

  const handleAddColor = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setStatus({ type: 'error', message: 'Please enter a paint color name.' });
      return;
    }

    const targetPalette = palettes.find(
      (p) => (p._id && p._id === selectedPaletteId) || p.slug === selectedPaletteId
    ) || palettes[0];

    if (!targetPalette) {
      setStatus({ type: 'error', message: 'No target palette selected.' });
      return;
    }

    const targetId = targetPalette._id || targetPalette.slug;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await API.post(`/paint/palettes/${targetId}/swatches`, {
        name: newName.trim(),
        hex: newHex,
        family: newFamily || targetPalette.name,
        isCore: newIsCore,
      });

      setStatus({
        type: 'success',
        message:
          res.data?.message ||
          `Color "${newName.trim()}" added to "${targetPalette.name}" successfully!`,
      });

      setNewName('');
      setNewIsCore(false);
      await fetchPalettes();
    } catch (err) {
      console.error('Failed to add color to palette:', err);
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Authentication required. Please log in as admin.'
          : err.response?.status === 403
          ? 'Access denied. Administrator privileges required.'
          : 'Failed to add color swatch to database.');
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (palette, swatch) => {
    setEditingSwatch({
      paletteId: palette._id || palette.slug,
      paletteName: palette.name,
      swatchId: swatch.id,
      name: swatch.name,
      hex: swatch.hex,
      family: swatch.family || palette.name,
      isCore: Boolean(swatch.isCore),
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSwatch) return;
    if (!editingSwatch.name.trim()) {
      setStatus({ type: 'error', message: 'Color name cannot be empty.' });
      return;
    }

    setIsSavingEdit(true);
    setStatus(null);

    try {
      const res = await API.put(
        `/paint/palettes/${editingSwatch.paletteId}/swatches/${editingSwatch.swatchId}`,
        {
          name: editingSwatch.name.trim(),
          hex: editingSwatch.hex,
          family: editingSwatch.family,
          isCore: editingSwatch.isCore,
        }
      );

      setStatus({
        type: 'success',
        message:
          res.data?.message ||
          `Color "${editingSwatch.name}" updated successfully in database.`,
      });
      setEditingSwatch(null);
      await fetchPalettes();
    } catch (err) {
      console.error('Failed to update swatch:', err);
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Authentication required. Please log in as admin.'
          : err.response?.status === 403
          ? 'Access denied. Administrator privileges required.'
          : 'Failed to update swatch in database.');
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteSwatch = async (palette, swatch) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete swatch "${swatch.name}" (${swatch.hex}) from "${palette.name}"?\n\nThis will permanently remove it from the database.`
    );
    if (!confirmDelete) return;

    const paletteKey = palette._id || palette.slug;
    const swatchKey = `${paletteKey}-${swatch.id}`;
    setDeletingId(swatchKey);
    setStatus(null);

    try {
      const res = await API.delete(`/paint/palettes/${paletteKey}/swatches/${swatch.id}`);
      setStatus({
        type: 'success',
        message:
          res.data?.message ||
          `Color "${swatch.name}" deleted successfully from "${palette.name}".`,
      });
      await fetchPalettes();
    } catch (err) {
      console.error('Failed to delete swatch:', err);
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Authentication required. Please log in as admin.'
          : err.response?.status === 403
          ? 'Access denied. Administrator privileges required.'
          : 'Failed to delete color swatch from database.');
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="Paint Studio Palettes">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#1F1D1A' }}>
              Paint Studio Palettes &amp; Colors
            </h2>
            <p style={{ margin: 0, color: '#6B645C', fontSize: 14 }}>
              Manage curated paint swatches and color collections persisted in MongoDB. Changes sync directly to the Paint Studio.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchPalettes}
            className="paint-admin-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #D4CEC5',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#3D3833',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Status Notification Banner */}
        {status && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor:
                status.type === 'success'
                  ? '#ECFDF5'
                  : status.type === 'error'
                  ? '#FEF2F2'
                  : '#FEF3C7',
              border: `1px solid ${
                status.type === 'success'
                  ? '#10B981'
                  : status.type === 'error'
                  ? '#EF4444'
                  : '#F59E0B'
              }`,
              borderRadius: 8,
              color:
                status.type === 'success'
                  ? '#065F46'
                  : status.type === 'error'
                  ? '#991B1B'
                  : '#92400E',
              marginBottom: 20,
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {status.type === 'success' ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{status.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatus(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Add Color Form */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E0D8',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              margin: '0 0 16px',
              color: '#1F1D1A',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Palette size={18} style={{ color: '#FF6B53' }} /> Add New Color Swatch to Palette
          </h3>

          <form
            onSubmit={handleAddColor}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              alignItems: 'flex-end',
            }}
          >
            {/* Target Palette Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#3D3833',
                }}
              >
                Target Palette
              </label>
              <select
                value={selectedPaletteId}
                onChange={(e) => setSelectedPaletteId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #D4CEC5',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  background: '#FFFFFF',
                  color: '#1F1D1A',
                }}
              >
                {palettes.map((p) => (
                  <option key={p._id || p.slug} value={p._id || p.slug}>
                    {p.name} ({p.swatches?.length || 0} swatches)
                  </option>
                ))}
              </select>
            </div>

            {/* Color Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#3D3833',
                }}
              >
                Color Name
              </label>
              <input
                type="text"
                placeholder="e.g. Desert Sand, Dusty Rose"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #D4CEC5',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Color Family */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#3D3833',
                }}
              >
                Color Family
              </label>
              <select
                value={newFamily}
                onChange={(e) => setNewFamily(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #D4CEC5',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  background: '#FFFFFF',
                }}
              >
                <option value="Studio Signatures">Studio Signatures</option>
                <option value="Warm Earth">Warm Earth &amp; Terracotta</option>
                <option value="Ocean">Ocean &amp; Coastal</option>
                <option value="Botanical">Botanical Greens</option>
                <option value="Nordic">Nordic Neutrals</option>
              </select>
            </div>

            {/* Hex Value */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#3D3833',
                }}
              >
                Hex Value
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={newHex}
                  onChange={(e) => setNewHex(e.target.value)}
                  style={{
                    width: 42,
                    height: 40,
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 6,
                    padding: 0,
                  }}
                />
                <input
                  type="text"
                  value={newHex}
                  onChange={(e) => setNewHex(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #D4CEC5',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Core Swatch & Submit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#4B463F',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={newIsCore}
                  onChange={(e) => setNewIsCore(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Featured Core Swatch
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  borderRadius: 8,
                  backgroundColor: '#FF6B53',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Plus size={16} /> {isSubmitting ? 'Saving to Database...' : 'Add Paint Color'}
              </button>
            </div>
          </form>
        </div>

        {/* Edit Modal Dialog */}
        {editingSwatch && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 24,
                width: '100%',
                maxWidth: 480,
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1F1D1A' }}>
                  Edit Color Swatch
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingSwatch(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8A8278',
                    padding: 4,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                style={{
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#6B645C',
                }}
              >
                Palette: <strong>{editingSwatch.paletteName}</strong> · Swatch ID: <code>{editingSwatch.swatchId}</code>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: '#3D3833',
                    }}
                  >
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={editingSwatch.name}
                    onChange={(e) =>
                      setEditingSwatch({ ...editingSwatch, name: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #D4CEC5',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: '#3D3833',
                    }}
                  >
                    Color Family
                  </label>
                  <input
                    type="text"
                    value={editingSwatch.family}
                    onChange={(e) =>
                      setEditingSwatch({ ...editingSwatch, family: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #D4CEC5',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: '#3D3833',
                    }}
                  >
                    Hex Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="color"
                      value={editingSwatch.hex}
                      onChange={(e) =>
                        setEditingSwatch({ ...editingSwatch, hex: e.target.value })
                      }
                      style={{
                        width: 44,
                        height: 42,
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 6,
                        padding: 0,
                      }}
                    />
                    <input
                      type="text"
                      value={editingSwatch.hex}
                      onChange={(e) =>
                        setEditingSwatch({ ...editingSwatch, hex: e.target.value })
                      }
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #D4CEC5',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                    <div
                      style={{
                        width: 42,
                        height: 40,
                        borderRadius: 6,
                        backgroundColor: editingSwatch.hex,
                        border: '1px solid #D4CEC5',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#3D3833',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editingSwatch.isCore}
                      onChange={(e) =>
                        setEditingSwatch({ ...editingSwatch, isCore: e.target.checked })
                      }
                      style={{ cursor: 'pointer' }}
                    />
                    Core Swatch (Featured in primary picker)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingSwatch(null)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: '1px solid #D4CEC5',
                      background: '#FFFFFF',
                      color: '#6B645C',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#FF6B53',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                      opacity: isSavingEdit ? 0.7 : 1,
                    }}
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Palettes Grid */}
        <div style={{ display: 'grid', gap: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#78716C' }}>
              Loading palettes from database...
            </div>
          ) : palettes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 48,
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E5E0D8',
                color: '#78716C',
              }}
            >
              No paint palettes found in database. Click Refresh to initialize default collections.
            </div>
          ) : (
            palettes.map((palette) => (
              <div
                key={palette._id || palette.slug || palette.name}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E0D8',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        margin: '0 0 4px',
                        color: '#1F1D1A',
                      }}
                    >
                      {palette.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#8A8278',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {palette.category || 'Collection'} · {(palette.swatches || []).length} Swatches
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#6B645C',
                      background: '#F5F2EC',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    Slug: <code>{palette.slug}</code>
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: 14,
                  }}
                >
                  {(palette.swatches || []).map((swatch) => {
                    const deleteKey = `${palette._id || palette.slug}-${swatch.id}`;
                    const isDeleting = deletingId === deleteKey;

                    return (
                      <div
                        key={swatch.id || swatch.name}
                        style={{
                          border: '1px solid #EAE6DF',
                          borderRadius: 10,
                          padding: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          background: '#FAF8F5',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              backgroundColor: swatch.hex,
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#1F1D1A',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                              }}
                              title={swatch.name}
                            >
                              {swatch.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: '#6B645C',
                              }}
                            >
                              {swatch.hex.toUpperCase()}
                            </div>
                            {swatch.isCore && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: 10,
                                  color: '#FF6B53',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  marginTop: 2,
                                }}
                              >
                                Core Swatch
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Action Controls: Edit & Delete */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 6,
                            borderTop: '1px solid #EDE8E1',
                            paddingTop: 8,
                            marginTop: 2,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(palette, swatch)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #D4CEC5',
                              borderRadius: 6,
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#3D3833',
                            }}
                            title={`Edit ${swatch.name}`}
                          >
                            <Edit2 size={12} /> Edit
                          </button>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteSwatch(palette, swatch)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #FCA5A5',
                              borderRadius: 6,
                              padding: '5px 8px',
                              cursor: isDeleting ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#DC2626',
                              opacity: isDeleting ? 0.6 : 1,
                            }}
                            title={`Delete ${swatch.name}`}
                          >
                            <Trash2 size={12} /> {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
