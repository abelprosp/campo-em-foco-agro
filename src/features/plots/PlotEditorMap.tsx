import { useState, useRef, useEffect } from 'react';
import Map from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface PlotEditorMapProps {
  initialGeometry: any;
  onGeometryChange: (geometry: any) => void;
}

const DrawControl = (props: any) => {
  const drawRef = useRef<MapboxDraw | null>(null);

  useEffect(() => {
    if (!props.map) return;
    
    const map = props.map.getMap();
    if (map && !drawRef.current) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        userProperties: true,
      });
      drawRef.current = draw;
      map.addControl(draw);

      if (props.initialGeometry) {
        draw.add({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: props.initialGeometry,
          }],
        });
      }

      const updateArea = (e: any) => {
        const features = e.features;
        if (features.length > 0) {
          const feature = features[0];
          // Only one polygon at a time
          const allFeatures = draw.getAll();
          if (allFeatures.features.length > 1) {
            const featuresToDelete = allFeatures.features.filter(f => f.id !== feature.id);
            draw.delete(featuresToDelete.map(f => String(f.id)));
          }
          props.onGeometryChange(feature.geometry);
        } else {
          props.onGeometryChange(null);
        }
      };
      
      const clearArea = () => {
         props.onGeometryChange(null);
      }

      map.on('draw.create', updateArea);
      map.on('draw.update', updateArea);
      map.on('draw.delete', clearArea);

      return () => {
        map.off('draw.create', updateArea);
        map.off('draw.update', updateArea);
        map.off('draw.delete', clearArea);
        if (drawRef.current && map.hasControl(drawRef.current)) {
           map.removeControl(drawRef.current);
        }
        drawRef.current = null;
      };
    }
  }, [props.map, props.initialGeometry, props.onGeometryChange]);
  
  return null;
};

const GeocoderControl = (props: { mapboxAccessToken: string, map: any }) => {
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    if (!props.map) return;
    
    const map = props.map.getMap();
    if (map && !geocoderRef.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: props.mapboxAccessToken,
        marker: false,
        placeholder: 'Pesquisar localização',
      });
      geocoderRef.current = geocoder;
      map.addControl(geocoder);

      return () => {
        if (geocoderRef.current && map.hasControl(geocoderRef.current)) {
           map.removeControl(geocoderRef.current);
        }
        geocoderRef.current = null;
      };
    }
  }, [props.map, props.mapboxAccessToken]);
  
  return null;
};

export const PlotEditorMap = ({ initialGeometry, onGeometryChange }: PlotEditorMapProps) => {
  const [map, setMap] = useState<any>(null);
  const mapboxToken = "pk.eyJ1IjoiYWJlbG9hczEyIiwiYSI6ImNseDZwMjdxNTFsZjAyaXBzc3Z3M215NnkifQ.MsWtBRSRh8xuNK_XX2Vs0A";

  const getInitialViewState = () => {
    if (initialGeometry && initialGeometry.coordinates) {
      // A simple way to find the center. Not perfect for complex polygons.
      const coords = initialGeometry.coordinates[0];
      const lngs = coords.map((c: any) => c[0]);
      const lats = coords.map((c: any) => c[1]);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      return {
        longitude: (minLng + maxLng) / 2,
        latitude: (minLat + maxLat) / 2,
        zoom: 14,
      };
    }
    return { longitude: -49.25, latitude: -18.5, zoom: 4 };
  };

  return (
    <div className="h-64 w-full rounded-md border overflow-hidden">
      <Map
        ref={c => setMap(c)}
        mapboxAccessToken={mapboxToken}
        initialViewState={getInitialViewState()}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      >
        <GeocoderControl mapboxAccessToken={mapboxToken} map={map} />
        <DrawControl
          map={map}
          initialGeometry={initialGeometry}
          onGeometryChange={onGeometryChange}
        />
      </Map>
    </div>
  );
};
