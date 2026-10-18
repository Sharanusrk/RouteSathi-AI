import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  ShieldCheck,
  Users,
  Clock,
  IndianRupee,
  PlusCircle,
  CheckCircle2,
  Eye,
  Navigation,
  Heart,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';

const CATEGORY_GRADIENTS = {
  Historical: 'from-amber-600 via-orange-700 to-rose-800',
  Fort: 'from-stone-700 via-amber-800 to-red-900',
  Palace: 'from-purple-700 via-indigo-800 to-slate-900',
  Temple: 'from-orange-500 via-amber-600 to-red-700',
  Religious: 'from-amber-600 via-red-700 to-rose-900',
  Spiritual: 'from-teal-600 via-cyan-700 to-blue-800',
  Beach: 'from-cyan-500 via-sky-600 to-blue-800',
  'Hill Station': 'from-emerald-600 via-teal-700 to-slate-800',
  Nature: 'from-green-600 via-emerald-700 to-teal-900',
  Wildlife: 'from-emerald-700 via-green-800 to-stone-900',
  Waterfall: 'from-sky-500 via-blue-700 to-indigo-900',
  Museum: 'from-indigo-600 via-slate-700 to-slate-900',
  Food: 'from-rose-500 via-orange-600 to-amber-700',
  Shopping: 'from-pink-600 via-purple-700 to-indigo-800',
};

export default function PlaceCard({ place, showAiExplanations = false }) {
  const navigate = useNavigate();
  const { customTripBasket, addPlaceToBasket, removePlaceFromBasket } = useTrip();
  const { user, toggleSavedPlace } = useAuth();

  const inBasket = customTripBasket.some((p) => p.id === place.id);
  const isSaved = user?.saved_places?.includes(place.id);

  const safetyScore = Number(place.safetyScore ?? place.safety_score ?? 84);
  const crowdLevel = place.crowdLevel || place.crowd_level || (place.crowdScore < 45 ? 'Low' : place.crowdScore < 72 ? 'Moderate' : 'High');
  const entryFee = Number(place.entryFee ?? place.entry_fee ?? 0);
  const bestTime = place.bestTime || place.best_time || '09:00 AM - 12:00 PM';
  const duration = place.averageVisitDuration || place.average_visit_duration || 2.0;
  const grad = CATEGORY_GRADIENTS[place.category] || 'from-sky-600 via-blue-700 to-slate-900';

  const safetyBadgeColor =
    safetyScore >= 80
      ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
      : safetyScore >= 60
      ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-700 border-rose-500/30';

  const crowdBadgeColor =
    crowdLevel === 'Low'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : crowdLevel === 'Moderate'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Visual Header Banner */}
      <div className={`relative h-44 bg-gradient-to-br ${grad} p-4 flex flex-col justify-between text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/35 backdrop-blur-md border border-white/20">
              {place.category}
            </span>
            {place.recommendation_score && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500 text-white shadow">
                AI Score: {place.recommendation_score}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSavedPlace(place.id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md border transition ${
                  isSaved
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-black/30 text-white/90 border-white/20 hover:bg-black/50'
                }`}
                title="Save Place"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-black/40 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {place.rating}
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="font-extrabold text-lg leading-snug text-white group-hover:text-sky-200 transition line-clamp-1">
            {place.name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-white/85 mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-300" />
            <span className="truncate">
              {place.city}, {place.district} • {place.state}
            </span>
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {place.description || place.history}
          </p>

          {/* Telemetry Pills */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${safetyBadgeColor}`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Safety: {safetyScore}/100</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${crowdBadgeColor}`}>
              <Users className="w-4 h-4 shrink-0" />
              <span>Crowd: {crowdLevel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
            <span className="flex items-center gap-1 font-medium">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              {entryFee === 0 ? (
                <span className="text-emerald-600 font-bold">Free Entry</span>
              ) : (
                <span className="text-slate-800 font-bold">₹{entryFee} Entry</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {duration} hrs • {bestTime.split('(')[0]}
            </span>
          </div>

          {/* Explainable AI Box (Section 44) */}
          {showAiExplanations && place.ai_explanations && place.ai_explanations.length > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-sky-50/80 border border-sky-200/70">
              <p className="text-[11px] font-bold text-sky-900 mb-1">Recommended because:</p>
              <ul className="space-y-0.5">
                {place.ai_explanations.slice(0, 4).map((exp, i) => (
                  <li key={i} className="text-[11px] text-sky-800 leading-tight">
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons (Section 43: View Details, Add to Trip, View on Map) */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => navigate(`/places/${place.id}`)}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          <button
            onClick={() =>
              inBasket ? removePlaceFromBasket(place.id) : addPlaceToBasket(place)
            }
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold transition ${
              inBasket
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {inBasket ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Trip</span>
              </>
            )}
          </button>

          <button
            onClick={() =>
              navigate(`/map?lat=${place.latitude}&lon=${place.longitude}&name=${encodeURIComponent(place.name)}`)
            }
            className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>On Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}
