import { useEffect, useRef, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import * as satellite from 'satellite.js';

// Set Cesium base URL for assets
window.CESIUM_BASE_URL = '/cesium';

const CesiumGlobe = ({ satellites = [], onSatelliteSelect, focusedSatelliteId, showTrails = true }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const entitiesRef = useRef(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Initialize viewer once
  useEffect(() => {
    if (viewerRef.current || !containerRef.current) return;

    let viewer = null;
    let isCancelled = false;

    const initViewer = async () => {
      try {
        console.log('Initializing Cesium viewer...');
        
        // Create viewer without terrain first
        viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          vrButton: false,
          shouldAnimate: true,
          // Use default imagery provider
          imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
        });

        // Hide credits
        viewer.cesiumWidget.creditContainer.style.display = 'none';
        
        // Configure scene
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = false;
        
        // Set clock
        viewer.clock.multiplier = 1;
        viewer.clock.shouldAnimate = true;

        // Initial camera view
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883, 20000000),
        });

        // Try to add terrain asynchronously
        try {
          console.log('Loading terrain...');
          const terrainProvider = await Cesium.createWorldTerrainAsync();
          if (!isCancelled) {
            viewer.terrainProvider = terrainProvider;
            console.log('Terrain loaded successfully');
          }
        } catch (terrainErr) {
          console.warn('Terrain loading failed, using default ellipsoid:', terrainErr.message);
          // Continue without terrain - ellipsoid is fine for satellite visualization
        }

        if (!isCancelled) {
          viewerRef.current = viewer;
          setIsLoaded(true);
          console.log('Cesium viewer initialized');
        }
      } catch (err) {
        console.error('Failed to initialize Cesium:', err);
        if (!isCancelled) {
          setError(err.message);
        }
      }
    };

    initViewer();

    return () => {
      isCancelled = true;
      if (viewerRef.current) {
        console.log('Destroying Cesium viewer...');
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Compute orbital path for trails
  const computeOrbitalPath = useCallback((line1, line2, now) => {
    const positions = [];
    const orbitDuration = 90 * 60 * 1000; // 90 minutes
    const step = 60 * 1000; // 1 minute steps

    try {
      const satrec = satellite.twoline2satrec(line1, line2);
      if (!satrec) return positions;

      for (let t = -orbitDuration / 2; t <= orbitDuration / 2; t += step) {
        const time = new Date(now.getTime() + t);
        const position = satellite.propagate(satrec, time);
        
        if (position?.position) {
          const gmst = satellite.gstime(time);
          const positionEci = satellite.ecfToEci(position.position, gmst);
          const location = satellite.eciToGeodetic(positionEci, gmst);

          if (location && location.longitude && location.latitude) {
            const lon = satellite.degreesLong(location.longitude);
            const lat = satellite.degreesLat(location.latitude);
            const alt = location.height / 1000;
            
            // Only add valid positions
            if (typeof lon === 'number' && typeof lat === 'number' && 
                !isNaN(lon) && !isNaN(lat) && isFinite(alt)) {
              positions.push({ lon, lat, alt });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error computing orbital path:', err);
    }
    
    return positions;
  }, []);

  // Update satellite entities
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isLoaded) return;

    // Remove satellites that are no longer in the list
    entitiesRef.current.forEach((entity, id) => {
      if (!satellites.find(s => s.norad_id === id)) {
        if (entity.point) viewer.entities.remove(entity.point);
        if (entity.trail) viewer.entities.remove(entity.trail);
        if (entity.label) viewer.entities.remove(entity.label);
        entitiesRef.current.delete(id);
      }
    });

    const now = new Date();

    // Add/update satellites
    satellites.forEach((sat) => {
      let entity = entitiesRef.current.get(sat.norad_id);

      if (!entity) {
        const isIss = sat.norad_id === 25544;
        
        // Create point entity
        const point = viewer.entities.add({
          id: `point-${sat.norad_id}`,
          position: Cesium.Cartesian3.fromDegrees(0, 0, 7000000),
          point: {
            pixelSize: isIss ? 12 : 6,
            color: isIss 
              ? Cesium.Color.fromCssColorString('#ff4444')
              : Cesium.Color.fromCssColorString('#00d4ff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: isIss ? 2 : 1,
            scaleByDistance: new Cesium.NearFarScalar(1e7, 1.5, 5e7, 0.5),
          },
        });

        // Create label entity
        const label = viewer.entities.add({
          id: `label-${sat.norad_id}`,
          position: Cesium.Cartesian3.fromDegrees(0, 0, 7000000),
          label: {
            text: sat.name?.substring(0, 12) || `SAT-${sat.norad_id}`,
            font: isIss ? 'bold 14px sans-serif' : '11px sans-serif',
            fillColor: isIss ? Cesium.Color.fromCssColorString('#ff6666') : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15),
            translucencyByDistance: new Cesium.NearFarScalar(1e7, 1.0, 3e7, 0.0),
          },
        });

        // Create trail entity
        let trail = null;
        if (showTrails && sat.line1 && sat.line2) {
          const orbitPositions = computeOrbitalPath(sat.line1, sat.line2, now);
          // Filter out invalid positions (NaN, undefined, out of range)
          const validPositions = orbitPositions.filter(pos => 
            pos && 
            typeof pos.lon === 'number' && 
            typeof pos.lat === 'number' && 
            !isNaN(pos.lon) && 
            !isNaN(pos.lat) &&
            pos.lon >= -180 && pos.lon <= 180 &&
            pos.lat >= -90 && pos.lat <= 90
          );
          
          if (validPositions.length > 2) {
            const cartesianPositions = validPositions.map(pos => 
              Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, (pos.alt || 400) * 1000)
            );
            
            trail = viewer.entities.add({
              id: `trail-${sat.norad_id}`,
              polyline: {
                positions: cartesianPositions,
                width: isIss ? 2 : 1,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.15,
                  color: isIss 
                    ? Cesium.Color.fromCssColorString('#ff4444').withAlpha(0.6)
                    : Cesium.Color.fromCssColorString('#00d4ff').withAlpha(0.4),
                }),
              },
            });
          }
        }

        entitiesRef.current.set(sat.norad_id, { point, label, trail });
      }

      // Update positions
      const entityData = entitiesRef.current.get(sat.norad_id);
      if (sat.position && entityData && 
          sat.position.longitude != null && sat.position.latitude != null &&
          !isNaN(sat.position.longitude) && !isNaN(sat.position.latitude)) {
        const pos = Cesium.Cartesian3.fromDegrees(
          sat.position.longitude,
          sat.position.latitude,
          (sat.position.altitude || 400) * 1000
        );
        entityData.point.position = pos;
        entityData.label.position = pos;
      }
    });
  }, [satellites, isLoaded, showTrails, computeOrbitalPath]);

  // Handle focused satellite
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !focusedSatelliteId || !isLoaded) return;

    const focusOnSatellite = () => {
      const entityData = entitiesRef.current.get(focusedSatelliteId);
      if (entityData?.point) {
        const position = entityData.point.position.getValue(viewer.clock.currentTime);
        if (position) {
          const cartographic = Cesium.Cartographic.fromCartesian(position);
          if (cartographic && !isNaN(cartographic.longitude) && !isNaN(cartographic.latitude)) {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                3000000
              ),
              duration: 2.0,
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-90),
                roll: 0.0,
              },
            });
            return true;
          }
        }
      }
      return false;
    };

    // Try immediately
    if (!focusOnSatellite()) {
      // Retry after a short delay (position might not be set yet)
      const retry = setTimeout(focusOnSatellite, 500);
      return () => clearTimeout(retry);
    }
  }, [focusedSatelliteId, isLoaded]);

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a14',
        color: '#ff4444',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <p>Failed to load 3D Globe</p>
        <p style={{ fontSize: '0.8rem', color: '#71717a' }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        background: '#000',
      }}
    />
  );
};

export default CesiumGlobe;
