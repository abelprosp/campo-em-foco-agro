
import { Plot } from './api';

export const getPlotCenter = (plot: Plot): { latitude: number; longitude: number } | null => {
  if (!plot.geometry) {
    return null;
  }
  const geometry = plot.geometry as any;
  if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates.length > 0 && geometry.coordinates[0].length > 0) {
    const coords = geometry.coordinates[0];
    if (coords.length === 0) return null;
    const lngs = coords.map((c: any) => c[0]);
    const lats = coords.map((c: any) => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    return {
      longitude: (minLng + maxLng) / 2,
      latitude: (minLat + maxLat) / 2,
    };
  }
  return null;
};
