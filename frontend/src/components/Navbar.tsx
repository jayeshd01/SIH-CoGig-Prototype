import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import {
  FiTool,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiAlertTriangle,
  FiShield,
  FiGlobe,
  FiBriefcase,
  FiCalendar,
  FiActivity,
  FiMapPin,
  FiNavigation,
  FiChevronDown,
} from 'react-icons/fi';
import EmergencySOSModal from './EmergencySOSModal';

const Navbar: React.FC = () => {
  const { user, logout, loginAsDemo } = useAuth();
  const { location, openPrompt } = useLocation();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangDropdownOpen(false);
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'mr' : i18n.language === 'mr' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
  };

  const handleDemoSwitch = async (role: 'CUSTOMER' | 'WORKER' | 'ADMIN') => {
    await loginAsDemo(role);
    setIsDemoDropdownOpen(false);
    if (role === 'CUSTOMER') navigate('/customer');
    if (role === 'WORKER') navigate('/worker');
    if (role === 'ADMIN') navigate('/admin');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        {/* Top cooperative banner */}
        <div className="bg-[#145A2F] text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
          <FiShield className="inline text-emerald-300" />
          <span>Labour Cooperative Federation Recognized &bull; 80-90% Direct Worker Wage Guarantee &bull; Welfare & Accident Cover</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#2A8F4F] flex items-center justify-center shadow-md text-white font-black text-xl group-hover:scale-105 transition-transform">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-[#1B6B3A]">
                  CoGig
                </span>
                <span className="text-[10px] text-gray-500 font-medium -mt-1 hidden sm:inline">
                  सहकारी डिजिटल सेवा मंच
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/services" className="text-sm font-semibold text-gray-700 hover:text-[#1B6B3A] transition-colors">
                {t('nav.services')}
              </Link>
              <Link to="/workers" className="text-sm font-semibold text-gray-700 hover:text-[#1B6B3A] transition-colors">
                {t('nav.workers')}
              </Link>
              <Link to="/about-cooperative" className="text-sm font-semibold text-gray-700 hover:text-[#1B6B3A] transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/welfare" className="text-sm font-semibold text-gray-700 hover:text-[#1B6B3A] transition-colors">
                {t('nav.welfare')}
              </Link>

              {user?.role === 'CUSTOMER' && (
                <Link to="/customer" className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 hover:text-emerald-800">
                  <FiCalendar className="text-base" /> {t('nav.myBookings')}
                </Link>
              )}
              {user?.role === 'WORKER' && (
                <Link to="/worker" className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 hover:text-amber-800">
                  <FiBriefcase className="text-base" /> {t('nav.jobs')}
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-sm font-semibold text-purple-700 flex items-center gap-1.5 hover:text-purple-800">
                  <FiActivity className="text-base" /> {t('nav.adminPanel')}
                </Link>
              )}
            </nav>

            {/* Actions & Utilities */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Location Selector Pill */}
              <button
                onClick={openPrompt}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 text-[#1a73e8] hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer group"
                title="Change Device GPS / Choose Neighborhood"
              >
                <FiMapPin className="text-[#1a73e8] animate-pulse text-sm group-hover:scale-110 transition-transform" />
                <span className="max-w-[140px] truncate font-black">
                  {location.neighborhood.split('(')[0] || 'Pune'}
                </span>
                <span className="text-[9px] bg-[#1a73e8] text-white px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                  {location.source === 'GPS' ? 'GPS' : 'Area'}
                </span>
              </button>

              {/* Multilingual Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Select Language"
                >
                  <FiGlobe className="text-emerald-700 text-sm" />
                  <span className="font-bold">
                    {languages.find((l) => l.code === i18n.language)?.native || 'English'}
                  </span>
                  <FiChevronDown className="text-gray-400 text-xs" />
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs space-y-0.5">
                    <div className="px-3 py-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                      Choose Language:
                    </div>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center justify-between cursor-pointer ${
                          i18n.language === l.code
                            ? 'bg-emerald-50/80 text-[#1B6B3A] font-black'
                            : 'text-gray-700 font-medium'
                        }`}
                      >
                        <span>{l.native}</span>
                        <span className="text-[10px] text-gray-400">{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Demo Switcher Quick Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Demo Roles
                </button>

                {isDemoDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs">
                    <div className="px-3 py-1 text-gray-400 font-semibold uppercase text-[10px]">Instant Login:</div>
                    <button
                      onClick={() => handleDemoSwitch('CUSTOMER')}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-800 font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Customer (Anita)
                    </button>
                    <button
                      onClick={() => handleDemoSwitch('WORKER')}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-800 font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Worker (Rajesh, Electrician)
                    </button>
                    <button
                      onClick={() => handleDemoSwitch('ADMIN')}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-800 font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span> Co-op Admin Federation
                    </button>
                  </div>
                )}
              </div>

              {/* Emergency SOS Button */}
              <button
                onClick={() => setShowSosModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <FiAlertTriangle className="animate-bounce" />
                <span>SOS</span>
              </button>

              {/* User Account / Auth buttons */}
              {user ? (
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 capitalize">
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Sign Out"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <Link
                    to="/login"
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg text-[#1B6B3A] border border-[#1B6B3A] hover:bg-emerald-50 transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#1B6B3A] text-white hover:bg-[#145A2F] transition-colors shadow-xs"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setShowSosModal(true)}
                className="p-1.5 bg-red-600 text-white rounded-md text-xs font-bold flex items-center gap-1"
              >
                <FiAlertTriangle /> SOS
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/services"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800"
            >
              {t('nav.services')}
            </Link>
            <Link
              to="/workers"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800"
            >
              {t('nav.workers')}
            </Link>
            <Link
              to="/about-cooperative"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800"
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/welfare"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800"
            >
              {t('nav.welfare')}
            </Link>

            {user?.role === 'CUSTOMER' && (
              <Link
                to="/customer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-emerald-700"
              >
                {t('nav.myBookings')}
              </Link>
            )}
            {user?.role === 'WORKER' && (
              <Link
                to="/worker"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-amber-700"
              >
                {t('nav.jobs')}
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-purple-700"
              >
                {t('nav.adminPanel')}
              </Link>
            )}

            {/* Mobile Location Selector */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  openPrompt();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[#1a73e8] text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-base animate-pulse" />
                  <span className="truncate">{location.neighborhood.split('(')[0] || 'Pune'}</span>
                </div>
                <span className="text-[10px] uppercase bg-[#1a73e8] text-white px-1.5 py-0.5 rounded font-black">
                  Turn on GPS / Change
                </span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={toggleLanguage}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700"
              >
                Language: {i18n.language === 'hi' ? 'हिन्दी' : 'English'}
              </button>
              {user ? (
                <button
                  onClick={logout}
                  className="text-xs font-bold text-red-600 px-3 py-1.5 rounded-lg bg-red-50"
                >
                  Sign Out ({user.firstName})
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-xs font-bold px-3 py-1.5 border rounded-lg">
                    Login
                  </Link>
                  <Link to="/register" className="text-xs font-bold px-3 py-1.5 bg-[#1B6B3A] text-white rounded-lg">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Demo Buttons for Mobile */}
            <div className="pt-2 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-500 mb-2">Switch Demo Account:</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    handleDemoSwitch('CUSTOMER');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-1 px-2 text-[10px] bg-blue-50 text-blue-800 font-bold rounded-sm text-center"
                >
                  Customer
                </button>
                <button
                  onClick={() => {
                    handleDemoSwitch('WORKER');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-1 px-2 text-[10px] bg-amber-50 text-amber-800 font-bold rounded-sm text-center"
                >
                  Worker
                </button>
                <button
                  onClick={() => {
                    handleDemoSwitch('ADMIN');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-1 px-2 text-[10px] bg-purple-50 text-purple-800 font-bold rounded-sm text-center"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Emergency SOS Modal */}
      {showSosModal && <EmergencySOSModal onClose={() => setShowSosModal(false)} />}
    </>
  );
};

export default Navbar;
