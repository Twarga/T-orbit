import * as satellite from 'satellite.js';

self.onmessage = function(e) {
  const { type, satellites, time } = e.data;
  
  if (type === 'PROPAGATE') {
    const results = satellites.map(sat => {
      if (!sat.line1 || !sat.line2) {
        return { norad_id: sat.norad_id, position: null };
      }
      
      try {
        const satrec = satellite.twoline2satrec(sat.line1, sat.line2);
        if (!satrec) {
          return { norad_id: sat.norad_id, position: null };
        }
        
        const positionAndVelocity = satellite.propagate(satrec, time);
        
        if (!positionAndVelocity?.position) {
          return { norad_id: sat.norad_id, position: null };
        }
        
        const gmst = satellite.gstime(time);
        const positionEci = satellite.ecfToEci(positionAndVelocity.position, gmst);
        const position = satellite.eciToGeodetic(positionEci, gmst);
        
        if (!position || !position.latitude || !position.longitude) {
          return { norad_id: sat.norad_id, position: null };
        }
        
        const lat = satellite.degreesLat(position.latitude);
        const lon = satellite.degreesLong(position.longitude);
        const alt = position.height / 1000;
        
        if (isNaN(lat) || isNaN(lon) || isNaN(alt)) {
          return { norad_id: sat.norad_id, position: null };
        }
        
        return {
          norad_id: sat.norad_id,
          position: {
            latitude: lat,
            longitude: lon,
            altitude: alt,
          },
        };
      } catch (err) {
        return { norad_id: sat.norad_id, position: null };
      }
    });
    
    self.postMessage({ type: 'POSITIONS', positions: results });
  }
};
