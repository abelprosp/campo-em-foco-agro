
import { useMemo, useState } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, FullscreenControl } from 'react-map-gl';
import { Plot } from './api';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PlotsMapProps {
  plots: Plot[];
}

export const PlotsMap = ({ plots }: PlotsMapProps) => {
  const [popupInfo, setPopupInfo] = useState<{ longitude: number; latitude: number; name: string } | null>(null);
  const mapboxToken = "pk.eyJ1IjoiYWJlbG9hczEyIiwiYSI6ImNseDZwMjdxNTFsZjAyaXBzc3Z3M215NnkifQ.MsWtBRSRh8xuNK_XX2Vs0A";

  const geojsonPlots = useMemo(() => ({
    type: 'FeatureCollection',
    features: plots
      .filter(plot => plot.geometry)
      .map(plot => ({
        type: 'Feature',
        geometry: plot.geometry as any,
        properties: { id: plot.id, name: plot.name },
      })),
  }), [plots]);

  const initialViewState = useMemo(() => {
    if (plots.length === 1 && plots[0].geometry) {
        const geometry = plots[0].geometry as any;
        if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates[0].length > 0) {
             const coords = geometry.coordinates[0];
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
    }
    return {
        longitude: -49.25,
        latitude: -18.5,
        zoom: 4,
    };
  }, [plots]);

  const onMapClick = (event: any) => {
    const features = event.target.queryRenderedFeatures(event.point, { layers: ['plots-fill'] });
    if (features.length > 0) {
      const [feature] = features;
      setPopupInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        name: feature.properties.name,
      });
    } else {
      setPopupInfo(null);
    }
  };

  return (
    <div className="h-[450px] w-full rounded-md border overflow-hidden relative">
      <Map
        key={JSON.stringify(initialViewState)}
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        onClick={onMapClick}
        interactiveLayerIds={['plots-fill']}
      >
        <FullscreenControl />
        <NavigationControl />
        <Source id="plots-data" type="geojson" data={geojsonPlots as any}>
          <Layer
            id="plots-fill"
            type="fill"
            paint={{ 'fill-color': '#088', 'fill-opacity': 0.4 }}
          />
          <Layer
            id="plots-outline"
            type="line"
            paint={{ 'line-color': '#088', 'line-width': 2 }}
          />
        </Source>
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            offset={10}
            className="font-sans"
          >
            {popupInfo.name}
          </Popup>
        )}
      </Map>
    </div>
  );
};
