"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Facility, FoodCategory } from "@/types";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_COLOR: Record<FoodCategory, string> = {
  donation: "#16a34a",
  biodigester: "#2563eb",
  landfill: "#6b7280",
};

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FlyTo({ facility }: { facility: Facility | null }) {
  const map = useMap();
  useEffect(() => {
    if (facility) map.flyTo([facility.lat, facility.lng], 14, { duration: 0.8 });
  }, [facility, map]);
  return null;
}

interface Props {
  facilities: Facility[];
  selected: Facility | null;
  onSelect: (f: Facility) => void;
}

export default function FacilityMap({ facilities, selected, onSelect }: Props) {
  const center: [number, number] =
    facilities.length > 0
      ? [facilities[0].lat, facilities[0].lng]
      : [29.76, -95.37];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo facility={selected} />
      {facilities.map((f) => (
        <Marker
          key={f.id}
          position={[f.lat, f.lng]}
          icon={createIcon(CATEGORY_COLOR[f.type])}
          eventHandlers={{ click: () => onSelect(f) }}
        >
          <Popup>
            <strong>{f.name}</strong>
            <br />
            {f.address}
            {f.hours && <><br />{f.hours}</>}
            {f.phone && <><br />{f.phone}</>}
            <br />
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(f.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
