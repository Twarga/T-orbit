// MissionControl - Main app component
// This will be implemented in Sprint 5 (CW-043 to CW-054)

const MissionControl = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Mission Control
      </h1>
      <p style={{ color: '#a1a1aa' }}>
        Coming in Sprint 5 (CW-043 to CW-054)
      </p>
      <div style={{
        padding: '1rem 2rem',
        background: '#1a1a25',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <strong>Next Steps:</strong>
        <ul style={{ marginTop: '0.5rem', color: '#a1a1aa' }}>
          <li>CW-003: Initialize monorepo skeleton</li>
          <li>CW-043: Bootstrap React app shell</li>
          <li>CW-044: Integrate Cesium globe</li>
        </ul>
      </div>
    </div>
  );
};

export default MissionControl;
