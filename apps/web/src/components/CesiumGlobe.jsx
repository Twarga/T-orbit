import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';

const CesiumGlobe = ({ satellites = [], onSatelliteSelect, focusedSatelliteId }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const entitiesRef = useRef(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (viewerRef.current) return;

    const initViewer = async () => {
      try {
        const terrainProvider = await Cesium.createWorldTerrainAsync();
        
        const viewer = new Cesium.Viewer(containerRef.current, {
          terrainProvider,
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
          creditsContainer: document.createElement('div'),
          shouldAnimate: true,
        });

        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.clock.multiplier = 1;
        viewer.clock.shouldAnimate = true;

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883, 20000000),
        });

        viewerRef.current = viewer;
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize Cesium:', err);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isLoaded) return;

    entitiesRef.current.forEach((entity, id) => {
      if (!satellites.find(s => s.norad_id === id)) {
        viewer.entities.remove(entity);
        entitiesRef.current.delete(id);
      }
    });

    satellites.forEach((sat) => {
      let entity = entitiesRef.current.get(sat.norad_id);

      if (!entity) {
        entity = viewer.entities.add({
          id: String(sat.norad_id),
          name: sat.name || `SAT-${sat.norad_id}`,
          position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
          point: {
            pixelSize: sat.norad_id === 25544 ? 10 : 5,
            color: sat.norad_id === 25544 
              ? Cesium.Color.fromCssColorString('#ff4444')
              : Cesium.Color.fromCssColorString('#00d4ff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
          },
          label: {
            text: sat.name?.substring(0, 15) || `SAT-${sat.norad_id}`,
            font: '12px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000000),
          },
        });
        entitiesRef.current.set(sat.norad_id, entity);

        entity.description = JSON.stringify({
          noradId: sat.norad_id,
          name: sat.name,
          line1: sat.line1,
          line2: sat.line2,
        });
      }

      if (sat.position) {
        entity.position = Cesium.Cartesian3.fromDegrees(
          sat.position.longitude,
          sat.position.latitude,
          sat.position.altitude * 1000
        );
      }
    });
  }, [satellites, isLoaded]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !focusedSatelliteId || !isLoaded) return;

    const entity = viewer.entities.getById(String(focusedSatelliteId));
    if (entity && entity.position) {
      const pos = entity.position.getValue(viewer.clock.currentTime);
      if (pos) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromRadians(
            pos.longitude,
            pos.latitude,
            5000000
          ),
          duration: 1.5,
        });
      }
    }
  }, [focusedSatelliteId, isLoaded]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
};

export default CesiumGlobe;
