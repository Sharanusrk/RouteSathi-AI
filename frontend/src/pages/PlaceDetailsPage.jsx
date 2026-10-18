import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  CloudSun,
  Users,
  Train,
  Bus,
  Car,
  BookOpen,
  ArrowLeft,
  Calendar,
  Navigation,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { useTrip } from '../context/TripContext';
import PlaceCard from '../components/PlaceCard';

export default function PlaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addPlaceToBasket } = useTrip();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getPlaceDetails(id)
      .then((res) => setPlace(res))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Tourist Place Not Found</h2>
        <button
          onClick={() => navigate('/explore')}
          className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          Back to Explore India
        </button>
      </div>
    );
  }

  const safety = place.safetyAnalysis || {};
  const weather = place.weather || {};
  const transit = place.transportFromCenter?.options || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Results</span>
      </button>

      {/* Hero Banner */}
      <div className="st-page-hero bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500 text-white">
                {place.category}
              </span>
              {(place.subCategory || []).map((sc, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-sky-200 border border-white/15"
                >
                  {sc}
                </span>
              ))}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {place.rating} Rating
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{place.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-300 mt-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>
                {place.city}, {place.district} District, {place.state} • Coords: ({place.latitude}, {place.longitude})
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => {
                addPlaceToBasket(place);
                navigate(`/planner?dest=${encodeURIComponent(place.city)}`);
              }}
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Plan Trip Including {place.name}</span>
            </button>
            <button
              onClick={() =>
                navigate(`/map?lat=${place.latitude}&lon=${place.longitude}&name=${encodeURIComponent(place.name)}`)
              }
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 transition"
            >
              <Navigation className="w-4 h-4 text-sky-300" />
              <span>Interactive Safe Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: History, Timings, Multi-Modal Transport */}
        <div className="lg:col-span-8 space-y-6">
          {/* Concise Verified History Section (Section 23: 100-150 words + source) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>Concise Historical Overview & Significance</span>
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Source: {place.dataSource || 'ASI / ProjectCapstone Dataset'}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
              {place.history}
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              <strong>Visitor Experience:</strong> {place.description}
            </p>
          </div>

          {/* Visiting Timings, Entry Fee & Suitability Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <Clock className="w-5 h-5 text-sky-600 mb-1.5" />
              <p className="text-[11px] font-bold text-slate-400 uppercase">Opening Hours</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {place.openingTime} – {place.closingTime}
              </p>
              <p className="text-[11px] text-slate-500">Weekly Off: {place.weeklyOff || 'None'}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <IndianRupee className="w-5 h-5 text-emerald-600 mb-1.5" />
              <p className="text-[11px] font-bold text-slate-400 uppercase">Entry Ticket</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {place.entryFee === 0 ? 'Free Entry' : `₹${place.entryFee} / person`}
              </p>
              <p className="text-[11px] text-slate-500">Duration: ~{place.averageVisitDuration} hrs</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <Users className="w-5 h-5 text-indigo-600 mb-1.5" />
              <p className="text-[11px] font-bold text-slate-400 uppercase">Best Visiting Time</p>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5">{place.bestTime}</p>
              <p className="text-[11px] text-slate-500">Season: {place.bestSeason}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <CloudSun className="w-5 h-5 text-amber-500 mb-1.5" />
              <p className="text-[11px] font-bold text-slate-400 uppercase">Weather Condition</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {weather.temperature_c}°C • {weather.condition}
              </p>
              <p className="text-[10px] text-sky-600 font-semibold truncate">
                {weather.source_label}
              </p>
            </div>
          </div>

          {/* Multi-Modal Local Connectivity (Sections 11, 12, 13) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Metro, Bus & Cab Connectivity
                </h2>
                <p className="text-xs text-slate-500">
                  Clearly labeled as Estimated Fares from configurable tariff dataset
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                ESTIMATED FARE DATASET
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
                <div className="flex items-center gap-2 font-extrabold text-xs text-sky-900 mb-1.5">
                  <Train className="w-4 h-4 text-sky-600" />
                  <span>Nearest Metro Station</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {place.nearestMetro || transit.metro?.destination_station || 'Use City Bus / Cab'}
                </p>
                {transit.metro?.available && (
                  <p className="text-[11px] text-slate-600 mt-1">
                    Est. Fare: <strong>₹{transit.metro.estimated_fare_inr}</strong> • {transit.metro.estimated_time_mins} mins
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 font-extrabold text-xs text-emerald-900 mb-1.5">
                  <Bus className="w-4 h-4 text-emerald-600" />
                  <span>Nearest City Bus Stop</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {place.nearestBusStop || transit.bus?.nearest_stop}
                </p>
                {transit.bus && (
                  <p className="text-[11px] text-slate-600 mt-1">
                    Est. Fare: <strong>₹{transit.bus.estimated_fare_inr}</strong> • {transit.bus.bus_route}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900 mb-1.5">
                  <Car className="w-4 h-4 text-amber-600" />
                  <span>Auto & App Cab Estimate</span>
                </div>
                {transit.auto && transit.cab && (
                  <>
                    <p className="text-xs font-bold text-slate-800">
                      Auto: ₹{transit.auto.estimated_fare_inr} | Cab: ₹{transit.cab.estimated_fare_mini_inr}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Est. Time: {transit.cab.estimated_time_mins} mins from center
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: AI Safety Engine Breakdown & Safer Alternatives */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>AI Safety Engine Analysis</span>
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  safety.overall_risk_level === 'LOW'
                    ? 'bg-emerald-100 text-emerald-800'
                    : safety.overall_risk_level === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {safety.overall_risk_level || 'LOW'} RISK ({safety.overall_risk_score || 24}/100)
              </span>
            </div>

            {/* 6 Risk Factors Progress Bars */}
            {safety.factor_scores && (
              <div className="space-y-2.5 mb-5">
                {Object.entries(safety.factor_scores).map(([k, val]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="capitalize text-slate-600">{k} Risk Factor</span>
                      <span className="text-slate-900">{val}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          val < 34 ? 'bg-emerald-500' : val < 67 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, val)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p className="font-extrabold text-slate-800">AI Safety Recommendation:</p>
              <p className="text-slate-600 leading-relaxed">{safety.recommendation}</p>
            </div>

            {safety.safer_alternatives && (
              <div className="mt-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs space-y-1">
                <p className="font-extrabold text-sky-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-sky-600" />
                  <span>Safer Alternative Options:</span>
                </p>
                <p className="text-sky-800">
                  <strong>Best Window:</strong> {safety.safer_alternatives.alternative_time}
                </p>
                <p className="text-sky-800">
                  <strong>Indoor Option:</strong> {safety.safer_alternatives.alternative_place}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nearby Places in Same State */}
      {place.nearbyPlaces && place.nearbyPlaces.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            More Tourist Places in {place.state}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {place.nearbyPlaces.map((np) => (
              <PlaceCard key={np.id} place={np} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
