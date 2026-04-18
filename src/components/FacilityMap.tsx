"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Facility, getCapacityStatus } from "@/types";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CAPACITY_COLOR = {
  available: "#16a34a",
  limited: "#d97706",
  full: "#dc2626",
};

const CAPACITY_LABEL = {
  available: "Space Available",
  limited: "Almost Full",
  full: "At Capacity",
};

function createIcon(color: string, selected: boolean) {
  const size = selected ? 18 : 14;
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.5);transition:all 0.2s"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 16, left: 16, zIndex: 1000,
        background: "white", borderRadius: "0.75rem", padding: "10px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontSize: "12px", lineHeight: "1.8"
      }}>
        {(["available", "limited", "full"] as const).map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: CAPACITY_COLOR[s] }} />
            <span style={{ color: "#374151" }}>{CAPACITY_LABEL[s]}</span>
          </div>
        ))}
      </div>

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
        {facilities.map((f) => {
          const status = getCapacityStatus(f.capacityPercent);
          const color = CAPACITY_COLOR[status];
          return (
            <Marker
              key={f.id}
              position={[f.lat, f.lng]}
              icon={createIcon(color, selected?.id === f.id)}
              eventHandlers={{ click: () => onSelect(f) }}
            >
              <Popup>
                <strong>{f.name}</strong>
                <br />
                {f.address}
                {f.hours && <><br />{f.hours}</>}
                {f.phone && <><br />{f.phone}</>}
                <br />
                <span style={{ color, fontWeight: 600 }}>
                  {CAPACITY_LABEL[status]} ({f.capacityPercent}% full)
                </span>
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
          );
        })}
      </MapContainer>
    </div>
  );
}
