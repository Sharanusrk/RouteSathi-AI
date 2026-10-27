import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  CloudSun,
  Navigation,
  FileText,
  ArrowRight,
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

const HERO_TRAVEL_VIDEOS = [
  {
    title: 'Motorcycle riders travelling in India',
    src: 'https://videos.pexels.com/video-files/26812335/12012951_2160_3840_60fps.mp4',
  },
  {
    title: 'Rajasthan desert forts',
    src: 'https://videos.pexels.com/video-files/4797161/4797161-uhd_3840_2160_24fps.mp4',
  },
  {
    title: 'Kerala backwaters',
    src: 'https://videos.pexels.com/video-files/35576273/15075199_2160_3840_30fps.mp4',
  },
  {
    title: 'Ladakh mountain roads',
    src: 'https://videos.pexels.com/video-files/27975367/12278555_2160_3840_60fps.mp4',
  },
  {
    title: 'Taj Mahal in Agra',
    src: 'https://videos.pexels.com/video-files/30061654/12894298_1080_1920_60fps.mp4',
  },
  {
    title: 'Goa coastline',
    src: 'https://videos.pexels.com/video-files/15456863/15456863-hd_1920_1080_24fps.mp4',
  },
  {
    title: 'Open roads across India',
    src: 'https://videos.pexels.com/video-files/36946421/15651997_3840_2160_60fps.mp4',
  },
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
  const [heroVideoIndexes, setHeroVideoIndexes] = useState([0, 1]);
  const [activeHeroVideoSlot, setActiveHeroVideoSlot] = useState(0);
  const [isHeroVideoTransitioning, setIsHeroVideoTransitioning] = useState(false);
  const [heroVideosEnabled, setHeroVideosEnabled] = useState(false);
  const heroVideoRefs = useRef([null, null]);
  const heroTransitionLock = useRef(false);
  const heroTransitionTimer = useRef(null);
  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const slowConnection = connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
    if (reducedMotion || slowConnection) return undefined;

    const startVideos = () => setHeroVideosEnabled(true);
    let idleHandle;
    let timer;
    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(startVideos, { timeout: 1400 });
    } else {
      timer = window.setTimeout(startVideos, 900);
    }

    return () => {
      if (idleHandle !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      if (timer) window.clearTimeout(timer);
    };
  }, []);

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

  useEffect(() => {
    heroVideoRefs.current.forEach((video) => {
      if (video) video.playbackRate = 1.75;
    });
  }, [heroVideoIndexes]);

  useEffect(() => () => {
    if (heroTransitionTimer.current) {
      window.clearTimeout(heroTransitionTimer.current);
    }
  }, []);

  const transitionHeroVideo = () => {
    if (heroTransitionLock.current) return;

    const fromSlot = activeHeroVideoSlot;
    const toSlot = 1 - fromSlot;
    const currentVideo = heroVideoRefs.current[fromSlot];
    const nextVideo = heroVideoRefs.current[toSlot];
    if (!currentVideo || !nextVideo) return;

    heroTransitionLock.current = true;
    nextVideo.currentTime = 0;
    nextVideo.playbackRate = 1.75;
    nextVideo.play().then(() => {
      setIsHeroVideoTransitioning(true);
      heroTransitionTimer.current = window.setTimeout(() => {
        currentVideo.pause();
        const upcomingIndex = (heroVideoIndexes[toSlot] + 1) % HERO_TRAVEL_VIDEOS.length;
        setHeroVideoIndexes((indexes) =>
          indexes.map((index, slot) => (slot === fromSlot ? upcomingIndex : index))
        );
        setActiveHeroVideoSlot(toSlot);
        setIsHeroVideoTransitioning(false);
        heroTransitionLock.current = false;
      }, 700);
    }).catch(() => {
      heroTransitionLock.current = false;
    });
  };

  const handleHeroVideoTimeUpdate = (slot) => {
    if (slot !== activeHeroVideoSlot || heroTransitionLock.current) return;
    const video = heroVideoRefs.current[slot];
    if (!video || !Number.isFinite(video.duration)) return;

    const transitionLeadTime = Math.min(4, Math.max(1, video.duration * 0.2));
    if (video.duration - video.currentTime <= transitionLeadTime) {
      transitionHeroVideo();
    }
  };

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
    <div className="pb-4 md:pb-20">
      {/* Still, full-bleed travel video hero. */}
      <section
        className="relative isolate flex h-[calc(100svh-76px)] min-h-[620px] max-h-[900px] items-center justify-center overflow-hidden bg-[#17231f] text-center text-white sm:min-h-[680px]"
        role="region"
        aria-label="Travel video"
      >
        {heroVideoIndexes.map((clipIndex, slot) => {
          const clip = HERO_TRAVEL_VIDEOS[clipIndex];
          const isVisible = slot === activeHeroVideoSlot
            ? !isHeroVideoTransitioning
            : isHeroVideoTransitioning;

          return (
            <video
              ref={(video) => {
                heroVideoRefs.current[slot] = video;
              }}
              key={`${slot}-${clip.src}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              src={heroVideosEnabled ? clip.src : undefined}
              poster="/travel-hero-fallback.svg"
              autoPlay={heroVideosEnabled && slot === activeHeroVideoSlot}
              muted
              playsInline
              preload={heroVideosEnabled ? (slot === activeHeroVideoSlot ? 'auto' : 'metadata') : 'none'}
              onLoadedMetadata={(event) => {
                event.currentTarget.playbackRate = 1.75;
              }}
              onTimeUpdate={slot === activeHeroVideoSlot ? () => handleHeroVideoTimeUpdate(slot) : undefined}
              onEnded={slot === activeHeroVideoSlot ? transitionHeroVideo : undefined}
              aria-hidden={slot !== activeHeroVideoSlot}
              aria-label={clip.title}
            />
          );
        })}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/55" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
          <p className="mx-auto mb-5 inline-flex rounded-full border border-white/35 bg-black/20 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm sm:text-xs">
            RouteSathi · Explore India
          </p>
          <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.055em] drop-shadow-[0_4px_22px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl">
            Discover India
            <br />
            <span className="font-serif font-medium italic text-[#ffd27a]">your way.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm font-medium text-white/90 drop-shadow sm:text-lg">
            Plan a trip. Travel safer.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => document.getElementById('trip-planner')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#17231f] shadow-lg transition hover:bg-[#fff2d3]"
            >
              Plan a trip <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-black/15 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Explore places
            </button>
          </div>
        </div>
      </section>

      <section className="relative bg-[#f4f1e9] px-4 py-10 text-slate-900 sm:px-6 sm:py-14">
        <div className="max-w-7xl mx-auto">          {/* MAIN BOOKING-STYLE SEARCH ENGINE WIDGET */}
          <form
            onSubmit={handlePlanTrip}
            id="trip-planner"
            className="mx-auto max-w-6xl rounded-[1.75rem] border border-white bg-white p-4 text-slate-900 shadow-[0_24px_80px_-48px_rgba(23,35,31,0.45)] sm:p-7 scroll-mt-28"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
              {/* 1. FROM: Starting Location (All Indian Cities) */}
              <div className="lg:col-span-3">
                <AllIndiaCitySelect
                  label="From"
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
                    To
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
                  Interests:
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
                className="px-7 py-3.5 rounded-xl bg-[#245c4a] hover:bg-[#194638] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 shrink-0 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build my trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Evaluation Scenarios (Section 48 Demo Flow) */}
          <div className="max-w-6xl mx-auto mt-5 hidden flex-wrap items-center justify-center gap-2 text-xs sm:flex">
            <span className="text-slate-500 font-semibold">Quick starts</span>
            <button
              onClick={() =>
                runCanonicalDemo('Delhi', 3, 15000, ['Historical', 'Couple', 'Museum', 'Food'])
              }
              className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 font-bold transition"
            >
              🚀 Delhi · 3 days
            </button>
            <button
              onClick={() =>
                runCanonicalDemo('Mysore', 2, 10000, ['Palace', 'Heritage', 'Family', 'Nature'])
              }
              className="px-3 py-1.5 rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-100 text-violet-700 font-bold transition"
            >
              🏰 Mysore · 2 days
            </button>
            <button
              onClick={() =>
                runCanonicalDemo('Jaipur', 3, 20000, ['Fort', 'Palace', 'Cultural', 'Shopping'])
              }
              className="px-3 py-1.5 rounded-full bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-100 text-fuchsia-700 font-bold transition"
            >
              🐪 Jaipur · 3 days
            </button>
          </div>
        </div>
      </section>

      {/* TOURISM CATEGORIES EXPLORER (Section 4 & 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Explore by Tourism Category
              </h2>
              <p className="text-xs text-slate-500">
                Find places by the way you like to travel.
              </p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
            >
              <span>All states & UTs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5">
            {HERO_CATEGORIES.map((c, index) => (
              <button
                key={c.label}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(c.value)}`)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200/80 transition group text-center ${index > 7 ? "hidden sm:flex" : ""}`}
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

      {/* 6 PILLARS OF ROUTERAKSHA AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Travel, planned with care
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Smart planning. Safer routes. Better discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: ShieldCheck,
              color: 'bg-emerald-500',
              title: 'Multi-Factor AI Safety Engine',
              desc: 'Weather, routes, crowds, and local risks—one clear score.',
              link: '/safety',
            },
            {
              icon: Navigation,
              color: 'bg-sky-600',
              title: 'Safe Route vs. Shortest Route',
              desc: 'Compare quick routes with safer ways to get there.',
              link: '/map',
            },
            {
              icon: CloudSun,
              color: 'bg-amber-500',
              title: 'Weather-Activity & Crowd ML',
              desc: 'Plan outdoor stops around local weather.',
              link: '/safety',
            },
            {
              icon: Calendar,
              color: 'bg-indigo-600',
              title: 'Dynamic Geo-Clustered Itineraries',
              desc: 'Group nearby places and compare local travel costs.',
              link: '/planner',
            },
            {
              icon: FileText,
              color: 'bg-rose-600',
              title: '9-Step PDF Ingestion & PDF Export',
              desc: 'Save and share your trip as a PDF.',
              link: '/pdf',
            },
            {
              icon: Cpu,
              color: 'bg-purple-600',
              title: 'IEEE / ML Evaluation Dashboard',
              desc: 'See how the travel AI is evaluated.',
              link: '/ml-dashboard',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(feat.link)}
                className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-sky-300 transition flex flex-col justify-between ${i > 2 ? "hidden sm:flex" : ""}`}
              >
                <div>
                  <div className={`w-11 h-11 rounded-2xl ${feat.color} text-white flex items-center justify-center shadow-md mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-sky-600">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED VERIFIED DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Places worth the journey
            </h2>
            <p className="text-xs text-slate-500">
              A few favorites from across India.
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Explore all places
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
