import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { api } from '../services/api';
import {
  Sparkles,
  Compass,
  ShieldCheck,
  IndianRupee,
  Clock,
  Train,
  Bus,
  Car,
  AlertTriangle,
  CheckCircle2,
  Download,
  Sliders,
  History,
  Hotel,
  Utensils,
  Navigation,
  ArrowRight,
  MapPin,
  Footprints,
  ExternalLink,
  ChevronRight,
  Calendar,
  Plane,
  Coffee,
  Sunset,
  Moon,
  Info,
} from 'lucide-react';
import AllIndiaCitySelect from '../components/AllIndiaCitySelect';

const CATEGORIES = [
  'Historical', 'Heritage', 'Monument', 'Fort', 'Palace', 'Museum', 'Temple', 'Spiritual',
  'Nature', 'Beach', 'Hill Station', 'Waterfall', 'Wildlife', 'Adventure', 'Couple', 'Family', 'Food', 'Shopping'
];

export default function TripPlannerPage() {
  const navigate = useNavigate();
  const { searchCriteria, setSearchCriteria, activeItinerary, setActiveItinerary } = useTrip();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [showWeights, setShowWeights] = useState(false);

  const [weights, setWeights] = useState({
    preference_match: 0.22,
    budget_match: 0.16,
    safety: 0.20,
    weather_suitability: 0.12,
    crowd_suitability: 0.10,
    distance: 0.08,
    rating: 0.07,
    time_suitability: 0.05,
  });

  useEffect(() => {
    api.getStates().then((res) => setStates(res.states || [])).catch(() => {});
    api.getCities().then((res) => setCities(res.cities || [])).catch(() => {});
  }, []);

  const updateCriteria = (patch) => {
    setSearchCriteria((prev) => ({ ...prev, ...patch }));
  };

  const toggleCategory = (cat) => {
    const curr = searchCriteria.categories || [];
    if (curr.includes(cat)) {
      updateCriteria({ categories: curr.filter((c) => c !== cat) });
    } else {
      updateCriteria({ categories: [...curr, cat] });
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const planPayload = {
        startLocation: searchCriteria.startLocation || 'Bangalore',
        destination: searchCriteria.destination || 'Delhi',
        days: Number(searchCriteria.days) || 3,
        budget: Number(searchCriteria.budget) || 15000,
        travelers: Number(searchCriteria.travelers) || 2,
        date: searchCriteria.date || '2026-10-15',
        preferredStartTime: searchCriteria.preferredStartTime || '09:00',
        travelPreference: searchCriteria.travelPreference || 'Historical & Couple',
        categories: searchCriteria.categories || ['Historical', 'Museum'],
      };
      const recPayload = {
        ...planPayload,
        customWeights: weights,
      };
      const [itinData, recData] = await Promise.all([
        api.planTrip(planPayload),
        api.getRecommendations(recPayload),
      ]);
      setActiveItinerary(itinData);
      setRecommendations(recData);
      setSelectedDay(1);
    } catch (err) {
      setError(err.message || 'Failed to generate AI trip plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeItinerary) {
      handleGenerate();
    } else if (!recommendations) {
      api.getRecommendations({
        startLocation: searchCriteria.startLocation || 'Bangalore',
        destination: activeItinerary.destination || searchCriteria.destination || 'Delhi',
        days: Number(searchCriteria.days) || 3,
        budget: Number(searchCriteria.budget) || 15000,
        travelers: Number(searchCriteria.travelers) || 2,
        date: searchCriteria.date || '2026-10-15',
        preferredStartTime: searchCriteria.preferredStartTime || '09:00',
        travelPreference: searchCriteria.travelPreference || 'Historical & Couple',
        categories: searchCriteria.categories || ['Historical', 'Museum'],
        customWeights: weights,
      }).then((data) => setRecommendations(data)).catch(() => {});
    }
  }, []);

  const handleDownloadPdf = async () => {
    if (!activeItinerary) return;
    setPdfLoading(true);
    try {
      let blob;
      if (activeItinerary.tripId) {
        blob = await api.exportTripPdf(activeItinerary.tripId);
      } else {
        blob = await api.exportDirectPdf(activeItinerary);
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SafeTrip_AI_${(activeItinerary.destination || 'India').replace(/\s+/g, '_')}_Itinerary.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate PDF itinerary: ' + err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const activeDayObj = activeItinerary?.days?.find((d) => d.day === selectedDay) || activeItinerary?.days?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Page Header */}
      <div className="st-page-hero bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hybrid AI Recommendation + Geo-Clustered Day Planner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              AI Day-by-Day Trip Planner & Route Logistics Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Generates precision time-slotted daily schedules with physical distances, Metro/Bus/Cab fares, opening hours, ticket costs, and live weather-activity safety assessments.
            </p>
          </div>
          {activeItinerary && (
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{pdfLoading ? 'Generating PDF...' : 'Download Full PDF Travel Guide'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Trip Configuration Form */}
      <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Trip Parameters & Preferences</span>
          </h2>
          <button
            type="button"
            onClick={() => setShowWeights(!showWeights)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showWeights ? 'Hide AI Scoring Weights' : 'Configure AI Weights'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <AllIndiaCitySelect
              label="1. From (Starting City)"
              value={searchCriteria.startLocation || 'Bangalore'}
              onChange={(val) => updateCriteria({ startLocation: val })}
              apiCities={cities}
              states={states}
              placeholder="Select Starting City..."
              accentColor="emerald"
            />
          </div>

          <div>
            <AllIndiaCitySelect
              label="2. To (Destination City or State)"
              value={searchCriteria.destination || 'Delhi'}
              onChange={(val) => updateCriteria({ destination: val })}
              apiCities={cities}
              states={states}
              includeStates={true}
              placeholder="Select Destination City or State..."
              accentColor="sky"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vacation Days (1 - 14)</label>
            <input
              type="number"
              min={1}
              max={14}
              value={searchCriteria.days || 3}
              onChange={(e) => updateCriteria({ days: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Budget (INR ₹)</label>
            <input
              type="number"
              min={2000}
              step={1000}
              value={searchCriteria.budget || 15000}
              onChange={(e) => updateCriteria({ budget: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Number of Travelers</label>
            <input
              type="number"
              min={1}
              max={20}
              value={searchCriteria.travelers || 2}
              onChange={(e) => updateCriteria({ travelers: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Traveler Profile</label>
            <select
              value={searchCriteria.travelPreference || 'Historical & Couple'}
              onChange={(e) => updateCriteria({ travelPreference: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Historical & Couple">Couple • Heritage & Romance</option>
              <option value="Family">Family Friendly with Kids</option>
              <option value="Solo">Solo Safe Explorer</option>
              <option value="Friends & Adventure">Friends • Adventure & Fun</option>
              <option value="Spiritual & Heritage">Spiritual & Temple Trail</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Travel Date</label>
            <input
              type="date"
              value={searchCriteria.date || '2026-10-15'}
              onChange={(e) => updateCriteria({ date: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Start Time</label>
            <select
              value={searchCriteria.preferredStartTime || '09:00'}
              onChange={(e) => updateCriteria({ preferredStartTime: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="08:00">08:00 AM (Early Explorer)</option>
              <option value="09:00">09:00 AM (Standard Recommended)</option>
              <option value="10:00">10:00 AM (Relaxed Pace)</option>
            </select>
          </div>
        </div>

        {/* Category Multi-Select */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Interests & Tourism Categories:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const active = (searchCriteria.categories || []).includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configurable AI Formula Weights */}
        {showWeights && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Hybrid Recommendation Scoring Weights (Preference, Budget, Safety, Weather, Crowd, Distance, Rating, Time)
              </span>
              <span className="text-xs text-teal-700 font-mono font-bold">Configurable Hybrid Weights</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {Object.entries(weights).map(([k, val]) => (
                <div key={k} className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="text-teal-600 font-bold">{val.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.40"
                    step="0.02"
                    value={val}
                    onChange={(e) => setWeights({ ...weights, [k]: parseFloat(e.target.value) })}
                    className="w-full accent-teal-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-teal-600/25 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Computing Time-Aware Schedule...' : 'Generate Precision Day-by-Day Plan'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {activeItinerary && (
        <>
          {/* Tabs: Day-by-Day Timeline vs Place Rankings */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex rounded-2xl bg-slate-200/80 p-1">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'itinerary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Day-by-Day Schedule & Travel Logistics ({activeItinerary.days_count} Days)
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'recommendations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Explainable AI Place Ranking ({recommendations?.recommendations?.length || 0} Places)
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                Safety: {activeItinerary.risk?.overall_risk_level || 'LOW'} ({activeItinerary.risk?.overall_risk_score || 24}/100)
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-extrabold">
                {activeItinerary.weather?.condition}, {activeItinerary.weather?.temperature_c}°C
              </span>
            </div>
          </div>

          {activeTab === 'itinerary' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Columns: Day Selector & Timeline */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Day Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {activeItinerary.days?.map((dayObj) => {
                    const active = selectedDay === dayObj.day;
                    return (
                      <button
                        key={dayObj.day}
                        onClick={() => setSelectedDay(dayObj.day)}
                        className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shrink-0 transition cursor-pointer border flex items-center gap-2 ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Day {dayObj.day}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          active ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {dayObj.places?.length || 0} stops
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeDayObj && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    
                    {/* Day Header with Comprehensive Travel Metrics */}
                    <div className="pb-5 mb-6 border-b border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-md">
                            {activeDayObj.theme}
                          </span>
                          <h3 className="text-xl font-black text-slate-900 mt-1">
                            Day {activeDayObj.day} Smart Itinerary & Travel Logistics
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">{activeDayObj.weather_summary}</p>
                        </div>

                        {/* Interactive View Day on Map Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (activeDayObj.places && activeDayObj.places.length >= 2) {
                              navigate(`/map`);
                            } else {
                              navigate('/map');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs transition flex items-center gap-1.5 shrink-0"
                        >
                          <Navigation className="w-3.5 h-3.5 text-teal-600" />
                          <span>Explore Day Route on Map →</span>
                        </button>
                      </div>

                      {/* Travel Quick Telemetry Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Transit Distance</span>
                          <strong className="text-slate-900 text-sm">{activeDayObj.total_distance_km || 10.5} km total</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Travel Time</span>
                          <strong className="text-slate-900 text-sm">~{activeDayObj.total_travel_time_mins || 45} mins transit</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Estimated Spend</span>
                          <strong className="text-teal-700 text-sm">₹{activeDayObj.daily_estimated_cost_inr?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Safety Rating</span>
                          <strong className="text-emerald-700 text-sm">{activeDayObj.day_safety_score || 85}/100 Safe</strong>
                        </div>
                      </div>
                    </div>

                    {/* Chronological Daily Timeline with All Travel Details */}
                    {activeDayObj.timeline ? (
                      <div className="space-y-6">
                        {activeDayObj.timeline.map((item, idx) => {
                          
                          // Non-Attraction Slots (Breakfast, Lunch, Evening Food, Hotel Return)
                          if (item.slot_type !== 'ATTRACTION') {
                            const isBreakfast = item.slot_type === 'MEAL' && idx === 0;
                            const isLunch = item.slot_type === 'MEAL' && idx > 0;
                            const isEvening = item.slot_type === 'EVENING_FOOD';
                            const isHotel = item.slot_type === 'HOTEL_RETURN';

                            return (
                              <div key={idx} className="relative pl-8 border-l-2 border-amber-300">
                                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-amber-400 border-4 border-white shadow flex items-center justify-center text-[10px]" />
                                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                                  <div className="flex flex-wrap items-center justify-between text-xs font-black text-amber-950 gap-2 mb-1">
                                    <div className="flex items-center gap-1.5">
                                      {isBreakfast && <Coffee className="w-4 h-4 text-amber-600" />}
                                      {isLunch && <Utensils className="w-4 h-4 text-amber-600" />}
                                      {isEvening && <Sunset className="w-4 h-4 text-orange-600" />}
                                      {isHotel && <Moon className="w-4 h-4 text-indigo-600" />}
                                      <span>{item.time_label} • {item.title}</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                                      Est. ₹{item.estimated_cost_inr} • Safety: {item.risk_level}
                                    </span>
                                  </div>
                                  <p className="text-xs text-amber-900 leading-relaxed">{item.description}</p>
                                </div>
                              </div>
                            );
                          }

                          // Attraction Slot with Travel Details
                          const place = item.place_detail;
                          return (
                            <div key={idx} className="relative pl-8 border-l-2 border-teal-500">
                              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow">
                                {place.visit_order}
                              </div>

                              {/* Inter-Place Transit Leg Card ("Currect Travel Details") */}
                              <div className="mb-3.5 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs shadow-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                                  <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <Navigation className="w-4 h-4 text-teal-600" />
                                    <span>From <span className="font-extrabold text-slate-900">{place.previous_location}</span>:</span>
                                    <span className="text-teal-700 font-black">{place.distance_from_previous_km} km</span>
                                    <span>•</span>
                                    <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-black">
                                      {place.travel_method}
                                    </span>
                                    <span>(~{place.estimated_travel_time_mins} mins)</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900">₹{place.estimated_travel_cost_inr}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                      Estimated fare
                                    </span>
                                    <Link
                                      to="/map"
                                      className="text-teal-600 hover:text-teal-700 font-extrabold text-[11px] underline ml-1"
                                    >
                                      View Safe Route →
                                    </Link>
                                  </div>
                                </div>

                                {/* Multi-Modal Transit Breakdown Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 text-[11px] text-slate-600">
                                  <div className="flex items-start gap-1.5 p-1.5 rounded-lg bg-white border border-slate-100">
                                    <Train className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-slate-800">Metro Transit:</strong>
                                      <div className="text-[10px] text-slate-600">{place.metro_information}</div>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-1.5 p-1.5 rounded-lg bg-white border border-slate-100">
                                    <Bus className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-slate-800">City Bus Route:</strong>
                                      <div className="text-[10px] text-slate-600">{place.bus_information}</div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                                  <span><strong>Cab / Auto Alternative:</strong> {place.cab_auto_estimate}</span>
                                  <span className="text-[10px] text-slate-400">Door-to-door GPS route</span>
                                </div>
                              </div>

                              {/* Attraction Landmark Card */}
                              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-teal-300 transition">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md mb-1.5">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Visiting Hours: {place.start_time} – {place.end_time} ({place.estimated_visit_duration_hrs} hrs visit)</span>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900">
                                      <Link to={`/places/${place.place_id}`} className="hover:text-teal-600 transition">
                                        {place.name}
                                      </Link>
                                    </h4>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      Category: <strong>{place.category}</strong> • Hours: <strong>{place.opening_hours}</strong>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800">
                                      Safety: {place.safety_risk} ({place.safety_score}/100)
                                    </span>
                                    <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
                                      Crowd: {place.crowd_level}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700">
                                      Route: {place.route_risk}
                                    </span>
                                  </div>
                                </div>

                                {/* Historical Background Snippet */}
                                <div className="mt-3.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-slate-700">
                                  <div className="font-extrabold text-amber-900 flex items-center gap-1.5 mb-1">
                                    <History className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Historical & Cultural Context</span>
                                  </div>
                                  <p className="leading-relaxed">{place.short_history || place.description}</p>
                                </div>

                                {/* Entry Ticket & Weather Advisory */}
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-2.5 border-t border-slate-100">
                                  <div>
                                    <strong>Entry Ticket:</strong> ₹{place.entry_fee_per_person_inr}/person (Total: <strong>₹{place.total_entry_fee_inr}</strong> for {searchCriteria.travelers || 2} travelers)
                                  </div>
                                  <div>
                                    <strong>Weather:</strong> {place.weather_suitability}
                                  </div>
                                </div>

                                {/* AI Safety Advisory */}
                                {place.recommendation && (
                                  <div className="mt-2.5 text-xs text-teal-900 bg-teal-50/70 border border-teal-200/60 rounded-xl px-3 py-2">
                                    <strong>AI Safety Advisory:</strong> {place.recommendation}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Fallback */
                      <div className="space-y-4">
                        {activeDayObj.places?.map((place, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-slate-200">
                            <div className="font-bold text-slate-900">{place.name} ({place.start_time} - {place.end_time})</div>
                            <p className="text-xs text-slate-600 mt-1">{place.short_history}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Intercity Travel, Complete Budget Breakdown, Hotels & Restaurants */}
              <div className="space-y-6">
                
                {/* Intercity Travel Options (Start City ➔ Destination City) */}
                {activeItinerary.transport && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Plane className="w-4 h-4 text-sky-600" />
                      <span>Intercity Travel ({activeItinerary.start_location} ➔ {activeItinerary.destination})</span>
                    </h3>
                    
                    {activeItinerary.transport.options?.length > 0 ? (
                      <div className="space-y-3">
                        {activeItinerary.transport.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex items-center justify-between font-extrabold text-slate-900 mb-1">
                              <span>{opt.mode}</span>
                              <span className="text-teal-700">₹{opt.total_cost_for_travelers_inr?.toLocaleString('en-IN')} total</span>
                            </div>
                            <div className="text-[11px] text-slate-600">{opt.service_name}</div>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                              <span>Duration: ~{opt.estimated_duration_hrs} hrs</span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                {opt.badge || 'Estimated Fare'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                        {activeItinerary.transport.disclaimer || 'Local region — use metro or cab.'}
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Trip Budget Breakdown */}
                {activeItinerary.budget && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                      <IndianRupee className="w-4 h-4 text-teal-600" />
                      <span>Complete Trip Budget Breakdown</span>
                    </h3>
                    <div className="space-y-2.5 text-xs sm:text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Intercity Transit ({activeItinerary.start_location} ↔ {activeItinerary.destination})</span>
                        <span className="font-bold text-slate-900">
                          ₹{activeItinerary.budget.intercity_travel_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Hotel Accommodation ({activeItinerary.days_count} nights)</span>
                        <span className="font-bold text-slate-900">
                          ₹{activeItinerary.budget.accommodation_hotel_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Food & Regional Dining</span>
                        <span className="font-bold text-slate-900">
                          ₹{activeItinerary.budget.food_dining_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Local Transit (Metro/Bus/Cab)</span>
                        <span className="font-bold text-slate-900">
                          ₹{activeItinerary.budget.local_transport_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Monument Entry Tickets</span>
                        <span className="font-bold text-slate-900">
                          ₹{activeItinerary.budget.entry_tickets_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Contingency Buffer</span>
                        <span className="font-bold text-slate-900">
                          ₹{activeItinerary.budget.miscellaneous_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-black text-slate-900">Total Estimated Cost</span>
                        <span className="text-base font-black text-teal-700">
                          ₹{activeItinerary.budget.total_estimated_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 flex justify-between pt-1">
                        <span>Your Budget: ₹{activeItinerary.budget.total_budget_inr?.toLocaleString('en-IN')}</span>
                        <span className={`font-black ${
                          activeItinerary.budget.within_budget ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {activeItinerary.budget.within_budget
                            ? `✓ Saves ₹${activeItinerary.budget.remaining_budget_inr?.toLocaleString('en-IN')}`
                            : '⚠ Budget Adjusted'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended Hotels in Destination */}
                {activeItinerary.hotels?.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Hotel className="w-4 h-4 text-teal-600" />
                      <span>Verified Safe Accommodations in {activeItinerary.destination}</span>
                    </h3>
                    <div className="space-y-2.5">
                      {activeItinerary.hotels.map((h) => (
                        <div key={h.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-black text-slate-900 flex justify-between">
                            <span>{h.name}</span>
                            <span className="text-teal-700 font-extrabold">★ {h.rating}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{h.tier} Tier • {h.amenities}</div>
                          <div className="mt-2 flex justify-between items-center pt-1.5 border-t border-slate-200/60">
                            <span className="font-bold text-slate-800">₹{h.price_per_night}/night</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                              Safety: {h.safety_score}/100
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Restaurants & Regional Food */}
                {activeItinerary.restaurants?.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Utensils className="w-4 h-4 text-amber-600" />
                      <span>Verified Dining & Local Cuisine</span>
                    </h3>
                    <div className="space-y-2.5">
                      {activeItinerary.restaurants.map((r) => (
                        <div key={r.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-black text-slate-900 flex justify-between">
                            <span>{r.name}</span>
                            <span className="text-amber-600 font-extrabold">★ {r.rating}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{r.cuisine} • Must try: {r.signature_dish}</div>
                          <div className="mt-2 font-bold text-slate-800 text-[11px] pt-1.5 border-t border-slate-200/60">
                            Avg ₹{r.avg_cost_for_two} for two
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Tab 2: Explainable AI Place Ranking */
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-3xl p-5 text-xs text-teal-950 font-medium">
                <strong>{recommendations?.methodology}:</strong> Every destination below is ranked using configurable 8-factor weights combining Preference Match, Budget Fit, Safety Score, Weather Suitability, Crowd Suitability, Distance, Rating, and Visit Duration.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendations?.recommendations?.map((rec, idx) => (
                  <div key={rec.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-black mb-1.5">
                            Rank #{idx + 1} • AI Score: {rec.recommendation_score}/100
                          </span>
                          <h3 className="text-lg font-black text-slate-900">
                            <Link to={`/places/${rec.id}`} className="hover:text-teal-600">
                              {rec.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-slate-500">
                            {rec.city}, {rec.state} • {rec.category}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                          Safety: {rec.safety_score}/100
                        </span>
                      </div>

                      <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>Why Recommended by SafeTrip AI:</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {rec.ai_explanations?.map((reason, rIdx) => (
                            <li key={rIdx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Entry: <strong>₹{rec.entry_fee}</strong> • Metro: <strong>{rec.nearest_metro || 'City Hub'}</strong>
                      </span>
                      <Link
                        to={`/places/${rec.id}`}
                        className="inline-flex items-center gap-1 font-black text-teal-600 hover:text-teal-700"
                      >
                        <span>Inspect Safety & Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
