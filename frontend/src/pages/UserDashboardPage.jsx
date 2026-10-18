import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { api } from '../services/api';
import PlaceCard from '../components/PlaceCard';
import {
  Calendar, Bookmark, Download, ShieldCheck, Sparkles
} from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { customTripBasket } = useTrip();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    api.getUserTrips().then((res) => setTrips(res.trips || [])).catch(() => {});
  }, []);

  const handleDownloadPdf = async (tripId, title) => {
    try {
      const blob = await api.exportTripPdf(tripId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SafeTrip_${(title || 'Itinerary').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-8">
      {/* Profile Banner */}
      <div className="st-page-hero bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-2xl font-extrabold text-teal-300">
            {(user?.full_name || 'Traveler')[0]}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified {user?.role || 'USER'} Account
            </div>
            <h1 className="text-2xl font-extrabold">{user?.full_name || 'SafeTrip Traveler'}</h1>
            <p className="text-slate-300 text-xs">{user?.email || 'user@safetrip.ai'}</p>
          </div>
        </div>
        <Link
          to="/planner"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow transition"
        >
          <Sparkles className="w-4 h-4" />
          Plan a New AI Trip
        </Link>
      </div>

      {/* My Generated Itineraries */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            My AI Generated Trips & PDF Itineraries ({trips.length})
          </h2>
          <Link to="/planner" className="text-xs font-bold text-teal-600 hover:underline">
            + Create New Itinerary
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No saved itineraries yet. Go to the <Link to="/planner" className="text-teal-600 font-bold underline">AI Trip Planner</Link> to generate your first trip!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((it) => (
              <div key={it.tripId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                      {it.days} Days • {it.travelers} Travelers
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Risk: {it.overallRiskLevel}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{it.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Route: <strong>{it.startLocation} → {it.destination}</strong> • Est. Cost: <strong>₹{it.estimatedCost?.toLocaleString('en-IN')}</strong>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {it.startDate || '2026'}
                  </span>
                  <button
                    onClick={() => handleDownloadPdf(it.tripId, it.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Basket / Bookmarked Places */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            My Trip Basket / Saved Destinations ({customTripBasket.length})
          </h2>
          <Link to="/explore" className="text-xs font-bold text-teal-600 hover:underline">
            Explore All 36 States/UTs →
          </Link>
        </div>

        {customTripBasket.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500">
            You haven't added any tourist places to your trip basket yet. Click "Add to Trip" on any destination card to save it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {customTripBasket.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
