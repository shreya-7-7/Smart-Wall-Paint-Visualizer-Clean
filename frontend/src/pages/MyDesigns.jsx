import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import {
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Palette,
  Paintbrush,
  Layers,
} from 'lucide-react';
import './Dashboard.css';

const MyDesigns = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const fetchDesigns = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const res = await API.get('/paint/designs');
        setDesigns(res.data?.designs || []);
      } catch (err) {
        console.error('Error fetching saved paint designs:', err);
        showToast('Could not load your saved makeovers', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [navigate]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ show: false, id: null });

    try {
      await API.delete(`/paint/designs/${id}`);
      setDesigns((prev) => prev.filter((d) => (d._id || d.id) !== id));
      showToast('Paint design removed successfully', 'success');
    } catch (err) {
      console.error('Error deleting paint design:', err);
      showToast('Failed to delete design', 'error');
    }
  };

  return (
    <div className="db-page">
      <Navbar />
      <div className="db-content">
        <header className="db-section-header" style={{ marginBottom: '10px' }}>
          <div>
            <h1 className="db-hero-title" style={{ color: '#1e293b', fontSize: '32px' }}>
              My Saved Designs
            </h1>
            <p className="db-hero-sub" style={{ color: '#64748b', fontSize: '15px' }}>
              Manage and continue working on your wall paint makeovers.
            </p>
          </div>
          <button
            className="db-hero-btn"
            onClick={() => navigate('/paint-visualizer')}
            style={{
              background: '#E8654F',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(232, 101, 79, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Paintbrush size={16} /> + Open Paint Studio
          </button>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#E8654F', fontWeight: '500' }}>
            <div className="loading-spinner"></div>
            Loading your saved paint makeovers...
          </div>
        ) : designs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '72px 24px',
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px dashed #E2E8F0',
              maxWidth: '560px',
              margin: '32px auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#FFF5F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                color: '#E8654F',
              }}
            >
              <Palette size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
              No Saved Paint Makeovers Yet
            </h3>
            <p
              style={{
                color: '#64748B',
                fontSize: '14.5px',
                lineHeight: '1.6',
                marginBottom: '26px',
                maxWidth: '420px',
                margin: '0 auto 26px',
              }}
            >
              You haven't saved any room color designs yet. Open Paint Studio to start experimenting
              with realistic paint colors on your walls.
            </p>
            <button
              onClick={() => navigate('/paint-visualizer')}
              style={{
                background: '#E8654F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 26px',
                fontSize: '14.5px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(232, 101, 79, 0.3)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Paintbrush size={17} /> Open Paint Studio
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 340px))',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {designs.map((design) => {
              const designId = design._id || design.id;
              const wallCount = Array.isArray(design.walls) ? design.walls.length : 0;
              const primaryHex = design.primaryColor || (design.walls?.[0]?.color) || '#E8654F';
              const colorName = design.primaryColorName || (design.walls?.[0]?.colorName) || 'Selected Color';
              const finishLabel = design.finish || (design.walls?.[0]?.finish) || 'realistic';
              const previewImg = design.thumbnail || design.roomImage || '/assets/images/hero-living-room.jpg';

              return (
                <div
                  key={designId}
                  className="db-design-card"
                  onClick={() => navigate(`/paint-visualizer?id=${designId}`)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div
                    className="db-design-img-wrap"
                    style={{
                      height: '210px',
                      background: '#F1F5F9',
                      borderBottom: '1px solid #F3EDE6',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={previewImg}
                      alt={design.name || 'Paint Makeover'}
                      className="db-design-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/hero-living-room.jpg';
                      }}
                    />
                    <div
                      className="db-design-tag"
                      style={{
                        background: 'rgba(232, 101, 79, 0.92)',
                        color: '#FFFFFF',
                        border: 'none',
                        textTransform: 'capitalize',
                        fontWeight: '600',
                      }}
                    >
                      {finishLabel} Finish
                    </div>
                  </div>

                  <div className="db-design-body" style={{ padding: '18px 20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <h3
                        className="db-design-title"
                        style={{ fontSize: '17px', fontWeight: '700', color: '#1E293B' }}
                        title={design.name}
                      >
                        {design.name || 'Untitled Makeover'}
                      </h3>
                      <button
                        onClick={(e) => handleDelete(designId, e)}
                        className="delete-btn-hover"
                        style={{
                          color: '#9CA3AF',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                        }}
                        title="Delete Makeover"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    {/* Color Swatch & Wall Count Meta */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '12.5px',
                        color: '#475569',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '13px',
                            height: '13px',
                            borderRadius: '50%',
                            backgroundColor: primaryHex,
                            display: 'inline-block',
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                          }}
                        />
                        <span style={{ fontWeight: '500' }}>{colorName}</span>
                      </span>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={13} style={{ color: '#94A3B8' }} />
                        <span>
                          {wallCount} {wallCount === 1 ? 'Wall' : 'Walls'}
                        </span>
                      </span>
                    </div>

                    <div
                      className="db-design-meta"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}
                    >
                      <Calendar size={13} />
                      <span>
                        Edited on {new Date(design.updatedAt || design.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      className="db-btn-outline"
                      style={{
                        width: '100%',
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        borderRadius: '12px',
                        borderColor: '#E2E8F0',
                        color: '#1E293B',
                        fontWeight: '600',
                        padding: '10px',
                      }}
                    >
                      <Paintbrush size={15} style={{ color: '#E8654F' }} /> Continue in Studio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {deleteModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '24px',
              width: '400px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              animation: 'modalSlide 0.3s ease-out',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                background: '#FEF2F2',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>
              Delete Paint Makeover?
            </h3>
            <p style={{ margin: '0 0 28px', color: '#6B7280', fontSize: '15px', lineHeight: '1.6' }}>
              This action cannot be undone. You will lose your wall outlines, color selections, and room
              makeovers for this design.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal({ show: false, id: null })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#EF4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM TOAST NOTIFICATION */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10000,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            animation: 'toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: '600', fontSize: '14px' }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default MyDesigns;
