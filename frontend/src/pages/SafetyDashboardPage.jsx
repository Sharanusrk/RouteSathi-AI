import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Sparkles,
  ThermometerSun,
  PhoneCall,
  MapPin,
  Clock,
  Activity,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function SafetyDashboardPage() {
  const [places, setPlaces] = useState([]);
  const [states, setStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [selectedState, setSelectedState] = useState('Delhi');
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [selectedPlaceName, setSelectedPlaceName] = useState('Red Fort (Lal Qila)');
  const [destination, setDestination] = useState('New Delhi');
  const [category, setCategory] = useState('Historical');
  const [activity, setActivity] = useState('Sightseeing');
  const [visitTime, setVisitTime] = useState('14:00');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placeSearch, setPlaceSearch] = useState('');

  const [riskWeights, setRiskWeights] = useState({
    weather_risk: 0.20,
    crowd_risk: 0.15,
    time_risk: 0.15,
    route_risk: 0.20,
    location_risk: 0.15,
    scam_risk: 0.15,
  });

  // Load States, Cities, Places
  useEffect(() => {
    api.getStates().then((res) => setStates(res.states || [])).catch(() => {});
    api.getCities().then((res) => setAllCities(res.cities || [])).catch(() => {});
    api.searchPlaces({ limit: 600 }).then((res) => {
      const items = res.places || [];
      setPlaces(items);
    }).catch(() => {});
  }, []);

  // Filter cities by state
  const stateCities = useMemo(() => {
    if (!selectedState) return allCities;
    return allCities.filter(
      (c) => c.state?.trim().toLowerCase() === selectedState.trim().toLowerCase()
    );
  }, [allCities, selectedState]);

  // Filter places by state, city, and search
  const filteredPlaces = useMemo(() => {
    let list = places;
    if (selectedState) {
      list = list.filter((p) => p.state?.toLowerCase() === selectedState.toLowerCase());
    }
    if (selectedCity && selectedCity !== '__all__') {
      list = list.filter((p) => p.city?.toLowerCase() === selectedCity.toLowerCase());
    }
    if (placeSearch.trim()) {
      const q = placeSearch.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }
    return list;
  }, [places, selectedState, selectedCity, placeSearch]);

  const handleStateChange = (st) => {
    setSelectedState(st);
    const matching = allCities.filter(
      (c) => c.state?.trim().toLowerCase() === st.trim().toLowerCase()
    );
    if (matching.length > 0) {
      setSelectedCity(matching[0].city);
    } else {
      setSelectedCity('__all__');
    }
  };

  const handlePlaceSelect = (e) => {
    const pName = e.target.value;
    setSelectedPlaceName(pName);
    const found = places.find((p) => p.name === pName);
    if (found) {
      setDestination(found.city || found.state || 'Delhi');
      setCategory(found.category || 'Historical');
      setActivity(found.category || 'Sightseeing');
      if (found.state && found.state !== selectedState) setSelectedState(found.state);
      if (found.city && found.city !== selectedCity) setSelectedCity(found.city);
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const data = await api.predictRisk({
        destination: destination || selectedCity || selectedState || 'Delhi',
        placeName: selectedPlaceName || 'Red Fort (Lal Qila)',
        category: category || 'Historical',
        activity: activity || 'Sightseeing',
        date: '2026-10-15',
        time: visitTime,
        customWeights: riskWeights,
      });
      setEvaluation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleEvaluate();
  }, [selectedPlaceName, visitTime, activity, destination]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-8">
      {/* Header */}
      <div className="st-page-hero bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>6-Factor AI Safety Engine • Open-Meteo Weather Telemetry • Scikit-Learn ML Models</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          AI Tourism Safety, Weather-Activity Risk & Safer Alternatives Engine
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Evaluates real-time composite safety across all 36 Indian states using 4 trained Scikit-Learn ML models (Crowd Density, Weather Sensitivity, Crime Index, Road Accident Risk) plus time-of-day risk windows.
        </p>
      </div>

      {/* Controls & Drilldown (State ➔ City ➔ Place) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          
          {/* 1. Filter State */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. State / UT ({states.length})
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All 36 States & UTs</option>
              {states.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. City ({stateCities.length})
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="__all__">All Cities in {selectedState || 'India'}</option>
              {stateCities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.placesCount} places)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Select Destination Place */}
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1">
              3. Tourist Attraction ({filteredPlaces.length})
            </label>
            <select
              value={selectedPlaceName}
              onChange={handlePlaceSelect}
              className="w-full rounded-xl border border-emerald-300 px-3 py-2.5 text-xs font-bold bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {(filteredPlaces.length > 0 ? filteredPlaces : places).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Planned Visit Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              4. Planned Visit Time
            </label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="08:30">08:30 AM (Early Safe Window)</option>
              <option value="11:00">11:00 AM (Midday)</option>
              <option value="14:00">02:00 PM (Afternoon)</option>
              <option value="17:00">05:00 PM (Evening Rush)</option>
              <option value="20:00">08:00 PM (Night Advisory)</option>
              <option value="22:30">10:30 PM (Late Night Risk)</option>
            </select>
          </div>

          {/* 5. Tourism Activity Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              5. Tourism Activity Type
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Sightseeing">Heritage / Monument Sightseeing</option>
              <option value="Trekking">Mountain Trekking / Nature Trail</option>
              <option value="Beach">Coastal / Beach Water Sports</option>
              <option value="Museum">Indoor Museum / Palace Gallery</option>
              <option value="Shopping">Evening Bazaar / Street Food Walk</option>
            </select>
          </div>
        </div>

        {/* Action Button & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={placeSearch}
              onChange={(e) => setPlaceSearch(e.target.value)}
              placeholder="Search destination within state/city..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Safety AI...' : 'Recalculate 6-Factor Safety Risk'}</span>
          </button>
        </div>

        {/* Configurable 6-Factor Risk Weights */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            Configurable 6-Factor Risk Weights Formula: Risk = w1·Weather + w2·Crowd + w3·Time + w4·Route + w5·Location + w6·Scam
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(riskWeights).map(([k, val]) => (
              <div key={k} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="text-emerald-700 font-bold">{val.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={val}
                  onChange={(e) => setRiskWeights({ ...riskWeights, [k]: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluation Output */}
      {evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                    Real-Time AI Safety & Risk Assessment
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    {evaluation.place_name} ({evaluation.destination})
                  </h2>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Planned Time: {visitTime} • Activity: {activity}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Composite Risk Score</div>
                    <div className="text-3xl font-black text-slate-900">
                      {evaluation.overall_risk_score}/100
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-2xl text-xs font-black tracking-wide ${
                    evaluation.overall_risk_level === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : evaluation.overall_risk_level === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {evaluation.overall_risk_level} RISK
                  </span>
                </div>
              </div>

              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                6-Factor Risk Component Breakdown (0 = Lowest Risk, 100 = Highest Risk)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {evaluation.factor_scores &&
                  Object.entries(evaluation.factor_scores).map(([factor, score]) => (
                    <div key={factor} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                        <span className="capitalize">{factor} Risk</span>
                        <span className={score > 55 ? 'text-rose-600 font-black' : score > 33 ? 'text-amber-600 font-black' : 'text-emerald-600 font-black'}>
                          {score}/100
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            score > 55 ? 'bg-rose-500' : score > 33 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Reasons & Advisories */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Explainable AI Risk Factors & Tourist Advisories
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                  {evaluation.reasons?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Safer Alternatives System */}
            {evaluation.safer_alternatives && (
              <div className="bg-teal-50/70 rounded-3xl border-2 border-teal-500 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-teal-950 font-black text-base mb-1">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  AI Safer Alternative Recommendation Engine
                </div>
                <p className="text-xs text-teal-800 font-medium mb-4">
                  {evaluation.safer_alternatives.primary_recommendation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-teal-200">
                    <span className="text-slate-500 block font-semibold">Safer Visiting Window</span>
                    <strong className="text-teal-950">{evaluation.safer_alternatives.alternative_time}</strong>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-teal-200">
                    <span className="text-slate-500 block font-semibold">Alternative Indoor / Safe Place</span>
                    <strong className="text-teal-950">{evaluation.safer_alternatives.alternative_place}</strong>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-teal-200">
                    <span className="text-slate-500 block font-semibold">Alternative Activity</span>
                    <strong className="text-teal-950">{evaluation.safer_alternatives.alternative_activity}</strong>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-teal-200">
                    <span className="text-slate-500 block font-semibold">Recommended Safe Route</span>
                    <strong className="text-teal-950">{evaluation.safer_alternatives.alternative_route}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Weather Telemetry & Emergency Helpline */}
          <div className="space-y-6">
            {evaluation.weather_context && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5 text-amber-500" />
                    Weather Telemetry
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {evaluation.weather_context.data_type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Temperature</span>
                    <strong className="text-lg text-slate-900">{evaluation.weather_context.temperature_c}°C</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Condition</span>
                    <strong className="text-sm text-slate-900">{evaluation.weather_context.condition}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Rainfall</span>
                    <strong className="text-slate-900">{evaluation.weather_context.rainfall_mm} mm</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Wind Speed</span>
                    <strong className="text-teal-700">{evaluation.weather_context.wind_speed_kmh} km/h</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 24x7 Emergency Matrix with Clickable Hotlines */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>24×7 National Emergency Matrix</span>
              </h3>

              <div className="space-y-2 text-xs">
                <a
                  href="tel:112"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 transition group"
                >
                  <span className="text-slate-300">All-India Emergency (ERSS)</span>
                  <strong className="text-rose-400 font-mono font-bold group-hover:scale-105 transition">112</strong>
                </a>

                <a
                  href="tel:1363"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-teal-500/20 border border-white/10 hover:border-teal-500/40 transition group"
                >
                  <span className="text-slate-300">Ministry of Tourism Helpline</span>
                  <strong className="text-teal-300 font-mono font-bold group-hover:scale-105 transition">1363</strong>
                </a>

                <a
                  href="tel:1091"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 transition group"
                >
                  <span className="text-slate-300">Women Safety Helpline</span>
                  <strong className="text-purple-300 font-mono font-bold group-hover:scale-105 transition">1091</strong>
                </a>

                <a
                  href="tel:1033"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 transition group"
                >
                  <span className="text-slate-300">National Highway Helpline</span>
                  <strong className="text-amber-300 font-mono font-bold group-hover:scale-105 transition">1033</strong>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
