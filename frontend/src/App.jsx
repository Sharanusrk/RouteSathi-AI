import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import Navbar from './components/Navbar';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ExploreIndiaPage = lazy(() => import('./pages/ExploreIndiaPage'));
const PlaceDetailsPage = lazy(() => import('./pages/PlaceDetailsPage'));
const TripPlannerPage = lazy(() => import('./pages/TripPlannerPage'));
const InteractiveMapPage = lazy(() => import('./pages/InteractiveMapPage'));
const TransportPlannerPage = lazy(() => import('./pages/TransportPlannerPage'));
const SafetyDashboardPage = lazy(() => import('./pages/SafetyDashboardPage'));
const IncidentReportPage = lazy(() => import('./pages/IncidentReportPage'));
const PdfManagerPage = lazy(() => import('./pages/PdfManagerPage'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const MlDashboardPage = lazy(() => import('./pages/MlDashboardPage'));

function renderPage(Page) {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-slate-500" role="status">Loading page…</div>}>
      <Page />
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={renderPage(LandingPage)} />
                <Route path="/login" element={renderPage(LoginPage)} />
                <Route path="/register" element={renderPage(RegisterPage)} />
                <Route path="/explore" element={renderPage(ExploreIndiaPage)} />
                <Route path="/places/:id" element={renderPage(PlaceDetailsPage)} />
                <Route path="/planner" element={renderPage(TripPlannerPage)} />
                <Route path="/trip-planner" element={renderPage(TripPlannerPage)} />
                <Route path="/recommendations" element={renderPage(TripPlannerPage)} />
                <Route path="/map" element={renderPage(InteractiveMapPage)} />
                <Route path="/transport" element={renderPage(TransportPlannerPage)} />
                <Route path="/safety" element={renderPage(SafetyDashboardPage)} />
                <Route path="/incidents" element={renderPage(IncidentReportPage)} />
                <Route path="/pdf" element={renderPage(PdfManagerPage)} />
                <Route path="/pdf-manager" element={renderPage(PdfManagerPage)} />
                <Route path="/dashboard" element={renderPage(UserDashboardPage)} />
                <Route path="/admin" element={renderPage(AdminDashboardPage)} />
                <Route path="/ml-dashboard" element={renderPage(MlDashboardPage)} />
              </Routes>
            </main>

            <footer className="bg-white text-slate-500 border-t border-slate-200 pt-5 pb-32 mt-4 sm:py-8 sm:pb-8 sm:mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-3 text-center text-[11px] sm:flex-row sm:gap-4 sm:text-left sm:text-xs">
                <div>
                  <span className="font-extrabold text-slate-900">RouteRaksha AI</span> — Plan your trip with safety in mind.
                </div>
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.instagram.com/sharanu_srk/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram Profile"
                      title="Follow on Instagram"
                      className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center gap-1.5 text-[11px] font-semibold group"
                    >
                      <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                      <span>Instagram</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/sharanu-kumasgi"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn Profile"
                      title="Connect on LinkedIn"
                      className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-1.5 text-[11px] font-semibold group"
                    >
                      <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  </div>
                  <span className="text-slate-300 font-medium">
                    Built by{' '}
                    <a
                      href="https://www.linkedin.com/in/sharanu-kumasgi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-800 font-bold tracking-wider hover:text-violet-600 transition-colors"
                      title="Connect on LinkedIn"
                    >
                      Sharanabasappa
                    </a>
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

