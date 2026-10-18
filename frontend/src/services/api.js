const API_BASE = import.meta.env.VITE_API_BASE || '';

export function getToken() {
  return localStorage.getItem('safetrip_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('safetrip_token', token);
  } else {
    localStorage.removeItem('safetrip_token');
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errText = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      errText = errJson.detail || errJson.message || errText;
    } catch {
      // ignore
    }
    throw new Error(errText);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    return res.blob();
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => apiRequest('/api/auth/me'),
  updatePreferences: (payload) =>
    apiRequest('/api/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // States, Districts, Places, Cities
  getCategories: () => apiRequest('/api/categories'),
  getStates: () => apiRequest('/api/states'),
  getCities: (state = '') =>
    apiRequest(`/api/cities${state ? `?state=${encodeURIComponent(state)}` : ''}`),
  getStateDistricts: (stateId) => apiRequest(`/api/states/${stateId}/districts`),

  getDistrictPlaces: (districtId) => apiRequest(`/api/districts/${districtId}/places`),
  searchPlaces: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    return apiRequest(`/api/places?${qs.toString()}`);
  },
  autocomplete: (q) => apiRequest(`/api/places/autocomplete?q=${encodeURIComponent(q)}`),
  getPlaceDetails: (id) => apiRequest(`/api/places/${id}`),

  // AI Recommendations & Trip Planner
  getRecommendations: (payload) =>
    apiRequest('/api/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  planTrip: (payload) =>
    apiRequest('/api/trips/plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getUserTrips: () => apiRequest('/api/trips'),
  getTripById: (id) => apiRequest(`/api/trips/${id}`),
  exportTripPdf: (tripId) =>
    apiRequest(`/api/itinerary/${tripId}/export-pdf`, { method: 'POST' }),
  exportDirectPdf: (itineraryData) =>
    apiRequest('/api/itinerary/export-pdf-direct', {
      method: 'POST',
      body: JSON.stringify(itineraryData),
    }),

  // Safety, Crowd, Weather, Route, Transport, Incidents
  predictRisk: (payload) =>
    apiRequest('/api/risk/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  predictCrowd: (payload) =>
    apiRequest('/api/crowd/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  predictWeatherRisk: (payload) =>
    apiRequest('/api/weather/risk', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  analyzeRoute: (payload) =>
    apiRequest('/api/route/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTransport: (params = {}) => {
    const qs = new URLSearchParams(params);
    return apiRequest(`/api/transport?${qs.toString()}`);
  },
  getIncidents: (params = {}) => {
    const qs = new URLSearchParams(params);
    return apiRequest(`/api/incidents?${qs.toString()}`);
  },
  reportIncident: (payload) =>
    apiRequest('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // PDF Dataset Upload & Approval
  uploadPdf: (file, datasetSource) => {
    const form = new FormData();
    form.append('file', file);
    form.append('dataset_source', datasetSource || 'Uploaded Tourism PDF');
    return apiRequest('/api/pdf/upload', { method: 'POST', body: form });
  },
  loadCapstonePdfSample: () =>
    apiRequest('/api/pdf/load-capstone-sample', { method: 'POST' }),
  listPdfUploads: () => apiRequest('/api/pdf'),
  getPdfDetail: (id) => apiRequest(`/api/pdf/${id}`),
  updatePdfRecords: (id, records) =>
    apiRequest(`/api/pdf/${id}/records`, {
      method: 'PUT',
      body: JSON.stringify({ records }),
    }),
  approvePdfUpload: (id) =>
    apiRequest(`/api/pdf/${id}/approve`, { method: 'POST' }),

  // ML & Admin
  getMlEvaluation: () => apiRequest('/api/ml/evaluation'),
  retrainMlModels: () => apiRequest('/api/ml/train', { method: 'POST' }),
  getAdminOverview: () => apiRequest('/api/admin/overview'),
  adminCreatePlace: (payload) =>
    apiRequest('/api/admin/places', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminDeletePlace: (id) =>
    apiRequest(`/api/admin/places/${id}`, { method: 'DELETE' }),
};
