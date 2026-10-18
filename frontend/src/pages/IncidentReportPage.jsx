import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertTriangle, ShieldAlert, CheckCircle2, Send } from 'lucide-react';

const INCIDENT_TYPES = [
  'Scam',
  'Theft',
  'Harassment',
  'Unsafe route',
  'Transport issue',
  'Fraud',
  'Crowd issue',
  'Other',
];

export default function IncidentReportPage() {
  const [places, setPlaces] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    locationName: 'Connaught Place',
    city: 'Delhi',
    state: 'Delhi',
    date: '2026-10-15',
    time: '16:30',
    category: 'Scam',
    severity: 'MEDIUM',
    description: '',
  });

  const loadData = async () => {
    try {
      const [pRes, iRes] = await Promise.all([
        api.searchPlaces({ limit: 600 }),
        api.getIncidents(),
      ]);
      setPlaces(pRes.places || []);
      setIncidents(iRes.incidents || []);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const handlePlaceSelect = (e) => {
    const pName = e.target.value;
    const found = places.find((p) => p.name === pName);
    if (found) {
      setForm({
        ...form,
        locationName: found.name,
        city: found.city || 'Delhi',
        state: found.state || 'Delhi',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await api.reportIncident(form);
      setSuccessMsg('Incident report submitted! Our AI Safety Engine has integrated your anonymized report.');
      setForm({ ...form, description: '' });
      loadData();
    } catch (err) {
      alert('Failed to submit incident report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      {/* Header */}
      <div className="st-page-hero bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          Crowdsourced Tourist Safety Telemetry & Scam Prevention
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Report a Tourist Safety Incident or Scam Alert
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Anonymized community incident reports directly feed the SafeTrip AI Scam & Route Risk Engine to warn fellow travelers and suggest safer alternatives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Submission Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Submit Safety / Scam Report
          </h2>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quick Select Tourist Place</label>
              <select
                onChange={handlePlaceSelect}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">-- Choose from directory or type below --</option>
                {places.map((p) => (
                  <option key={p.id} value={p.name}>{p.name} ({p.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Landmark Name</label>
              <input
                type="text"
                required
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Severity Level</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="LOW">LOW (Minor Nuisance)</option>
                  <option value="MEDIUM">MEDIUM (Financial Scam / Touts)</option>
                  <option value="HIGH">HIGH (Safety Hazard / Theft)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Description & Precautionary Advice
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe what happened (e.g., unofficial guide overcharging at gate, unlit street segment, fake gem shop taxi detour)..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Report...' : 'Submit Community Safety Report'}
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Community Incident Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-900">
              Verified & Community Safety Alert Feed ({incidents.length} Reports)
            </h2>
            <span className="text-xs font-semibold text-slate-500">Anonymized Verified Telemetry</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      inc.severity === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : inc.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {inc.category} • {inc.severity}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{inc.locationName}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {inc.city}, {inc.state} • {inc.date} {inc.time}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{inc.description}</p>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  Source: {inc.reporterPrivacy || 'Anonymized Verified Traveler'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
