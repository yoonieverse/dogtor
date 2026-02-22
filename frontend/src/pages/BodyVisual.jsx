import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SKIN = '#F4C2A1';
const SELECTED = '#ff6b6b';
const BORDER = '2px solid #c8956a';
const BORDER_SELECTED = '2px solid #cc0000';

export default function BodyVisual() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedParts, setSelectedParts] = useState([]);

  // Save prescreening data from location state if available
  const prescreeningData = location.state?.prescreeningData;
  if (prescreeningData) {
    sessionStorage.setItem('prescreeningData', JSON.stringify(prescreeningData));
  }

  const toggle = (id) =>
    setSelectedParts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );

  const sel = (id) => selectedParts.includes(id);

  const block = (id, style) => ({
    position: 'absolute',
    cursor: 'pointer',
    backgroundColor: sel(id) ? SELECTED : SKIN,
    border: sel(id) ? BORDER_SELECTED : BORDER,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    color: sel(id) ? '#fff' : '#5a3010',
    userSelect: 'none',
    transition: 'background-color 0.15s',
    boxShadow: sel(id) ? '0 0 6px rgba(204,0,0,0.4)' : '1px 1px 3px rgba(0,0,0,0.15)',
    lineHeight: '1.2',
    ...style,
  });

  const handleContinue = () => {
    sessionStorage.setItem('selectedBodyParts', JSON.stringify(selectedParts));
    navigate('/record');
  };

  const faceParts = [
    { id: 'eyes',  label: '👀 Eyes'  },
    { id: 'ears',  label: '👂 Ears'  },
    { id: 'nose',  label: '👃 Nose'  },
    { id: 'mouth', label: '👄 Mouth' },
  ];

  const labelMap = {
    head: 'Head', chest: 'Chest', tummy: 'Tummy',
    'left-arm': 'L. Arm', 'right-arm': 'R. Arm',
    'left-hand': 'L. Hand', 'right-hand': 'R. Hand',
    'left-leg': 'L. Leg', 'right-leg': 'R. Leg',
    'left-foot': 'L. Foot', 'right-foot': 'R. Foot',
    eyes: 'Eyes', ears: 'Ears', nose: 'Nose', mouth: 'Mouth',
  };

  const selectedLabels = selectedParts.map(p => labelMap[p] ?? p);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '6px' }}>
        Where is your ouchie? 🐶
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>
        Tap the body parts that hurt or feel funny
      </p>

      {/* ── Blocky figure ── */}
      <div style={{ position: 'relative', width: '220px', height: '330px', marginBottom: '16px' }}>

        {/* Head */}
        <div onClick={() => toggle('head')} style={block('head', { width: 80, height: 80, left: 70, top: 0 })}>
          Head
        </div>

        {/* Chest */}
        <div onClick={() => toggle('chest')} style={block('chest', { width: 100, height: 58, left: 60, top: 86 })}>
          Chest
        </div>

        {/* Tummy */}
        <div onClick={() => toggle('tummy')} style={block('tummy', { width: 100, height: 50, left: 60, top: 146 })}>
          Tummy
        </div>

        {/* Left Arm (from viewer's perspective: on the right side of screen) */}
        <div onClick={() => toggle('left-arm')} style={block('left-arm', { width: 34, height: 90, left: 163, top: 86 })}>
          L. Arm
        </div>

        {/* Right Arm */}
        <div onClick={() => toggle('right-arm')} style={block('right-arm', { width: 34, height: 90, left: 23, top: 86 })}>
          R. Arm
        </div>

        {/* Left Hand */}
        <div onClick={() => toggle('left-hand')} style={block('left-hand', { width: 32, height: 30, left: 164, top: 179 })}>
          L. Hand
        </div>

        {/* Right Hand */}
        <div onClick={() => toggle('right-hand')} style={block('right-hand', { width: 32, height: 30, left: 24, top: 179 })}>
          R. Hand
        </div>

        {/* Left Leg */}
        <div onClick={() => toggle('left-leg')} style={block('left-leg', { width: 44, height: 88, left: 116, top: 198 })}>
          L. Leg
        </div>

        {/* Right Leg */}
        <div onClick={() => toggle('right-leg')} style={block('right-leg', { width: 44, height: 88, left: 60, top: 198 })}>
          R. Leg
        </div>

        {/* Left Foot */}
        <div onClick={() => toggle('left-foot')} style={block('left-foot', { width: 52, height: 24, left: 116, top: 288 })}>
          L. Foot
        </div>

        {/* Right Foot */}
        <div onClick={() => toggle('right-foot')} style={block('right-foot', { width: 52, height: 24, left: 52, top: 288 })}>
          R. Foot
        </div>

        {/* L / R labels */}
        <span style={{ position: 'absolute', left: 148, top: 72, fontSize: '10px', color: '#999' }}>L</span>
        <span style={{ position: 'absolute', left: 62, top: 72, fontSize: '10px', color: '#999' }}>R</span>
      </div>

      {/* ── Face parts row ── */}
      <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Face</p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {faceParts.map(({ id, label }) => (
          <div
            key={id}
            onClick={() => toggle(id)}
            style={{
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
              border: sel(id) ? BORDER_SELECTED : BORDER,
              backgroundColor: sel(id) ? SELECTED : SKIN,
              color: sel(id) ? '#fff' : '#5a3010',
              fontWeight: 'bold',
              fontSize: '12px',
              userSelect: 'none',
              boxShadow: sel(id) ? '0 0 6px rgba(204,0,0,0.4)' : '1px 1px 3px rgba(0,0,0,0.15)',
              transition: 'background-color 0.15s',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Selected summary ── */}
      {selectedParts.length > 0 && (
        <p style={{ textAlign: 'center', marginBottom: '16px', color: '#cc0000', fontWeight: 'bold' }}>
          Selected: {selectedLabels.join(', ')}
        </p>
      )}

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
        <button onClick={() => navigate('/prescreen')} style={{ flex: 1 }}>
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedParts.length === 0}
          style={{ flex: 1 }}
        >
          Talk to Dog-tor →
        </button>
      </div>
    </div>
  );
}
