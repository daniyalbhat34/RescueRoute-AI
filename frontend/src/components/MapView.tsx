import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type Coordinates = [number, number];

interface MapViewProps {
  start: Coordinates | null;
  destination: Coordinates | null;
  route: Coordinates[];
  alternativeRoute?: Coordinates[];
  onSelect: (point: Coordinates) => void;
}

const RIVERSIDE: LatLngExpression = [33.9806, -117.3755];

function MapClickHandler({
  onSelect,
}: {
  onSelect: (point: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export default function MapView({
  start,
  destination,
  route,
  alternativeRoute = [],
  onSelect,
}: MapViewProps) {
  const [zoom] = useState(13);

  return (
    <div className="relative h-full min-h-[450px] w-full overflow-hidden rounded-xl">
      <MapContainer
        center={RIVERSIDE}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
        style={{ minHeight: 450 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onSelect={onSelect} />

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

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#2563eb", weight: 6 }}
          />
        )}

        {alternativeRoute.length > 0 && (
          <Polyline
            positions={alternativeRoute}
            pathOptions={{ color: "#059669", weight: 6 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
