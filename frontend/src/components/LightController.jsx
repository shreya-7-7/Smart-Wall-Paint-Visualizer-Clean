import React from 'react';

const LightController = ({ rotation, setRotation }) => {
  const handleRotation = (e) => {
    setRotation(e.target.value);
  };

  return (
    <div style={{ 
      background: '#1a1a1a', padding: '25px', borderRadius: '24px', 
      color: '#fff', textAlign: 'center', width: '280px' 
    }}>
      <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '500' }}>Light Rotation</h4>
      
      {/* Circular Dial UI Logic */}
      <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
        <svg width="150" height="150" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="2" />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="3" 
            strokeDasharray="283" strokeDashoffset={283 - (rotation / 360) * 283}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <input 
          type="range" min="0" max="360" value={rotation} onChange={handleRotation}
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '130px', accentColor: '#a855f7', cursor: 'pointer'
          }}
        />
        <div style={{ marginTop: '10px', color: '#a855f7', fontWeight: 'bold' }}>{rotation}°</div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'left', fontSize: '14px' }}>
        <div style={{ padding: '10px 0', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
          <span>🟣 Light 1</span> <span>›</span>
        </div>
        <div style={{ padding: '10px 0', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
          <span>🟡 Light 2</span> <span>›</span>
        </div>
      </div>
    </div>
  );
};

export default LightController;