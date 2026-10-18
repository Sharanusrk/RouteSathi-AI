import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck,
  CloudSun,
  Navigation,
  FileText,
  ArrowRight,
  Search,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { useTrip } from '../context/TripContext';
import PlaceCard from '../components/PlaceCard';
import AllIndiaCitySelect from '../components/AllIndiaCitySelect';

const HERO_CATEGORIES = [
  { label: 'Temples', value: 'Temple', emoji: '🛕' },
  { label: 'Historical Places', value: 'Historical', emoji: '🏛️' },
  { label: 'Beaches', value: 'Beach', emoji: '🏖️' },
  { label: 'Hill Stations', value: 'Hill Station', emoji: '⛰️' },
  { label: 'Couples', value: 'Couple', emoji: '💑' },
  { label: 'Family', value: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { label: 'Adventure', value: 'Adventure', emoji: '🧗' },
  { label: 'Nature', value: 'Nature', emoji: '🌿' },
  { label: 'Museums', value: 'Museum', emoji: '🏺' },
  { label: 'Wildlife', value: 'Wildlife', emoji: '🐅' },
  { label: 'Waterfalls', value: 'Waterfall', emoji: '🌊' },
  { label: 'Forts', value: 'Fort', emoji: '🏰' },
  { label: 'Spiritual', value: 'Spiritual', emoji: '🕉️' },
  { label: 'Cultural', value: 'Cultural', emoji: '🎭' },
  { label: 'Shopping', value: 'Shopping', emoji: '🛍️' },
  { label: 'Food & Heritage', value: 'Food', emoji: '🍛' },
  { label: 'Photography', value: 'Photography', emoji: '📸' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { searchCriteria, setSearchCriteria } = useTrip();

  const [startLocation, setStartLocation] = useState(searchCriteria.startLocation || 'Bangalore');
  const [destination, setDestination] = useState(searchCriteria.destination || 'Delhi');
  const [days, setDays] = useState(searchCriteria.days || 3);
  const [travelDate, setTravelDate] = useState(searchCriteria.date || '2026-10-15');
  const [travelers, setTravelers] = useState(searchCriteria.travelers || 2);
  const [budget, setBudget] = useState(searchCriteria.budget || 15000);
  const [selectedCats, setSelectedCats] = useState(['Historical', 'Couple', 'Museum', 'Food']);
  const [allCities, setAllCities] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api
      .searchPlaces({ limit: 8 })
      .then((res) => setFeaturedPlaces(res.places || []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));
    api
      .getCities()
      .then((res) => setAllCities(res.cities || []))
      .catch(() => {});
    api
      .getStates()
      .then((res) => setAllStates(res.states || []))
      .catch(() => {});
  }, []);

  const toggleCategory = (catVal) => {
    setSelectedCats((prev) =>
      prev.includes(catVal) ? prev.filter((c) => c !== catVal) : [...prev, catVal]
    );
  };

  const handleSwapCities = () => {
    const prevStart = startLocation;
    setStartLocation(destination);
    setDestination(prevStart);
  };

  const handlePlanTrip = (e) => {
    e.preventDefault();
    setSearchCriteria({
      startLocation,
      destination,
      days: Number(days),
      budget: Number(budget),
      travelers: Number(travelers),
      date: travelDate,
      preferredStartTime: '09:00',
      travelPreference: selectedCats.join(', '),
      categories: selectedCats.length > 0 ? selectedCats : ['Historical', 'Couple'],
    });
    navigate('/planner?auto=1');
  };

  const runCanonicalDemo = (destCity, daysCount, budgetVal, cats) => {
    setSearchCriteria({
      startLocation: startLocation || 'Bangalore',
      destination: destCity,
      days: daysCount,
      budget: budgetVal,
      travelers: 2,
      date: '2026-10-15',
      preferredStartTime: '09:00',
      travelPreference: cats.join(', '),
      categories: cats,
    });
    navigate('/planner?auto=1');
  };

  return (
    <div className="pb-20">
      {/* VIDEO HERO */}
      <section className="relative isolate flex min-h-[76svh] items-center justify-center overflow-hidden bg-slate-950 px-4 py-20 text-white sm:min-h-[calc(100svh-4rem)] sm:px-6">
        <iframe
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube-nocookie.com/embed/4WZ2KAbuDns?autoplay=1&mute=1&controls=0&loop=1&playlist=4WZ2KAbuDns&playsinline=1&rel=0&modestbranding=1"
          title="Incredible India travel video background"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media; picture-in-picture"
          aria-hidden="true"
          tabIndex="-1"
        />
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-transparent to-slate-950/55" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-white backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Your India travel companion</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)]">
              Plan your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-violet-300 to-fuchsia-300">India adventure</span> with AI
            </h1>
            <p className="mt-6 text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Personalized itineraries, thoughtful safety insights, and a smoother way to explore India.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                type="button"
                onClick={() => document.getElementById('trip-planner')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="px-7 py-3.5 rounded-xl bg-white text-slate-950 text-sm font-extrabold shadow-lg hover:bg-slate-100 transition"
              >
                Start planning <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="px-7 py-3.5 rounded-xl border border-white/60 bg-black/20 text-white text-sm font-bold backdrop-blur-sm hover:bg-white/15 transition"
              >
                Explore India
              </button>
            </div>
          </div>
          <a
            href="https://www.youtube.com/watch?v=4WZ2KAbuDns"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-5 right-4 sm:right-6 text-[10px] sm:text-xs text-white/75 hover:text-white"
          >
            Travel film by Incredible India
          </a>
        </div>
      </section>

      <section className="relative bg-white px-4 py-12 text-slate-900 sm:px-6 sm:py-16">
        <div className="max-w-7xl mx-auto">          {/* MAIN BOOKING-STYLE SEARCH ENGINE WIDGET */}
          <form
            onSubmit={handlePlanTrip}
            id="trip-planner"
            className="bg-white text-slate-900 rounded-3xl shadow-[0_18px_70px_-42px_rgba(30,41,59,0.35)] p-5 sm:p-7 border border-slate-200/80 max-w-6xl mx-auto scroll-mt-28"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
              {/* 1. FROM: Starting Location (All Indian Cities) */}
              <div className="lg:col-span-3">
                <AllIndiaCitySelect
                  label="1. From (Starting City — All India)"
                  value={startLocation}
                  onChange={setStartLocation}
                  apiCities={allCities}
                  placeholder="Select Starting City..."
                  accentColor="emerald"
                />
              </div>

              {/* Swap From <-> To Button + 2. TO: Destination (All Indian Cities & States) */}
              <div className="lg:col-span-4 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    2. To (Destination City or State)
                  </label>
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="text-[11px] font-bold text-violet-700 hover:text-violet-900 px-2 py-0.5 rounded-md bg-violet-50 hover:bg-violet-100 transition cursor-pointer"
                    title="Swap From and To Cities"
                  >
                    ⇄ Swap From / To
                  </button>
                </div>
                <AllIndiaCitySelect
                  label=""
                  value={destination}
                  onChange={setDestination}
                  apiCities={allCities}
                  states={allStates}
                  includeStates={true}
                  placeholder="Select Destination City or State..."
                  accentColor="sky"
                />
              </div>

              {/* 3. Number of Days */}
              <div className="lg:col-span-1">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Days
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
                    <option key={d} value={d}>
                      {d} {d === 1 ? 'Day' : 'Days'}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Travel Date */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Travel Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-9 pr-2.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. Travelers & Budget */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Travelers & Budget
                </label>

                <div className="flex gap-1.5">
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-1/2 px-2 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-xs focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((t) => (
                      <option key={t} value={t}>
                        {t} Pax
                      </option>
                    ))}
                  </select>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-1/2 px-2 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-emerald-700 text-xs focus:outline-none"
                  >
                    <option value={5000}>₹5,000</option>
                    <option value={10000}>₹10,000</option>
                    <option value={15000}>₹15,000</option>
                    <option value={20000}>₹20,000</option>
                    <option value={50000}>₹50,000+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tourism Preferences Selector + Submit Row */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-xs font-extrabold text-slate-500 mr-1">
                  Tourism Preferences:
                </span>
                {['Historical', 'Couple', 'Museum', 'Food', 'Temple', 'Nature', 'Beach', 'Hill Station', 'Fort', 'Wildlife'].map(
                  (pref) => {
                    const active = selectedCats.includes(pref);
                    return (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => toggleCategory(pref)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          active
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {active ? `✓ ${pref}` : pref}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 shrink-0 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Plan My Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Evaluation Scenarios (Section 48 Demo Flow) */}
          <div className="max-w-6xl mx-auto mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Try a sample trip</span>
            <button
              onClick={() =>
                runCanonicalDemo('Delhi', 3, 15000, ['Historical', 'Couple', 'Museum', 'Food'])
              }
              className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 font-bold transition"
            >
              🚀 Demo 1: Bangalore → Delhi (3 Days, ₹15,000, Historical + Couple + Food)
            </button>
            <button
              onClick={() =>
                runCanonicalDemo('Mysore', 2, 10000, ['Palace', 'Heritage', 'Family', 'Nature'])
              }
              className="px-3 py-1.5 rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-100 text-violet-700 font-bold transition"
            >
              🏰 Demo 2: Karnataka → Mysore Royal Circuit (2 Days, ₹10,000)
            </button>
            <button
              onClick={() =>
                runCanonicalDemo('Jaipur', 3, 20000, ['Fort', 'Palace', 'Cultural', 'Shopping'])
              }
              className="px-3 py-1.5 rounded-full bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-100 text-fuchsia-700 font-bold transition"
            >
              🐪 Demo 3: Jaipur Royal Heritage (3 Days, ₹20,000)
            </button>
          </div>
        </div>
      </section>

      {/* TOURISM CATEGORIES EXPLORER (Section 4 & 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Explore by Tourism Category
              </h2>
              <p className="text-xs text-slate-500">
                Click any category to filter verified Indian tourist places with safety & crowd scores
              </p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
            >
              <span>View All 36 States & UTs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5">
            {HERO_CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(c.value)}`)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200/80 transition group text-center"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition">
                  {c.emoji}
                </span>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-sky-700 leading-tight">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6 PILLARS OF SAFETRIP AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            More Than a Recommendation Site — A Unified Safety & Trip Intelligence Engine
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Combining Machine Learning models trained on Indian Tourism,IMD Rainfall, NCRB Crime, and Road Risk datasets with real-time weather and routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: ShieldCheck,
              color: 'bg-emerald-500',
              title: 'Multi-Factor AI Safety Engine',
              desc: 'Evaluates Weather Risk (20%), Route Risk (20%), Crowd Risk (15%), Time Risk (15%), Location Risk (15%), and Scam Risk (15%) with explainable scores & safer alternatives.',
              link: '/safety',
            },
            {
              icon: Navigation,
              color: 'bg-sky-600',
              title: 'Safe Route vs. Shortest Route',
              desc: 'Uses NetworkX & OpenStreetMap/OSRM to compare Route A (shortest distance) against Route B (lower-risk arterial & metro corridor) on an interactive Leaflet map.',
              link: '/map',
            },
            {
              icon: CloudSun,
              color: 'bg-amber-500',
              title: 'Weather-Activity & Crowd ML',
              desc: 'Integrates Open-Meteo live telemetry with Random Forest & Decision Tree classifiers to flag high-risk outdoor activities during heavy rain or heat waves.',
              link: '/safety',
            },
            {
              icon: Calendar,
              color: 'bg-indigo-600',
              title: 'Dynamic Geo-Clustered Itineraries',
              desc: 'Automatically groups nearby monuments on the same day, checks opening hours, and computes Metro, Bus, Auto, and Cab fares between stops.',
              link: '/planner',
            },
            {
              icon: FileText,
              color: 'bg-rose-600',
              title: '9-Step PDF Ingestion & PDF Export',
              desc: 'Extracts and validates structured tourism datasets from uploaded PDFs with admin approval, and exports complete traveler PDF itineraries.',
              link: '/pdf',
            },
            {
              icon: Cpu,
              color: 'bg-purple-600',
              title: 'IEEE / ML Evaluation Dashboard',
              desc: 'Compares Random Forest, Decision Tree, and Logistic Regression with Confusion Matrices, Precision, Recall, F1, ROC-AUC, and Feature Importance.',
              link: '/ml-dashboard',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(feat.link)}
                className="cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-sky-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-2xl ${feat.color} text-white flex items-center justify-center shadow-md mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-sky-600">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED VERIFIED DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Top AI-Verified Indian Tourist Landmarks
            </h2>
            <p className="text-xs text-slate-500">
              Curated from ProjectCapstone Indian Tourism Dataset with verified history, timings & safety scores
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Explore All 300+ Places
          </button>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
