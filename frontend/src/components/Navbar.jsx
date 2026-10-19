import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Navigation,
  Calendar,
  Train,
  AlertTriangle,
  FileText,
  Cpu,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  UserPlus,
  GraduationCap,
  Instagram,
  Linkedin,
  Link2,
  Sparkles,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { customTripBasket } = useTrip();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryNavItems = [
    { to: '/explore', label: 'Explore India', icon: MapPin },
    { to: '/planner', label: 'Trip planner', icon: Calendar },
    { to: '/safety', label: 'Safety', icon: ShieldCheck },
    { to: '/map', label: 'Map', icon: Navigation },
    { to: '/transport', label: 'Transport', icon: Train },
    { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { to: '/pdf', label: 'PDF hub', icon: FileText },
    { to: '/ml-dashboard', label: 'AI research', icon: Cpu },
    { to: '/admin', label: 'Admin', icon: LayoutDashboard },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-50 transition-all duration-300">
        <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 text-slate-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-center justify-between h-[76px] gap-5">
              
              {/* Brand Logo */}
              <Link to="/" className="flex items-center gap-3 group shrink-0 select-none">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-900 to-violet-600 flex items-center justify-center shadow-md shadow-violet-200 group-hover:scale-105 transition-all duration-300">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  {/* Subtle live radar ping */}
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[19px] tracking-tight text-slate-950 group-hover:brightness-110 transition">
                      SafeTrip <span className="bg-gradient-to-r from-blue-600 to-fuchsia-600 bg-clip-text text-transparent">AI</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-violet-50 text-violet-700 border border-violet-100">
                      India
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 tracking-wide font-medium hidden sm:block">
                    Plan Smarter • Travel Safer
                  </p>
                </div>
              </Link>

              {/* Desktop Nav Links - Clean & Uniform without arbitrary highlighting */}
              <nav className="hidden lg:flex items-center gap-1">
                {primaryNavItems.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                        active
                          ? 'bg-violet-50 text-violet-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors duration-200 ${
                          active
                          ? 'text-violet-600'
                          : 'text-slate-400 group-hover:text-violet-600'
                        }`}
                      />
                      <span>{item.label}</span>
                      
                      {item.badge && !active && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                          {item.badge}
                        </span>
                      )}

                      {/* Active bottom micro-glow pill */}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-violet-500 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right Side: Trip Basket + Auth/Profile */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Trip Basket Button */}
                {customTripBasket.length > 0 && (
                  <button
                    onClick={() => navigate('/planner')}
                    className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all duration-200"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Trip Basket</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold shadow-sm">
                      {customTripBasket.length}
                    </span>
                  </button>
                )}

                {/* User State */}
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 transition-all duration-200 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                        {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="max-w-[100px] truncate text-slate-800 font-semibold hidden md:inline">
                        {user.full_name}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${
                          user.role === 'ADMIN'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}
                      >
                        {user.role}
                      </span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      title="Logout"
                      className="p-2 rounded-full hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-200 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-semibold border border-black transition-all duration-200"
                    >
                      <LogIn className="w-3.5 h-3.5 text-white" />
                      <span>Sign in</span>
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-md shadow-violet-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Get started</span>
                    </Link>
                  </div>
                )}

                {/* Mobile Hamburger Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
                  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

            </div>
          </div>

          {/* Secondary Tablet/Laptop Quick Horizontal Scroll Bar (when screen is < 1280px but > 768px) */}
          <div className="hidden md:flex lg:hidden items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-white no-scrollbar">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-violet-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Dropdown Drawer for Small Screens */}
          {mobileMenuOpen && (
            <div className="lg:hidden max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-slate-100 bg-white px-4 py-3 shadow-lg animate-fadeIn">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Quick access</p>
              <div className="space-y-1">
                {primaryNavItems.slice(0, 5).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}
                      className={"flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition " + (active ? "bg-violet-50 text-violet-700 font-semibold" : "text-slate-600 hover:bg-slate-50")}>
                      <span className="flex items-center gap-3">
                        <Icon className={"h-4 w-4 " + (active ? "text-violet-600" : "text-slate-400")} />
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </Link>
                  );
                })}
              </div>
              <details className="group mt-2 rounded-xl border border-slate-100">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-3.5 text-sm font-semibold text-slate-600">
                  More tools <span className="text-violet-600 transition group-open:rotate-90">›</span>
                </summary>
                <div className="space-y-1 border-t border-slate-100 p-2">
                  {primaryNavItems.slice(5).map((item) => {
                    const Icon = item.icon;
                    return <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-50"><Icon className="h-4 w-4 text-slate-400" />{item.label}</Link>;
                  })}
                </div>
              </details>
              <section
                className="mt-3 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4 shadow-sm"
                aria-labelledby="about-owner-heading"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/images/sharanabasappa-profile.jpg"
                    alt="Sharanabasappa"
                    className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-md ring-2 ring-violet-200"
                  />
                  <div className="min-w-0">
                    <p id="about-owner-heading" className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
                      About the owner
                    </p>
                    <h2 className="mt-0.5 truncate text-base font-extrabold text-slate-900">
                      Sharanabasappa
                    </h2>
                    <p className="text-xs font-semibold text-slate-600">MCA Student</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 shrink-0 text-violet-600" />
                    <span>Sapthagiri NPS University</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-sky-600" />
                    <span>Bengaluru, India</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <a
                    href="https://linktr.ee/Srk_sharan"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit my Linktree"
                    className="flex items-center justify-center gap-1 rounded-xl border border-violet-200 bg-white px-2 py-2 text-[10px] font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Linktree
                  </a>
                  <a
                    href="https://www.instagram.com/sharanu_srk/?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit my Instagram profile"
                    className="flex items-center justify-center gap-1 rounded-xl border border-pink-200 bg-white px-2 py-2 text-[10px] font-bold text-pink-700 transition hover:bg-pink-50"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    Instagram
                  </a>
                  <a
                    href="https://www.linkedin.com/in/sharanu-kumasgi"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit my LinkedIn profile"
                    className="flex items-center justify-center gap-1 rounded-xl border border-sky-200 bg-white px-2 py-2 text-[10px] font-bold text-sky-700 transition hover:bg-sky-50"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                </div>
              </section>
            </div>
          )}
        </div>
      </header>

      {/* Modern Floating Dock Bottom Bar for Mobile Phones */}
      <nav className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-50 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-300/50 px-2 py-1.5 flex items-center justify-around">
        {[
          { to: '/', label: 'Home', icon: Sparkles },
          { to: '/planner', label: 'Planner', icon: Calendar },
          { to: '/safety', label: 'Safety', icon: ShieldCheck },
          { to: '/explore', label: 'Explore', icon: MapPin },
        ].map((m) => {
          const Icon = m.icon;
          const active = isActive(m.to);
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold transition-all duration-200 ${
                active
                  ? 'text-violet-700 scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{m.label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-violet-600 mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
