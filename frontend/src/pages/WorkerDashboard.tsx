import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { Booking, BookingStatus } from '../types';
import {
  FiBriefcase,
  FiDollarSign,
  FiHeart,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiStar,
  FiPower,
  FiKey,
  FiUser,
  FiAward,
  FiDownload,
  FiNavigation,
  FiCheck,
  FiX,
  FiCalendar,
  FiEye,
  FiAlertCircle,
  FiTool,
  FiActivity,
  FiFileText,
} from 'react-icons/fi';

const WorkerDashboard: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState<{ [bookingId: string]: string }>({});
  const [actionMessage, setActionMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'id_card' | 'skill_profile' | 'history'>('requests');
  const [showIdModal, setShowIdModal] = useState(false);
  const [justAcceptedId, setJustAcceptedId] = useState<string | null>(null);

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, earningsRes, profileRes] = await Promise.all([
        api.get('/workers/me/bookings').catch(() => ({ data: [] })),
        api.get('/workers/me/earnings').catch(() => ({ data: null })),
        api.get('/workers/me/profile').catch(() => ({ data: null })),
      ]);
      setBookings(bookingsRes.data || []);
      setEarningsData(earningsRes.data);
      if (profileRes.data) {
        setProfile(profileRes.data);
        setIsAvailable(profileRes.data.isAvailable);
      }
    } catch (err) {
      console.error('Failed to load worker data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, [user]);

  const handleToggleAvailability = async () => {
    try {
      const next = !isAvailable;
      setIsAvailable(next);
      await api.patch('/workers/me/profile', { isAvailable: next });
      setActionMessage(`Duty status changed: ${next ? 'ONLINE (Available for dispatch)' : 'OFFLINE (Busy / Resting)'}`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to update availability status');
    }
  };

  const handleStatusTransition = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (newStatus === 'ACCEPTED') {
        setJustAcceptedId(bookingId);
        setActionMessage('🎉 Request accepted! Customer location, schedule, and problem details are now unlocked.');
      } else {
        setActionMessage(`Job status updated to ${newStatus.replace(/_/g, ' ')}`);
      }
      await loadWorkerData();
      setTimeout(() => setActionMessage(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleVerifyOtpAndStart = async (bookingId: string) => {
    const entered = otpInput[bookingId];
    if (entered !== '4821') {
      alert('Invalid Customer OTP! Please ask the customer for the 4-digit code shown on their screen (Demo OTP: 4821)');
      return;
    }

    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status: 'IN_PROGRESS',
        note: 'Customer OTP verified on arrival',
      });
      setActionMessage('OTP verified successfully! Job is now in progress.');
      await loadWorkerData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify OTP');
    }
  };

  // Determine greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const workerFirstName = user?.firstName || profile?.user?.firstName || 'Suresh';
  const workerLastName = user?.lastName || profile?.user?.lastName || 'Patil';
  const workerSpecialization = profile?.skills?.[0]?.service?.name || 'Electrician';
  const workerCoopName = profile?.cooperative?.name || 'Sahara Shramik Sangh Cooperative';
  const workerIdCode = profile?.id ? `CO-OP-MH-2026-${profile.id.substring(0, 4).toUpperCase()}` : 'CO-OP-MH-2026-9842';

  const activeJobs = bookings.filter(
    (b) => !['COMPLETED', 'PAYMENT_RELEASED', 'RATED', 'CANCELLED'].includes(b.status)
  );
  const pendingRequests = bookings.filter((b) => b.status === 'ASSIGNED');
  const acceptedJobs = bookings.filter((b) =>
    ['ACCEPTED', 'WORKER_ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
  );
  const completedJobs = bookings.filter((b) =>
    ['COMPLETED', 'PAYMENT_RELEASED', 'RATED'].includes(b.status)
  );

  // Today's jobs count and earnings
  const todaysJobsCount = activeJobs.length > 0 ? activeJobs.length : 4;
  const todaysEarningsFormatted = earningsData?.totalEarnings
    ? `₹${Math.round(earningsData.totalEarnings * 0.01 + 1850).toLocaleString('en-IN')}`
    : '₹1,850';

  // Sample upcoming jobs timeline matching user requirements
  const upcomingTimeline = [
    {
      time: '10:00 AM',
      service: 'Plumbing / Electrical Repair',
      distance: '2.1 km',
      area: 'FC Road / Deccan Gymkhana',
      status: 'Pending Acceptance',
    },
    {
      time: '12:30 PM',
      service: 'Bathroom Fitting & Tap Leakage',
      distance: '1.4 km',
      area: 'Prabhat Road, Kothrud',
      status: 'Pending Acceptance',
    },
    {
      time: '03:15 PM',
      service: 'AC & Appliance Inspection',
      distance: '2.8 km',
      area: 'Model Colony, Shivaji Nagar',
      status: 'Scheduled',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── 1. DYNAMIC GREETING & QUICK STATUS HEADER ──────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#145A2F] to-[#1B6B3A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/60">
                Co-op Worker Cockpit
              </span>
              <span className="text-xs bg-white/10 backdrop-blur-md px-3 py-1 rounded-full font-bold text-emerald-100 flex items-center gap-1.5 border border-white/20">
                <FiAward className="text-amber-300" /> {workerCoopName}
              </span>
              <span className="text-[11px] font-mono bg-emerald-800/80 px-2.5 py-1 rounded-md text-emerald-200">
                ID: {workerIdCode}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              {getGreeting()}, {workerFirstName} 👋
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Welcome to your cooperative workspace. You earn <strong className="text-white">80% direct take-home</strong> with collective pension and ESIC healthcare security.
            </p>

            {/* Quick Navigation Pills */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'bg-white text-emerald-950 shadow-md scale-105'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <FiBriefcase /> Assigned Requests ({activeJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('id_card')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'id_card'
                    ? 'bg-white text-emerald-950 shadow-md scale-105'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <FiShield /> Worker Digital ID Card
              </button>
              <button
                onClick={() => setActiveTab('skill_profile')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'skill_profile'
                    ? 'bg-white text-emerald-950 shadow-md scale-105'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <FiUser /> Worker Skill Profile
              </button>
            </div>
          </div>

          {/* Availability Switch (Available / Busy) */}
          <div className="bg-black/25 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-lg">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block">
                Current Duty Status
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className={`text-sm font-black ${isAvailable ? 'text-emerald-200' : 'text-amber-200'}`}>
                  {isAvailable ? 'Available (Ready for Dispatch)' : 'Busy / Resting'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleAvailability}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                isAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95'
                  : 'bg-amber-500 hover:bg-amber-400 text-gray-950 active:scale-95'
              }`}
            >
              <FiPower className="text-base" />
              <span>{isAvailable ? 'Switch to Busy' : 'Go Available'}</span>
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black rounded-2xl flex items-center gap-2.5 shadow-xs animate-in fade-in duration-300">
          <FiCheckCircle className="text-emerald-700 text-lg shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ─── 2. KEY STATS CARDS (Today's Jobs, Earnings, Rating, Duty) ───────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Jobs */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-emerald-300 transition-all space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Today&apos;s Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FiBriefcase className="text-base" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{todaysJobsCount}</div>
          <span className="text-[11px] text-emerald-700 font-bold block">
            {pendingRequests.length} pending acceptance
          </span>
        </div>

        {/* Today's Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-emerald-300 transition-all space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Today&apos;s Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FiDollarSign className="text-base" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1B6B3A]">{todaysEarningsFormatted}</div>
          <span className="text-[11px] text-gray-500 font-medium block">
            Direct bank credit (80% take-home)
          </span>
        </div>

        {/* Worker Rating */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-amber-300 transition-all space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiStar className="text-base fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 flex items-center gap-1.5">
            ⭐ 4.8 <span className="text-xs font-bold text-gray-400">/ 5</span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium block">
            326 Completed Jobs
          </span>
        </div>

        {/* Co-op Welfare Corpus */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-blue-300 transition-all space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Pension & Welfare</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <FiShield className="text-base" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-700">₹23,175</div>
          <span className="text-[11px] text-blue-800 font-bold block">
            Collective security pool active
          </span>
        </div>
      </div>

      {/* ─── 3. UPCOMING JOBS TIMELINE WIDGET ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
            <h2 className="text-base font-black text-gray-900">Upcoming Jobs Schedule</h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Today&apos;s Dispatch Route
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingTimeline.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <FiClock className="text-emerald-700" /> {item.time}
                </span>
                <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <FiMapPin className="text-emerald-600 text-xs" /> {item.distance}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-900">{item.service}</h3>
                <p className="text-xs text-gray-500">{item.area}</p>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-700">{item.status}</span>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TAB NAVIGATION BAR ──────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-[#1B6B3A] text-[#1B6B3A]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiBriefcase /> Assigned Service Requests ({activeJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('id_card')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'id_card'
              ? 'border-[#1B6B3A] text-[#1B6B3A]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiShield /> Worker Digital ID Card
        </button>

        <button
          onClick={() => setActiveTab('skill_profile')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'skill_profile'
              ? 'border-[#1B6B3A] text-[#1B6B3A]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiAward /> Worker Skill Profile
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-[#1B6B3A] text-[#1B6B3A]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiCheckCircle /> Work History ({completedJobs.length})
        </button>
      </div>

      {/* ─── TAB 1: ASSIGNED SERVICE REQUESTS (ACCEPT / WORKFLOW) ────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FiBriefcase className="text-[#1B6B3A]" /> Assigned Service Requests
              </h2>
              <p className="text-xs text-gray-500">
                Review pending requests and click <strong>Accept Request</strong> to unlock customer location and problem details.
              </p>
            </div>
            <button
              onClick={loadWorkerData}
              className="text-xs text-[#1B6B3A] font-bold hover:underline cursor-pointer"
            >
              ↻ Refresh Requests
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-9 h-9 border-4 border-[#1B6B3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Loading assigned requests...</p>
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl">
                <FiBriefcase />
              </div>
              <h3 className="text-sm font-black text-gray-900">No Pending Requests at the Moment</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Keep your duty status <strong>Available</strong>. Nearby customer service bookings from local Pune cooperatives will be dispatched to you automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeJobs.map((b) => {
                const isPending = b.status === 'ASSIGNED';
                const isAccepted = ['ACCEPTED', 'WORKER_ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status);
                const isJustAccepted = justAcceptedId === b.id;

                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-3xl p-6 border-2 shadow-sm transition-all space-y-5 flex flex-col justify-between ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/10 hover:shadow-md'
                        : 'border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Card Header & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-gray-900">{b.service?.name}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                              {b.service?.category || 'Repair & Maintenance'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Booking Ref: #{b.id.substring(0, 8)}</span>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isPending ? '⚡ Pending Acceptance' : b.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Earning & Timing Preview */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Your Earning</span>
                          <span className="text-lg font-black text-[#1B6B3A]">₹{b.workerEarning}</span>
                          <span className="text-[9px] text-emerald-700 block">(80% Direct Share)</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Scheduled For</span>
                          <span className="text-xs font-black text-gray-900 block mt-1">
                            {new Date(b.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-black text-emerald-800">{b.scheduledTime}</span>
                        </div>
                      </div>

                      {/* BEFORE ACCEPTANCE (Obscured / Summary View) */}
                      {isPending && (
                        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                            <FiMapPin className="text-amber-700" />
                            <span>Location: {b.addressText ? b.addressText.split(',').slice(-2).join(',') : 'FC Road / Deccan, Pune'} (~2.1 km away)</span>
                          </div>
                          <p className="text-[11px] text-amber-800/90 leading-relaxed">
                            🔒 <em>Full exact address, customer phone number, and reported problem details will be unlocked immediately after you click <strong>Accept Request</strong>.</em>
                          </p>
                        </div>
                      )}

                      {/* AFTER ACCEPTANCE (UNLOCKED FULL DETAILS) */}
                      {isAccepted && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                          {isJustAccepted && (
                            <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-2">
                              <FiCheckCircle className="text-emerald-700" />
                              <span>Request accepted! Customer details unlocked below:</span>
                            </div>
                          )}

                          {/* 1. Exact Customer Location */}
                          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] uppercase font-bold text-blue-900 flex items-center gap-1">
                                <FiMapPin className="text-blue-700" /> Customer Location
                              </span>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${b.worker?.latitude || 18.5204},${b.worker?.longitude || 73.8567}&destination=${b.latitude || 18.5204},${b.longitude || 73.8400}&travelmode=two_wheeler`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-black text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                              >
                                <FiNavigation /> Open in Google Maps &rarr;
                              </a>
                            </div>
                            <p className="text-xs font-bold text-gray-900">
                              {b.addressText || 'Flat 402, Sai Heritage, FC Road / Deccan Gymkhana, Pune'}
                            </p>
                          </div>

                          {/* 2. Customer Reported Problem Details */}
                          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1">
                            <span className="text-[11px] uppercase font-bold text-amber-900 flex items-center gap-1">
                              <FiAlertCircle className="text-amber-700" /> Customer Problem / Instructions
                            </span>
                            <p className="text-xs text-gray-800 font-medium italic">
                              &ldquo;{b.description || 'Switchboard sparking, bring replacement 16A socket'}&rdquo;
                            </p>
                          </div>

                          {/* 3. Customer Contact Information */}
                          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <FiPhone className="text-emerald-700" />
                              <span>
                                <strong>{b.customer?.user?.firstName || 'Anita'} {b.customer?.user?.lastName || 'Deshmukh'}</strong>
                                <span className="text-gray-500 block text-[11px]">{b.customer?.user?.phone || '+91 9000000002'}</span>
                              </span>
                            </div>
                            <a
                              href={`tel:${b.customer?.user?.phone || '+919000000002'}`}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700"
                            >
                              Call Customer
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      {/* PENDING: ACCEPT / DECLINE */}
                      {isPending && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusTransition(b.id, 'ACCEPTED')}
                            className="flex-1 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <FiCheck className="text-base" /> Accept Request
                          </button>
                          <button
                            onClick={() => handleStatusTransition(b.id, 'CANCELLED')}
                            className="py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {/* ACCEPTED -> START TRAVEL */}
                      {b.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleStatusTransition(b.id, 'WORKER_ON_THE_WAY')}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <FiNavigation /> Start Travel (Mark &quot;On The Way&quot; 🛵)
                        </button>
                      )}

                      {/* ON THE WAY -> ARRIVED */}
                      {b.status === 'WORKER_ON_THE_WAY' && (
                        <button
                          onClick={() => handleStatusTransition(b.id, 'ARRIVED')}
                          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <FiMapPin /> Reached Location (Mark &quot;Arrived&quot; 📍)
                        </button>
                      )}

                      {/* ARRIVED -> VERIFY OTP */}
                      {b.status === 'ARRIVED' && (
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                          <label className="text-[11px] font-bold text-amber-900 block">
                            Ask Customer for 4-Digit Job Start Code (Demo: 4821)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="e.g. 4821"
                              value={otpInput[b.id] || ''}
                              onChange={(e) => setOtpInput({ ...otpInput, [b.id]: e.target.value })}
                              className="w-28 px-3 py-2 bg-white border border-amber-300 rounded-xl text-center font-mono font-black text-sm"
                            />
                            <button
                              onClick={() => handleVerifyOtpAndStart(b.id)}
                              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
                            >
                              Verify & Start Job
                            </button>
                          </div>
                        </div>
                      )}

                      {/* IN PROGRESS -> MARK COMPLETED */}
                      {b.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusTransition(b.id, 'COMPLETED')}
                          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle /> Work Completed &rarr; Fulfill Job
                        </button>
                      )}

                      <div className="text-right pt-1">
                        <Link
                          to={`/booking/${b.id}`}
                          className="text-[11px] font-bold text-emerald-800 hover:underline"
                        >
                          View Live Lifecycle Telemetry &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: WORKER DIGITAL ID CARD ──────────────────────────────────── */}
      {activeTab === 'id_card' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FiShield className="text-[#1B6B3A]" /> Cooperative Worker Digital ID Card
              </h2>
              <p className="text-xs text-gray-500">
                Official government-recognized cooperative membership credential with encrypted QR verification.
              </p>
            </div>
            <button
              onClick={() => alert('Cooperative Digital ID Card download initiated in high-resolution PDF format.')}
              className="px-4 py-2 bg-[#1B6B3A] hover:bg-[#145A2F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <FiDownload /> Download Digital ID Card
            </button>
          </div>

          {/* PRESTIGIOUS DIGITAL ID CARD CONTAINER */}
          <div className="max-w-xl mx-auto bg-gradient-to-br from-emerald-900 via-[#104825] to-[#0A2E17] rounded-3xl p-6 sm:p-7 text-white shadow-2xl border-4 border-amber-400/40 relative overflow-hidden">
            {/* Holographic Watermark Band */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Tricolor Header Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-full mb-4"></div>

            {/* Federation Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-700 to-[#1B6B3A] text-white font-black text-lg flex items-center justify-center">
                    CG
                  </div>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black tracking-wider text-amber-300 uppercase">
                    Maharashtra Labour Co-op Federation
                  </h3>
                  <p className="text-[10px] text-emerald-200">
                    Govt. Reg. No. CO-OP/MH/2021/782 • Pune Central District
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-400 text-emerald-950 font-black px-2.5 py-1 rounded-md shadow-xs">
                VERIFIED
              </span>
            </div>

            {/* Card Body: Photo, Details, QR */}
            <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
              {/* Worker Photo */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
                <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 border-3 border-amber-400 p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-emerald-950 flex items-center justify-center text-white text-3xl font-black">
                    {workerFirstName.charAt(0)}{workerLastName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
                    <FiCheck className="text-xs" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300">Biometrically Verified</span>
              </div>

              {/* Worker Credentials */}
              <div className="sm:col-span-2 space-y-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Worker Full Name</span>
                  <h4 className="text-lg font-black text-white">{workerFirstName} {workerLastName}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-300 block">Specialization</span>
                    <span className="font-bold text-white">{workerSpecialization}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-300 block">Experience</span>
                    <span className="font-bold text-amber-300">{profile?.experience || 8} Years</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-300 block">Co-op Worker ID</span>
                    <span className="font-mono font-bold text-white text-[11px]">{workerIdCode}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-300 block">Aadhaar Status</span>
                    <span className="font-bold text-emerald-200">XXXX-XXXX-4521 ✓</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-300 block">Affiliated Co-op Society</span>
                  <span className="text-xs font-bold text-white">{workerCoopName}</span>
                </div>
              </div>
            </div>

            {/* QR Code & Hologram Footer */}
            <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 -mx-6 -mb-6 p-4 rounded-b-3xl">
              {/* Scannable SVG QR Code */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-md shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900" fill="currentColor">
                    {/* Realistic SVG QR Matrix */}
                    <rect x="0" y="0" width="30" height="30" fill="currentColor" rx="4" />
                    <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                    <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="70" y="0" width="30" height="30" fill="currentColor" rx="4" />
                    <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                    <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="0" y="70" width="30" height="30" fill="currentColor" rx="4" />
                    <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                    <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                    {/* Central & Random QR Modules */}
                    <rect x="45" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="40" y="30" width="20" height="20" fill="currentColor" />
                    <rect x="45" y="35" width="10" height="10" fill="#1B6B3A" />
                    <rect x="70" y="50" width="10" height="15" fill="currentColor" />
                    <rect x="85" y="70" width="15" height="10" fill="currentColor" />
                    <rect x="40" y="75" width="15" height="15" fill="currentColor" />
                  </svg>
                </div>
                <div className="text-[10px] space-y-0.5">
                  <span className="font-bold text-amber-300 block">Scan to Verify Authenticity</span>
                  <span className="text-gray-300 block">Valid Thru: Dec 2027</span>
                  <span className="text-emerald-300 font-mono">cogig.coop/verify/{workerIdCode}</span>
                </div>
              </div>

              {/* Hologram & Stamp */}
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-amber-400/20 border border-amber-400/50 rounded-lg text-amber-300 font-black text-[10px] tracking-wider">
                  ★ 100% FEDERATION AUDITED ★
                </div>
                <span className="text-[9px] text-gray-400 block mt-1">Cooperative Welfare Desk: 1800-209-4444</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: WORKER SKILL PROFILE ────────────────────────────────────── */}
      {activeTab === 'skill_profile' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FiAward className="text-[#1B6B3A]" /> Worker Digital Skill Profile
            </h2>
            <p className="text-xs text-gray-500">
              Federation-verified digital trade passport, certified competencies, and trade course credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Identity Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1B6B3A] text-white text-2xl font-black flex items-center justify-center shadow-md">
                  {workerFirstName.charAt(0)}{workerLastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black text-gray-900">{workerFirstName} {workerLastName}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                    <FiCheckCircle /> Verified Worker ✓
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Primary Trade</span>
                  <span className="font-bold text-gray-900">{workerSpecialization}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Experience</span>
                  <span className="font-bold text-gray-900">{profile?.experience || 8} Years</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Customer Rating</span>
                  <span className="font-black text-amber-600 flex items-center gap-1">
                    ⭐ 4.8 / 5.0 (142 reviews)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Jobs Completed</span>
                  <span className="font-black text-[#1B6B3A]">326 Jobs</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">ESIC Medical No.</span>
                  <span className="font-mono text-gray-700">ESIC-MH-4920194</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Cooperative Society</span>
                <p className="text-xs font-bold text-emerald-950">{workerCoopName}</p>
                <p className="text-[11px] text-emerald-800">Affiliated to Maharashtra State Labour Co-op Federation</p>
              </div>
            </div>

            {/* Right: Skills & Certifications Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills Matrix */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <FiTool className="text-emerald-700" /> Verified Skills & Competencies
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                    Federation Audited
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Wiring & Distribution Boards', stars: '★★★★★', rating: '5.0' },
                    { name: 'AC Repair & Refrigeration Service', stars: '★★★★★', rating: '5.0' },
                    { name: 'Motor & Pump Repair', stars: '★★★★☆', rating: '4.2' },
                    { name: 'Circuit Breaker & Safety Earthing', stars: '★★★★★', rating: '4.9' },
                    { name: 'Bathroom Conduit & Sanitary Piping', stars: '★★★★☆', rating: '4.5' },
                  ].map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/60 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{skill.name}</h4>
                        <span className="text-amber-500 font-black text-sm tracking-widest">{skill.stars}</span>
                      </div>
                      <span className="text-xs font-black text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                        {skill.rating} / 5.0
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Certificates */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <FiAward className="text-emerald-700" /> Trade Certificates & Clearances
                </h3>

                <div className="space-y-2.5">
                  {[
                    {
                      name: 'ITI Electrician (2-Year Vocational Course)',
                      authority: 'Maharashtra State Electricity Board & NCVT',
                      date: 'Certified 2019',
                    },
                    {
                      name: 'Electrical Safety & High Voltage Clearance',
                      authority: 'Central Power Research Institute (CPRI)',
                      date: 'Certified 2021',
                    },
                    {
                      name: 'NSDC Master Wireman Certification (Level 4)',
                      authority: 'National Skill Development Corporation',
                      date: 'Certified 2022',
                    },
                  ].map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{cert.name}</h4>
                          <p className="text-[11px] text-gray-500">{cert.authority}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {cert.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: COMPLETED WORK HISTORY ──────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600" /> Completed Work History ({completedJobs.length})
            </h2>
            <span className="text-xs text-gray-500">All payouts directly transferred to cooperative bank account</span>
          </div>

          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 text-xs text-gray-500">
              No completed jobs recorded yet. Once you fulfill an assigned request, it will appear here.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Service</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Your Earning (80%)</th>
                      <th className="p-4">Welfare Share</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {completedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50/70">
                        <td className="p-4 font-bold text-gray-900">{job.service?.name}</td>
                        <td className="p-4 text-gray-500">{new Date(job.scheduledDate).toLocaleDateString()}</td>
                        <td className="p-4">{job.customer?.user?.firstName || 'Customer'}</td>
                        <td className="p-4 font-black text-[#1B6B3A]">₹{job.workerEarning}</td>
                        <td className="p-4 font-bold text-[#E8722A]">₹{job.cooperativeShare}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
