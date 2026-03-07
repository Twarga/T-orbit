import { useState, useEffect } from 'react';

const SolarNavigator = () => {
  const [bodies, setBodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBody, setSelectedBody] = useState(null);

  // Mock planet data (AU from Sun, approximate)
  const mockBodies = [
    { code: 'SUN', name: 'Sun', category: 'star', distance: 0, color: '#FDB813' },
    { code: 'MERCURY', name: 'Mercury', category: 'planet', distance: 0.39, color: '#B5B5B5' },
    { code: 'VENUS', name: 'Venus', category: 'planet', distance: 0.72, color: '#E6C87A' },
    { code: 'EARTH', name: 'Earth', category: 'planet', distance: 1.0, color: '#6B93D6' },
    { code: 'MARS', name: 'Mars', category: 'planet', distance: 1.52, color: '#C1440E' },
    { code: 'JUPITER', name: 'Jupiter', category: 'planet', distance: 5.20, color: '#D8CA9D' },
    { code: 'SATURN', name: 'Saturn', category: 'planet', distance: 9.58, color: '#F4D59E' },
    { code: 'URANUS', name: 'Uranus', category: 'planet', distance: 19.2, color: '#D1F3F6' },
    { code: 'NEPTUNE', name: 'Neptune', category: 'planet', distance: 30.1, color: '#5B5DDF' },
    { code: 'MOON', name: 'Moon', category: 'moon', distance: 0.0026, color: '#C0C0C0' },
  ];

  useEffect(() => {
    // Fetch real data from API
    fetch('http://localhost:3000/api/solar/bodies')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setBodies(data.data.map(b => ({
            ...b,
            distance: mockBodies.find(m => m.code === b.body_code)?.distance || 0,
            color: mockBodies.find(m => m.code === b.body_code)?.color || '#fff',
          })));
        } else {
          setBodies(mockBodies);
        }
        setLoading(false);
      })
      .catch(() => {
        setBodies(mockBodies);
        setLoading(false);
      });
  }, []);

  const earthDistance = mockBodies.find(b => b.code === 'EARTH')?.distance || 1;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🪐 Solar System</h3>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <div style={styles.content}>
          {/* Planet visualization */}
          <div style={styles.orbits}>
            {bodies.filter(b => b.category === 'planet' || b.code === 'SUN').map(body => (
              <div
                key={body.code}
                onClick={() => setSelectedBody(body)}
                style={{
                  ...styles.planet,
                  backgroundColor: body.color,
                  width: body.code === 'SUN' ? 40 : 12,
                  height: body.code === 'SUN' ? 40 : 12,
                  left: body.distance * 20 + 50,
                }}
              />
            ))}
          </div>

          {/* Planet list */}
          <div style={styles.planetList}>
            {bodies.map(body => {
              const auDistance = body.code === 'MOON' 
                ? '384,400 km' 
                : body.code === 'SUN'
                ? '0'
                : `${body.distance} AU`;
              
              return (
                <div
                  key={body.code}
                  onClick={() => setSelectedBody(body)}
                  style={{
                    ...styles.planetItem,
                    ...(selectedBody?.code === body.code ? styles.planetItemActive : {}),
                  }}
                >
                  <div style={{...styles.planetDot, backgroundColor: body.color}} />
                  <span style={styles.planetName}>{body.name}</span>
                  <span style={styles.planetDistance}>{auDistance}</span>
                </div>
              );
            })}
          </div>

          {/* Selected body info */}
          {selectedBody && (
            <div style={styles.infoPanel}>
              <h4 style={styles.infoTitle}>{selectedBody.name}</h4>
              <p style={styles.infoText}>
                Distance from Sun: {selectedBody.code === 'MOON' ? 'Same as Earth' : `${selectedBody.distance} AU`}
              </p>
              <p style={styles.infoText}>
                Distance from Earth: {
                  selectedBody.code === 'EARTH' ? '0' :
                  selectedBody.code === 'MOON' ? '384,400 km' :
                  selectedBody.code === 'SUN' ? '1 AU (149.6M km)' :
                  `${Math.abs(selectedBody.distance - earthDistance).toFixed(2)} AU`
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem',
    background: 'rgba(10, 10, 20, 0.95)',
    minHeight: '100%',
  },
  header: {
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#fff',
  },
  loading: {
    color: '#a1a1aa',
    textAlign: 'center',
    padding: '2rem',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  orbits: {
    position: 'relative',
    height: '100px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  planet: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  planetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  planetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  planetItemActive: {
    background: 'rgba(59, 130, 246, 0.2)',
  },
  planetDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  planetName: {
    flex: 1,
    color: '#fff',
    fontSize: '0.9rem',
  },
  planetDistance: {
    color: '#71717a',
    fontSize: '0.8rem',
  },
  infoPanel: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  infoTitle: {
    margin: '0 0 0.5rem 0',
    color: '#fff',
    fontSize: '1rem',
  },
  infoText: {
    margin: '0.25rem 0',
    color: '#a1a1aa',
    fontSize: '0.85rem',
  },
};

export default SolarNavigator;
