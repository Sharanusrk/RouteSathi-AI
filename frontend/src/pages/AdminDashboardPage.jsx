import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Database, PlusCircle, Trash2, FileText, Cpu,
  CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState(null);
  const [places, setPlaces] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newPlace, setNewPlace] = useState({
    name: '',
    state: 'Delhi',
    district: 'New Delhi',
    city: 'New Delhi',
    category: 'Historical',
    latitude: 28.5933,
    longitude: 77.2507,
    opening_time: '07:00',
    closing_time: '20:00',
    entry_fee: 40,
    rating: 4.6,
    safety_score: 86,
    weather_sensitivity: 'MEDIUM',
    description: '',
    history: '',
  });

  const loadAdminData = async () => {
    try {
      const [ovRes, pRes] = await Promise.all([
        api.getAdminOverview(),
        api.searchPlaces({ limit: 35 }),
      ]);
      setCounts(ovRes.counts);
      setPlaces(pRes.places || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAddPlace = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await api.adminCreatePlace({
        ...newPlace,
        latitude: Number(newPlace.latitude),
        longitude: Number(newPlace.longitude),
        entry_fee: Number(newPlace.entry_fee),
        rating: Number(newPlace.rating),
        safety_score: Number(newPlace.safety_score),
        history: newPlace.history || newPlace.description || 'Verified historical and cultural site.',
      });
      setMessage(`Successfully validated and added "${newPlace.name}" to the tourism database!`);
      setNewPlace({ ...newPlace, name: '', description: '', history: '' });
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Validation failed when adding place.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlace = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from database?`)) return;
    try {
      await api.adminDeletePlace(id);
      setMessage(`Deleted "${name}".`);
      loadAdminData();
    } catch (err) {
      setError('Failed to delete place.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-8">
      {/* Header */}
      <div className="st-page-hero bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" />
            System Administration & Data Governance Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Admin Control Center (22 Relational Tables)
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage verified Indian tourist places, monitor 36 States/UTs coverage, review safety incidents, and oversee PDF dataset ingestion.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/pdf"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow transition"
          >
            <FileText className="w-4 h-4" /> PDF Dataset Pipeline
          </Link>
          <Link
            to="/ml-dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
          >
            <Cpu className="w-4 h-4" /> ML Model Evaluation
          </Link>
        </div>
      </div>

      {/* Live Database Metrics Grid */}
      {counts && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'States & UTs', val: counts.states },
            { label: 'Districts', val: counts.districts },
            { label: 'Tourist Places', val: counts.touristPlaces },
            { label: 'ML Models (.pkl)', val: counts.mlModels },
            { label: 'Registered Datasets', val: counts.datasets },
            { label: 'Safety Incidents', val: counts.incidentReports },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">{item.label}</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{item.val}</span>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add New Validated Tourist Place */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-teal-600" />
            Add Verified Tourist Destination
          </h2>
          <form onSubmit={handleAddPlace} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Place Name *</label>
              <input
                type="text"
                required
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                placeholder="e.g., Sunder Nursery Heritage Park"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / UT</label>
                <input
                  type="text"
                  required
                  value={newPlace.state}
                  onChange={(e) => setNewPlace({ ...newPlace, state: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">District / City</label>
                <input
                  type="text"
                  required
                  value={newPlace.city}
                  onChange={(e) => setNewPlace({ ...newPlace, city: e.target.value, district: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newPlace.category}
                  onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Safety Score (0-100)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={newPlace.safety_score}
                  onChange={(e) => setNewPlace({ ...newPlace, safety_score: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Latitude (6°N - 38°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newPlace.latitude}
                  onChange={(e) => setNewPlace({ ...newPlace, latitude: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Longitude (68°E - 98°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newPlace.longitude}
                  onChange={(e) => setNewPlace({ ...newPlace, longitude: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Time</label>
                <input
                  type="text"
                  value={newPlace.opening_time}
                  onChange={(e) => setNewPlace({ ...newPlace, opening_time: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Closing Time</label>
                <input
                  type="text"
                  value={newPlace.closing_time}
                  onChange={(e) => setNewPlace({ ...newPlace, closing_time: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Historical & Cultural Description *</label>
              <textarea
                rows={3}
                required
                value={newPlace.description}
                onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value, history: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow transition cursor-pointer"
            >
              {submitting ? 'Validating & Saving...' : 'Validate & Insert Place'}
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Manage Existing Tourist Places */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4">
            Recent Verified Tourist Places Directory
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">City / State</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Safety</th>
                  <th className="p-2.5">Entry (₹)</th>
                  <th className="p-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {places.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">#{p.id}</td>
                    <td className="p-2.5 font-bold text-slate-900">
                      <Link to={`/places/${p.id}`} className="hover:text-teal-600">{p.name}</Link>
                    </td>
                    <td className="p-2.5 text-slate-600">{p.city}, {p.state}</td>
                    <td className="p-2.5">{p.category}</td>
                    <td className="p-2.5 font-bold text-emerald-700">{p.safetyScore}/100</td>
                    <td className="p-2.5">₹{p.entryFee}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => handleDeletePlace(p.id, p.name)}
                        className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                        title="Delete place"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
