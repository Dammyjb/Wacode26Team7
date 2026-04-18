"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Facility, FoodCategory, getCapacityStatus } from "@/types";
import "leaflet/dist/leaflet.css";

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

// Different shapes per facility type so you can tell them apart at a glance
const TYPE_SHAPE: Record<FoodCategory, (color: string, size: number) => string> = {
  donation: (color, size) =>
    `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2.5px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.45)"></div>`,
  biodigester: (color, size) =>
    `<div style="background:${color};width:${size}px;height:${size}px;border-radius:3px;transform:rotate(45deg);border:2.5px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.45)"></div>`,
  landfill: (color, size) =>
    `<div style="width:0;height:0;border-left:${size / 2}px solid transparent;border-right:${size / 2}px solid transparent;border-bottom:${size}px solid ${color};filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4))"></div>`,
};

const TYPE_LABEL: Record<FoodCategory, string> = {
  donation: "Donation Center",
  biodigester: "Biodigester",
  landfill: "Landfill",
};

const TYPE_SHAPE_EXAMPLE: Record<FoodCategory, string> = {
  donation: `<div style="width:12px;height:12px;border-radius:50%;border:2px solid #9ca3af;background:#9ca3af"></div>`,
  biodigester: `<div style="width:10px;height:10px;border-radius:2px;transform:rotate(45deg);border:2px solid #9ca3af;background:#9ca3af"></div>`,
  landfill: `<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #9ca3af"></div>`,
};

function createIcon(type: FoodCategory, color: string, selected: boolean) {
  const size = selected ? 20 : 16;
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${size + 4}px;height:${size + 4}px">${TYPE_SHAPE[type](color, size)}</div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
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
    facilities.length > 0 ? [facilities[0].lat, facilities[0].lng] : [29.76, -95.37];

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 16, left: 16, zIndex: 1000,
        background: "white", borderRadius: "0.75rem", padding: "12px 16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)", fontSize: "12px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <p style={{ fontWeight: 700, color: "#111827", marginBottom: 2 }}>Legend</p>

        <p style={{ fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</p>
        {(["donation", "biodigester", "landfill"] as FoodCategory[]).map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
              dangerouslySetInnerHTML={{ __html: TYPE_SHAPE_EXAMPLE[t] }} />
            <span style={{ color: "#374151" }}>{TYPE_LABEL[t]}</span>
          </div>
        ))}

        <p style={{ fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>Capacity</p>
        {(["available", "limited", "full"] as const).map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: CAPACITY_COLOR[s], flexShrink: 0 }} />
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
              icon={createIcon(f.type, color, selected?.id === f.id)}
              eventHandlers={{ click: () => onSelect(f) }}
            >
              <Popup>
                <strong style={{ fontSize: 14 }}>{f.name}</strong>
                <br />
                <span style={{ color: "#6b7280", fontSize: 12 }}>{TYPE_LABEL[f.type]}</span>
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
