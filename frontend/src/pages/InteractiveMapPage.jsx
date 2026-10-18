import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import {
  Search,
  MapPin,
  Navigation,
  Route as RouteIcon,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RefreshCw,
  Compass,
  ShieldCheck,
  ArrowUpDown,
  Clock,
  Gauge,
  Zap,
  Train,
  Bus,
  Car,
  Footprints,
  Eye,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  RotateCw,
  Flag,
  ShieldAlert,
  Info,
  Sliders,
} from 'lucide-react';

const CATEGORY_CHIPS = [
  'All',
  'Historical',
  'Temple',
  'Fort',
  'Palace',
  'Nature',
  'Waterfall',
  'Beach',
  'Museum',
  'Hill Station',
];

export default function InteractiveMapPage() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const stepMarkerRef = useRef(null);

  // States & Cities Hierarchy
  const [states, setStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [selectedState, setSelectedState] = useState('Delhi');
  const [selectedCity, setSelectedCity] = useState('Delhi');

  // Places & Search
  const [places, setPlaces] = useState([]);
  const [allStatePlaces, setAllStatePlaces] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategoryChip, setSelectedCategoryChip] = useState('All');

  // Routing Selection (Origin & Destination)
  const [originId, setOriginId] = useState('');
  const [destId, setDestId] = useState('');
  const [travelHour, setTravelHour] = useState(14);
  const [activeRouteTab, setActiveRouteTab] = useState('route_b'); // 'route_b' (AI Safe) | 'route_a' (Shortest)
  const [activeSideView, setActiveSideView] = useState('directions'); // 'directions' | 'comparison' | 'places' | 'transit'
  const [showTurnSteps, setShowTurnSteps] = useState(true);

  // Analysis result
  const [routeComparison, setRouteComparison] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Map Layer Toggles
  const [layers, setLayers] = useState({
    places: true,
    routeB: true,
    routeA: true,
    incidents: true,
  });

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const map = L.map(container, {
      center: [28.6139, 77.2090],
      zoom: 12,
      zoomControl: false, // will position custom or default
      scrollWheelZoom: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = group;

    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      observer.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (observer) observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // 2. Load States, Cities, and Incident Data on Mount
  useEffect(() => {
    api.getStates().then((res) => setStates(res.states || [])).catch(() => {});
    api.getCities().then((res) => setAllCities(res.cities || [])).catch(() => {});
    api.getIncidents().then((res) => setIncidents(res.incidents || [])).catch(() => {});
  }, []);

  // Cities filtered by selectedState
  const stateCities = useMemo(() => {
    if (!selectedState) return allCities;
    return allCities.filter(
      (c) => c.state?.trim().toLowerCase() === selectedState.trim().toLowerCase()
    );
  }, [allCities, selectedState]);

  // 3. When selectedState changes: update cities and fetch places
  const handleStateChange = (newState) => {
    setSelectedState(newState);
    if (!newState) {
      setSelectedCity('');
      return;
    }
    const matching = allCities.filter(
      (c) => c.state?.trim().toLowerCase() === newState.trim().toLowerCase()
    );
    if (matching.length > 0) {
      setSelectedCity(matching[0].city);
    } else {
      setSelectedCity('');
    }
  };

  // 4. Fetch Tourist Places when selectedState or selectedCity changes
  useEffect(() => {
    const params = { limit: 600 };
    if (selectedState) params.state = selectedState;
    if (selectedCity && selectedCity !== '__all__') params.city = selectedCity;

    api.searchPlaces(params).then((res) => {
      const items = res.places || [];
      setPlaces(items);

      // Also keep a copy of state places if state is selected
      if (selectedState && selectedCity && selectedCity !== '__all__') {
        api.searchPlaces({ state: selectedState, limit: 600 }).then((sRes) => {
          setAllStatePlaces(sRes.places || []);
        }).catch(() => {});
      } else {
        setAllStatePlaces(items);
      }

      // Auto-set Origin and Destination within the selected city or state
      if (items.length >= 2) {
        setOriginId(String(items[0].id));
        setDestId(String(items[1].id));
      } else if (items.length === 1) {
        setOriginId(String(items[0].id));
        setDestId(String(items[0].id));
        if (mapInstanceRef.current && items[0].latitude && items[0].longitude) {
          mapInstanceRef.current.flyTo([items[0].latitude, items[0].longitude], 13);
        }
      }
    }).catch(() => {});
  }, [selectedState, selectedCity]);

  // 5. Manual Search Autocomplete Handler
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.searchPlaces({ q: searchQuery.trim(), limit: 12 });
        setSearchResults(res.places || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select place from Manual Search
  const handleSelectSearchResult = (place) => {
    if (!place) return;
    setSearchQuery('');
    setSearchResults([]);

    // Update state & city
    if (place.state && place.state !== selectedState) {
      setSelectedState(place.state);
    }
    if (place.city && place.city !== selectedCity) {
      setSelectedCity(place.city);
    }

    // Ensure place exists in current list
    setPlaces((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      return [place, ...prev];
    });

    // Make it destination or origin
    if (!originId || originId === String(place.id)) {
      setOriginId(String(place.id));
    } else {
      setDestId(String(place.id));
    }

    // Fly to place
    if (mapInstanceRef.current && place.latitude && place.longitude) {
      mapInstanceRef.current.flyTo([place.latitude, place.longitude], 14, { duration: 1.2 });
    }
  };

  // 6. Compute Route Comparison (Route A vs Route B)
  const handleCompareRoutes = async () => {
    const origin = (places.length ? places : allStatePlaces).find(
      (p) => String(p.id) === String(originId)
    );
    const dest = (places.length ? places : allStatePlaces).find(
      (p) => String(p.id) === String(destId)
    );
    if (!origin || !dest) return;

    if (origin.id === dest.id) {
      setRouteError('Origin and Destination are identical. Please select different starting and destination places to compare routes.');
      return;
    }

    setRouteError(null);
    setLoadingRoute(true);
    try {
      const data = await api.analyzeRoute({
        originName: origin.name,
        destName: dest.name,
        city: origin.city || selectedCity || selectedState || 'Delhi',
        originLat: origin.latitude,
        originLon: origin.longitude,
        destLat: dest.latitude,
        destLon: dest.longitude,
        weatherCondition: 'Clear',
        hour: Number(travelHour),
      });
      setRouteComparison(data);
      setActiveRouteTab('route_b'); // Default to AI recommended route
    } catch (err) {
      console.error('Route comparison error:', err);
      setRouteError('Could not calculate driving routes. Please try another pair of tourist places.');
    } finally {
      setLoadingRoute(false);
    }
  };

  // Re-run route comparison whenever origin, destination, or travelHour changes
  useEffect(() => {
    if (originId && destId && originId !== destId && places.length >= 1) {
      handleCompareRoutes();
    }
  }, [originId, destId, travelHour]);

  // Swap Origin and Destination
  const handleSwapOriginDest = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  // 7. Render Leaflet Map Markers & Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    const boundsPoints = [];

    const originPlace = places.find((p) => String(p.id) === String(originId));
    const destPlace = places.find((p) => String(p.id) === String(destId));

    // Render Tourist Places Markers
    if (layers.places) {
      const filteredPlaces = selectedCategoryChip === 'All'
        ? places
        : places.filter((p) =>
            p.category?.toLowerCase().includes(selectedCategoryChip.toLowerCase()) ||
            p.subCategory?.some((s) => s.toLowerCase().includes(selectedCategoryChip.toLowerCase()))
          );

      filteredPlaces.forEach((p) => {
        if (!p.latitude || !p.longitude) return;
        const isOrigin = String(p.id) === String(originId);
        const isDest = String(p.id) === String(destId);

        // Custom Leaflet Icons for Origin & Destination
        if (isOrigin) {
          const originIcon = L.divIcon({
            className: 'origin-marker',
            html: `
              <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <div style="background:#059669; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; box-shadow:0 4px 16px rgba(5,150,105,0.6); border:3px solid #ffffff; animation: pulse 2s infinite;">
                  A
                </div>
                <div style="background:#064e3b; color:#ecfdf5; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
                  START: ${p.name.slice(0, 18)}
                </div>
              </div>
            `,
            iconSize: [40, 56],
            iconAnchor: [20, 20],
          });
          const m = L.marker([p.latitude, p.longitude], { icon: originIcon, zIndexOffset: 1000 }).addTo(group);
          m.bindPopup(`
            <div style="font-size:12px; line-height:1.4; min-width:210px;">
              <span style="background:#059669; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700;">ORIGIN (START POINT A)</span>
              <div style="font-weight:800; font-size:14px; color:#0f172a; margin-top:4px;">${p.name}</div>
              <div style="color:#475569; font-weight:600;">${p.city}, ${p.state}</div>
              <div style="margin-top:6px; font-size:11px;">
                <strong>Safety:</strong> <span style="color:#059669; font-weight:700;">${p.safetyScore}/100 (${p.safetyLevel || 'Safe'})</span>
              </div>
            </div>
          `);
          boundsPoints.push([p.latitude, p.longitude]);
          return;
        }

        if (isDest) {
          const destIcon = L.divIcon({
            className: 'dest-marker',
            html: `
              <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <div style="background:#dc2626; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; box-shadow:0 4px 16px rgba(220,38,38,0.6); border:3px solid #ffffff; animation: pulse 2s infinite;">
                  B
                </div>
                <div style="background:#7f1d1d; color:#fef2f2; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
                  DEST: ${p.name.slice(0, 18)}
                </div>
              </div>
            `,
            iconSize: [40, 56],
            iconAnchor: [20, 20],
          });
          const m = L.marker([p.latitude, p.longitude], { icon: destIcon, zIndexOffset: 1000 }).addTo(group);
          m.bindPopup(`
            <div style="font-size:12px; line-height:1.4; min-width:210px;">
              <span style="background:#dc2626; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700;">DESTINATION (POINT B)</span>
              <div style="font-weight:800; font-size:14px; color:#0f172a; margin-top:4px;">${p.name}</div>
              <div style="color:#475569; font-weight:600;">${p.city}, ${p.state}</div>
              <div style="margin-top:6px; font-size:11px;">
                <strong>Safety:</strong> <span style="color:#059669; font-weight:700;">${p.safetyScore}/100</span> • Entry: ₹${p.entryFee}
              </div>
            </div>
          `);
          boundsPoints.push([p.latitude, p.longitude]);
          return;
        }

        // Regular tourist place marker
        const isSafe = p.safetyScore >= 75;
        const color = isSafe ? '#0284c7' : '#d97706';
        const fill = isSafe ? '#38bdf8' : '#f59e0b';

        const marker = L.circleMarker([p.latitude, p.longitude], {
          radius: 8,
          color,
          fillColor: fill,
          fillOpacity: 0.9,
          weight: 2,
        });

        marker.bindPopup(`
          <div style="font-size:12px; min-width:210px; line-height:1.4;">
            <div style="font-weight:800; font-size:14px; color:#0f172a;">${p.name}</div>
            <div style="color:#475569; font-weight:600;">${p.city}, ${p.state}</div>
            <div style="margin-top:6px; display:flex; align-items:center; gap:6px;">
              <span style="background:#0284c7; color:#fff; font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px;">${p.category}</span>
              <span style="color:#059669; font-weight:700;">Safety: ${p.safetyScore}/100</span>
            </div>
            <div style="margin-top:4px; color:#64748b; font-size:11px;">
              Entry: ₹${p.entryFee} • Hours: ${p.openingTime || '09:00'}-${p.closingTime || '18:00'}
            </div>
            <div style="margin-top:8px; display:flex; gap:6px;">
              <button onclick="window.__safeTripSetOrigin('${p.id}')" style="background:#059669; color:#fff; border:none; border-radius:6px; padding:4px 8px; font-size:11px; font-weight:700; cursor:pointer;">
                Set as Start (A)
              </button>
              <button onclick="window.__safeTripSetDest('${p.id}')" style="background:#dc2626; color:#fff; border:none; border-radius:6px; padding:4px 8px; font-size:11px; font-weight:700; cursor:pointer;">
                Set as Dest (B)
              </button>
            </div>
          </div>
        `);

        marker.addTo(group);
      });
    }

    // Expose quick setOrigin / setDest helpers to global window for popup buttons
    window.__safeTripSetOrigin = (id) => setOriginId(String(id));
    window.__safeTripSetDest = (id) => setDestId(String(id));

    // Render Incident Markers
    if (layers.incidents) {
      incidents.forEach((inc) => {
        if (!inc.latitude || !inc.longitude) return;
        const incIcon = L.divIcon({
          className: 'incident-badge',
          html: `
            <div style="background:#b91c1c; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; box-shadow:0 2px 8px rgba(185,28,28,0.5); border:2px solid #fff;">
              !
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const m = L.marker([inc.latitude, inc.longitude], { icon: incIcon }).addTo(group);
        m.bindPopup(`
          <div style="font-size:12px; min-width:190px;">
            <div style="font-weight:800; color:#b91c1c;">⚠ Hazard Alert: ${inc.category}</div>
            <div style="font-weight:600; color:#1e293b;">${inc.locationName} (${inc.city})</div>
            <p style="margin:4px 0; color:#475569; font-size:11px;">${inc.description}</p>
            <div style="font-size:10px; color:#94a3b8;">Severity: ${inc.severity} • Avoided in Route B</div>
          </div>
        `);
      });
    }

    // Google Maps Styled Dual Route Rendering:
    // Route B (AI Safe Route)
    if (layers.routeB && routeComparison?.route_b?.coordinates?.length) {
      const isSelected = activeRouteTab === 'route_b';
      const polyB = L.polyline(routeComparison.route_b.coordinates, {
        color: isSelected ? '#059669' : '#10b981',
        weight: isSelected ? 7 : 4,
        opacity: isSelected ? 1.0 : 0.55,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      polyB.on('click', () => setActiveRouteTab('route_b'));
      polyB.bindPopup(`
        <div style="font-size:12px; min-width:200px;">
          <div style="background:#059669; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; display:inline-block;">AI RECOMMENDED SAFE ROUTE (B)</div>
          <div style="font-weight:800; font-size:13px; margin-top:4px;">${routeComparison.route_b.duration_mins} mins • ${routeComparison.route_b.distance_km} km</div>
          <div style="color:#059669; font-weight:700;">Risk Score: ${routeComparison.route_b.risk_score}/100 (LOW RISK)</div>
          <div style="color:#475569; font-size:11px; margin-top:2px;">Well-lit divided arterial corridor with police patrol beats</div>
        </div>
      `);

      routeComparison.route_b.coordinates.forEach((pt) => boundsPoints.push(pt));

      // Route B Duration Floating Pill on Map
      if (routeComparison.route_b.coordinates.length > 2) {
        const midIdx = Math.floor(routeComparison.route_b.coordinates.length / 2);
        const midPoint = routeComparison.route_b.coordinates[midIdx];
        const pillIconB = L.divIcon({
          className: 'route-b-pill',
          html: `
            <div style="background:${isSelected ? '#059669' : '#34d399'}; color:#fff; padding:3px 8px; border-radius:20px; font-size:11px; font-weight:800; box-shadow:0 3px 10px rgba(0,0,0,0.3); border:2px solid #ffffff; white-space:nowrap; cursor:pointer; display:flex; align-items:center; gap:4px;">
              <span>✓ ${routeComparison.route_b.duration_mins} min</span>
              <span style="font-size:9px; opacity:0.9;">(${routeComparison.route_b.distance_km} km • Safe)</span>
            </div>
          `,
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });
        L.marker(midPoint, { icon: pillIconB }).addTo(group).on('click', () => setActiveRouteTab('route_b'));
      }
    }

    // Route A (Shortest Distance)
    if (layers.routeA && routeComparison?.route_a?.coordinates?.length) {
      const isSelected = activeRouteTab === 'route_a';
      const polyA = L.polyline(routeComparison.route_a.coordinates, {
        color: isSelected ? '#ef4444' : '#94a3b8',
        weight: isSelected ? 6 : 4,
        dashArray: isSelected ? '8, 8' : '5, 8',
        opacity: isSelected ? 0.95 : 0.45,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      polyA.on('click', () => setActiveRouteTab('route_a'));
      polyA.bindPopup(`
        <div style="font-size:12px; min-width:200px;">
          <div style="background:#ef4444; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; display:inline-block;">SHORTEST DISTANCE ROUTE (A)</div>
          <div style="font-weight:800; font-size:13px; margin-top:4px;">${routeComparison.route_a.duration_mins} mins • ${routeComparison.route_a.distance_km} km</div>
          <div style="color:#ef4444; font-weight:700;">Risk Score: ${routeComparison.route_a.risk_score}/100 (HIGH RISK)</div>
          <div style="color:#475569; font-size:11px; margin-top:2px;">Narrow 2-lane market streets with congestion & unlit spots</div>
        </div>
      `);

      routeComparison.route_a.coordinates.forEach((pt) => boundsPoints.push(pt));

      // Route A Duration Floating Pill on Map
      if (routeComparison.route_a.coordinates.length > 2) {
        const midIdx = Math.floor(routeComparison.route_a.coordinates.length / 2);
        const midPoint = routeComparison.route_a.coordinates[midIdx];
        const pillIconA = L.divIcon({
          className: 'route-a-pill',
          html: `
            <div style="background:${isSelected ? '#ef4444' : '#64748b'}; color:#fff; padding:3px 8px; border-radius:20px; font-size:11px; font-weight:800; box-shadow:0 3px 10px rgba(0,0,0,0.3); border:2px solid #ffffff; white-space:nowrap; cursor:pointer; display:flex; align-items:center; gap:4px;">
              <span>⚠ ${routeComparison.route_a.duration_mins} min</span>
              <span style="font-size:9px; opacity:0.9;">(${routeComparison.route_a.distance_km} km)</span>
            </div>
          `,
          iconSize: [110, 24],
          iconAnchor: [55, 12],
        });
        L.marker(midPoint, { icon: pillIconA }).addTo(group).on('click', () => setActiveRouteTab('route_a'));
      }
    }

    // Fit map bounds to route or selected city
    map.invalidateSize();
    if (boundsPoints.length >= 2) {
      const bounds = L.latLngBounds(boundsPoints);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
      }
    } else if (places.length > 0 && places[0].latitude && places[0].longitude) {
      map.setView([places[0].latitude, places[0].longitude], selectedCity ? 12 : 8);
    }
  }, [places, incidents, routeComparison, layers, originId, destId, activeRouteTab, selectedCategoryChip]);

  // Turn step click highlight handler
  const handleStepClick = (step) => {
    if (!step?.location || !mapInstanceRef.current) return;
    const [lat, lon] = step.location;
    mapInstanceRef.current.flyTo([lat, lon], 16, { duration: 0.8 });

    if (stepMarkerRef.current) {
      layerGroupRef.current.removeLayer(stepMarkerRef.current);
    }

    const stepPin = L.circleMarker([lat, lon], {
      radius: 10,
      color: '#2563eb',
      fillColor: '#60a5fa',
      fillOpacity: 0.9,
      weight: 3,
    }).addTo(layerGroupRef.current);

    stepPin.bindPopup(`<strong>${step.instruction}</strong><br/>${step.distance_label} • ${step.duration_label}`).openPopup();
    stepMarkerRef.current = stepPin;
  };

  // Turn Step Icon Helper
  const getStepIcon = (type = '', mod = '') => {
    const t = type.toLowerCase();
    const m = mod.toLowerCase();
    if (t === 'depart') return <Compass className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (t === 'arrive') return <Flag className="w-4 h-4 text-rose-600 shrink-0" />;
    if (t === 'roundabout' || t === 'rotary') return <RotateCw className="w-4 h-4 text-sky-600 shrink-0" />;
    if (m.includes('right')) return <CornerUpRight className="w-4 h-4 text-slate-700 shrink-0" />;
    if (m.includes('left')) return <CornerUpLeft className="w-4 h-4 text-slate-700 shrink-0" />;
    return <ArrowUp className="w-4 h-4 text-slate-600 shrink-0" />;
  };

  const originPlace = (places.length ? places : allStatePlaces).find((p) => String(p.id) === String(originId));
  const destPlace = (places.length ? places : allStatePlaces).find((p) => String(p.id) === String(destId));

  const activeRouteData = activeRouteTab === 'route_b'
    ? routeComparison?.route_b
    : routeComparison?.route_a;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top Header & Search Bar (Google Maps Style) */}
      <div className="st-page-hero bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>SafeTrip AI • Live Map Explorer & Dual-Route Safe Navigation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Interactive Map & Intelligent Route Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Explore all 36 Indian states, select cities, discover verified tourist places, and compare Shortest Route A vs AI-Optimized Safe Route B like Google Maps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCompareRoutes()}
              disabled={loadingRoute}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-teal-500/25 transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRoute ? 'animate-spin' : ''}`} />
              <span>{loadingRoute ? 'Computing Route...' : 'Recalculate Routes'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Manual Search Bar */}
        <div className="relative z-30">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any place, landmark, city or state (e.g. Taj Mahal, Red Fort, Mysore Palace, Marina Beach)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-80 overflow-y-auto z-50">
              {searching ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span>Searching all tourist destinations across India...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No places found for "{searchQuery}". Try another keyword or landmark.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Search Results ({searchResults.length})</span>
                    <span className="text-teal-600">Click to locate & add to route</span>
                  </div>
                  {searchResults.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => handleSelectSearchResult(place)}
                      className="p-3 px-4 hover:bg-teal-50/70 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-teal-600 group-hover:text-white transition">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-teal-700 transition">
                            {place.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {place.city}, {place.state} • {place.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Safety {place.safetyScore}/100
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-teal-300 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Filter Places:
            </span>
            {CATEGORY_CHIPS.map((chip) => {
              const active = selectedCategoryChip === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedCategoryChip(chip)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition whitespace-nowrap ${
                    active
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* State & City Controls + Route Origin/Destination Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* 1. State / UT Selection */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">1</span>
              <span>Select State / UT ({states.length})</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">All 36 States & UTs</option>
              {states.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.placesCount} places)
                </option>
              ))}
            </select>
          </div>

          {/* 2. City Selection */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              <span>Select City in {selectedState || 'India'} ({stateCities.length})</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="__all__">All Cities in {selectedState || 'India'}</option>
              {stateCities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.placesCount} places)
                </option>
              ))}
            </select>
          </div>

          {/* 3. From (Origin) Place */}
          <div>
            <label className="block text-xs font-black text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">A</span>
              <span>From (Starting Place)</span>
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full rounded-xl border border-emerald-300 px-3 py-2.5 text-xs font-bold bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {(places.length > 0 ? places : allStatePlaces).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          {/* 4. To (Destination) Place with Swap Button */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] flex items-center justify-center font-bold">B</span>
                <span>To (Destination Place)</span>
              </label>
              <button
                type="button"
                onClick={handleSwapOriginDest}
                title="Swap Origin and Destination"
                className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold flex items-center gap-1 transition"
              >
                <ArrowUpDown className="w-3 h-3 text-slate-600" />
                <span>Swap A ⇄ B</span>
              </button>
            </div>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full rounded-xl border border-rose-300 px-3 py-2.5 text-xs font-bold bg-rose-50/50 text-rose-950 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {(places.length > 0 ? places : allStatePlaces).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Travel Time & Layer Toggles Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3.5 border-t border-slate-100 text-xs">
          {/* Departure Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">Departure Hour:</span>
            <select
              value={travelHour}
              onChange={(e) => setTravelHour(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold bg-slate-50 text-slate-800"
            >
              <option value={9}>09:00 AM (Morning Rush)</option>
              <option value={14}>02:00 PM (Daytime Normal)</option>
              <option value={18}>06:00 PM (Evening Peak)</option>
              <option value={22}>10:00 PM (Night Safety Mode)</option>
            </select>
          </div>

          {/* Map Layer Checkboxes */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-teal-600" /> Active Map Layers:
            </span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.places}
                onChange={(e) => setLayers({ ...layers, places: e.target.checked })}
                className="accent-teal-600"
              />
              <span className="font-semibold text-slate-700">Tourist Places ({places.length})</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.routeB}
                onChange={(e) => setLayers({ ...layers, routeB: e.target.checked })}
                className="accent-emerald-600"
              />
              <span className="text-emerald-700 font-bold">Route B: Safe Route (Solid)</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.routeA}
                onChange={(e) => setLayers({ ...layers, routeA: e.target.checked })}
                className="accent-rose-600"
              />
              <span className="text-rose-600 font-bold">Route A: Shortest (Dashed)</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.incidents}
                onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
                className="accent-amber-600"
              />
              <span className="text-amber-700 font-semibold">Incident / Hazard Alerts ({incidents.length})</span>
            </label>
          </div>
        </div>
      </div>

      {routeError && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{routeError}</span>
        </div>
      )}

      {/* Main Split: Interactive Map + Google Maps Direction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Map View (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative" style={{ height: '680px', minHeight: '680px' }}>
          {/* Map canvas */}
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

          {/* Floating Map Legend Overlay */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md text-white p-3 px-4 rounded-2xl shadow-xl border border-white/10 text-xs pointer-events-auto">
            <div className="font-extrabold text-[11px] uppercase tracking-wider text-teal-400 mb-1.5 flex items-center gap-1.5">
              <RouteIcon className="w-3.5 h-3.5" />
              <span>Google Maps Route Comparison</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div
                onClick={() => setActiveRouteTab('route_b')}
                className={`flex items-center justify-between gap-3 cursor-pointer p-1 rounded-lg transition ${
                  activeRouteTab === 'route_b' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-emerald-500 rounded-full" />
                  <span>Route B (AI Safe Route)</span>
                </div>
                <span className="text-emerald-400 font-extrabold">
                  {routeComparison ? `${routeComparison.route_b.duration_mins}m` : 'Ready'}
                </span>
              </div>
              <div
                onClick={() => setActiveRouteTab('route_a')}
                className={`flex items-center justify-between gap-3 cursor-pointer p-1 rounded-lg transition ${
                  activeRouteTab === 'route_a' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-rose-500 rounded-full border-t border-dashed" />
                  <span>Route A (Shortest Distance)</span>
                </div>
                <span className="text-rose-400 font-extrabold">
                  {routeComparison ? `${routeComparison.route_a.duration_mins}m` : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Directions / Comparison / Tourist Places Explorer (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Tab Selector: Directions | Why Route B is Better | Places in City | Local Transit */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center justify-between gap-1 text-xs">
            {[
              { id: 'directions', label: 'Directions & Steps', icon: Navigation },
              { id: 'comparison', label: 'Why Route B is Better', icon: CheckCircle2 },
              { id: 'places', label: `Places (${places.length})`, icon: MapPin },
              { id: 'transit', label: 'Local Transit', icon: Train },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeSideView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSideView(tab.id)}
                  className={`flex-1 py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-center ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* VIEW 1: GOOGLE MAPS DIRECTIONS & ROUTE CARDS */}
          {activeSideView === 'directions' && (
            <div className="space-y-4">
              {routeComparison ? (
                <>
                  {/* Dual Route Chooser Cards (Google Maps Style) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Route B Card */}
                    <div
                      onClick={() => setActiveRouteTab('route_b')}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                        activeRouteTab === 'route_b'
                          ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          ✓ RECOMMENDED
                        </span>
                        <span className="text-xs font-bold text-emerald-800">
                          Risk {routeComparison.route_b.risk_score}/100
                        </span>
                      </div>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        {routeComparison.route_b.duration_mins} min
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        {routeComparison.route_b.distance_km} km • AI Safe Route
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-900 font-medium line-clamp-2">
                        Divided arterial corridor • 24/7 CCTV & police patrol beats
                      </div>
                    </div>

                    {/* Route A Card */}
                    <div
                      onClick={() => setActiveRouteTab('route_a')}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                        activeRouteTab === 'route_a'
                          ? 'bg-rose-50/90 border-rose-600 shadow-md ring-2 ring-rose-500/20'
                          : 'bg-white border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          SHORTEST DISTANCE
                        </span>
                        <span className="text-xs font-bold text-rose-700">
                          Risk {routeComparison.route_a.risk_score}/100
                        </span>
                      </div>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        {routeComparison.route_a.duration_mins} min
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        {routeComparison.route_a.distance_km} km • High Traffic
                      </div>
                      <div className="mt-2 text-[11px] text-rose-900 font-medium line-clamp-2">
                        Cuts through narrow market streets • Higher congestion & crash risk
                      </div>
                    </div>

                  </div>

                  {/* Summary of Active Route */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${activeRouteTab === 'route_b' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {activeRouteData?.label}
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowTurnSteps(!showTurnSteps)}
                        className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
                      >
                        <span>{showTurnSteps ? 'Hide Step Directions' : 'Show Step Directions'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTurnSteps ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      From: <span className="font-bold text-slate-900">{originPlace?.name}</span> → To: <span className="font-bold text-slate-900">{destPlace?.name}</span>
                    </p>

                    {/* Highlights */}
                    <div className="mt-3 space-y-1 text-xs">
                      {activeRouteData?.highlights?.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700">
                          {activeRouteTab === 'route_b' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Turn-by-Turn Navigation Steps (Google Maps Directions) */}
                  {showTurnSteps && activeRouteData?.steps && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-teal-600" />
                          <span>Turn-by-Turn Navigation Steps ({activeRouteData.steps.length})</span>
                        </span>
                        <span className="text-[11px] text-slate-500">Click step to view on map</span>
                      </div>

                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {activeRouteData.steps.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleStepClick(s)}
                            className="p-3 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 group"
                          >
                            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-teal-600 group-hover:text-white transition">
                              {getStepIcon(s.type, s.modifier)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">
                                {s.instruction}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {s.street && <span className="font-semibold text-slate-700">{s.street} • </span>}
                                <span>{s.distance_label}</span>
                                {s.duration_label && <span> ({s.duration_label})</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Link to Detailed Why Route B is Better */}
                  <div
                    onClick={() => setActiveSideView('comparison')}
                    className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-sky-500/10 border border-teal-500/30 hover:border-teal-500/50 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-black text-teal-900 uppercase">
                        Route Recommendation Verdict
                      </div>
                      <div className="text-xs text-slate-700 font-medium mt-0.5">
                        {routeComparison.recommendation_reason}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-teal-600 shrink-0 ml-2" />
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="font-bold text-slate-800 text-sm">Select Origin & Destination</div>
                  <p className="mt-1 max-w-xs mx-auto">
                    Pick a starting place (A) and destination (B) above to calculate AI Safe Route B and Shortest Route A.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: WHY ROUTE B IS BETTER THAN ROUTE A (Google Maps Deep Comparison) */}
          {activeSideView === 'comparison' && (
            <div className="space-y-4">
              {routeComparison ? (
                <>
                  {/* Executive Verdict Card */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>AI Route Optimization Verdict</span>
                    </div>
                    <h3 className="text-base font-black">
                      Why Route B is Recommended over Route A
                    </h3>
                    <p className="text-xs text-emerald-50 mt-1 leading-relaxed">
                      {routeComparison.why_route_b_farther?.summary || routeComparison.recommendation_reason}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
                        <span className="text-[10px] text-emerald-200 block font-semibold">Risk Reduction</span>
                        <strong className="text-sm font-black text-white">
                          -{Math.round(routeComparison.route_a.risk_score - routeComparison.route_b.risk_score)} pts
                        </strong>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
                        <span className="text-[10px] text-emerald-200 block font-semibold">Speed Advantage</span>
                        <strong className="text-sm font-black text-white">
                          {routeComparison.route_b.duration_mins <= routeComparison.route_a.duration_mins ? 'Faster Flow' : '+2m extra'}
                        </strong>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
                        <span className="text-[10px] text-emerald-200 block font-semibold">Safety Rating</span>
                        <strong className="text-sm font-black text-emerald-300">
                          {routeComparison.route_b.risk_level}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Matrix Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                      Side-by-Side Metric Comparison
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                          <tr>
                            <th className="py-2.5 px-3">Metric</th>
                            <th className="py-2.5 px-3 text-emerald-700">Route B (Safe Route)</th>
                            <th className="py-2.5 px-3 text-rose-700">Route A (Shortest)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-700">Travel Duration</td>
                            <td className="py-2 px-3 text-emerald-700 font-extrabold">{routeComparison.route_b.duration_mins} mins</td>
                            <td className="py-2 px-3 text-rose-700 font-bold">{routeComparison.route_a.duration_mins} mins</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-700">Total Distance</td>
                            <td className="py-2 px-3 text-slate-800">{routeComparison.route_b.distance_km} km</td>
                            <td className="py-2 px-3 text-slate-800">{routeComparison.route_a.distance_km} km</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-700">Safety Risk Score</td>
                            <td className="py-2 px-3 text-emerald-700 font-black">{routeComparison.route_b.risk_score}/100 (LOW)</td>
                            <td className="py-2 px-3 text-rose-700 font-black">{routeComparison.route_a.risk_score}/100 (HIGH)</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-700">Road Infrastructure</td>
                            <td className="py-2 px-3 text-slate-700">4-Lane Divided Ring Highway</td>
                            <td className="py-2 px-3 text-slate-700">Narrow 2-Lane Inner Market Alley</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-700">Street Lighting & CCTV</td>
                            <td className="py-2 px-3 text-emerald-700 font-semibold">100% High-Mast LED & Cameras</td>
                            <td className="py-2 px-3 text-rose-600">Unlit & Dark Stretches</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-700">Police PCR Patrols</td>
                            <td className="py-2 px-3 text-emerald-700 font-semibold">Frequent Active Beats</td>
                            <td className="py-2 px-3 text-slate-500">Sparse Secondary Beats</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-700">Accident Blackspots</td>
                            <td className="py-2 px-3 text-emerald-700 font-semibold">Completely Avoided</td>
                            <td className="py-2 px-3 text-rose-600 font-semibold">Passes 2-3 High-Fatality Spots</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4 Reasons Breakdown Cards */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Specific Reasons Behind Safe Route B Detour
                    </h4>
                    {routeComparison.why_route_b_farther?.reasons?.map((r, i) => (
                      <div key={i} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-slate-900">{r.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {r.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{r.detail}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  Select a Route first to view why Route B is safer and superior to Route A.
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: ALL TOURIST PLACES IN SELECTED CITY / STATE */}
          {activeSideView === 'places' && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-slate-900">
                    {selectedCity === '__all__' ? `All Cities in ${selectedState}` : selectedCity}
                  </span>
                  <span className="text-slate-500 ml-1">({places.length} places verified)</span>
                </div>
                <span className="text-[11px] font-semibold text-teal-700">1-click select for route</span>
              </div>

              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {places.map((place) => {
                  const isOrigin = String(place.id) === String(originId);
                  const isDest = String(place.id) === String(destId);
                  return (
                    <div
                      key={place.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isOrigin
                          ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                          : isDest
                          ? 'bg-rose-50 border-rose-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-slate-900">{place.name}</span>
                            {isOrigin && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                ORIGIN (A)
                              </span>
                            )}
                            {isDest && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-600 text-white">
                                DEST (B)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {place.city}, {place.state} • {place.category}
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          place.safetyScore >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Safety {place.safetyScore}/100
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                        <div>
                          <span>Entry: ₹{place.entryFee}</span>
                          <span className="mx-1.5">•</span>
                          <span>Rating: ★ {place.rating || '4.5'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setOriginId(String(place.id));
                              if (mapInstanceRef.current && place.latitude && place.longitude) {
                                mapInstanceRef.current.flyTo([place.latitude, place.longitude], 14);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition"
                          >
                            Set Start (A)
                          </button>
                          <button
                            onClick={() => {
                              setDestId(String(place.id));
                              if (mapInstanceRef.current && place.latitude && place.longitude) {
                                mapInstanceRef.current.flyTo([place.latitude, place.longitude], 14);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition"
                          >
                            Set Dest (B)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: LOCAL MULTI-MODAL TRANSIT OPTIONS */}
          {activeSideView === 'transit' && (
            <div className="space-y-3">
              {routeComparison?.transport_modes ? (
                <>
                  {/* Metro */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                          <Train className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900">
                            {routeComparison.transport_modes.metro.mode}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {routeComparison.transport_modes.metro.network}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-sky-700 block">
                          ₹{routeComparison.transport_modes.metro.estimated_fare_inr}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {routeComparison.transport_modes.metro.estimated_time_mins} mins
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {routeComparison.transport_modes.metro.route_summary}
                    </p>
                  </div>

                  {/* Bus */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          <Bus className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900">City Bus Transit</span>
                          <span className="text-[11px] text-slate-500 block">
                            {routeComparison.transport_modes.bus.bus_route}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-700 block">
                          ₹{routeComparison.transport_modes.bus.estimated_fare_inr}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {routeComparison.transport_modes.bus.estimated_time_mins} mins
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      From: {routeComparison.transport_modes.bus.nearest_stop} → To: {routeComparison.transport_modes.bus.destination_stop}
                    </div>
                  </div>

                  {/* Cab & Auto */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 mb-1">
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span>App Cab</span>
                      </div>
                      <div className="text-base font-black text-emerald-700">
                        ₹{routeComparison.transport_modes.cab.estimated_fare_inr}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {routeComparison.transport_modes.cab.estimated_time_mins} min door-to-door
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 mb-1">
                        <Navigation className="w-4 h-4 text-amber-600" />
                        <span>Metered Auto</span>
                      </div>
                      <div className="text-base font-black text-amber-700">
                        ₹{routeComparison.transport_modes.auto.estimated_fare_inr}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {routeComparison.transport_modes.auto.estimated_time_mins} min metered tariff
                      </div>
                    </div>
                  </div>

                  {/* Walking */}
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-slate-600" />
                      <div>
                        <span className="font-bold text-slate-900">Pedestrian Pathway</span>
                        <span className="text-[11px] text-slate-500 block">
                          {routeComparison.transport_modes.walking.details}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 block">Free</span>
                      <span className="text-[10px] text-slate-500">
                        {routeComparison.transport_modes.walking.estimated_time_mins} mins
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  Select a Route first to view multi-modal Metro, Bus, Cab, and Auto options.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
