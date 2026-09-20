// Real Places Discovery Engine (OpenStreetMap Overpass + Nominatim APIs)
// 100% Real Live Data — No Mock or Fabricated Places

export interface RealPlace {
  id: string;
  name: string;
  category: "all" | "nurseries" | "stores" | "parks" | "botanical" | "plant_shops" | "community";
  categoryLabel: string;
  emoji: string;
  lat: number;
  lon: number;
  distanceKm: number;
  formattedDistance: string;
  address?: string;
  city?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  wheelchair?: string;
  osmType: "node" | "way" | "relation";
  osmId: number;
  rawTags: Record<string, string>;
}

export interface UserCoordinates {
  lat: number;
  lon: number;
  accuracy?: number;
}

// Calculate precise distance between two coordinates using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Overpass API Query Builder for Botanical, Nature, and Garden Places
export function buildOverpassQuery(
  category: string,
  lat: number,
  lon: number,
  radiusMeters: number = 15000
): string {
  let innerFilters = "";

  switch (category) {
    case "nurseries":
      innerFilters = `
        node["shop"="garden_centre"](around:${radiusMeters},${lat},${lon});
        way["shop"="garden_centre"](around:${radiusMeters},${lat},${lon});
        node["shop"="plant_nursery"](around:${radiusMeters},${lat},${lon});
        way["shop"="plant_nursery"](around:${radiusMeters},${lat},${lon});
        node["shop"="plants"](around:${radiusMeters},${lat},${lon});
        way["shop"="plants"](around:${radiusMeters},${lat},${lon});
      `;
      break;

    case "stores":
      innerFilters = `
        node["shop"="garden_centre"](around:${radiusMeters},${lat},${lon});
        way["shop"="garden_centre"](around:${radiusMeters},${lat},${lon});
        node["shop"="florist"](around:${radiusMeters},${lat},${lon});
        way["shop"="florist"](around:${radiusMeters},${lat},${lon});
        node["shop"="agricultural_supplies"](around:${radiusMeters},${lat},${lon});
        way["shop"="agricultural_supplies"](around:${radiusMeters},${lat},${lon});
      `;
      break;

    case "parks":
      innerFilters = `
        node["leisure"="park"](around:${radiusMeters},${lat},${lon});
        way["leisure"="park"](around:${radiusMeters},${lat},${lon});
        node["leisure"="nature_reserve"](around:${radiusMeters},${lat},${lon});
        way["leisure"="nature_reserve"](around:${radiusMeters},${lat},${lon});
      `;
      break;

    case "botanical":
      innerFilters = `
        node["leisure"="garden"](around:${radiusMeters},${lat},${lon});
        way["leisure"="garden"](around:${radiusMeters},${lat},${lon});
        node["tourism"="attraction"]["garden"](around:${radiusMeters},${lat},${lon});
        way["tourism"="attraction"]["garden"](around:${radiusMeters},${lat},${lon});
      `;
      break;

    case "plant_shops":
      innerFilters = `
        node["shop"="florist"](around:${radiusMeters},${lat},${lon});
        way["shop"="florist"](around:${radiusMeters},${lat},${lon});
        node["shop"="plants"](around:${radiusMeters},${lat},${lon});
        way["shop"="plants"](around:${radiusMeters},${lat},${lon});
      `;
      break;

    case "community":
      innerFilters = `
        node["landuse"="allotments"](around:${radiusMeters},${lat},${lon});
        way["landuse"="allotments"](around:${radiusMeters},${lat},${lon});
        node["leisure"="community_garden"](around:${radiusMeters},${lat},${lon});
        way["leisure"="community_garden"](around:${radiusMeters},${lat},${lon});
      `;
      break;

    case "all":
    default:
      innerFilters = `
        node["shop"~"garden_centre|florist|plants"](around:${radiusMeters},${lat},${lon});
        way["shop"~"garden_centre|florist|plants"](around:${radiusMeters},${lat},${lon});
        node["leisure"~"garden|park|nature_reserve|community_garden"](around:${radiusMeters},${lat},${lon});
        way["leisure"~"garden|park|nature_reserve|community_garden"](around:${radiusMeters},${lat},${lon});
        node["landuse"="allotments"](around:${radiusMeters},${lat},${lon});
        way["landuse"="allotments"](around:${radiusMeters},${lat},${lon});
      `;
      break;
  }

  return `[out:json][timeout:20];(${innerFilters});out center 40;`;
}

// Categorize raw OSM tags into clean UI categories
function categorizeOsmTags(tags: Record<string, string>): {
  category: RealPlace["category"];
  categoryLabel: string;
  emoji: string;
} {
  const shop = tags.shop?.toLowerCase();
  const leisure = tags.leisure?.toLowerCase();
  const landuse = tags.landuse?.toLowerCase();

  if (shop === "garden_centre" || shop === "plant_nursery") {
    return { category: "nurseries", categoryLabel: "Plant Nursery", emoji: "🌱" };
  }
  if (leisure === "garden" || (tags.tourism === "attraction" && tags.garden)) {
    return { category: "botanical", categoryLabel: "Botanical Garden", emoji: "🌺" };
  }
  if (leisure === "park" || leisure === "nature_reserve") {
    return { category: "parks", categoryLabel: "Public Park", emoji: "🌳" };
  }
  if (landuse === "allotments" || leisure === "community_garden") {
    return { category: "community", categoryLabel: "Community Garden", emoji: "🥬" };
  }
  if (shop === "plants" || shop === "florist") {
    return { category: "plant_shops", categoryLabel: "Plant Shop", emoji: "🪴" };
  }
  if (shop === "agricultural_supplies") {
    return { category: "stores", categoryLabel: "Garden Supplies", emoji: "🌿" };
  }

  return { category: "all", categoryLabel: "Green Space", emoji: "🍃" };
}

// Fetch real places from OpenStreetMap Overpass API
export async function fetchRealPlacesFromOverpass(
  category: string,
  userLat: number,
  userLon: number,
  radiusMeters: number = 15000
): Promise<RealPlace[]> {
  const query = buildOverpassQuery(category, userLat, userLon, radiusMeters);
  const endpoint = "https://overpass-api.de/api/interpreter";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API responded with status ${response.status}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  const places: RealPlace[] = [];
  const seenNames = new Set<string>();

  for (const el of elements) {
    const tags: Record<string, string> = el.tags || {};
    
    // Determine coordinates (node has lat/lon, way has center.lat/center.lon)
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) continue;

    // Determine place name
    const rawName =
      tags.name ||
      tags["name:en"] ||
      tags["name:hi"] ||
      tags.brand ||
      tags.operator ||
      (tags.leisure === "park" ? "Public Park" : undefined) ||
      (tags.leisure === "garden" ? "Public Botanical Garden" : undefined) ||
      (tags.shop === "garden_centre" ? "Local Plant Nursery" : undefined) ||
      (tags.landuse === "allotments" ? "Community Allotment" : undefined);

    if (!rawName) continue;

    // Deduplicate by name & approximate location
    const dedupeKey = `${rawName.toLowerCase()}_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    if (seenNames.has(dedupeKey)) continue;
    seenNames.add(dedupeKey);

    const { category: cat, categoryLabel, emoji } = categorizeOsmTags(tags);
    const distKm = calculateDistanceKm(userLat, userLon, lat, lon);

    // Build address string
    const addrParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"],
      tags["addr:district"],
      tags["addr:city"] || tags["addr:town"] || tags["addr:state_district"],
      tags["addr:postcode"],
    ].filter(Boolean);
    const address = addrParts.length > 0 ? addrParts.join(", ") : undefined;

    places.push({
      id: `osm-${el.type}-${el.id}`,
      name: rawName,
      category: cat,
      categoryLabel,
      emoji,
      lat,
      lon,
      distanceKm: distKm,
      formattedDistance: formatDistance(distKm),
      address,
      city: tags["addr:city"] || tags["addr:town"],
      phone: tags.phone || tags["contact:phone"],
      website: tags.website || tags["contact:website"],
      openingHours: tags.opening_hours,
      wheelchair: tags.wheelchair,
      osmType: el.type,
      osmId: el.id,
      rawTags: tags,
    });
  }

  // Sort strictly by distance (closest first)
  places.sort((a, b) => a.distanceKm - b.distanceKm);

  return places;
}

// Search real places by keyword query using Nominatim OpenStreetMap API
export async function searchRealPlacesWithNominatim(
  query: string,
  userLat: number,
  userLon: number
): Promise<RealPlace[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    trimmed
  )}&viewbox=${userLon - 0.5},${userLat + 0.5},${userLon + 0.5},${userLat - 0.5}&bounded=0&limit=25&addressdetails=1&extratags=1`;

  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim API error: ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const results: RealPlace[] = [];

  for (const item of data) {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (isNaN(lat) || isNaN(lon)) continue;

    const tags: Record<string, string> = {
      ...(item.extratags || {}),
      ...(item.address || {}),
    };

    const distKm = calculateDistanceKm(userLat, userLon, lat, lon);
    const { category, categoryLabel, emoji } = categorizeOsmTags({
      shop: item.type === "garden_centre" || item.class === "shop" ? item.type : "",
      leisure: item.type === "park" || item.type === "garden" ? item.type : "",
      ...tags,
    });

    results.push({
      id: `nom-${item.osm_type || "node"}-${item.osm_id || Math.random()}`,
      name: item.name || item.display_name.split(",")[0] || "Green Venue",
      category,
      categoryLabel,
      emoji,
      lat,
      lon,
      distanceKm: distKm,
      formattedDistance: formatDistance(distKm),
      address: item.display_name,
      city: item.address?.city || item.address?.town || item.address?.suburb,
      phone: tags.phone || tags["contact:phone"],
      website: tags.website || tags["contact:website"],
      openingHours: tags.opening_hours,
      osmType: item.osm_type || "node",
      osmId: item.osm_id || 0,
      rawTags: tags,
    });
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results;
}
