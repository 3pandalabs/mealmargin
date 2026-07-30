import type { Locality } from "./types";

// Delivery locations. The whole v2 flow starts here: you say where you are,
// and everything downstream — which kitchens appear, how far each one is, what
// the rider costs, whether walking is even a sane suggestion — follows from it.
//
// Each restaurant's `distanceKm` is measured from its locality's centre, so
// these are not decorative labels: change the locality and every delivery fare
// and pickup walk time in the app changes with it.

export const LOCALITIES: Locality[] = [
  { id: "dwarka", name: "Dwarka Sector 6, New Delhi", area: "Dwarka Sector 6", city: "New Delhi" },
  { id: "indiranagar", name: "Indiranagar, Bengaluru", area: "Indiranagar", city: "Bengaluru" },
  { id: "andheri-west", name: "Andheri West, Mumbai", area: "Andheri West", city: "Mumbai" },
  { id: "koregaon-park", name: "Koregaon Park, Pune", area: "Koregaon Park", city: "Pune" },
  { id: "banjara-hills", name: "Banjara Hills, Hyderabad", area: "Banjara Hills", city: "Hyderabad" },
];

export const LOCALITY_BY_ID = new Map(LOCALITIES.map((locality) => [locality.id, locality]));

export const DEFAULT_LOCALITY_ID = "dwarka";

/** Free-text match, so "delhi" or "sector 6" both find Dwarka. */
export function matchLocalities(query: string): Locality[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return LOCALITIES;
  return LOCALITIES.filter((locality) =>
    `${locality.name} ${locality.area} ${locality.city}`.toLowerCase().includes(needle),
  );
}
