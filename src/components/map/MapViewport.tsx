/**
 * NARASI - Interactive map viewport.
 *
 * MapLibre GL JS (dark CARTO basemap) + deck.gl MapboxOverlay (IMPLEMENTATION
 * MASTERPLAN §12). Owns the map lifecycle and a hover-tooltip surface.
 *
 * Layer builders (useCorridorLayers, useStopNodesLayer, ...) read the hover
 * context, so they must be rendered inside <MapHoverProvider>. Wrap the map
 * subtree of each view with it.
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { Layer, PickingInfo } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';

export const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const DEFAULT_CORRIDOR_VIEW: { center: [number, number]; zoom: number } = {
  center: [106.8205, -6.195],
  zoom: 12.1,
};

interface MapHoverValue {
  hover: PickingInfo | null;
  setHover: (info: PickingInfo | null) => void;
}

const MapHoverContext = createContext<MapHoverValue>({
  hover: null,
  setHover: () => {},
});

/** Provides the shared hover state; wrap map subtrees that build layers. */
export function MapHoverProvider({ children }: { children: ReactNode }) {
  const [hover, setHover] = useState<PickingInfo | null>(null);
  return (
    <MapHoverContext.Provider value={{ hover, setHover }}>
      {children}
    </MapHoverContext.Provider>
  );
}

/** Layer builders call this to surface hover tooltips on the map. */
export const useMapHover = () => useContext(MapHoverContext);

interface MapViewportProps {
  layers: Layer[];
  /** Renders the tooltip body for a picked object (null → no tooltip). */
  renderHoverContent?: (info: PickingInfo) => ReactNode;
  initialView?: { center: [number, number]; zoom: number };
  className?: string;
}

export function MapViewport({
  layers,
  renderHoverContent,
  initialView = DEFAULT_CORRIDOR_VIEW,
  className,
}: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const { hover } = useMapHover();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: initialView.center,
      zoom: initialView.zoom,
      attributionControl: false,
    });
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right',
    );
    mapRef.current = map;

    const overlay = new MapboxOverlay({ interleaved: false });
    map.addControl(overlay as maplibregl.IControl);
    overlayRef.current = overlay;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    overlayRef.current?.setProps({ layers });
  }, [layers]);

  const content = hover ? renderHoverContent?.(hover) : null;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className ?? ''}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {content && hover ? (
        <div
          className="pointer-events-none absolute z-20 w-60 -translate-y-1/2 rounded-lg border border-edge/70 bg-abyss/95 p-3 shadow-xl backdrop-blur-md"
          style={{ left: hover.x + 14, top: hover.y }}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}
