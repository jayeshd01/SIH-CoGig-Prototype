import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { Service, Worker } from '../types';
import {
  FiShield,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
  FiHeart,
  FiDollarSign,
  FiUsers,
  FiActivity,
  FiTool,
  FiPhoneCall,
  FiStar,
  FiTrendingUp,
  FiMic,
  FiAward,
} from 'react-icons/fi';
import VoiceAssistantModal from '../components/VoiceAssistantModal';
import BookingModal from '../components/BookingModal';
import FairWageModal from '../components/FairWageModal';
import EmergencySOSModal from '../components/EmergencySOSModal';

import { DEFAULT_SERVICES, DEFAULT_WORKERS } from '../data/mockData';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES.slice(0, 8));
  const [featuredWorkers, setFeaturedWorkers] = useState<Worker[]>(DEFAULT_WORKERS.slice(0, 4));
  const [calculatorAmount, setCalculatorAmount] = useState<number>(500);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showFairWageModal, setShowFairWageModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, workersRes] = await Promise.allSettled([
          api.get('/services'),
          api.get('/workers/nearby?lat=18.5204&lng=73.8567&radius=20'),
        ]);

        if (servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value?.data)) {
          setServices(servicesRes.value.data.slice(0, 8));
        }
        if (workersRes.status === 'fulfilled' && Array.isArray(workersRes.value?.data)) {
          setFeaturedWorkers(workersRes.value.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching home data, using fallback data', err);
      }
    };
    loadData();
  }, []);

  const categoryIcons: Record<string, string> = {
    electrician: '⚡',
    plumber: '🚰',
    carpenter: '🪚',
    painter: '🎨',
    cleaning: '🧹',
    caregiver: '🩺',
    driver: '🚗',
    gardener: '🌱',
    appliance: '🔧',
    technician: '💻',
    domestic: '🏠',
    emergency: '🚨',
  };

  // Calculator calculations
  const sahyogWorkerTakeHome = Math.round(calculatorAmount * 0.8);
  const sahyogWelfareFund = Math.round(calculatorAmount * 0.1);
  const sahyogTechOps = Math.round(calculatorAmount * 0.1);

  const corporateWorkerTakeHome = Math.round(calculatorAmount * 0.65); // Aggregator takes ~35%
  const corporateAggregatorCut = Math.round(calculatorAmount * 0.35);

  return (
    <div className="space-y-16 pb-20">
      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-[#145A2F] to-[#1B6B3A] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200 shadow-sm animate-in fade-in duration-300">
              <FiAward className="text-amber-400" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
              Dignified Work. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-200 via-white to-amber-200 bg-clip-text text-transparent">
                Transparent Pricing.
              </span>{' '}
              <br />
              Trusted Services.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-2xl mx-auto">
              Connecting households with verified skilled electricians, plumbers, carpenters, and domestic helpers.
              <span className="font-bold text-white"> 80-90% of your bill goes directly to the worker</span>, with ESIC & accidental welfare coverage.
            </p>

            {/* Action CTAs */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/services"
                className="px-6 py-3.5 bg-[#E8722A] hover:bg-[#F5943E] text-white font-black text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-98 flex items-center gap-2"
              >
                <span>{t('hero.bookNow')}</span>
                <FiArrowRight />
              </Link>

              <button
                onClick={() => setShowVoiceModal(true)}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-98 flex items-center gap-2"
              >
                <FiMic className="text-amber-300 text-lg animate-pulse" />
                <span>बोलकर बुक करें (Voice Assist)</span>
              </button>

              <Link
                to="/register?role=worker"
                className="px-5 py-3.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold text-sm rounded-xl border border-emerald-600/40 transition-colors"
              >
                {t('hero.becomeWorker')}
              </Link>

              {/* Emergency SOS Button */}
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-98 flex items-center gap-2 animate-pulse-border border-2 border-red-400/50"
              >
                <span className="animate-pulse">🚨</span>
                <span>EMERGENCY</span>
              </button>
            </div>

            {/* Live Trust Metrics */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-white/15">
              <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                <div className="text-2xl sm:text-3xl font-black text-white">25+</div>
                <div className="text-xs text-emerald-200 mt-0.5">{t('stats.workers')}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                <div className="text-2xl sm:text-3xl font-black text-white">120+</div>
                <div className="text-xs text-emerald-200 mt-0.5">{t('stats.completedJobs')}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                <div className="text-2xl sm:text-3xl font-black text-amber-300">80% - 90%</div>
                <div className="text-xs text-emerald-200 mt-0.5">{t('stats.workerEarningsRate')}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                <div className="text-2xl sm:text-3xl font-black text-white">4.8 ★</div>
                <div className="text-xs text-emerald-200 mt-0.5">{t('stats.satisfaction')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EMERGENCY SERVICE BANNER ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          onClick={() => setShowEmergencyModal(true)}
          className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 rounded-3xl p-5 sm:p-7 cursor-pointer hover:shadow-2xl hover:from-red-700 hover:to-rose-900 transition-all group border border-red-500/30 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0 border border-white/20">
                🚨
              </div>
              <div className="text-white">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">EMERGENCY SERVICE</h2>
                <p className="text-red-100 text-sm font-medium mt-0.5">
                  Electrical • Plumbing • Gas • Lock • Safety — Rapid Dispatch in Minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {['⚡ Electrical', '💧 Plumbing', '🔐 Locksmith', '🔥 Gas Safety'].map((e) => (
                  <div key={e} className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 text-white text-[11px] font-bold whitespace-nowrap">
                    {e}
                  </div>
                ))}
              </div>
              <div className="bg-white text-red-700 font-black text-xs px-4 py-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow whitespace-nowrap shrink-0">
                Tap to Book →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── POPULAR SERVICES GRID ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-black tracking-wider text-[#1B6B3A] uppercase">Cooperative Catalog</span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Popular Household & Trade Services
              </h2>
            </div>
            <Link
              to="/services"
              className="text-xs font-bold text-[#1B6B3A] hover:text-[#145A2F] flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View all services &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(Array.isArray(services) ? services : DEFAULT_SERVICES.slice(0, 8)).map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-2xl border border-gray-200 hover:border-[#1B6B3A] bg-gray-50/50 hover:bg-white transition-all card-hover group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {categoryIcons[srv.category] || '🛠️'}
                  </div>
                  <h3 className="text-sm font-black text-gray-900 line-clamp-1">{srv.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {srv.description || 'Reliable certified cooperative service.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">Fair Price</span>
                    <span className="text-sm font-black text-[#1B6B3A]">₹{srv.basePrice}</span>
                  </div>
                  <button
                    onClick={() => setSelectedService(srv)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1B6B3A] text-white hover:bg-[#145A2F] transition-colors shadow-2xs cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE FAIR WAGE CALCULATOR ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 rounded-3xl p-6 sm:p-10 border border-emerald-200/80 shadow-md">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#1B6B3A] bg-emerald-100/70 px-3 py-1 rounded-full">
              Live Wage Transparency Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              See Where Your Money Actually Goes
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Traditional aggregator apps charge high commissions and classify workers as contractor gigs. On CoGig, workers collectively own the platform.
            </p>
          </div>

          {/* Interactive Slider */}
          <div className="max-w-xl mx-auto mb-10 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-gray-800">
              <span>Service Bill Amount:</span>
              <span className="text-2xl font-black text-[#1B6B3A]">₹{calculatorAmount}</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="50"
              value={calculatorAmount}
              onChange={(e) => setCalculatorAmount(Number(e.target.value))}
              className="w-full accent-[#1B6B3A] h-2.5 bg-gray-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
              <span>₹200 (Minor Repair)</span>
              <span>₹1,500 (Home Maintenance)</span>
              <span>₹3,000 (Complete Overhaul)</span>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* CoGig Model */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#1B6B3A] shadow-lg relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 bg-[#1B6B3A] text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                CoGig Co-op Model
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <FiShield className="text-[#1B6B3A]" /> Worker Wins
                </h3>
                <p className="text-xs text-gray-500">Dignified pay with social security safety net</p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Worker Direct Take-Home (80%)</span>
                    <span className="text-[10px] text-emerald-700">Immediate payout after OTP job completion</span>
                  </div>
                  <span className="text-xl font-black text-[#1B6B3A]">₹{sahyogWorkerTakeHome}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-orange-50/70 border border-orange-100">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Cooperative Welfare & Pension (10%)</span>
                    <span className="text-[10px] text-orange-700">Accident insurance (₹5L), ESIC medical cover</span>
                  </div>
                  <span className="text-sm font-black text-[#E8722A]">₹{sahyogWelfareFund}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Federation Governance & Tech (10%)</span>
                    <span className="text-[10px] text-blue-700">Server costs, SMS gateway, dispute tribunal</span>
                  </div>
                  <span className="text-sm font-black text-blue-700">₹{sahyogTechOps}</span>
                </div>
              </div>
            </div>

            {/* Corporate Aggregator Model */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4 opacity-90">
              <div className="text-[10px] font-bold text-red-600 bg-red-50 inline-block px-2.5 py-1 rounded-md uppercase tracking-wider">
                Corporate Gig Aggregators
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-800">Extractive Model</h3>
                <p className="text-xs text-gray-500">High platform fee, zero worker ownership</p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">Worker Take-Home (~65%)</span>
                    <span className="text-[10px] text-gray-400">Heavily deducted, delayed weekly cycle</span>
                  </div>
                  <span className="text-xl font-bold text-gray-600">₹{corporateWorkerTakeHome}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-red-50/50 border border-red-100">
                  <div>
                    <span className="text-xs font-bold text-red-900 block">Corporate Commission Cut (~35%)</span>
                    <span className="text-[10px] text-red-600">Company revenue & shareholder dividends</span>
                  </div>
                  <span className="text-sm font-black text-red-600">₹{corporateAggregatorCut}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-400 block">Welfare / Pension Benefits</span>
                    <span className="text-[10px] text-gray-400">None (Workers are independent contractors)</span>
                  </div>
                  <span className="text-sm font-bold text-gray-400">₹0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED COOPERATIVE WORKERS SPOTLIGHT ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#1B6B3A]">Verified Tradespeople</span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
              Meet Certified Federation Workers
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Every worker is background-verified, police-cleared, and affiliated with recognized labour co-ops.
            </p>
          </div>
          <Link
            to="/workers"
            className="text-xs font-bold text-[#1B6B3A] hover:text-[#145A2F] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse all workers &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(Array.isArray(featuredWorkers) ? featuredWorkers : DEFAULT_WORKERS.slice(0, 4)).map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-emerald-300 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-black text-lg flex items-center justify-center">
                    {worker.user?.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-black text-gray-900">
                        {worker.user?.firstName} {worker.user?.lastName}
                      </h4>
                      <FiCheckCircle className="text-emerald-600 text-xs" title="Verified Worker" />
                    </div>
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
                      {worker.cooperative?.name || 'Labour Cooperative'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                  {worker.bio || 'Skilled professional with verified credentials and cooperative certification.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-center py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">Rating</span>
                    <span className="font-bold text-gray-900 flex items-center justify-center gap-0.5">
                      <FiStar className="text-amber-500 fill-amber-500 text-xs" /> {worker.averageRating || 4.8}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">Experience</span>
                    <span className="font-bold text-gray-900">{worker.experience} yrs</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700">
                  {worker.totalJobs} Jobs Completed
                </span>
                <Link
                  to={`/workers/${worker.id}`}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COOPERATIVE FEDERATION PARTNERS ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 border border-stone-800">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Institutional Backbone</span>
            <h2 className="text-2xl font-black tracking-tight">Partner Labour Cooperative Societies</h2>
            <p className="text-xs text-stone-400">
              Federated under the National Cooperative Union of India guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Shakti Labour Cooperative Society',
                reg: 'MH-COOP-2019-4521',
                city: 'Pune & Pimpri Chinchwad',
                workers: '1,450+ Members',
                trades: 'Electricians, Plumbers, Technicians',
              },
              {
                name: 'Sahara Shramik Sangh Co-op',
                reg: 'MH-COOP-2020-8912',
                city: 'Pune Metro Region',
                workers: '890+ Members',
                trades: 'Carpenters, Painters, Construction',
              },
              {
                name: 'Pragati Mahila Seva Sahakari',
                reg: 'MH-COOP-2021-3401',
                city: 'Pune South & West',
                workers: '620+ Members',
                trades: 'Domestic Helpers, Cleaners, Caregivers',
              },
            ].map((coop, idx) => (
              <div key={idx} className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B6B3A] text-white flex items-center justify-center font-bold text-base">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{coop.name}</h4>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{coop.reg}</div>
                </div>
                <div className="space-y-1 text-xs text-stone-400 pt-2 border-t border-stone-700/60">
                  <div><strong>Jurisdiction:</strong> {coop.city}</div>
                  <div><strong>Active Trades:</strong> {coop.trades}</div>
                  <div className="text-amber-400 font-bold">{coop.workers}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Assistant Modal */}
      {showVoiceModal && <VoiceAssistantModal onClose={() => setShowVoiceModal(false)} />}

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}

      {/* Emergency SOS Modal */}
      {showEmergencyModal && (
        <EmergencySOSModal onClose={() => setShowEmergencyModal(false)} />
      )}
    </div>
  );
};

export default Home;
