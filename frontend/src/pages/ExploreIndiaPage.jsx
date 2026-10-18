import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  Compass,
  ShieldCheck,
  Building2,
  Utensils,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import PlaceCard from '../components/PlaceCard';

const SMART_SEARCH_EXAMPLES = [
  'Delhi',
  'Karnataka',
  'Historical places in Delhi',
  'Temples in Tamil Nadu',
  'Couple places in Bangalore',
  'Museums in Mumbai',
  'Waterfalls in Kerala',
  'Historical places in Mysore',
];

export default function ExploreIndiaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCity, setSelectedCity] = useState('All');
  const [districtExtras, setDistrictExtras] = useState({ hotels: [], restaurants: [] });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minSafety, setMinSafety] = useState(0);
  const [crowdFilter, setCrowdFilter] = useState('All');
  const [maxFee, setMaxFee] = useState('');

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStates(), api.getCategories(), api.getCities()])
      .then(([stRes, catRes, cityRes]) => {
        setStates(stRes.states || []);
        setCategories(catRes.categories || []);
        setCities(cityRes.cities || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    fetchPlaces();
  }, [searchQuery, selectedState, selectedDistrict, selectedCity, selectedCategory, minSafety, crowdFilter, maxFee]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const res = await api.searchPlaces({
        q: searchQuery,
        state: selectedState?.name || '',
        district: selectedDistrict?.name || '',
        city: selectedCity === 'All' ? '' : selectedCity,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        min_safety: minSafety > 0 ? minSafety : '',
        crowd: crowdFilter === 'All' ? '' : crowdFilter,
        max_entry_fee: maxFee !== '' ? maxFee : '',
        limit: 600,
      });
      setPlaces(res.places || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  const handleSelectState = async (st) => {
    if (selectedState?.id === st.id) {
      setSelectedState(null);
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }
    setSelectedState(st);
    setSelectedDistrict(null);
    try {
      const res = await api.getStateDistricts(st.id);
      setDistricts(res.districts || []);
    } catch {
      setDistricts([]);
    }
  };

  const handleSelectDistrict = async (dist) => {
    if (selectedDistrict?.id === dist.id) {
      setSelectedDistrict(null);
      setDistrictExtras({ hotels: [], restaurants: [] });
      return;
    }
    setSelectedDistrict(dist);
    try {
      const res = await api.getDistrictPlaces(dist.id);
      setDistrictExtras({
        hotels: res.hotels || [],
        restaurants: res.restaurants || [],
      });
    } catch {
      setDistrictExtras({ hotels: [], restaurants: [] });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setSelectedCategory('All');
    setMinSafety(0);
    setCrowdFilter('All');
    setMaxFee('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header & Smart Search Bar */}
      <div className="st-page-hero bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>State & District Tourism Hierarchy Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Explore All 36 Indian States, Union Territories & Districts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Drill down from India → State → District → Tourist Places, or use natural-language AI search.
            </p>
          </div>

          {selectedState && (
            <button
              onClick={() => navigate(`/planner?dest=${encodeURIComponent(selectedState.name)}`)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold shadow-lg transition shrink-0"
            >
              Plan AI Trip to {selectedState.name} →
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try "Historical places in Delhi", "Temples in Tamil Nadu", "Waterfalls in Kerala", "Historical places in Mysore"...'
            className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white text-slate-900 font-semibold text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Natural Language Search Quick Chips (Section 7) */}
        <div className="mt-4 flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-bold text-sky-300 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Try Smart Queries:
          </span>
          {SMART_SEARCH_EXAMPLES.map((q) => (
            <button
              key={q}
              onClick={() => {
                setSelectedState(null);
                setSelectedDistrict(null);
                setSelectedCategory('All');
                setSearchQuery(q);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                searchQuery.toLowerCase() === q.toLowerCase()
                  ? 'bg-sky-500 text-white border-sky-400'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
              }`}
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* ALL 36 STATES & UNION TERRITORIES SELECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>Step 1: Select Indian State or Union Territory ({states.length})</span>
          </h2>
          {(selectedState || selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {states.map((st) => {
            const active = selectedState?.id === st.id;
            return (
              <button
                key={st.id}
                onClick={() => handleSelectState(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>{st.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {st.placesCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* DISTRICT HIERARCHY DRILLDOWN */}
        {selectedState && districts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-extrabold text-slate-700 mb-2">
              Step 2: Districts in {selectedState.name} ({districts.length}) — Click a district to filter:
            </p>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => {
                const active = selectedDistrict?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDistrict(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      active
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className="text-[10px] opacity-80">({d.placesCount} places)</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MULTI-FACTOR FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            All-India City ({cities.length} Cities)
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
          >
            <option value="All">All Indian Cities ({cities.length})</option>
            {cities
              .filter((c) => !selectedState || c.state === selectedState.name)
              .map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.state})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Tourism Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
          >
            <option value="All">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Minimum Safety Score
          </label>
          <select
            value={minSafety}
            onChange={(e) => setMinSafety(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
          >
            <option value={0}>Any Safety Level</option>
            <option value={75}>75+ (Safe & Verified)</option>
            <option value={85}>85+ (High Safety Zone)</option>
            <option value={90}>90+ (Top Security Landmarks)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Crowd Level Filter
          </label>
          <select
            value={crowdFilter}
            onChange={(e) => setCrowdFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
          >
            <option value="All">All Crowd Levels</option>
            <option value="low">Low Crowd Only</option>
            <option value="moderate">Moderate Crowd</option>
            <option value="high">High Popularity Hubs</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Max Entry Fee (INR)
          </label>
          <select
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
          >
            <option value="">Any Entry Ticket Fee</option>
            <option value="0">Free Entry Only (₹0)</option>
            <option value="50">Up to ₹50</option>
            <option value="150">Up to ₹150</option>
          </select>
        </div>
      </div>

      {/* District Hotels & Food Preview if District Selected */}
      {selectedDistrict && (districtExtras.hotels.length > 0 || districtExtras.restaurants.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-emerald-900 uppercase flex items-center gap-1.5 mb-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Hotels in {selectedDistrict.name}</span>
            </h3>
            <div className="space-y-1.5">
              {districtExtras.hotels.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="font-bold text-slate-800">{h.name} ({h.tier})</span>
                  <span className="font-bold text-emerald-700">₹{h.pricePerNight}/night • Safety {h.safetyScore}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-amber-900 uppercase flex items-center gap-1.5 mb-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Recommended Local Food in {selectedDistrict.name}</span>
            </h3>
            <div className="space-y-1.5">
              {districtExtras.restaurants.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-amber-100">
                  <span className="font-bold text-slate-800">{r.name} ({r.cuisine})</span>
                  <span className="font-bold text-amber-700">₹{r.avgCostForTwo} for 2 • ★ {r.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-700">
          Showing <span className="text-sky-600 font-extrabold">{places.length}</span> verified tourist places
          {selectedState ? ` in ${selectedState.name}` : ''}
          {selectedDistrict ? ` → ${selectedDistrict.name}` : ''}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-slate-800">No Matching Tourist Places Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try clearing one of your active filters or searching for another Indian state, city, or category.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
