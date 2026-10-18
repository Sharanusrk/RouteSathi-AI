import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, ChevronDown, Search, Check, X } from 'lucide-react';

export const MASTER_INDIAN_CITIES = [
  { city: 'Agartala', state: 'Tripura' },
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Aizawl', state: 'Mizoram' },
  { city: 'Ajmer', state: 'Rajasthan' },
  { city: 'Alibaug', state: 'Maharashtra' },
  { city: 'Alleppey', state: 'Kerala' },
  { city: 'Almora', state: 'Uttarakhand' },
  { city: 'Amaravati', state: 'Andhra Pradesh' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Anandpur Sahib', state: 'Punjab' },
  { city: 'Araku Valley', state: 'Andhra Pradesh' },
  { city: 'Auli', state: 'Uttarakhand' },
  { city: 'Aurangabad', state: 'Maharashtra' },
  { city: 'Ayodhya', state: 'Uttar Pradesh' },
  { city: 'Badami', state: 'Karnataka' },
  { city: 'Badrinath', state: 'Uttarakhand' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Belagavi', state: 'Karnataka' },
  { city: 'Bharatpur', state: 'Rajasthan' },
  { city: 'Bhimtal', state: 'Uttarakhand' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Bhubaneswar', state: 'Odisha' },
  { city: 'Bhuj', state: 'Gujarat' },
  { city: 'Bikaner', state: 'Rajasthan' },
  { city: 'Bilaspur', state: 'Chhattisgarh' },
  { city: 'Bodh Gaya', state: 'Bihar' },
  { city: 'Bomdila', state: 'Arunachal Pradesh' },
  { city: 'Calangute', state: 'Goa' },
  { city: 'Champhai', state: 'Mizoram' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Cherrapunji', state: 'Meghalaya' },
  { city: 'Chidambaram', state: 'Tamil Nadu' },
  { city: 'Chikkamagaluru', state: 'Karnataka' },
  { city: 'Chittorgarh', state: 'Rajasthan' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Coonoor', state: 'Tamil Nadu' },
  { city: 'Coorg (Madikeri)', state: 'Karnataka' },
  { city: 'Cuttack', state: 'Odisha' },
  { city: 'Dalhousie', state: 'Himachal Pradesh' },
  { city: 'Daman', state: 'Dadra & Nagar Haveli and Daman & Diu' },
  { city: 'Darbhanga', state: 'Bihar' },
  { city: 'Darjeeling', state: 'West Bengal' },
  { city: 'Dawki', state: 'Meghalaya' },
  { city: 'Dehradun', state: 'Uttarakhand' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Deoghar', state: 'Jharkhand' },
  { city: 'Dhanbad', state: 'Jharkhand' },
  { city: 'Dharamshala', state: 'Himachal Pradesh' },
  { city: 'Dibrugarh', state: 'Assam' },
  { city: 'Digha', state: 'West Bengal' },
  { city: 'Dimapur', state: 'Nagaland' },
  { city: 'Diu', state: 'Dadra & Nagar Haveli and Daman & Diu' },
  { city: 'Durgapur', state: 'West Bengal' },
  { city: 'Dwarka', state: 'Gujarat' },
  { city: 'Ernakulam', state: 'Kerala' },
  { city: 'Faridabad', state: 'Haryana' },
  { city: 'Gandhinagar', state: 'Gujarat' },
  { city: 'Gangtok', state: 'Sikkim' },
  { city: 'Gaya', state: 'Bihar' },
  { city: 'Goa (Panaji)', state: 'Goa' },
  { city: 'Gokarna', state: 'Karnataka' },
  { city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { city: 'Gulmarg', state: 'Jammu and Kashmir' },
  { city: 'Guntur', state: 'Andhra Pradesh' },
  { city: 'Gurugram', state: 'Haryana' },
  { city: 'Guwahati', state: 'Assam' },
  { city: 'Gwalior', state: 'Madhya Pradesh' },
  { city: 'Haldwani', state: 'Uttarakhand' },
  { city: 'Hampi', state: 'Karnataka' },
  { city: 'Haridwar', state: 'Uttarakhand' },
  { city: 'Hassan', state: 'Karnataka' },
  { city: 'Havelock Island', state: 'Andaman and Nicobar Islands' },
  { city: 'Hisar', state: 'Haryana' },
  { city: 'Hosapete', state: 'Karnataka' },
  { city: 'Hubballi', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Imphal', state: 'Manipur' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Itanagar', state: 'Arunachal Pradesh' },
  { city: 'Jabalpur', state: 'Madhya Pradesh' },
  { city: 'Jagdalpur', state: 'Chhattisgarh' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Jaisalmer', state: 'Rajasthan' },
  { city: 'Jalandhar', state: 'Punjab' },
  { city: 'Jammu', state: 'Jammu and Kashmir' },
  { city: 'Jamnagar', state: 'Gujarat' },
  { city: 'Jamshedpur', state: 'Jharkhand' },
  { city: 'Jhansi', state: 'Uttar Pradesh' },
  { city: 'Jodhpur', state: 'Rajasthan' },
  { city: 'Jorhat', state: 'Assam' },
  { city: 'Junagadh', state: 'Gujarat' },
  { city: 'Kalimpong', state: 'West Bengal' },
  { city: 'Kanchipuram', state: 'Tamil Nadu' },
  { city: 'Kanha', state: 'Madhya Pradesh' },
  { city: 'Kannur', state: 'Kerala' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Kanyakumari', state: 'Tamil Nadu' },
  { city: 'Kargil', state: 'Ladakh' },
  { city: 'Karnal', state: 'Haryana' },
  { city: 'Karwar', state: 'Karnataka' },
  { city: 'Kasauli', state: 'Himachal Pradesh' },
  { city: 'Katra (Vaishno Devi)', state: 'Jammu and Kashmir' },
  { city: 'Kavaratti', state: 'Lakshadweep' },
  { city: 'Kaziranga', state: 'Assam' },
  { city: 'Kedarnath', state: 'Uttarakhand' },
  { city: 'Kevadia (Statue of Unity)', state: 'Gujarat' },
  { city: 'Khajuraho', state: 'Madhya Pradesh' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Kodaikanal', state: 'Tamil Nadu' },
  { city: 'Kohima', state: 'Nagaland' },
  { city: 'Kolhapur', state: 'Maharashtra' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Kollam', state: 'Kerala' },
  { city: 'Konark', state: 'Odisha' },
  { city: 'Kota', state: 'Rajasthan' },
  { city: 'Kottayam', state: 'Kerala' },
  { city: 'Kovalam', state: 'Kerala' },
  { city: 'Kozhikode', state: 'Kerala' },
  { city: 'Kullu', state: 'Himachal Pradesh' },
  { city: 'Kumbakonam', state: 'Tamil Nadu' },
  { city: 'Kumarakom', state: 'Kerala' },
  { city: 'Kurnool', state: 'Andhra Pradesh' },
  { city: 'Kurukshetra', state: 'Haryana' },
  { city: 'Kutch (Rann of Kutch)', state: 'Gujarat' },
  { city: 'Lachung', state: 'Sikkim' },
  { city: 'Leh', state: 'Ladakh' },
  { city: 'Lepakshi', state: 'Andhra Pradesh' },
  { city: 'Lonavala', state: 'Maharashtra' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Madurai', state: 'Tamil Nadu' },
  { city: 'Mahabalipuram', state: 'Tamil Nadu' },
  { city: 'Mahabaleshwar', state: 'Maharashtra' },
  { city: 'Majuli', state: 'Assam' },
  { city: 'Manali', state: 'Himachal Pradesh' },
  { city: 'Mandu', state: 'Madhya Pradesh' },
  { city: 'Mangaluru', state: 'Karnataka' },
  { city: 'Margao', state: 'Goa' },
  { city: 'Mathura', state: 'Uttar Pradesh' },
  { city: 'Matheran', state: 'Maharashtra' },
  { city: 'McLeod Ganj', state: 'Himachal Pradesh' },
  { city: 'Meerut', state: 'Uttar Pradesh' },
  { city: 'Mount Abu', state: 'Rajasthan' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Munnar', state: 'Kerala' },
  { city: 'Murudeshwar', state: 'Karnataka' },
  { city: 'Mussoorie', state: 'Uttarakhand' },
  { city: 'Mysore', state: 'Karnataka' },
  { city: 'Nagarjuna Sagar', state: 'Telangana' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Nainital', state: 'Uttarakhand' },
  { city: 'Nalanda', state: 'Bihar' },
  { city: 'Nashik', state: 'Maharashtra' },
  { city: 'Neil Island', state: 'Andaman and Nicobar Islands' },
  { city: 'Nellore', state: 'Andhra Pradesh' },
  { city: 'Netarhat', state: 'Jharkhand' },
  { city: 'New Delhi', state: 'Delhi' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Nubra Valley', state: 'Ladakh' },
  { city: 'Old Goa', state: 'Goa' },
  { city: 'Omkareshwar', state: 'Madhya Pradesh' },
  { city: 'Ooty', state: 'Tamil Nadu' },
  { city: 'Orchha', state: 'Madhya Pradesh' },
  { city: 'Pachmarhi', state: 'Madhya Pradesh' },
  { city: 'Pahalgam', state: 'Jammu and Kashmir' },
  { city: 'Palakkad', state: 'Kerala' },
  { city: 'Panaji', state: 'Goa' },
  { city: 'Panchkula', state: 'Haryana' },
  { city: 'Pangong Tso', state: 'Ladakh' },
  { city: 'Panipat', state: 'Haryana' },
  { city: 'Patiala', state: 'Punjab' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Pelling', state: 'Sikkim' },
  { city: 'Periyar (Thekkady)', state: 'Kerala' },
  { city: 'Pithoragarh', state: 'Uttarakhand' },
  { city: 'Port Blair', state: 'Andaman and Nicobar Islands' },
  { city: 'Prayagraj', state: 'Uttar Pradesh' },
  { city: 'Puducherry', state: 'Puducherry' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Puri', state: 'Odisha' },
  { city: 'Pushkar', state: 'Rajasthan' },
  { city: 'Raipur', state: 'Chhattisgarh' },
  { city: 'Rajahmundry', state: 'Andhra Pradesh' },
  { city: 'Rajgir', state: 'Bihar' },
  { city: 'Rajkot', state: 'Gujarat' },
  { city: 'Rameswaram', state: 'Tamil Nadu' },
  { city: 'Ranchi', state: 'Jharkhand' },
  { city: 'Ranikhet', state: 'Uttarakhand' },
  { city: 'Ranthambore', state: 'Rajasthan' },
  { city: 'Ratnagiri', state: 'Maharashtra' },
  { city: 'Rishikesh', state: 'Uttarakhand' },
  { city: 'Rohtak', state: 'Haryana' },
  { city: 'Rourkela', state: 'Odisha' },
  { city: 'Salem', state: 'Tamil Nadu' },
  { city: 'Sanchi', state: 'Madhya Pradesh' },
  { city: 'Saputara', state: 'Gujarat' },
  { city: 'Shantiniketan', state: 'West Bengal' },
  { city: 'Shillong', state: 'Meghalaya' },
  { city: 'Shimla', state: 'Himachal Pradesh' },
  { city: 'Shirdi', state: 'Maharashtra' },
  { city: 'Shivamogga', state: 'Karnataka' },
  { city: 'Siliguri', state: 'West Bengal' },
  { city: 'Silvassa', state: 'Dadra & Nagar Haveli and Daman & Diu' },
  { city: 'Sirpur', state: 'Chhattisgarh' },
  { city: 'Sivasagar', state: 'Assam' },
  { city: 'Solan', state: 'Himachal Pradesh' },
  { city: 'Somnath', state: 'Gujarat' },
  { city: 'Sonamarg', state: 'Jammu and Kashmir' },
  { city: 'Spiti Valley', state: 'Himachal Pradesh' },
  { city: 'Srinagar', state: 'Jammu and Kashmir' },
  { city: 'Sundarbans', state: 'West Bengal' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Tawang', state: 'Arunachal Pradesh' },
  { city: 'Tezpur', state: 'Assam' },
  { city: 'Thanjavur', state: 'Tamil Nadu' },
  { city: 'Thiruvananthapuram', state: 'Kerala' },
  { city: 'Thrissur', state: 'Kerala' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { city: 'Tirunelveli', state: 'Tamil Nadu' },
  { city: 'Tirupati', state: 'Andhra Pradesh' },
  { city: 'Tiruvannamalai', state: 'Tamil Nadu' },
  { city: 'Udaipur', state: 'Rajasthan' },
  { city: 'Udupi', state: 'Karnataka' },
  { city: 'Ujjain', state: 'Madhya Pradesh' },
  { city: 'Ukhrul', state: 'Manipur' },
  { city: 'Vadodara', state: 'Gujarat' },
  { city: 'Vaishali', state: 'Bihar' },
  { city: 'Varanasi', state: 'Uttar Pradesh' },
  { city: 'Varkala', state: 'Kerala' },
  { city: 'Vellore', state: 'Tamil Nadu' },
  { city: 'Vijayawada', state: 'Andhra Pradesh' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Vrindavan', state: 'Uttar Pradesh' },
  { city: 'Warangal', state: 'Telangana' },
  { city: 'Wayanad', state: 'Kerala' },
  { city: 'Yercaud', state: 'Tamil Nadu' },
  { city: 'Ziro', state: 'Arunachal Pradesh' },
];

export default function AllIndiaCitySelect({
  label,
  value,
  onChange,
  apiCities = [],
  states = [],
  includeStates = false,
  placeholder = 'Select Indian City...',
  accentColor = 'sky',
}) {
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Merge MASTER_INDIAN_CITIES + live apiCities + optional states
  const mergedOptions = useMemo(() => {
    const map = new Map();
    MASTER_INDIAN_CITIES.forEach((item) => {
      map.set(item.city.toLowerCase(), {
        label: item.city,
        value: item.city,
        sublabel: item.state,
        type: 'City',
      });
    });
    (apiCities || []).forEach((c) => {
      const cName = (c.city || '').trim();
      if (!cName) return;
      const key = cName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          label: cName,
          value: cName,
          sublabel: c.state || 'India',
          type: 'City',
        });
      }
    });
    if (includeStates) {
      (states || []).forEach((s) => {
        const sName = (s.name || '').trim();
        if (!sName) return;
        const key = `state-${sName.toLowerCase()}`;
        if (!map.has(sName.toLowerCase())) {
          map.set(key, {
            label: sName,
            value: sName,
            sublabel: `${s.region || 'India'} • State / UT`,
            type: 'State',
          });
        }
      });
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [apiCities, states, includeStates]);

  const filteredOptions = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return mergedOptions;
    return mergedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [mergedOptions, filterText]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const currentObj = mergedOptions.find(
    (o) => o.value.toLowerCase() === (value || '').trim().toLowerCase()
  );

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setFilterText('');
        }}
        className="w-full pl-9 pr-8 py-3 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 font-bold text-slate-900 text-sm text-left flex items-center justify-between focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition cursor-pointer"
      >
        <MapPin className={`w-4 h-4 text-${accentColor}-600 absolute left-3 top-[calc(50%+10px)] -translate-y-1/2 pointer-events-none`} />
        <div className="truncate">
          <span className="font-extrabold text-slate-900">{value || placeholder}</span>
          {currentObj?.sublabel && (
            <span className="ml-1.5 text-[11px] font-medium text-slate-500">
              ({currentObj.sublabel})
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden min-w-[260px]">
          {/* Search input inside dropdown */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={`Search ${mergedOptions.length}+ Indian cities or states...`}
                className="w-full pl-8 pr-7 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {filterText && (
                <button
                  type="button"
                  onClick={() => setFilterText('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] font-bold text-slate-500">
              <span>Showing {filteredOptions.length} Indian Cities</span>
              <span>All 36 States & UTs</span>
            </div>
          </div>

          {/* Scrollable all-India city list */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = (value || '').toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    type="button"
                    key={`${opt.type}-${opt.value}`}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setFilterText('');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-sky-50 transition cursor-pointer ${
                      isSelected ? 'bg-sky-50/80 font-extrabold text-sky-900' : 'text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500">{opt.sublabel}</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {opt.type}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-2">No exact match in preset list.</p>
                {filterText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(filterText.trim());
                      setOpen(false);
                      setFilterText('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
                  >
                    Use "{filterText.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
