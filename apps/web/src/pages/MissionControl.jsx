import { useState, useEffect, useCallback } from 'react';
import * as satellite from 'satellite.js';
import CesiumGlobe from '../components/CesiumGlobe';

const MissionControl = () => {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSat, setSelectedSat] = useState(null);
  const [focusedSatId, setFocusedSatId] = useState(null);

  const fetchSatellites = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/satellites/active');
      if (!res.ok) throw new Error('Failed to fetch satellites');
      const data = await res.json();
      setSatellites(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSatellites();
    const interval = setInterval(fetchSatellites, 60000);
    return () => clearInterval(interval);
  }, [fetchSatellites]);

  useEffect(() => {
    if (satellites.length === 0) return;

    const propagate = (line1, line2, date) => {
      try {
        const satrec = satellite.twoline2satrec(line1, line2);
        if (!satrec) return null;

        const position = satellite.propagate(satrec, date);
        if (!position?.position) return null;

        const gmst = satellite.gstime(date);
        const positionEci = satellite.ecfToEci(position.position, gmst);
        const location = satellite.eciToGeodetic(positionEci, gmst);

        return {
          latitude: satellite.degreesLat(location.latitude),
          longitude: satellite.degreesLong(location.longitude),
          altitude: location.height / 1000,
        };
      } catch {
        return null;
      }
    };

    const updatePositions = () => {
      const now = new Date();
      const updated = satellites.map((sat) => {
        if (!sat.line1 || !sat.line2) return sat;
        const position = propagate(sat.line1, sat.line2, now);
        return { ...sat, position };
      });
      setSatellites(updated);
    };

    updatePositions();
    const interval = setInterval(updatePositions, 5000);
    return () => clearInterval(interval);
  }, [satellites.length]);

  const handleSatelliteSelect = (sat) => {
    setSelectedSat(sat);
  };

  const handleFocusSatellite = (sat) => {
    setFocusedSatId(sat.norad_id);
  };

  const iss = satellites.find(s => s.norad_id === 25544);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading satellite data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchSatellites} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <CesiumGlobe
        satellites={satellites}
        onSatelliteSelect={handleSatelliteSelect}
        focusedSatelliteId={focusedSatId}
      />

      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🛰️</span>
          Cosmic Watch
        </div>
        <div style={styles.stats}>
          <span>Active Satellites: {satellites.length}</span>
        </div>
      </div>

      {iss && (
        <div style={styles.issCard}>
          <div style={styles.issHeader}>
            <span style={styles.issIcon}>🔴</span>
            <span>ISS (ZARYA)</span>
            <span style={styles.issId}>NORAD {iss.norad_id}</span>
          </div>
          {iss.position && (
            <div style={styles.issData}>
              <div style={styles.issDataItem}>
                <span style={styles.issLabel}>LAT</span>
                <span>{iss.position.latitude.toFixed(4)}°</span>
              </div>
              <div style={styles.issDataItem}>
                <span style={styles.issLabel}>LON</span>
                <span>{iss.position.longitude.toFixed(4)}°</span>
              </div>
              <div style={styles.issDataItem}>
                <span style={styles.issLabel}>ALT</span>
                <span>{Math.round(iss.position.altitude)} km</span>
              </div>
            </div>
          )}
          <button
            onClick={() => handleFocusSatellite(iss)}
            style={styles.focusBtn}
          >
            Focus
          </button>
        </div>
      )}

      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3>Satellites</h3>
        </div>
        <div style={styles.satelliteList}>
          {satellites.slice(0, 100).map((sat) => (
            <div
              key={sat.norad_id}
              onClick={() => handleSatelliteSelect(sat)}
              style={{
                ...styles.satelliteItem,
                ...(selectedSat?.norad_id === sat.norad_id ? styles.satelliteItemSelected : {}),
              }}
            >
              <span style={styles.satName}>{sat.name?.substring(0, 20) || `SAT-${sat.norad_id}`}</span>
              <span style={styles.satId}>#{sat.norad_id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#000',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#00d4ff',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0, 212, 255, 0.3)',
    borderTopColor: '#00d4ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#ff4444',
    gap: '1rem',
  },
  retryBtn: {
    padding: '0.5rem 1rem',
    background: '#00d4ff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.25rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    fontSize: '1.5rem',
  },
  stats: {
    color: '#a1a1aa',
    fontSize: '0.9rem',
  },
  issCard: {
    position: 'absolute',
    top: '80px',
    left: '1rem',
    background: 'rgba(20, 20, 30, 0.95)',
    border: '1px solid rgba(255, 68, 68, 0.5)',
    borderRadius: '12px',
    padding: '1rem',
    minWidth: '200px',
    zIndex: 100,
  },
  issHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    fontWeight: 600,
    color: '#fff',
  },
  issIcon: {
    fontSize: '1rem',
  },
  issId: {
    color: '#71717a',
    fontSize: '0.8rem',
    marginLeft: 'auto',
  },
  issData: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  issDataItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  issLabel: {
    fontSize: '0.7rem',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  focusBtn: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255, 68, 68, 0.2)',
    border: '1px solid rgba(255, 68, 68, 0.5)',
    borderRadius: '6px',
    color: '#ff4444',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '280px',
    height: '100%',
    background: 'rgba(10, 10, 20, 0.9)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
  },
  sidebarHeader: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  satelliteList: {
    flex: 1,
    overflowY: 'auto',
  },
  satelliteItem: {
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.2s',
  },
  satelliteItemSelected: {
    background: 'rgba(0, 212, 255, 0.15)',
    borderLeft: '3px solid #00d4ff',
  },
  satName: {
    color: '#fff',
    fontSize: '0.85rem',
  },
  satId: {
    color: '#71717a',
    fontSize: '0.75rem',
  },
};

export default MissionControl;
