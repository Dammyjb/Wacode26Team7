import { Facility } from "@/types";

// Mock facilities — in production these come from a live DB / API
export const MOCK_FACILITIES: Facility[] = [
  {
    id: "1",
    name: "City Food Bank",
    type: "donation",
    address: "123 Main St, Houston, TX 77001",
    lat: 29.762,
    lng: -95.373,
    phone: "(713) 555-0101",
    hours: "Mon–Fri 8am–5pm",
    capacityPercent: 42,
  },
  {
    id: "2",
    name: "Hope Community Pantry",
    type: "donation",
    address: "456 Oak Ave, Houston, TX 77002",
    lat: 29.751,
    lng: -95.361,
    phone: "(713) 555-0202",
    hours: "Tue–Sat 9am–4pm",
    capacityPercent: 71,
  },
  {
    id: "3",
    name: "Harvest Table",
    type: "donation",
    address: "88 Westheimer Rd, Houston, TX 77006",
    lat: 29.757,
    lng: -95.389,
    phone: "(713) 555-0606",
    hours: "Mon–Sat 8am–6pm",
    capacityPercent: 91,
  },
  {
    id: "4",
    name: "GreenCycle Biodigester",
    type: "biodigester",
    address: "789 Industrial Blvd, Houston, TX 77003",
    lat: 29.74,
    lng: -95.35,
    phone: "(713) 555-0303",
    hours: "Mon–Sat 7am–6pm",
    capacityPercent: 30,
  },
  {
    id: "5",
    name: "BioEnergy Solutions",
    type: "biodigester",
    address: "321 Energy Pkwy, Houston, TX 77004",
    lat: 29.732,
    lng: -95.38,
    phone: "(713) 555-0404",
    hours: "Mon–Fri 6am–8pm",
    capacityPercent: 78,
  },
  {
    id: "6",
    name: "Metro Waste Management",
    type: "landfill",
    address: "999 Disposal Rd, Houston, TX 77005",
    lat: 29.72,
    lng: -95.39,
    phone: "(713) 555-0505",
    hours: "Mon–Sun 6am–8pm",
    capacityPercent: 88,
  },
];

export function getFacilitiesForCategory(category: string): Facility[] {
  return MOCK_FACILITIES.filter((f) => f.type === category);
}
