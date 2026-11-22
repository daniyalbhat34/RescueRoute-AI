import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type Coordinates = [number, number];

interface MapViewProps {
  start: Coordinates | null;
  destination: Coordinates | null;
  route: Coordinates[];
  alternativeRoute?: Coordinates[];
  blockedSegment?: Coordinates[];
  hazard: Coordinates | null;
  hazardMode: boolean;
  onSelect: (point: Coordinates) => void;
}

const RIVERSIDE: LatLngExpression = [33.9806, -117.3755];

function MapClickHandler({
  onSelect,
  hazardMode,
}: {
  onSelect: (point: Coordinates) => void;
  hazardMode: boolean;
}) {
  useMapEvents({
    click(event) {
      // Hazard selection happens on the blue route only.
      if (hazardMode) return;

      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function FitRoute({
  route,
  start,
  destination,
}: {
  route: Coordinates[];
  start: Coordinates | null;
  destination: Coordinates | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (route.length === 0) return;

    const points: Coordinates[] = [...route];

    if (start) points.push(start);
    if (destination) points.push(destination);

    map.fitBounds(L.latLngBounds(points), {
      padding: [40, 40],
      maxZoom: 16,
    });
  }, [map, route, start, destination]);

  return null;
}

export default function MapView({
  start,
  destination,
  route,
  alternativeRoute = [],
  blockedSegment = [],
  hazard,
  hazardMode,
  onSelect,
}: MapViewProps) {
  return (
    <div className="relative h-full min-h-[450px] w-full overflow-hidden rounded-xl">
      <MapContainer
        center={RIVERSIDE}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        style={{ minHeight: 450 }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          onSelect={onSelect}
          hazardMode={hazardMode}
        />

        <FitRoute
          route={route}
          start={start}
          destination={destination}
        />

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "#2563eb",
              weight: hazardMode ? 12 : 6,
              opacity: 0.85,
              bubblingMouseEvents: false,
            }}
            eventHandlers={{
              click: (event) => {
                if (!hazardMode) return;

                onSelect([
                  event.latlng.lat,
                  event.latlng.lng,
                ]);
              },
            }}
          />
        )}

        {alternativeRoute.length > 0 && (
          <Polyline
            positions={alternativeRoute}
            pathOptions={{
              color: "#059669",
              weight: 6,
              opacity: 0.9,
              bubblingMouseEvents: false,
            }}
          />
        )}

        {blockedSegment.length > 0 && (
          <Polyline
            positions={blockedSegment}
            pathOptions={{
              color: "#dc2626",
              weight: 9,
              opacity: 1,
              bubblingMouseEvents: false,
            }}
          />
        )}

        {hazard && (
          <CircleMarker
            center={hazard}
            radius={8}
            pathOptions={{
              color: "#991b1b",
              fillColor: "#ef4444",
              fillOpacity: 0.9,
            }}
          >
            <Popup>Reported hazard</Popup>
          </CircleMarker>
        )}

        {start && (
          <Marker position={start}>
            <Popup>Starting location</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination}>
            <Popup>Destination</Popup>
          </Marker>
        )}
      </MapContainer>

      {hazardMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-medium text-white shadow-lg">
          Click directly on the blue route
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/95 p-3 text-xs shadow-lg">
        <p className="mb-2 font-semibold">Map Legend</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-1 w-6 bg-blue-600" />
            Original Route
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-6 bg-green-600" />
            Alternative Route
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-6 bg-red-600" />
            Blocked Road
          </div>
        </div>
      </div>
    </div>
  );
}
