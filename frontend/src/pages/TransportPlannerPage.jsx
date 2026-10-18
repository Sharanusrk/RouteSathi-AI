import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Train, Bus, Plane, Navigation
} from 'lucide-react';

const DEFAULT_INDIA_HUBS = [
  'Agartala', 'Agra', 'Ahmedabad', 'Aizawl', 'Ajmer', 'Alleppey', 'Amaravati', 'Amritsar', 'Andaman (Port Blair)',
  'Araku Valley', 'Aurangabad', 'Ayodhya', 'Badami', 'Bangalore', 'Bhopal', 'Bhubaneswar', 'Bhuj', 'Bikaner',
  'Bilaspur', 'Bodh Gaya', 'Calangute', 'Chandigarh', 'Chennai', 'Cherrapunji', 'Chikkamagaluru', 'Coimbatore',
  'Coorg (Madikeri)', 'Cuttack', 'Dalhousie', 'Daman', 'Darjeeling', 'Dehradun', 'Delhi', 'Deoghar', 'Dharamshala',
  'Dimapur', 'Diu', 'Dwarka', 'Faridabad', 'Gandhinagar', 'Gangtok', 'Goa (Panaji)', 'Gokarna', 'Gulmarg',
  'Gurugram', 'Guwahati', 'Gwalior', 'Hampi', 'Haridwar', 'Havelock Island', 'Hyderabad', 'Imphal', 'Indore',
  'Itanagar', 'Jabalpur', 'Jagdalpur', 'Jaipur', 'Jaisalmer', 'Jammu', 'Jamshedpur', 'Jhansi', 'Jodhpur',
  'Jorhat', 'Kanyakumari', 'Kargil', 'Kasauli', 'Kavaratti', 'Kaziranga', 'Kevadia (Statue of Unity)', 'Khajuraho',
  'Kochi', 'Kodaikanal', 'Kohima', 'Kolkata', 'Konark', 'Kozhikode', 'Kullu', 'Kurnool', 'Kurukshetra',
  'Leh', 'Lonavala', 'Lucknow', 'Madurai', 'Mahabalipuram', 'Majuli', 'Manali', 'Mangaluru', 'Margao',
  'Mathura', 'Mount Abu', 'Mumbai', 'Munnar', 'Mussoorie', 'Mysore', 'Nagarjuna Sagar', 'Nagpur', 'Nainital',
  'Nalanda', 'Nashik', 'Netarhat', 'Ooty', 'Pahalgam', 'Panaji', 'Panchkula', 'Panipat', 'Patiala', 'Patna',
  'Pelling', 'Port Blair', 'Prayagraj', 'Puducherry', 'Pune', 'Puri', 'Pushkar', 'Raipur', 'Rajahmundry',
  'Rajgir', 'Rameswaram', 'Ranchi', 'Ranthambore', 'Rishikesh', 'Shantiniketan', 'Shillong', 'Shimla',
  'Sirpur', 'Sivasagar', 'Somnath', 'Srinagar', 'Surat', 'Tawang', 'Tezpur', 'Thanjavur', 'Thiruvananthapuram',
  'Thrissur', 'Tiruchirappalli', 'Tirupati', 'Udaipur', 'Udupi', 'Ujjain', 'Ukhrul', 'Vadodara', 'Vaishali',
  'Varanasi', 'Varkala', 'Vijayawada', 'Visakhapatnam', 'Warangal', 'Wayanad', 'Ziro'
];

export default function TransportPlannerPage() {
  const [cityList, setCityList] = useState(DEFAULT_INDIA_HUBS);
  const [places, setPlaces] = useState([]);
  const [originName, setOriginName] = useState('India Gate');
  const [destName, setDestName] = useState('Red Fort (Lal Qila)');
  const [city, setCity] = useState('Delhi');
  const [startCity, setStartCity] = useState('Bangalore');
  const [travelers, setTravelers] = useState(2);
  const [transportData, setTransportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCities().then((res) => {
      const apiCities = (res.cities || []).map((c) => c.city);
      const merged = Array.from(new Set([...DEFAULT_INDIA_HUBS, ...apiCities])).sort((a, b) => a.localeCompare(b));
      if (merged.length > 0) setCityList(merged);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.searchPlaces({ city, limit: 120 }).then((res) => {
      const items = res.places || [];
      setPlaces(items);
      if (items.length >= 2) {
        setOriginName(items[0].name);
        setDestName(items[1].name);
      } else if (items.length === 1) {
        setOriginName(items[0].name);
        setDestName(`${city} Central Railway / Bus Junction`);
      }
    }).catch(() => {});
  }, [city]);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const data = await api.getTransport({
        origin: originName,
        destination: destName,
        city,
        start_city: startCity,
        travelers,
      });
      setTransportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [originName, destName, city, startCity, travelers]);

  const localOpts = transportData?.localTransport;
  const intercityOpts = transportData?.intercityTransport;
  const metroStations = transportData?.metroStations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-8">
      {/* Header */}
      <div className="st-page-hero bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
          <Train className="w-3.5 h-3.5" />
          Multi-Modal Local & Intercity Transport Intelligence ({cityList.length}+ All-India Cities)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Metro, Bus, Cab & Intercity Train / Flight Planner
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Station-to-station Metro routing, local Bus/Auto/Cab fare estimation, and intercity Train & Flight comparison across all 36 Indian States & Union Territories. All formula-computed fares are transparently labeled as <strong className="text-amber-300">Estimated Data</strong>.
        </p>
      </div>

      {/* Section 1: Local Multi-Modal Transport Calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-teal-600" />
            1. Local Attraction-to-Attraction Multi-Modal Calculator
          </h2>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            Data Source: ESTIMATED DATA (Configurable Per-Km Fare Tables)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination City ({cityList.length} Indian Cities)</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              {cityList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">From Tourist Place</label>
            <select
              value={originName}
              onChange={(e) => setOriginName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              {places.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To Tourist Place</label>
            <select
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              {places.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow transition cursor-pointer"
          >
            {loading ? 'Calculating...' : 'Compare Transport Modes'}
          </button>
        </div>

        {localOpts && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-teal-900">Road Distance: </span>
                <span className="text-teal-800 font-semibold">{localOpts.distance_km} km</span>
                <span className="mx-2">•</span>
                <span className="font-bold text-teal-900">AI Recommended Mode: </span>
                <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-bold">
                  {localOpts.recommended_mode}
                </span>
              </div>
              <span className="text-teal-800 font-semibold">
                Est. {localOpts.recommended_time_mins} mins • ₹{localOpts.recommended_cost_inr}
              </span>
            </div>

            {localOpts.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Metro */}
                <div className="rounded-2xl p-4 border border-teal-300 bg-teal-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-sm">Metro Rail</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Estimated fare
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-700 mb-1">
                    ₹{localOpts.options.metro?.estimated_fare_inr}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Duration:</strong> {localOpts.options.metro?.estimated_time_mins} mins</div>
                    <div><strong>Network:</strong> {localOpts.options.metro?.network}</div>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      {localOpts.options.metro?.route_summary}
                    </div>
                  </div>
                </div>

                {/* Bus */}
                <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-sm">City Bus</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Estimated fare
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-700 mb-1">
                    ₹{localOpts.options.bus?.estimated_fare_inr}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Duration:</strong> {localOpts.options.bus?.estimated_time_mins} mins</div>
                    <div><strong>Route:</strong> {localOpts.options.bus?.bus_route}</div>
                    <div><strong>Stop:</strong> {localOpts.options.bus?.nearest_stop}</div>
                  </div>
                </div>

                {/* Auto */}
                <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-sm">Auto Rickshaw</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Estimated fare
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-700 mb-1">
                    ₹{localOpts.options.auto?.estimated_fare_inr}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Duration:</strong> {localOpts.options.auto?.estimated_time_mins} mins</div>
                    <div><strong>Distance:</strong> {localOpts.options.auto?.distance_km} km</div>
                    <div className="text-[11px] text-slate-500">{localOpts.options.auto?.fare_label}</div>
                  </div>
                </div>

                {/* Cab */}
                <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-sm">App Cab / Taxi</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Estimated fare
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-700 mb-1">
                    ₹{localOpts.options.cab?.estimated_fare_mini_inr}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Duration:</strong> {localOpts.options.cab?.estimated_time_mins} mins</div>
                    <div><strong>Sedan:</strong> ₹{localOpts.options.cab?.estimated_fare_sedan_inr}</div>
                    <div><strong>SUV:</strong> ₹{localOpts.options.cab?.estimated_fare_suv_inr}</div>
                  </div>
                </div>

                {/* Walking */}
                <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-sm">Walking</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Free
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-700 mb-1">
                    ₹0
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Duration:</strong> {localOpts.options.walking?.estimated_time_mins} mins</div>
                    <div className="text-[11px] text-slate-500">{localOpts.options.walking?.details}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Intercity Train / Flight / Bus Estimator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-indigo-600" />
            2. Intercity Train (IRCTC Tier Estimate), Flight & Express Bus Comparison
          </h2>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            ESTIMATED DATA (Non-Live Distance-Tiered Schedule)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Origin City ({cityList.length} Indian Cities)</label>
            <select
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              {cityList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination City ({cityList.length} Indian Cities)</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              {cityList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Travelers</label>
            <input
              type="number"
              min={1}
              max={15}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {intercityOpts && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">{intercityOpts.disclaimer}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {intercityOpts.options?.map((opt, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-base">{opt.mode}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {opt.data_type}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-indigo-700 mb-2">
                    ₹{opt.estimated_cost_per_person_inr?.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-500">/ person</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Service:</strong> {opt.service_name}</div>
                    <div><strong>Distance:</strong> {opt.distance_km} km • <strong>Est. Time:</strong> {opt.estimated_duration_hrs} hrs</div>
                    <div><strong>Total for {travelers} Travelers:</strong> ₹{opt.total_cost_for_travelers_inr?.toLocaleString('en-IN')}</div>
                    <p className="text-[11px] text-slate-500 pt-2">{opt.schedule_info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Seeded Metro Stations Reference */}
      {metroStations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <Train className="w-5 h-5 text-teal-600" />
            3. Verified Metro Station Directory in {city} ({metroStations.length} Stations)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {metroStations.map((st) => (
              <div key={st.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <div className="font-bold text-slate-900">{st.stationName}</div>
                <div className="text-teal-700 font-semibold mt-0.5">{st.lineName} • {st.network}</div>
                <div className="text-slate-500 mt-1">
                  {st.isInterchange ? (
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                      Interchange: {st.connectedLines}
                    </span>
                  ) : (
                    <span>Attractions: {st.nearbyAttractions}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
