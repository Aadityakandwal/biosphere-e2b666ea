import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Layers,
  Phone,
  Globe,
  Clock,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  Home,
  Wrench,
  ShoppingBag,
  User,
  ShoppingCart,
  Compass,
  Sprout,
  TreePine,
  Flower2,
  Store,
  Users,
} from "lucide-react";
import { useCart, useProfile } from "@/lib/stores";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logoUrl from "@/assets/my-garden-logo.png";
import {
  RealPlace,
  UserCoordinates,
  fetchRealPlacesFromOverpass,
  searchRealPlacesWithNominatim,
  calculateDistanceKm,
  formatDistance,
} from "@/lib/real-places";
import { getDeviceLocation } from "@/lib/location-bridge";

export const Route = createFileRoute("/bookings/")({
  head: () => ({
    meta: [
      { title: "Nature & Gardening Discovery Map — My Gardener" },
      {
        name: "description",
        content:
          "Real-time interactive discovery map for plant nurseries, botanical gardens, public parks, and garden supplies.",
      },
      { property: "og:title", content: "Discovery Map — My Gardener" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MapsDiscoveryPage,
});

type CategoryKey = "all" | "nurseries" | "stores" | "parks" | "botanical" | "plant_shops" | "community";

interface CategoryOption {
  id: CategoryKey;
  label: string;
  emoji: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "All Green Spaces", emoji: "🍃" },
  { id: "nurseries", label: "Nurseries", emoji: "🌱" },
  { id: "stores", label: "Garden Stores", emoji: "🌿" },
  { id: "parks", label: "Parks & Reserves", emoji: "🌳" },
  { id: "botanical", label: "Botanical Gardens", emoji: "🌺" },
  { id: "plant_shops", label: "Plant Shops", emoji: "🪴" },
  { id: "community", label: "Community Gardens", emoji: "🥬" },
];

export function MapsDiscoveryPage() {
  // Navigation & Cart state
  const items = useCart((s) => s.items);
  const avatar = useProfile((s) => s.avatar);
  const name = useProfile((s) => s.name);
  const cartCount = items.reduce((n, i) => n + i.qty, 0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Map DOM & Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  // Discovery & Location state
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<UserCoordinates>({ lat: 28.6139, lon: 77.209 }); // Default center until GPS resolves
  const [locationStatus, setLocationStatus] = useState<"prompt" | "requesting" | "granted" | "denied">("prompt");
  const [locationError, setLocationError] = useState<string | null>(null);

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  // Places Data
  const [places, setPlaces] = useState<RealPlace[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selected Place & Detail modal
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [detailPlace, setDetailPlace] = useState<RealPlace | null>(null);
  const [showLocationHelpModal, setShowLocationHelpModal] = useState(false);
  const [cityJumpQuery, setCityJumpQuery] = useState("");
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Bottom Sheet state: 'collapsed' | 'half' | 'expanded'
  const [sheetState, setSheetState] = useState<"peek" | "expanded">("peek");

  // Map Tile layer style: 'osm' | 'topo' | 'satellite'
  const [tileLayerType, setTileLayerType] = useState<"osm" | "topo" | "satellite">("osm");

  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedPlaceId) || null,
    [places, selectedPlaceId]
  );

  // 1. Request Real User Geolocation (Android Native + Web)
  const requestUserLocation = useCallback(async (forceCenter = true, isManualClick = false) => {
    setLocationStatus("requesting");
    setLocationError(null);

    const result = await getDeviceLocation();

    if (result.status === "granted" && result.coords) {
      const coords: UserCoordinates = {
        lat: result.coords.lat,
        lon: result.coords.lon,
        accuracy: result.coords.accuracy,
      };
      setUserLocation(coords);
      setMapCenter(coords);
      setLocationStatus("granted");
      setShowLocationHelpModal(false);

      if (mapInstanceRef.current && forceCenter) {
        mapInstanceRef.current.setView([coords.lat, coords.lon], 14, {
          animate: true,
        });
      }
    } else {
      setLocationStatus("denied");
      setLocationError(
        result.errorMessage || "Could not determine your exact position. Searching current area."
      );
      if (isManualClick) {
        setShowLocationHelpModal(true);
      }
    }
  }, []);

  // Request location automatically on initial mount
  useEffect(() => {
    requestUserLocation(false);
  }, [requestUserLocation]);

  // 2. Initialize Leaflet Map (SSR-Safe)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      const initialLat = userLocation?.lat || mapCenter.lat;
      const initialLon = userLocation?.lon || mapCenter.lon;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: userLocation ? 14 : 12,
        zoomControl: false, // Custom controls
        attributionControl: false,
      });

      // Standard OpenStreetMap tiles (100% free, public, no watermark, no API key needed)
      const osmLayer = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      );
      osmLayer.addTo(map);

      // Attribution
      L.control
        .attribution({
          position: "bottomright",
          prefix: '<span class="text-[9px] text-muted-foreground/80">© OpenStreetMap</span>',
        })
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Track map center on pan/drag
      map.on("moveend", () => {
        const center = map.getCenter();
        setMapCenter({ lat: center.lat, lon: center.lng });
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Switch Tile Layer
  useEffect(() => {
    async function updateTileLayer() {
      if (!mapInstanceRef.current) return;
      const L = await import("leaflet");

      // Remove existing tile layers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      let url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      let maxZoom = 19;

      if (tileLayerType === "topo") {
        url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
        maxZoom = 18;
      } else if (tileLayerType === "satellite") {
        url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        maxZoom = 18;
      }

      const newLayer = L.tileLayer(url, { maxZoom });
      newLayer.addTo(mapInstanceRef.current);
    }

    updateTileLayer();
  }, [tileLayerType]);

  // 4. Update User Marker
  useEffect(() => {
    async function renderUserMarker() {
      if (!mapInstanceRef.current || !userLocation) return;
      const L = await import("leaflet");

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
      } else {
        const userIcon = L.divIcon({
          className: "user-gps-marker-container",
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-emerald-500 opacity-40"></span>
              <span class="relative inline-flex h-4 w-4 rounded-full bg-emerald-700 ring-4 ring-white shadow-lg"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([userLocation.lat, userLocation.lon], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);

        userMarkerRef.current = marker;
      }
    }

    renderUserMarker();
  }, [userLocation]);

  // 5. Fetch Real Places whenever Category, Center, or Custom Search changes
  const loadPlaces = useCallback(async () => {
    setIsLoadingPlaces(true);
    setFetchError(null);

    const searchLat = mapCenter.lat;
    const searchLon = mapCenter.lon;

    try {
      let realResults: RealPlace[] = [];

      if (activeSearchTerm.trim()) {
        realResults = await searchRealPlacesWithNominatim(activeSearchTerm, searchLat, searchLon);
      } else {
        realResults = await fetchRealPlacesFromOverpass(selectedCategory, searchLat, searchLon, 15000);
      }

      setPlaces(realResults);

      // If user selected a place that is no longer in results, reset selection
      if (selectedPlaceId && !realResults.some((p) => p.id === selectedPlaceId)) {
        setSelectedPlaceId(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch real places:", err);
      setFetchError(
        "Could not load places from OpenStreetMap. Please check your network connection and try again."
      );
      setPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, [selectedCategory, activeSearchTerm, mapCenter.lat, mapCenter.lon, selectedPlaceId]);

  useEffect(() => {
    loadPlaces();
  }, [selectedCategory, activeSearchTerm]);

  // 6. Render Real Place Markers onto the Leaflet Map
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersGroupRef.current) return;
      const L = await import("leaflet");

      markersGroupRef.current.clearLayers();

      places.forEach((place) => {
        const isSelected = place.id === selectedPlaceId;

        const markerHtml = `
          <button 
            type="button" 
            class="group relative flex items-center justify-center transition-transform duration-200 ${
              isSelected ? "scale-125 z-50" : "hover:scale-110"
            }"
            style="transform-origin: bottom center;"
          >
            <div class="relative flex items-center justify-center rounded-2xl ${
              isSelected
                ? "bg-[#1A3D2F] text-white ring-4 ring-emerald-300 shadow-xl"
                : "bg-white text-foreground ring-1 ring-border/80 shadow-md hover:bg-emerald-50"
            } px-2 py-1.5 transition-all">
              <span class="text-sm leading-none">${place.emoji}</span>
              ${
                isSelected
                  ? `<span class="ml-1 text-[11px] font-bold tracking-tight text-white whitespace-nowrap max-w-[120px] truncate">${place.name}</span>`
                  : ""
              }
            </div>
            <div class="absolute -bottom-1 h-2 w-2 rotate-45 ${
              isSelected ? "bg-[#1A3D2F]" : "bg-white"
            }"></div>
          </button>
        `;

        const icon = L.divIcon({
          className: "real-botanical-marker",
          html: markerHtml,
          iconSize: [isSelected ? 140 : 36, 40],
          iconAnchor: [isSelected ? 70 : 18, 40],
        });

        const marker = L.marker([place.lat, place.lon], { icon });

        marker.on("click", () => {
          setSelectedPlaceId(place.id);
          mapInstanceRef.current.setView([place.lat, place.lon], Math.max(mapInstanceRef.current.getZoom(), 15), {
            animate: true,
          });
        });

        markersGroupRef.current.addLayer(marker);
      });
    }

    updateMarkers();
  }, [places, selectedPlaceId]);

  // Map Controls Helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenterUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lon], 15, {
        animate: true,
      });
      setMapCenter(userLocation);
    } else {
      requestUserLocation(true, true);
    }
  };

  const handleCityJump = async (cityName: string) => {
    if (!cityName.trim()) return;
    setIsSearchingCity(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cityName.trim()
      )}&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const coords: UserCoordinates = { lat, lon };
        setMapCenter(coords);
        setUserLocation(coords);
        setLocationStatus("granted");
        setShowLocationHelpModal(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lon], 14, { animate: true });
        }
      }
    } catch (e) {
      console.error("City jump search failed", e);
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchTerm(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearchTerm("");
  };

  const cycleLayer = () => {
    setTileLayerType((curr) => {
      if (curr === "osm") return "topo";
      if (curr === "topo") return "satellite";
      return "osm";
    });
  };

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/bookings", label: "Maps", icon: MapPin },
    { to: "/shop", label: "Shop", icon: ShoppingBag },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background font-sans select-none">
      {/* 1. Full-Screen Interactive Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full outline-none" />

      {/* 2. Floating Top Header & Search Bar Overlay */}
      <div className="absolute inset-x-0 top-0 z-30 flex flex-col gap-2 p-3 sm:p-4 max-w-md mx-auto pointer-events-none">
        {/* Compact Header Bar */}
        <div className="pointer-events-auto flex items-center justify-between rounded-full border border-border/40 bg-background/85 px-4 py-2 backdrop-blur-md shadow-md">
          <Link to="/" className="flex items-center gap-2 press">
            <img src={logoUrl} alt="My Gardener" className="h-7 w-auto object-contain" />
            <span className="font-display text-base font-bold tracking-tight text-primary">
              My Gardener
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative rounded-full p-1.5 text-foreground/75 hover:bg-primary/10 hover:text-primary transition press"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-3.5 min-w-3.5 rounded-full bg-primary px-1 text-[8px] text-primary-foreground shadow-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-secondary ring-1 ring-border/80 shadow-xs transition hover:ring-primary/40 press"
            >
              {avatar ? (
                <img alt={name || "Profile"} src={avatar} className="h-full w-full object-cover" />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Link>
          </div>
        </div>

        {/* Floating Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="pointer-events-auto relative flex items-center w-full shadow-lg rounded-2xl border border-border/40 bg-card/95 backdrop-blur-md"
        >
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search real nurseries, parks, botanical gardens..."
            className="h-11 w-full bg-transparent pl-10 pr-16 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted press"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="rounded-xl bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 press shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Horizontal Category Filters */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id && !activeSearchTerm;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveSearchTerm("");
                  setSearchQuery("");
                  setSelectedCategory(cat.id);
                }}
                className={`press flex flex-none items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all shadow-sm ${
                  isActive
                    ? "bg-[#1A3D2F] text-white shadow-md ring-1 ring-emerald-800"
                    : "border border-border/50 bg-card/90 text-foreground hover:bg-muted backdrop-blur-sm"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Location Status Banner (if permission denied/prompt) */}
        {locationStatus === "denied" && (
          <div className="pointer-events-auto flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Location access is off in browser settings.</span>
            </div>
            <button
              type="button"
              onClick={() => requestUserLocation(true, true)}
              className="rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-amber-700 press shrink-0 shadow-xs"
            >
              Enable
            </button>
          </div>
        )}
      </div>

      {/* 3. Floating Map Controls (Right Side) */}
      <div className="absolute right-3.5 top-44 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Recenter / GPS button */}
        <button
          type="button"
          onClick={handleRecenterUser}
          title="Center on my location"
          className="press flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 bg-card/95 text-foreground shadow-md backdrop-blur-md transition hover:bg-muted"
        >
          {locationStatus === "requesting" ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Crosshair className={`h-4 w-4 ${userLocation ? "text-emerald-700" : "text-foreground"}`} />
          )}
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="press flex h-9 w-9 items-center justify-center rounded-t-xl border border-border/50 bg-card/95 text-foreground shadow-md backdrop-blur-md hover:bg-muted"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="press flex h-9 w-9 items-center justify-center rounded-b-xl border border-t-0 border-border/50 bg-card/95 text-foreground shadow-md backdrop-blur-md hover:bg-muted"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        {/* Layer Switcher */}
        <button
          type="button"
          onClick={cycleLayer}
          title={`Layer: ${tileLayerType}`}
          className="press flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 bg-card/95 text-foreground shadow-md backdrop-blur-md hover:bg-muted"
        >
          <Layers className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* 4. Draggable / Expandable Bottom Sheet for Real Places */}
      <div
        className={`absolute inset-x-0 bottom-16 z-30 mx-auto max-w-md transition-all duration-300 ease-out ${
          sheetState === "expanded" ? "top-36" : "top-auto"
        }`}
      >
        <div className="flex h-full flex-col rounded-t-3xl border-t border-x border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl">
          {/* Bottom Sheet Handle & Header */}
          <div
            onClick={() => setSheetState(sheetState === "expanded" ? "peek" : "expanded")}
            className="flex cursor-pointer flex-col items-center pt-2.5 pb-2 px-4 select-none"
          >
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            <div className="mt-2 flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-foreground">
                  {activeSearchTerm
                    ? `Results for "${activeSearchTerm}"`
                    : CATEGORIES.find((c) => c.id === selectedCategory)?.label || "Nearby Places"}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {isLoadingPlaces ? "..." : `${places.length} found`}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="text-[11px]">{sheetState === "expanded" ? "Collapse" : "Browse"}</span>
                {sheetState === "expanded" ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </div>
            </div>
          </div>

          {/* Place List Content */}
          <div
            className={`flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 ${
              sheetState === "expanded" ? "max-h-[calc(100vh-260px)]" : "max-h-48"
            }`}
          >
            {/* Loading State */}
            {isLoadingPlaces && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="mt-2 text-xs font-medium text-foreground">
                  Searching real OpenStreetMap venues...
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Querying live botanical & park data
                </p>
              </div>
            )}

            {/* Error State */}
            {!isLoadingPlaces && fetchError && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-center">
                <p className="text-xs font-semibold text-destructive">{fetchError}</p>
                <button
                  type="button"
                  onClick={() => loadPlaces()}
                  className="mt-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Empty State (Zero Fake Data Guarantee) */}
            {!isLoadingPlaces && !fetchError && places.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Compass className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-bold text-foreground">No places found in this area</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground max-w-xs">
                  Try selecting another category above or pan the map to a different location.
                </p>
              </div>
            )}

            {/* Real Places Cards */}
            {!isLoadingPlaces &&
              places.map((place) => {
                const isSelected = place.id === selectedPlaceId;
                return (
                  <div
                    key={place.id}
                    onClick={() => {
                      setSelectedPlaceId(place.id);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([place.lat, place.lon], 16, { animate: true });
                      }
                    }}
                    className={`press group cursor-pointer rounded-2xl border p-3 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
                        : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-base">
                          {place.emoji}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-bold text-foreground truncate">{place.name}</h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {place.categoryLabel}
                            {place.city ? ` · ${place.city}` : ""}
                          </p>
                          {place.address && (
                            <p className="text-[10px] text-muted-foreground/80 line-clamp-1">
                              {place.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Navigation className="h-2.5 w-2.5" />
                          {place.formattedDistance}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailPlace(place);
                            }}
                            className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-semibold text-foreground hover:bg-muted press"
                          >
                            Details
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-0.5 rounded-lg bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 press shadow-xs"
                          >
                            <span>Go</span>
                            <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 5. Standard Bottom Navigation (Maps Active) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {navItems.map((n) => {
            const active =
              n.to === "/"
                ? pathname === "/"
                : pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary" />}
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
                    active ? "bg-primary/10" : ""
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "stroke-[2.2]" : "stroke-[1.6]"}`} />
                </span>
                <span className="tracking-tight">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 6. Place Detail Dialog Modal */}
      <Dialog open={!!detailPlace} onOpenChange={(open) => !open && setDetailPlace(null)}>
        <DialogContent className="max-w-md rounded-3xl p-5 border-border bg-card">
          {detailPlace && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{detailPlace.emoji}</span>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {detailPlace.categoryLabel}
                  </Badge>
                  <span className="ml-auto text-xs font-semibold text-primary">
                    {detailPlace.formattedDistance} away
                  </span>
                </div>
                <DialogTitle className="font-display text-lg font-bold text-foreground mt-1">
                  {detailPlace.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Verified real geographic venue from OpenStreetMap
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2.5 text-xs">
                {detailPlace.address && (
                  <div className="flex items-start gap-2 text-foreground/90">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{detailPlace.address}</span>
                  </div>
                )}

                {detailPlace.openingHours && (
                  <div className="flex items-start gap-2 text-foreground/90">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Hours: {detailPlace.openingHours}</span>
                  </div>
                )}

                {detailPlace.phone && (
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${detailPlace.phone}`} className="text-primary underline">
                      {detailPlace.phone}
                    </a>
                  </div>
                )}

                {detailPlace.website && (
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={detailPlace.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline truncate max-w-[280px]"
                    >
                      {detailPlace.website}
                    </a>
                  </div>
                )}

                <div className="rounded-xl bg-secondary/50 p-2.5 text-[11px] text-muted-foreground">
                  <div className="flex justify-between py-0.5">
                    <span>Coordinates</span>
                    <span className="font-mono text-[10px]">
                      {detailPlace.lat.toFixed(5)}, {detailPlace.lon.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>OSM ID</span>
                    <span className="font-mono text-[10px]">
                      {detailPlace.osmType}/{detailPlace.osmId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${detailPlace.lat},${detailPlace.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Get Directions</span>
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 7. Location Permission Helper & City Jump Modal */}
      <Dialog open={showLocationHelpModal} onOpenChange={setShowLocationHelpModal}>
        <DialogContent className="max-w-md rounded-3xl p-5 border-border bg-card">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-1">
              <Crosshair className="h-5 w-5" />
            </div>
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              Enable Location Access
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your browser has location permissions blocked for this site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-1">
            {/* Step-by-step instructions */}
            <div className="space-y-2 rounded-2xl border border-border/80 bg-secondary/40 p-3.5 text-foreground">
              <p className="font-semibold text-xs text-primary">To unblock in your browser:</p>
              <ol className="space-y-1.5 list-decimal pl-4 text-[11px] text-muted-foreground leading-relaxed">
                <li>
                  Click the <strong className="text-foreground">🔒 Lock / Tune icon</strong> in your browser address bar (top left of URL).
                </li>
                <li>
                  Set <strong className="text-foreground">Location</strong> to <strong className="text-foreground">"Allow"</strong>.
                </li>
                <li>
                  Click <strong className="text-foreground">"Try Again"</strong> below.
                </li>
              </ol>
            </div>

            {/* Try Again Button */}
            <button
              type="button"
              onClick={() => requestUserLocation(true, true)}
              className="w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 press shadow-xs flex items-center justify-center gap-2"
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>

            {/* Alternative: Jump to any city */}
            <div className="pt-2 border-t border-border/60 space-y-2.5">
              <p className="font-semibold text-xs text-foreground">Or jump to your city directly:</p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={cityJumpQuery}
                  onChange={(e) => setCityJumpQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCityJump(cityJumpQuery);
                    }
                  }}
                  placeholder="Enter city (e.g. Amritsar, Delhi, Bengaluru)..."
                  className="h-9 flex-1 rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  disabled={isSearchingCity || !cityJumpQuery.trim()}
                  onClick={() => handleCityJump(cityJumpQuery)}
                  className="rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted press disabled:opacity-50 flex items-center gap-1"
                >
                  {isSearchingCity ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Go"}
                </button>
              </div>

              {/* Popular quick cities */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {["Amritsar", "Delhi", "Chandigarh", "Bengaluru", "Mumbai"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCityJump(city)}
                    className="rounded-lg border border-border/80 bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted press"
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
