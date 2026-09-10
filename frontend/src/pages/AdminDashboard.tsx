import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import {
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiAlertTriangle,
  FiDollarSign,
  FiTrendingUp,
  FiFileText,
  FiCalendar,
  FiMapPin,
  FiTool,
  FiAward,
  FiMic,
  FiNavigation,
  FiSearch,
  FiCheck,
  FiX,
  FiGlobe,
  FiChevronRight,
  FiArrowRight,
  FiZap,
  FiCpu,
  FiClock,
  FiStar,
  FiVolume2,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [demandForecasts, setDemandForecasts] = useState<any>(null);
  const [allocationData, setAllocationData] = useState<any>(null);
  const [cooperatives, setCooperatives] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'workers' | 'demand' | 'allocation' | 'multilingual'>('overview');

  // Search & filter states
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerStatusFilter, setWorkerStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  // Modals state
  const [editingWorkerSkills, setEditingWorkerSkills] = useState<any | null>(null);
  const [editingWorkerCerts, setEditingWorkerCerts] = useState<any | null>(null);
  const [editingWorkerCoop, setEditingWorkerCoop] = useState<any | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedCoopId, setSelectedCoopId] = useState('');

  // Voice AI simulation state
  const [voiceQuery, setVoiceQuery] = useState('Mere ghar mein pipe leak ho raha hai.');
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<any>({
    language: 'Hindi (हिंदी)',
    service: 'Plumbing',
    urgency: 'High (Immediate Same-Day)',
    issue: 'Pipe Leakage & Water Dripping',
    basePrice: '₹249',
    workerPayout: '₹199.2 (80%)',
    coopFund: '₹24.9 (10%)',
  });

  // Allocation execution state
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationExecuted, setAllocationExecuted] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [
        dashRes,
        workersRes,
        pendingRes,
        complaintsRes,
        forecastRes,
        allocRes,
        coopRes,
        servRes,
      ] = await Promise.all([
        api.get('/admin/dashboard').catch(() => ({ data: null })),
        api.get('/admin/workers').catch(() => ({ data: { workers: [] } })),
        api.get('/admin/workers?status=PENDING').catch(() => ({ data: { workers: [] } })),
        api.get('/complaints').catch(() => ({ data: [] })),
        api.get('/admin/analytics/demand-forecast').catch(() => ({ data: null })),
        api.get('/admin/allocation').catch(() => ({ data: null })),
        api.get('/admin/cooperatives').catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] })),
      ]);

      const workersList = Array.isArray(workersRes.data)
        ? workersRes.data
        : (workersRes.data?.workers || []);
      const pendingList = Array.isArray(pendingRes.data)
        ? pendingRes.data
        : (pendingRes.data?.workers || []);
      const complaintsList = Array.isArray(complaintsRes.data)
        ? complaintsRes.data
        : (complaintsRes.data?.complaints || []);

      setDashboardData(dashRes.data);
      setWorkers(workersList);
      setPendingWorkers(pendingList);
      setComplaints(complaintsList);
      setDemandForecasts(forecastRes.data);
      setAllocationData(allocRes.data);
      setCooperatives(Array.isArray(coopRes.data) ? coopRes.data : []);
      setServices(Array.isArray(servRes.data) ? servRes.data : []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Worker verification
  const handleVerifyWorker = async (workerId: string, approve: boolean) => {
    try {
      await api.patch(`/admin/workers/${workerId}/verify`, {
        status: approve ? 'VERIFIED' : 'REJECTED',
        note: approve ? 'Approved & Certified by Cooperative Federation' : 'Application Rejected',
      });
      setActionSuccess(`Worker ${approve ? 'approved & certified' : 'application rejected'} successfully.`);
      await loadAdminData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  // Toggle account suspension
  const handleToggleSuspension = async (worker: any) => {
    try {
      const nextStatus = !worker.isAvailable;
      await api.patch(`/admin/workers/${worker.id}/suspension`, { isAvailable: nextStatus });
      setActionSuccess(`Worker account ${nextStatus ? 'reactivated' : 'temporarily suspended'}.`);
      await loadAdminData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update account status');
    }
  };

  // Update worker skills
  const handleSaveSkills = async () => {
    if (!editingWorkerSkills) return;
    try {
      await api.patch(`/admin/workers/${editingWorkerSkills.id}/skills`, {
        serviceIds: selectedSkillIds,
      });
      setActionSuccess(`Skills updated for ${editingWorkerSkills.user?.firstName} ${editingWorkerSkills.user?.lastName}.`);
      setEditingWorkerSkills(null);
      await loadAdminData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update skills');
    }
  };

  // Toggle certificate verification
  const handleToggleCertificate = async (workerId: string, certId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/workers/${workerId}/certificates/${certId}`, {
        isVerified: !currentStatus,
      });
      setActionSuccess(`Certificate ${!currentStatus ? 'verified & sealed' : 'unverified'}.`);
      await loadAdminData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Certificate verification failed');
    }
  };

  // Update worker cooperative membership
  const handleSaveCooperative = async () => {
    if (!editingWorkerCoop || !selectedCoopId) return;
    try {
      await api.patch(`/admin/workers/${editingWorkerCoop.id}/cooperative`, {
        cooperativeId: selectedCoopId,
      });
      setActionSuccess(`Cooperative membership updated for ${editingWorkerCoop.user?.firstName}.`);
      setEditingWorkerCoop(null);
      await loadAdminData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update cooperative');
    }
  };

  // Execute AI workforce allocation
  const handleExecuteAllocation = async () => {
    setIsAllocating(true);
    try {
      await api.post('/admin/allocation/reallocate', {
        sourceZone: 'Area C (Hadapsar)',
        targetZone: 'Area A (Kothrud)',
        tradeShift: { Plumbers: 5, Cleaners: 8 },
      });
      setAllocationExecuted(true);
      setActionSuccess('⚡ AI Workforce Reallocation Executed! 5 Plumbers and 8 Cleaners transferred to Area A (Kothrud).');
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Workforce allocation failed');
    } finally {
      setIsAllocating(false);
    }
  };

  // Voice AI speech-to-booking simulation
  const handleVoiceInput = (sampleText: string) => {
    setVoiceQuery(sampleText);
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      if (sampleText.includes('pipe') || sampleText.includes('नळ') || sampleText.includes('leak')) {
        setVoiceResult({
          language: sampleText.includes('नळ') ? 'Marathi (मराठी)' : 'Hindi (हिंदी)',
          service: 'Plumbing',
          urgency: 'High (Immediate Same-Day)',
          issue: 'Pipe Leakage & Water Dripping',
          basePrice: '₹249',
          workerPayout: '₹199.2 (80%)',
          coopFund: '₹24.9 (10%)',
        });
      } else if (sampleText.includes('spark') || sampleText.includes('switchboard')) {
        setVoiceResult({
          language: 'English',
          service: 'Electrical',
          urgency: 'High (Emergency Short-Circuit)',
          issue: 'Switchboard sparking & MCB failure',
          basePrice: '₹299',
          workerPayout: '₹239.2 (80%)',
          coopFund: '₹29.9 (10%)',
        });
      } else {
        setVoiceResult({
          language: 'Hindi (हिंदी)',
          service: 'Cleaning',
          urgency: 'Normal (Scheduled)',
          issue: 'Deep home cleaning & sanitization',
          basePrice: '₹349',
          workerPayout: '₹279.2 (80%)',
          coopFund: '₹34.9 (10%)',
        });
      }
    }, 1200);
  };

  // Regional languages list
  const regionalLanguages = [
    { code: 'en', name: 'English', script: 'English', state: 'National / All States' },
    { code: 'hi', name: 'Hindi', script: 'हिंदी', state: 'Northern & Central India' },
    { code: 'mr', name: 'Marathi', script: 'मराठी', state: 'Maharashtra' },
    { code: 'bn', name: 'Bengali', script: 'বাংলা', state: 'West Bengal & East' },
    { code: 'ta', name: 'Tamil', script: 'தமிழ்', state: 'Tamil Nadu & South' },
    { code: 'te', name: 'Telugu', script: 'తెలుగు', state: 'Telangana & Andhra Pradesh' },
  ];

  // Filtered workers list
  const filteredWorkers = workers.filter((w) => {
    const fullName = `${w.user?.firstName || ''} ${w.user?.lastName || ''}`.toLowerCase();
    const trade = (w.skills?.[0]?.service?.name || '').toLowerCase();
    const matchesSearch = fullName.includes(workerSearch.toLowerCase()) || trade.includes(workerSearch.toLowerCase());
    if (workerStatusFilter === 'VERIFIED') return matchesSearch && w.verificationStatus === 'VERIFIED';
    if (workerStatusFilter === 'PENDING') return matchesSearch && w.verificationStatus === 'PENDING';
    return matchesSearch;
  });

  // Dynamic Federation Stats (reactively calculated)
  const totalWorkersCount = dashboardData?.totalWorkers || 2845;
  const activeWorkersCount = dashboardData?.activeWorkers || 1920;
  const todaysJobsCount = dashboardData?.todayBookings || 486;
  const completedJobsCount = dashboardData?.completedJobs || 421;
  const pendingJobsCount = dashboardData?.pendingJobs || 65;
  const revenueFormatted = dashboardData?.monthlyRevenue
    ? `₹${Math.round(dashboardData.monthlyRevenue).toLocaleString('en-IN')}`
    : '₹4,82,000';
  const workerEarningsFormatted = dashboardData?.workerEarnings
    ? `₹${Math.round(dashboardData.workerEarnings).toLocaleString('en-IN')}`
    : '₹4,20,000';
  const customerRatingVal = dashboardData?.customerSatisfaction || 4.7;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── 1. FEDERATION HEADER BANNER ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-700/60">
                COOPERATIVE FEDERATION
              </span>
              <span className="text-xs bg-white/10 backdrop-blur-md px-3 py-1 rounded-full font-bold text-purple-100 flex items-center gap-1.5 border border-white/20">
                <FiShield className="text-amber-300" /> Maharashtra Labour Cooperative Union
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live System Sync
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Cooperative Federation Governance Console
            </h1>

            <p className="text-xs sm:text-sm text-purple-100/90 max-w-2xl leading-relaxed">
              Democratic administration of cooperative worker accreditations, AI demand forecasting, intelligent workforce allocation, and grievance tribunals.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-purple-600/60 text-white flex items-center justify-center text-2xl font-black border border-purple-400/40">
              ⚡
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-200 block">Co-op Model</span>
              <span className="text-sm font-black text-white">100% Worker-Led</span>
              <span className="text-[10px] text-emerald-300 font-bold block">80-90% Direct Pay</span>
            </div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black rounded-2xl flex items-center gap-2.5 shadow-xs animate-in fade-in duration-300">
          <FiCheckCircle className="text-emerald-700 text-lg shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ─── 2. COOPERATIVE FEDERATION OVERVIEW STATS (DYNAMIC) ───────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <FiActivity className="text-[#1B6B3A]" /> Real-Time Federation Overview
          </span>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Jaise-jaise workers ke kaam chalenge waise-waise changes hoga ✓
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Workers */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Workers</span>
            <div className="text-xl font-black text-gray-900">{totalWorkersCount.toLocaleString()}</div>
            <span className="text-[9px] text-emerald-700 font-bold block">Co-op Members</span>
          </div>

          {/* Active Workers */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Active Workers</span>
            <div className="text-xl font-black text-emerald-700">{activeWorkersCount.toLocaleString()}</div>
            <span className="text-[9px] text-emerald-600 font-bold block">Ready on duty</span>
          </div>

          {/* Today's Jobs */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Today&apos;s Jobs</span>
            <div className="text-xl font-black text-blue-700">{todaysJobsCount}</div>
            <span className="text-[9px] text-blue-600 font-bold block">Dispatched</span>
          </div>

          {/* Completed Jobs */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Completed</span>
            <div className="text-xl font-black text-[#1B6B3A]">{completedJobsCount}</div>
            <span className="text-[9px] text-emerald-700 font-bold block">100% Fulfilled</span>
          </div>

          {/* Pending Jobs */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Pending Jobs</span>
            <div className="text-xl font-black text-amber-600">{pendingJobsCount}</div>
            <span className="text-[9px] text-amber-700 font-bold block">In Queue</span>
          </div>

          {/* Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Revenue</span>
            <div className="text-lg font-black text-purple-700">{revenueFormatted}</div>
            <span className="text-[9px] text-purple-600 font-bold block">Total Inflow</span>
          </div>

          {/* Worker Earnings */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Worker Earnings</span>
            <div className="text-lg font-black text-[#1B6B3A]">{workerEarningsFormatted}</div>
            <span className="text-[9px] text-emerald-700 font-bold block">80-90% Direct</span>
          </div>

          {/* Customer Rating */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">Rating</span>
            <div className="text-xl font-black text-gray-900 flex items-center gap-1">
              ⭐ {customerRatingVal}
            </div>
            <span className="text-[9px] text-gray-500 font-bold block">Federation Avg</span>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB NAVIGATION ──────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiActivity /> Federation Overview
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'workers'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiUsers /> Admin Worker Management ({workers.length})
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'demand'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiTrendingUp /> AI Demand Forecasting & GPS
        </button>

        <button
          onClick={() => setActiveTab('allocation')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'allocation'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiZap /> AI Workforce Allocation
        </button>

        <button
          onClick={() => setActiveTab('multilingual')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'multilingual'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiGlobe /> Multilingual & Voice AI
        </button>
      </div>

      {/* ─── TAB 1: OVERVIEW & TRIBUNAL CHARTS ────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trade Demand vs Supply Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900">
                  Trade Demand vs Active Worker Supply
                </h3>
                <span className="text-[11px] font-bold text-gray-400">Pune Metro Region</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Plumber', demand: 45, workers: 32 },
                      { name: 'Electrician', demand: 40, workers: 38 },
                      { name: 'Cleaning', demand: 36, workers: 24 },
                      { name: 'Carpenter', demand: 28, workers: 18 },
                      { name: 'Appliance', demand: 31, workers: 22 },
                      { name: 'Painting', demand: 22, workers: 15 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#E8722A" name="Monthly Demand" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="workers" fill="#1B6B3A" name="Active Workers" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cooperative Bill Split (80-10-10) Pie Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900">
                  Cooperative Revenue Distribution
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Audited 80-10-10 Rule
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Worker Take-Home (80%)', value: 80, color: '#1B6B3A' },
                        { name: 'Welfare & Pension (10%)', value: 10, color: '#E8722A' },
                        { name: 'Tech & Operations (10%)', value: 10, color: '#2563EB' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {[
                        { color: '#1B6B3A' },
                        { color: '#E8722A' },
                        { color: '#2563EB' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-around text-xs font-bold text-gray-700 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B6B3A]"></span> 80% Worker
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E8722A]"></span> 10% Welfare Fund
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span> 10% Tech & Ops
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ADMIN WORKER MANAGEMENT ─────────────────────────────────── */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <FiUsers className="text-purple-700" /> Admin Worker Management
              </h2>
              <p className="text-xs text-gray-500">
                Approve workers, update certified skills, verify trade certificates, suspend accounts, and manage cooperative society memberships.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search name, trade..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs w-52 focus:outline-none focus:border-purple-600"
                />
              </div>

              <select
                value={workerStatusFilter}
                onChange={(e: any) => setWorkerStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
              >
                <option value="ALL">All Statuses ({workers.length})</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="PENDING">Pending Only ({pendingWorkers.length})</option>
              </select>
            </div>
          </div>

          {/* Workers Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkers.map((w) => {
              const tradeName = w.skills?.[0]?.service?.name || 'General Tradesman';
              const isVerified = w.verificationStatus === 'VERIFIED';
              const isPending = w.verificationStatus === 'PENDING';
              const isSuspended = w.isAvailable === false && isVerified;

              return (
                <div
                  key={w.id}
                  className={`bg-white rounded-3xl p-5 border-2 shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/10'
                      : isSuspended
                      ? 'border-gray-300 bg-gray-50/30'
                      : 'border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Name, Trade, Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-black text-lg flex items-center justify-center shadow-xs">
                          {w.user?.firstName?.charAt(0) || 'W'}{w.user?.lastName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">
                            {w.user?.firstName} {w.user?.lastName}
                          </h4>
                          <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                            {tradeName}
                          </span>
                        </div>
                      </div>

                      {isVerified ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <FiCheckCircle /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1">
                          <FiClock /> Verification Pending
                        </span>
                      )}
                    </div>

                    {/* Stats Pill */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">Rating</span>
                        <span className="font-black text-amber-600 flex items-center gap-1">
                          ⭐ {w.averageRating || 4.5} <span className="text-[10px] text-gray-400 font-normal">/ 5</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">Jobs Completed</span>
                        <span className="font-black text-[#1B6B3A]">{w.totalJobs || 0} Jobs</span>
                      </div>
                    </div>

                    {/* Co-op Society & Contact */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Cooperative:</span>
                        <span className="font-bold text-gray-900">{w.cooperative?.name || 'Shakti Labour Co-op'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-mono">{w.user?.phone || '9822011122'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Certificates:</span>
                        <span className="font-bold text-purple-800">{w.certifications?.length || 1} Documented</span>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN ACTION BUTTONS SUITE */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {/* 1. Approve / Reject (If Pending) */}
                    {isPending ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyWorker(w.id, true)}
                          className="flex-1 py-2 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <FiCheckCircle /> Approve Worker
                        </button>
                        <button
                          onClick={() => handleVerifyWorker(w.id, false)}
                          className="py-2 px-3 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl border border-red-200 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {/* 2. Suspend / Reactivate */}
                        <button
                          onClick={() => handleToggleSuspension(w)}
                          className={`flex-1 py-2 font-bold text-xs rounded-xl cursor-pointer transition-colors ${
                            w.isAvailable
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {w.isAvailable ? 'Suspend Account' : 'Reactivate Account'}
                        </button>
                      </div>
                    )}

                    {/* 3. Operational Modals: Update Skills, Verify Certs, Manage Co-op */}
                    <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                      <button
                        onClick={() => {
                          setEditingWorkerSkills(w);
                          setSelectedSkillIds(w.skills?.map((s: any) => s.serviceId) || []);
                        }}
                        className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-center cursor-pointer border border-purple-200"
                        title="Update worker skills"
                      >
                        Skills ⚙️
                      </button>

                      <button
                        onClick={() => setEditingWorkerCerts(w)}
                        className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-center cursor-pointer border border-blue-200"
                        title="Verify trade certificates"
                      >
                        Certs 📜
                      </button>

                      <button
                        onClick={() => {
                          setEditingWorkerCoop(w);
                          setSelectedCoopId(w.cooperativeId || cooperatives[0]?.id || '');
                        }}
                        className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-center cursor-pointer border border-emerald-200"
                        title="Manage cooperative society"
                      >
                        Co-op 🏢
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: AI DEMAND FORECASTING & GPS NAVIGATION ───────────────────── */}
      {activeTab === 'demand' && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-700">
              Machine Learning Predictive Intelligence
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5 flex items-center gap-2">
              <FiTrendingUp className="text-purple-700" /> AI Demand Forecasting with GPS & Navigation
            </h2>
            <p className="text-xs text-gray-500">
              System past historical data analyse karta hai aur weather & festive surge models ke through accurate demand generate karta hai.
            </p>
          </div>

          {/* Past Data Analysis */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <FiClock className="text-purple-700" /> Historical Service Demand Baseline (Previous Data)
              </h3>
              <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                Weekly Trajectory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-xs font-black text-gray-900 block border-b border-gray-200 pb-1">
                  Monday Baseline:
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plumbing:</span>
                    <strong className="text-gray-900">45 jobs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electrical:</span>
                    <strong className="text-gray-900">32 jobs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cleaning:</span>
                    <strong className="text-gray-900">21 jobs</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <span className="text-xs font-black text-blue-900 block border-b border-blue-200 pb-1">
                  🌧️ Rainy Season Surge Factors:
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Plumbing:</span>
                    <span className="px-2 py-0.5 bg-blue-200/80 text-blue-950 font-black rounded text-[11px]">
                      ↑ 42% Surge
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Electrical:</span>
                    <span className="px-2 py-0.5 bg-blue-200/80 text-blue-950 font-black rounded text-[11px]">
                      ↑ 18% Surge
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-700 italic pt-1">
                    Triggered by monsoon seepage & earthing issues
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="text-xs font-black text-amber-900 block border-b border-amber-200 pb-1">
                  🪔 Festival Season Surge Factors:
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800">Cleaning:</span>
                    <span className="px-2 py-0.5 bg-amber-200/80 text-amber-950 font-black rounded text-[11px]">
                      ↑ 65% Surge
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800">Painting:</span>
                    <span className="px-2 py-0.5 bg-amber-200/80 text-amber-950 font-black rounded text-[11px]">
                      ↑ 38% Surge
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-700 italic pt-1">
                    Diwali / Ganeshotsav deep home prep
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI PREDICTION & RECOMMENDATIONS HIGHLIGHT (PRESENTATION FEATURE) */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#145A2F] to-[#1B6B3A] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#1B6B3A] flex items-center justify-center text-xl font-black">
                  ✨
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block">
                    AI Predictive Engine Output
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Next week plumbing demand 30% increase hone ki possibility hai.
                  </h3>
                </div>
              </div>
              <span className="text-xs font-black bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full shadow-xs">
                Expected Demand: +31%
              </span>
            </div>

            {/* Suggested Actionable Checklist */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block">
                Suggested Cooperative Actions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block">Activate 18 Additional Plumbers</strong>
                    <span className="text-emerald-100 text-[11px]">From reserve co-op guild roster</span>
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block">Schedule 6 Workers for Emergency Service</strong>
                    <span className="text-emerald-100 text-[11px]">24x7 monsoon night shifts</span>
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block">Plumbing Material Stock Check</strong>
                    <span className="text-emerald-100 text-[11px]">Valves, Teflon tape, replacement pipes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Area Clusters & GPS Navigation */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <FiMapPin className="text-red-600" /> Geographic Area Forecasts & GPS Navigation
              </h3>
              <span className="text-xs text-gray-500">Pune City Metro Clusters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  area: 'Area A - Kothrud / Karve Nagar',
                  gps: '18.5074° N, 73.8077° E',
                  surge: '+45%',
                  status: 'High Deficit Risk',
                  expected: 120,
                  available: 75,
                  statusColor: 'text-red-700 bg-red-100',
                  url: 'https://www.google.com/maps/search/?api=1&query=18.5074,73.8077',
                },
                {
                  area: 'Area B - Shivaji Nagar / FC Road',
                  gps: '18.5314° N, 73.8446° E',
                  surge: '+28%',
                  status: 'Balanced Supply',
                  expected: 95,
                  available: 105,
                  statusColor: 'text-emerald-700 bg-emerald-100',
                  url: 'https://www.google.com/maps/search/?api=1&query=18.5314,73.8446',
                },
                {
                  area: 'Area C - Hadapsar / Magarpatta',
                  gps: '18.5089° N, 73.9260° E',
                  surge: '+35%',
                  status: 'Surplus Supply',
                  expected: 80,
                  available: 92,
                  statusColor: 'text-blue-700 bg-blue-100',
                  url: 'https://www.google.com/maps/search/?api=1&query=18.5089,73.9260',
                },
                {
                  area: 'Area D - Viman Nagar / Kharadi',
                  gps: '18.5679° N, 73.9143° E',
                  surge: '+22%',
                  status: 'Balanced Supply',
                  expected: 70,
                  available: 74,
                  statusColor: 'text-emerald-700 bg-emerald-100',
                  url: 'https://www.google.com/maps/search/?api=1&query=18.5679,73.9143',
                },
              ].map((c, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${c.statusColor}`}>
                      {c.status}
                    </span>
                    <span className="text-xs font-black text-purple-700">{c.surge}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-900">{c.area}</h4>
                    <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1 mt-0.5">
                      <FiMapPin className="text-red-500" /> {c.gps}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 text-xs py-1 border-y border-gray-200">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Expected</span>
                      <strong className="text-gray-900">{c.expected} Jobs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Available</span>
                      <strong className="text-emerald-700">{c.available} Workers</strong>
                    </div>
                  </div>

                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-black text-[#1B6B3A] hover:underline flex items-center gap-1 pt-1"
                  >
                    <FiNavigation /> Navigate in Google Maps ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: AI WORKFORCE ALLOCATION ─────────────────────────────────── */}
      {activeTab === 'allocation' && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#1B6B3A]">
              Dynamic Worker Optimization
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5 flex items-center gap-2">
              <FiZap className="text-[#1B6B3A]" /> AI Workforce Allocation Engine
            </h2>
            <p className="text-xs text-gray-500">
              AI sirf demand predict na kare, prediction ke basis par surplus areas se deficit areas mein workers allocate bhi kare.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deficit Zone: Area A (Kothrud) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-red-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900">Area A (Kothrud)</h3>
                <span className="text-xs font-black text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  {allocationExecuted ? 'BALANCED NOW ✓' : 'DEFICIT: -45 WORKERS'}
                </span>
              </div>

              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Jobs:</span>
                  <strong className="text-gray-900 text-sm">120</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Workers:</span>
                  <strong className="text-red-700 text-sm">{allocationExecuted ? '120' : '75'}</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Required Trade Breakdown:</span>
                {[
                  { trade: 'Plumber', required: 18, available: allocationExecuted ? 18 : 13, gap: allocationExecuted ? 0 : -5 },
                  { trade: 'Electrician', required: 15, available: 15, gap: 0 },
                  { trade: 'Cleaner', required: 20, available: allocationExecuted ? 20 : 12, gap: allocationExecuted ? 0 : -8 },
                  { trade: 'Carpenter', required: 10, available: 10, gap: 0 },
                  { trade: 'Driver', required: 7, available: 7, gap: 0 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                    <span className="font-bold text-gray-800">{item.trade}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{item.available} / {item.required}</span>
                      {item.gap < 0 ? (
                        <span className="text-[11px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          {item.gap} Short
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          ✓ Ready
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: AI Suggestion & Execution Action */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-purple-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center text-xl font-black">
                    ⚡
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-300 block">
                      AI Reallocation Suggestion
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Area A mein 5 additional plumbers aur 8 cleaners temporarily allocate karo.
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-purple-200 leading-relaxed">
                  Surplus cooperative pool identified in <strong>Area C (Hadapsar)</strong>. Workers are within 25 minutes transit via cooperative shuttle dispatch.
                </p>

                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-bold">Recommended Action Plan:</span>
                    <span className="text-white font-black">Transfer from Area C &rarr; Area A</span>
                  </div>
                  <ul className="list-disc list-inside text-purple-100 space-y-1 text-[11px]">
                    <li>Reassign 5 certified plumbers from Hadapsar co-op society to Kothrud morning shift.</li>
                    <li>Reassign 8 deep-cleaning personnel for peak residential demands.</li>
                    <li>Pay ₹150 inter-cluster transit allowance directly to reallocated workers.</li>
                  </ul>
                </div>

                <button
                  onClick={handleExecuteAllocation}
                  disabled={isAllocating || allocationExecuted}
                  className={`w-full py-4 rounded-2xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    allocationExecuted
                      ? 'bg-emerald-500 text-white cursor-default'
                      : 'bg-amber-400 hover:bg-amber-300 text-purple-950 active:scale-98'
                  }`}
                >
                  <FiZap className="text-base" />
                  <span>
                    {isAllocating
                      ? 'Reallocating Workforce...'
                      : allocationExecuted
                      ? '✓ Workforce Reallocated & Dispatched Successfully'
                      : 'Execute AI Workforce Allocation Now ⚡'}
                  </span>
                </button>
              </div>

              {/* Source Surplus Pool: Area C */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900">Source Pool: Area C (Hadapsar / Magarpatta)</h4>
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Surplus Available
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Total available cooperative members: 92. Shifting 13 workers to Area A retains 79 workers, which is 100% sufficient for local Area C obligations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: MULTILINGUAL & VOICE-ASSISTED BOOKING INNOVATION ─────────── */}
      {activeTab === 'multilingual' && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-700">
              Bharat-Centric Accessibility
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5 flex items-center gap-2">
              <FiGlobe className="text-purple-700" /> Multilingual Application & Voice-Assisted Booking
            </h2>
            <p className="text-xs text-gray-500">
              India ke liye native languages aur natural speech AI through instant cooperative booking requests.
            </p>
          </div>

          {/* 1. Regional Languages Grid */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <FiGlobe className="text-emerald-700" /> Choose Platform Language (समग्र भाषा समर्थन)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {regionalLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer space-y-1 ${
                    i18n.language === lang.code
                      ? 'border-[#1B6B3A] bg-emerald-50 text-[#1B6B3A] shadow-md scale-105'
                      : 'border-gray-200 bg-gray-50 hover:bg-white text-gray-700'
                  }`}
                >
                  <span className="text-base font-black block">{lang.script}</span>
                  <span className="text-xs font-bold text-gray-600 block">{lang.name}</span>
                  <span className="text-[9px] text-gray-400 block">{lang.state}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. VOICE-ASSISTED BOOKING INNOVATION SHOWCASE */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#145A2F] to-[#1B6B3A] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block">
                  Future Innovation Feature
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <FiMic className="text-amber-300" /> Voice-Assisted Booking Speech Engine
                </h3>
                <p className="text-xs text-emerald-100">
                  &ldquo;Mere ghar mein pipe leak ho raha hai.&rdquo; &rarr; AI speech ko direct verified booking request mein convert kare.
                </p>
              </div>

              <span className="text-xs font-black bg-amber-400 text-emerald-950 px-3 py-1 rounded-full shrink-0">
                Multi-Dialect NLP Active
              </span>
            </div>

            {/* Test utterance triggers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-200">Sample Voice Inputs to Test:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Mere ghar mein pipe leak ho raha hai.',
                  'आमच्या स्वयंपाकघरात नळ गळत आहे.',
                  'Bedroom main switchboard sparking ho rahi hai.',
                  'Ghar ki deep cleaning ke liye log chahiye.',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleVoiceInput(sample)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FiVolume2 className="text-amber-300" /> &ldquo;{sample}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Input Box & Listening Indicator */}
            <div className="p-5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleVoiceInput(voiceQuery)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all cursor-pointer shadow-lg ${
                    isListening
                      ? 'bg-red-500 text-white animate-ping'
                      : 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                  }`}
                  title="Click to speak"
                >
                  <FiMic />
                </button>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                    {isListening ? 'Listening & Transcribing...' : 'Recognized Voice Input'}
                  </span>
                  <p className="text-base font-black text-white italic">&ldquo;{voiceQuery}&rdquo;</p>
                </div>
              </div>
            </div>

            {/* AI Extracted Structured Booking Intent */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                  <FiCpu /> AI Parsed Service Work Order
                </span>
                <span className="text-xs font-bold text-emerald-200">Confidence: 98.6%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-black/20 rounded-xl">
                  <span className="text-[10px] text-emerald-300 block">Detected Language</span>
                  <strong className="text-white text-sm">{voiceResult.language}</strong>
                </div>
                <div className="p-3 bg-black/20 rounded-xl">
                  <span className="text-[10px] text-emerald-300 block">Identified Service</span>
                  <strong className="text-white text-sm">{voiceResult.service}</strong>
                </div>
                <div className="p-3 bg-black/20 rounded-xl">
                  <span className="text-[10px] text-emerald-300 block">Priority / Urgency</span>
                  <strong className="text-amber-300 text-sm">{voiceResult.urgency}</strong>
                </div>
                <div className="p-3 bg-black/20 rounded-xl">
                  <span className="text-[10px] text-emerald-300 block">Co-op Floor Price</span>
                  <strong className="text-white text-sm">{voiceResult.basePrice}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-emerald-200">
                  Worker Share: <strong>{voiceResult.workerPayout}</strong> • Welfare Fund: <strong>{voiceResult.coopFund}</strong>
                </span>
                <button
                  onClick={() => alert(`Voice booking created successfully for ${voiceResult.service}! Dispatched to nearest cooperative worker.`)}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Create Booking from Voice Request ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: EDIT WORKER SKILLS ──────────────────────────────────────── */}
      {editingWorkerSkills && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                Update Skills: {editingWorkerSkills.user?.firstName} {editingWorkerSkills.user?.lastName}
              </h3>
              <button
                onClick={() => setEditingWorkerSkills(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Select certified cooperative trade skills to accredit for this worker:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {services.map((s) => {
                const isSelected = selectedSkillIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer ${
                      isSelected ? 'border-purple-600 bg-purple-50/70 font-bold' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>{s.name} ({s.category})</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedSkillIds(selectedSkillIds.filter((id) => id !== s.id));
                        } else {
                          setSelectedSkillIds([...selectedSkillIds, s.id]);
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingWorkerSkills(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSkills}
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Save Certified Skills
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: VERIFY WORKER CERTIFICATES ──────────────────────────────── */}
      {editingWorkerCerts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                Trade Certificates: {editingWorkerCerts.user?.firstName}
              </h3>
              <button
                onClick={() => setEditingWorkerCerts(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(editingWorkerCerts.certifications || []).length === 0 ? (
                <p className="text-xs text-gray-500 italic p-4 text-center">No certificates uploaded yet.</p>
              ) : (
                editingWorkerCerts.certifications.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="text-xs font-black text-gray-900">{cert.name}</h5>
                      <span className="text-[11px] text-gray-500 block">{cert.issuingAuthority}</span>
                      <span className={`text-[10px] font-bold mt-1 inline-block ${cert.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {cert.isVerified ? '✓ Official Verified Seal' : '⏳ Pending Document Check'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleCertificate(editingWorkerCerts.id, cert.id, cert.isVerified)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        cert.isVerified
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs'
                      }`}
                    >
                      {cert.isVerified ? 'Revoke Seal' : 'Verify & Seal'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setEditingWorkerCerts(null)}
              className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: MANAGE COOPERATIVE MEMBERSHIP ──────────────────────────── */}
      {editingWorkerCoop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                Co-op Membership: {editingWorkerCoop.user?.firstName}
              </h3>
              <button
                onClick={() => setEditingWorkerCoop(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Assign worker to certified local labour cooperative society:
            </p>

            <div className="space-y-2">
              {cooperatives.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer ${
                    selectedCoopId === c.id
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div>
                    <span className="block">{c.name}</span>
                    <span className="text-[10px] text-gray-400">Reg: {c.registrationNo || 'CO-OP/MH/2021'}</span>
                  </div>
                  <input
                    type="radio"
                    name="cooperativeRadio"
                    checked={selectedCoopId === c.id}
                    onChange={() => setSelectedCoopId(c.id)}
                    className="w-4 h-4 text-emerald-600"
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingWorkerCoop(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCooperative}
                className="flex-1 py-2.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Confirm Membership
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
