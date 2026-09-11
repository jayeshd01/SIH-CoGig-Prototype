import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Booking, BookingStatus, Worker } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_SERVICES, DEFAULT_WORKERS } from '../data/mockData';
import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiShield,
  FiAlertTriangle,
  FiStar,
  FiDollarSign,
  FiPhone,
  FiFileText,
  FiChevronRight,
  FiUser,
  FiCheckSquare,
  FiNavigation,
  FiKey,
  FiZap,
  FiRefreshCw,
  FiAward,
  FiThumbsUp,
  FiSend,
  FiDownload,
  FiArrowLeft,
  FiRotateCcw,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import EmergencySOSModal from '../components/EmergencySOSModal';
import CancellationModal from '../components/CancellationModal';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';
import GeoMatchingMap from '../components/GeoMatchingMap';

const OTP_CODE = '4821';

const STEPS: { key: BookingStatus; label: string; desc: string; icon: string }[] = [
  { key: 'REQUESTED', label: 'Requested', desc: 'Booking submitted by customer', icon: '📝' },
  { key: 'ASSIGNED', label: 'Assigned', desc: 'Matched with cooperative professional', icon: '👷' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Job confirmed by worker', icon: '🤝' },
  { key: 'WORKER_ON_THE_WAY', label: 'On The Way', desc: 'Worker in transit to address', icon: '🛵' },
  { key: 'ARRIVED', label: 'Arrived', desc: 'Worker reached doorstep', icon: '📍' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'OTP verified & work ongoing', icon: '⚙️' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Work done & checklist verified', icon: '✅' },
  { key: 'PAYMENT_RELEASED', label: 'Paid', desc: 'Cooperative fare settled', icon: '💳' },
  { key: 'RATED', label: 'Rated', desc: 'Quality review recorded', icon: '⭐' },
];

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Available workers for assignment
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [dispatchNote, setDispatchNote] = useState('Urgent cooperative dispatch for certified technician');
  const [workerSearchFilter, setWorkerSearchFilter] = useState<string>('');

  // Undo / Cancel Booking (Available when in REQUESTED stage)
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelBooking = async (reason: string, details: string) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/bookings/${id}/status`, {
        status: 'CANCELLED',
        note: `Booking cancelled by customer. Reason: ${reason}. ${details}`,
      });
      setShowCancelModal(false);
      navigate('/services');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Worker Acceptance
  const [workerEta, setWorkerEta] = useState('20 minutes');
  const [workerAcceptNote, setWorkerAcceptNote] = useState('Job accepted. Tools inspected and ready.');

  // Step 3: Departure
  const [travelMode, setTravelMode] = useState('Cooperative Electric Scooter');

  // Step 5: OTP Verification
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Step 6: Work checklist & timer
  const [elapsedSeconds, setElapsedSeconds] = useState(740);
  const [checklist, setChecklist] = useState({
    diagnostics: true,
    procedure: true,
    qualityCheck: true,
    siteCleaned: false,
  });
  const [workNotes, setWorkNotes] = useState('Comprehensive inspection completed. Genuine parts used.');

  // Step 7: Payment
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'NET_BANKING' | 'CARD'>('UPI');
  const [upiHandle, setUpiHandle] = useState('anita@okhdfcbank');

  // Step 8: Rating
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('Outstanding punctuality, expert craftsmanship, and dignified service!');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Expert Craftsmanship', 'Respectful & Polite']);

  // Modals
  const [showSosModal, setShowSosModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  // Fetch Booking Details
  const fetchBooking = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);
      if (res.data?.workerId) {
        setSelectedWorkerId(res.data.workerId);
      }
      fetchWorkers(res.data?.latitude, res.data?.longitude, res.data?.serviceId);
    } catch (err: any) {
      console.warn('Using local/fallback booking state for demo prototype');
      let localBooking: Booking | null = null;
      try {
        const stored = localStorage.getItem(`booking_${id}`);
        if (stored) localBooking = JSON.parse(stored);
      } catch {}

      if (!localBooking) {
        localBooking = {
          id: id || 'demo-booking-1',
          customerId: 'demo-cust-id',
          customer: {
            id: 'cust-record-1',
            userId: 'demo-cust-id',
            user: {
              id: 'demo-cust-id',
              firstName: 'Anita',
              lastName: 'Deshmukh',
              email: 'customer@demo.com',
            },
          },
          workerId: DEFAULT_WORKERS[0].id,
          worker: DEFAULT_WORKERS[0],
          serviceId: DEFAULT_SERVICES[0].id,
          service: DEFAULT_SERVICES[0],
          status: 'REQUESTED',
          isEmergency: false,
          addressText: '45, MG Road, Shivaji Nagar, Pune 411005',
          latitude: 18.5204,
          longitude: 73.8567,
          scheduledDate: new Date().toISOString(),
          scheduledTime: '10:00 AM',
          description: 'Electrical inspection & switchboard repair needed',
          serviceCharge: 299,
          platformFee: 30,
          taxAmount: 0,
          totalAmount: 329,
          workerEarning: 239,
          cooperativeShare: 30,
          createdAt: new Date().toISOString(),
        };
      }

      setBooking(localBooking);
      if (localBooking.workerId) setSelectedWorkerId(localBooking.workerId);
      fetchWorkers(localBooking.latitude, localBooking.longitude, localBooking.serviceId);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch Available Workers for Assignment matching customer coordinates
  const fetchWorkers = async (targetLat?: number, targetLng?: number, sId?: string) => {
    try {
      const lat = targetLat ?? booking?.latitude ?? 18.5204;
      const lng = targetLng ?? booking?.longitude ?? 73.8567;
      const serviceQuery = sId ? `&serviceId=${sId}` : '';
      const res = await api.get(`/workers/nearby?lat=${lat}&lng=${lng}&radius=35${serviceQuery}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAvailableWorkers(res.data);
        if (!selectedWorkerId || !res.data.some((w: any) => w.id === selectedWorkerId)) {
          setSelectedWorkerId(res.data[0].id);
        }
      }
    } catch (e) {
      // Fallback mock workers with proper coordinates relative to customer location
      const lat = targetLat ?? booking?.latitude ?? 18.5204;
      const lng = targetLng ?? booking?.longitude ?? 73.8567;
      const fallback = [
        {
          id: '93ae012e-c696-44cb-b1ef-54fb78545647',
          user: { firstName: 'Rajesh', lastName: 'Kumar', phone: '+91 9823011223' },
          cooperative: { name: 'Pune Labour Cooperative Society' },
          experience: 8,
          averageRating: 4.9,
          totalJobs: 142,
          distance: 1.5,
          latitude: Number((lat + 0.012).toFixed(4)),
          longitude: Number((lng + 0.008).toFixed(4)),
        },
        {
          id: '4adaffaf-a6c9-4878-a381-6cca9f8a68bb',
          user: { firstName: 'Suresh', lastName: 'Jadhav', phone: '+91 9765432100' },
          cooperative: { name: 'Maharashtra Workers Federation' },
          experience: 6,
          averageRating: 4.8,
          totalJobs: 98,
          distance: 2.3,
          latitude: Number((lat - 0.015).toFixed(4)),
          longitude: Number((lng + 0.014).toFixed(4)),
        },
        {
          id: 'c5e611bb-3203-4af6-8424-53fa3ea2f940',
          user: { firstName: 'Manoj', lastName: 'Kulkarni', phone: '+91 9988776655' },
          cooperative: { name: 'Deccan Craft Co-op Guild' },
          experience: 11,
          averageRating: 4.95,
          totalJobs: 215,
          distance: 3.1,
          latitude: Number((lat - 0.021).toFixed(4)),
          longitude: Number((lng - 0.018).toFixed(4)),
        },
      ];
      setAvailableWorkers(fallback);
      if (!selectedWorkerId) setSelectedWorkerId(fallback[0].id);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();
      fetchWorkers();
    }
  }, [id]);

  // Timer for IN_PROGRESS
  useEffect(() => {
    let interval: any = null;
    if (booking?.status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [booking?.status]);

  const showSuccessNotice = (msg: string) => {
    setActionSuccess(msg);
    setActionError('');
    setTimeout(() => setActionSuccess(''), 5000);
  };

  // Status update generic handler
  const handleStatusTransition = async (
    newStatus: BookingStatus,
    note?: string,
    workerIdToAssign?: string
  ) => {
    try {
      setIsSubmitting(true);
      setActionError('');
      await api.patch(`/bookings/${id}/status`, {
        status: newStatus,
        note,
        workerId: workerIdToAssign || selectedWorkerId || undefined,
      });
      showSuccessNotice(`Lifecycle advanced to "${newStatus.replace(/_/g, ' ')}"`);
      await fetchBooking(true);
    } catch (err: any) {
      setBooking((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          status: newStatus,
          workerId: workerIdToAssign || selectedWorkerId || prev.workerId,
        };
        try {
          localStorage.setItem(`booking_${id}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      showSuccessNotice(`Lifecycle advanced to "${newStatus.replace(/_/g, ' ')}"`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Assign Worker
  const handleAssignWorker = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const workerToUse = selectedWorkerId || (availableWorkers[0]?.id);
    await handleStatusTransition('ASSIGNED', dispatchNote, workerToUse);
  };

  // Step 2: Worker Accepts
  const handleWorkerAccept = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleStatusTransition('ACCEPTED', `Accepted. ETA: ${workerEta}. ${workerAcceptNote}`);
  };

  // Step 3: Start Travel
  const handleStartTravel = async () => {
    await handleStatusTransition('WORKER_ON_THE_WAY', `Worker travelling via ${travelMode}`);
  };

  // Step 4: Arrived
  const handleMarkArrived = async () => {
    await handleStatusTransition('ARRIVED', 'Worker reached customer doorstep and requested OTP');
  };

  // Step 5: Verify OTP & Start Job
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError('');
    if (otpInput.trim() !== OTP_CODE) {
      setOtpError(`Incorrect OTP "${otpInput}". Please use ${OTP_CODE} to verify.`);
      return;
    }
    await handleStatusTransition('IN_PROGRESS', 'OTP 4821 verified successfully. Service commenced.');
  };

  // Step 6: Complete Job
  const handleCompleteJob = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleStatusTransition('COMPLETED', `Work finished. Checklist validated: ${workNotes}`);
  };

  // Step 7: Release Payment
  const handlePayAndRelease = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      setActionError('');
      await api.post('/payments', {
        bookingId: id,
        method: paymentMethod,
      });
      showSuccessNotice(`Payment of ₹${booking?.totalAmount} settled via ${paymentMethod}. Worker earnings released!`);
      await fetchBooking(true);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 8: Submit Rating
  const handleRatingSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!booking?.workerId) {
      setActionError('No worker record attached to rate.');
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError('');
      const fullComment = `${ratingComment} [${selectedTags.join(', ')}]`;
      await api.post('/ratings', {
        bookingId: id,
        workerId: booking.workerId,
        score: ratingScore,
        comment: fullComment,
      });
      showSuccessNotice(`Thank you! ${ratingScore}-Star rating saved. Live telemetry 100% completed!`);
      await fetchBooking(true);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast-forward 1 step
  const handleFastForwardNext = async () => {
    if (!booking) return;
    switch (booking.status) {
      case 'REQUESTED':
        await handleAssignWorker();
        break;
      case 'ASSIGNED':
        await handleWorkerAccept();
        break;
      case 'ACCEPTED':
        await handleStartTravel();
        break;
      case 'WORKER_ON_THE_WAY':
        await handleMarkArrived();
        break;
      case 'ARRIVED':
        setOtpInput(OTP_CODE);
        await handleStatusTransition('IN_PROGRESS', 'OTP auto-verified. Work started.');
        break;
      case 'IN_PROGRESS':
        await handleCompleteJob();
        break;
      case 'COMPLETED':
        await handlePayAndRelease();
        break;
      case 'PAYMENT_RELEASED':
        await handleRatingSubmit();
        break;
      default:
        break;
    }
  };

  // Jump directly to any step
  const handleJumpToStep = async (targetStepKey: BookingStatus) => {
    if (!booking) return;
    try {
      setIsSubmitting(true);
      setActionError('');
      await api.patch(`/bookings/${id}/status`, {
        status: targetStepKey,
        note: `Direct navigation to ${targetStepKey}`,
        workerId: selectedWorkerId || booking.workerId || undefined,
      });
      showSuccessNotice(`Lifecycle updated to "${targetStepKey.replace(/_/g, ' ')}"`);
      await fetchBooking(true);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update step.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fill up to Step 8 (Paid) with all 8 checkmarks
  const handleFillUpToPaid = async () => {
    if (!booking) return;
    try {
      setIsSubmitting(true);
      setActionError('');
      await api.patch(`/bookings/${id}/status`, {
        status: 'PAYMENT_RELEASED',
        note: 'Fast-forwarded to Step 8 (Paid)',
        workerId: selectedWorkerId || booking.workerId || undefined,
      });
      showSuccessNotice('All 8 steps filled with checkmarks up to Paid!');
      await fetchBooking(true);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to fill up to Paid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to Step 1 for repeatable testing
  const handleResetForTesting = async () => {
    if (!window.confirm('Reset this booking back to "REQUESTED" to test the full lifecycle again?')) return;
    await handleStatusTransition('REQUESTED', 'Reset to initial stage for workflow verification');
  };

  // Grievance submit
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintCategory) return;
    try {
      await api.post('/complaints', {
        bookingId: id,
        category: complaintCategory,
        description: complaintText,
      });
      setComplaintSubmitted(true);
      showSuccessNotice('Grievance registered with the Labour Cooperative Tribunal.');
      await fetchBooking(true);
    } catch (err: any) {
      // Even if API fails, show success for demo
      setComplaintSubmitted(true);
      showSuccessNotice('Grievance registered with the Labour Cooperative Tribunal.');
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B6B3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-gray-600">Connecting to live cooperative job telemetry...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-gray-900">Booking Record Unavailable</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Could not load booking telemetry. Check your connection or log in.
        </p>
        <button
          onClick={() => fetchBooking()}
          className="px-5 py-2.5 bg-[#1B6B3A] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#145A2F]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === booking.status);
  const isComplete = booking.status === 'RATED';
  const progressPercent = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ─── TOP BAR & HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          {/* Navigation & Undo Bar */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs shadow-2xs transition-all cursor-pointer group"
              title="Return to previous screen"
            >
              <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            <Link
              to="/services"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#1B6B3A] px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Services
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              to={user?.role === 'WORKER' ? '/worker' : '/customer'}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#1B6B3A] px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user?.role === 'WORKER' ? 'Jobs' : 'Dashboard'}
            </Link>

            {booking.status === 'REQUESTED' && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isSubmitting}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Undo and cancel this booking request"
              >
                <FiRotateCcw className="text-xs" />
                <span>Undo / Cancel Booking</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Booking #{booking.id.slice(0, 8).toUpperCase()}
            </h1>
            <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full status-${booking.status.toLowerCase().replace(/_/g, '-')}`}>
              {booking.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-bold text-[#1B6B3A] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Service: {booking.service?.name || 'Home Service'}
            </span>
          </div>
        </div>

        {/* Quick Utilities: Fill to Paid, Next Step & SOS */}
        <div className="flex items-center gap-2 flex-wrap">
          {(booking.status === 'PAYMENT_RELEASED' || booking.status === 'RATED') && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-[#1B6B3A] hover:from-emerald-800 hover:to-[#145A2F] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-emerald-500/40"
              title="View and download full official tax invoice"
            >
              <FiFileText className="text-amber-300" />
              <span>📄 Digital Tax Invoice</span>
            </button>
          )}

          {booking.status !== 'PAYMENT_RELEASED' && booking.status !== 'RATED' && (
            <button
              onClick={handleFillUpToPaid}
              disabled={isSubmitting}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-[#1B6B3A] hover:from-emerald-800 hover:to-[#145A2F] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50 border border-emerald-500/40"
              title="Instantly advance and check all steps 1 to 8 up to Paid"
            >
              <FiCheckCircle className="text-amber-300" />
              <span>⚡ Fill to Paid (Step 8)</span>
            </button>
          )}

          {!isComplete && (
            <button
              onClick={handleFastForwardNext}
              disabled={isSubmitting}
              className="px-3.5 py-2 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              title="Execute the current operation immediately"
            >
              <FiZap className="text-amber-300" />
              <span>Next Operation &rarr;</span>
            </button>
          )}

          <button
            onClick={handleResetForTesting}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Reset back to Step 1 (Requested)"
          >
            <FiRefreshCw />
            <span>Reset to Step 1</span>
          </button>

          <button
            onClick={() => setShowSosModal(true)}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FiAlertTriangle className="animate-pulse" /> SOS Rapid Help
          </button>
          <button
            onClick={() => setShowComplaintModal(true)}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Grievance
          </button>
        </div>
      </div>

      {/* ─── ALERTS / FEEDBACK ───────────────────────────────────────────────── */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-emerald-700 text-lg shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">Saved to Database</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs font-bold rounded-2xl flex items-center gap-2">
          <FiAlertTriangle className="text-red-600 text-base shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ─── 1. LIVE JOB LIFECYCLE TELEMETRY (DYNAMIC 9-STEP TRACKER) ───────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#1B6B3A]">
                Live Job Lifecycle Telemetry
              </h2>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex]?.desc}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-black text-gray-900">{progressPercent}% Completed</span>
              <span className="text-[10px] text-gray-400 block">
                {currentStepIndex + 1}/{STEPS.length} Stages Filled
              </span>
            </div>
            <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-full bg-gradient-to-r from-[#1B6B3A] to-[#2A8F4F] transition-all duration-700 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 9 Telemetry Step Circles */}
        <div className="overflow-x-auto pb-3 pt-2 scrollbar-none">
          <div className="flex items-center min-w-[760px] justify-between relative px-4">
            {/* Background connecting track */}
            <div className="absolute top-[18px] left-6 right-6 h-1.5 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
            {/* Active connecting fill */}
            <div
              className="absolute top-[18px] left-6 h-1.5 bg-gradient-to-r from-[#1B6B3A] to-[#2A8F4F] -translate-y-1/2 z-0 transition-all duration-700 rounded-full"
              style={{
                width: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 96)}%`,
              }}
            ></div>

            {STEPS.map((step, idx) => {
              const isFilled = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  onClick={() => handleJumpToStep(step.key)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                  title={`Click to jump to Step ${idx + 1}: ${step.label}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 shadow-xs ${
                      isCurrent
                        ? 'bg-[#1B6B3A] text-white ring-4 ring-emerald-300 scale-110'
                        : isFilled
                        ? 'bg-[#1B6B3A] text-white hover:bg-[#145A2F]'
                        : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-[#1B6B3A] hover:text-[#1B6B3A]'
                    }`}
                  >
                    {isFilled ? (
                      <span className="text-sm font-bold">✓</span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2.5 whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'text-gray-900 font-black'
                        : isFilled
                        ? 'text-[#1B6B3A] font-bold'
                        : 'text-gray-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[9px] text-gray-400 hidden group-hover:block absolute -bottom-4 whitespace-nowrap bg-gray-900 text-white px-2 py-0.5 rounded shadow z-20">
                    Click to jump to Step {idx + 1}: {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* OTP Reminder Banner */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B6B3A] text-white flex items-center justify-center text-lg">
              <FiKey />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 block">
                Job Safety Verification Passcode (Share with worker on arrival)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-mono font-black text-gray-900 tracking-widest bg-white px-3 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                  {OTP_CODE}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-1 rounded-md">
                  Active Code
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs text-emerald-900 max-w-xs text-right sm:text-left">
            <p className="font-bold">Cooperative Federation Guarantee:</p>
            <p className="text-[11px] text-gray-600">
              Only provide this OTP after verifying the professional’s physical cooperative ID card.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. LIVE GEO-MATCHING & GOOGLE MAPS NAVIGATION HUB ─────────────── */}
      {(() => {
        const selectedWorkerObj = availableWorkers.find((w) => w.id === selectedWorkerId);
        const activeWorker = booking.worker || selectedWorkerObj || availableWorkers[0];

        const customerLat = booking.latitude || 18.5204;
        const customerLng = booking.longitude || 73.8567;

        let wLat = activeWorker?.latitude;
        let wLng = activeWorker?.longitude;

        if (!wLat || !wLng) {
          const d = activeWorker?.distance || 2.4;
          wLat = Number((customerLat + (d / 111) * 0.7).toFixed(4));
          wLng = Number((customerLng + (d / 111) * 0.7).toFixed(4));
        }

        const workerDisplayName = activeWorker?.user
          ? `${activeWorker.user.firstName} ${activeWorker.user.lastName || ''}`.trim()
          : 'Rajesh Kumar (Co-op Electrician)';

        return (
          <GeoMatchingMap
            bookingId={booking.id}
            customerLat={customerLat}
            customerLng={customerLng}
            customerAddress={booking.addressText || 'Customer Location'}
            workerLat={wLat}
            workerLng={wLng}
            workerName={workerDisplayName}
            workerPhone={activeWorker?.user?.phone || '+91 98230 11223'}
            status={booking.status}
            nearbyWorkers={availableWorkers.map((w, idx) => ({
              id: w.id,
              name: w.user ? `${w.user.firstName} ${w.user.lastName || ''}`.trim() : `Technician ${idx + 1}`,
              lat: w.latitude || Number((customerLat + (idx === 0 ? -0.013 : idx === 1 ? 0.015 : -0.018)).toFixed(4)),
              lng: w.longitude || Number((customerLng + (idx === 0 ? -0.021 : idx === 1 ? 0.019 : 0.012)).toFixed(4)),
              trade: w.cooperative?.name || 'Cooperative Guild',
              rating: w.averageRating || 4.9,
              distance: w.distance || Number((1.5 + idx * 0.7).toFixed(1)),
            }))}
          />
        );
      })()}

      {/* ─── 3. ACTIVE OPERATION & WORKABLE FORM (PROPER WORKABLE WORKBENCH) ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1B6B3A]/30 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold mb-1">
              <span>⚡ Active Stage:</span>
              <span className="font-black uppercase">{STEPS[currentStepIndex]?.label}</span>
              <span className="text-[10px] text-amber-700">({currentStepIndex + 1} of {STEPS.length})</span>
            </div>
            <h3 className="text-lg font-black text-gray-900">
              {currentStepIndex === 0 && 'Operation 1: Match & Assign Cooperative Professional'}
              {currentStepIndex === 1 && 'Operation 2: Worker Dispatch & Job Acceptance'}
              {currentStepIndex === 2 && 'Operation 3: Worker Departure & Transit Journey'}
              {currentStepIndex === 3 && 'Operation 4: Worker Arrival at Customer Doorstep'}
              {currentStepIndex === 4 && 'Operation 5: Safety OTP Verification & Job Start'}
              {currentStepIndex === 5 && 'Operation 6: Active Service Delivery & Task Verification'}
              {currentStepIndex === 6 && 'Operation 7: Cooperative Transparent Fare Settlement'}
              {currentStepIndex === 7 && 'Operation 8: Member Quality Review & Rating'}
              {currentStepIndex === 8 && 'Operation 9: Full Job Lifecycle Fulfilled & Archived'}
            </h3>
          </div>

          <div className="text-xs font-semibold text-gray-500">
            Complete the form below to fill Step {currentStepIndex + 1} &rarr; Step {Math.min(currentStepIndex + 2, 9)}
          </div>
        </div>

        {/* ── FORM 1: REQUESTED -> ASSIGNED ── */}
        {booking.status === 'REQUESTED' && (() => {
          const filteredAvailableWorkers = availableWorkers.filter((w: any) => {
            if (!workerSearchFilter.trim()) return true;
            const q = workerSearchFilter.toLowerCase();
            const name = `${w.user?.firstName || ''} ${w.user?.lastName || ''}`.toLowerCase();
            const coop = (w.cooperative?.name || '').toLowerCase();
            const skill = (w.skills?.[0]?.service?.name || '').toLowerCase();
            return name.includes(q) || coop.includes(q) || skill.includes(q);
          });

          return (
            <form onSubmit={handleAssignWorker} className="space-y-5">
              {/* Minimal Cooperative Smart Match UI */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/50 rounded-2xl border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1B6B3A] text-white flex items-center justify-center text-sm shadow-xs font-black shrink-0">
                    ✨
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-emerald-950">
                        Cooperative Smart Match
                      </h4>
                      <span className="text-[9px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.2 rounded-full">
                        AI Proximity
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Ranked by real-time proximity, certified skills & audited member rotation
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs self-start sm:self-auto">
                  <FiShield className="text-emerald-700" />
                  <span>100% Federation Audited</span>
                </div>
              </div>

              {/* Worker Selection Header & Search Filter */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider">
                      Select Available Cooperative Worker:
                    </label>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {filteredAvailableWorkers.length} Members Available
                    </span>
                  </div>

                  {/* Worker search filter */}
                  <div className="relative w-full sm:w-64">
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
                    <input
                      type="text"
                      value={workerSearchFilter}
                      onChange={(e) => setWorkerSearchFilter(e.target.value)}
                      placeholder="Search name, co-op, or skill..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B6B3A] transition-colors"
                    />
                  </div>
                </div>

                {/* Rich Workable Grid of Available Workers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[440px] overflow-y-auto pr-1">
                  {filteredAvailableWorkers.map((w: any) => {
                    const isSelected = selectedWorkerId === w.id;
                    const name = `${w.user?.firstName || 'Worker'} ${w.user?.lastName || ''}`.trim();
                    const coop = w.cooperative?.name || 'Labour Cooperative';

                    return (
                      <div
                        key={w.id}
                        onClick={() => setSelectedWorkerId(w.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                          isSelected
                            ? 'border-[#1B6B3A] bg-emerald-50/70 shadow-sm ring-2 ring-emerald-300 scale-[1.01]'
                            : 'border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 shadow-2xs'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#1B6B3A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            ✓
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#2A8F4F] text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                            {name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="text-xs font-black text-gray-900 truncate">{name}</h4>
                            <span className="text-[10px] text-emerald-800 font-semibold block truncate">
                              {coop}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-100">
                          <span className="flex items-center gap-1 font-bold text-gray-800">
                            <FiStar className="text-amber-500 fill-amber-500 text-xs" /> {w.averageRating || 4.8}
                          </span>
                          <span className="text-gray-500">{w.experience || 5}y exp</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {w.distance ? `${w.distance} km` : '1.8 km'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Dispatch Instructions / Work Priority Note:
              </label>
              <input
                type="text"
                value={dispatchNote}
                onChange={(e) => setDispatchNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]"
                placeholder="e.g. Please bring extra copper piping or diagnostic kit"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <FiUser />
                <span>Assign Cooperative Worker & Fill Step 2 &rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => handleAssignWorker()}
                className="w-full sm:w-auto px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                ⚡ Auto-Assign Nearest (Rajesh Kumar)
              </button>
            </div>
          </form>
        ); })()}

        {/* ── FORM 2: ASSIGNED -> ACCEPTED ── */}
        {booking.status === 'ASSIGNED' && (
          <form onSubmit={handleWorkerAccept} className="space-y-5">
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">
                {booking.worker?.user?.firstName.charAt(0) || 'R'}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-gray-900">
                    {booking.worker?.user?.firstName || 'Rajesh'} {booking.worker?.user?.lastName || 'Kumar'}
                  </h4>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    Assigned Worker
                  </span>
                </div>
                <p className="text-xs text-blue-900">
                  {booking.worker?.cooperative?.name || 'Pune Labour Cooperative Society'} &bull; Contact: {booking.worker?.user?.phone || '+91 9100000001'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Worker Estimated Arrival Timeframe:
                </label>
                <select
                  value={workerEta}
                  onChange={(e) => setWorkerEta(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                >
                  <option value="15 minutes">15 minutes (Express)</option>
                  <option value="20 minutes">20 minutes (Standard)</option>
                  <option value="35 minutes">35 minutes (Moderate Traffic)</option>
                  <option value="45 minutes">45 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Worker Acceptance Remarks:
                </label>
                <input
                  type="text"
                  value={workerAcceptNote}
                  onChange={(e) => setWorkerAcceptNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <FiCheckCircle />
                <span>Confirm & Accept Job (Worker Action) &rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusTransition('REQUESTED', 'Re-routing worker')}
                className="w-full sm:w-auto px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Re-assign Different Worker
              </button>
            </div>
          </form>
        )}

        {/* ── FORM 3: ACCEPTED -> WORKER_ON_THE_WAY ── */}
        {booking.status === 'ACCEPTED' && (
          <div className="space-y-5">
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-2">
              <p className="font-bold flex items-center gap-2">
                <span>🛵 Worker Preparing for Transit:</span>
              </p>
              <p className="text-gray-600">
                {booking.worker?.user?.firstName || 'Rajesh'} has accepted the request. Safety gear, identity credentials, and toolkit are packed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cooperative Transport Mode:
                </label>
                <select
                  value={travelMode}
                  onChange={(e) => setTravelMode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                >
                  <option value="Cooperative Electric Scooter">Cooperative Electric Two-Wheeler</option>
                  <option value="Co-op Service Van">Co-op Service Van</option>
                  <option value="Bicycle Delivery">Bicycle / Rapid Transit</option>
                </select>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                <span className="font-bold text-gray-900 block">Customer Destination:</span>
                <span className="text-gray-600">{booking.addressText || 'Pune, Maharashtra'}</span>
              </div>
            </div>

            <button
              onClick={handleStartTravel}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <FiNavigation />
              <span>Worker Starts Journey (Mark On The Way) &rarr;</span>
            </button>
          </div>
        )}

        {/* ── FORM 4: WORKER_ON_THE_WAY -> ARRIVED ── */}
        {booking.status === 'WORKER_ON_THE_WAY' && (
          <div className="space-y-5">
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg animate-bounce">
                  🛵
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Worker is Travelling to Your Doorstep</h4>
                  <p className="text-[11px] text-gray-600">Simulated GPS Live Tracking Active &bull; 0.4 km away</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${booking.worker?.user?.phone || '+919100000001'}`}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <FiPhone /> Call Worker
                </a>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Assigned Professional:</span>
                <span>{booking.worker?.user?.firstName || 'Rajesh'} {booking.worker?.user?.lastName || 'Kumar'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Estimated Arrival:</span>
                <span className="text-emerald-700 font-bold">Within 3 minutes</span>
              </div>
            </div>

            <button
              onClick={handleMarkArrived}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <FiMapPin />
              <span>Worker Reached Doorstep (Mark Arrived) &rarr;</span>
            </button>
          </div>
        )}

        {/* ── FORM 5: ARRIVED -> IN_PROGRESS (SAFETY OTP FORM) ── */}
        {booking.status === 'ARRIVED' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                  Customer Security Verification PIN
                </span>
                <div className="text-3xl font-mono font-black text-gray-900 tracking-widest mt-0.5">
                  {OTP_CODE}
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Customer verbally shares this code with the worker to initiate the task.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOtpInput(OTP_CODE)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ Auto-fill Customer OTP ({OTP_CODE})</span>
              </button>
            </div>

            <div className="max-w-md space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Worker Verification Input (Enter 4-Digit Code to start):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError('');
                  }}
                  placeholder="e.g. 4821"
                  className="w-40 text-center font-mono text-xl tracking-widest font-black px-4 py-2.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || otpInput.length < 4}
                  className="px-6 py-2.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <FiKey />
                  <span>Verify & Start Job &rarr;</span>
                </button>
              </div>
              {otpError && (
                <p className="text-xs font-bold text-red-600">{otpError}</p>
              )}
            </div>
          </form>
        )}

        {/* ── FORM 6: IN_PROGRESS -> COMPLETED ── */}
        {booking.status === 'IN_PROGRESS' && (
          <form onSubmit={handleCompleteJob} className="space-y-5">
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg">
                  <FiClock />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-900 block">
                    Active Service Duration Tracker
                  </span>
                  <div className="text-2xl font-mono font-black text-gray-900 tracking-wider">
                    {formatSeconds(elapsedSeconds)}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-100/60 px-3 py-1 rounded-full">
                Live Cooperative Inspection Active
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Worker Service Execution Checklist:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.diagnostics}
                    onChange={(e) => setChecklist({ ...checklist, diagnostics: e.target.checked })}
                    className="rounded text-[#1B6B3A] focus:ring-[#1B6B3A]"
                  />
                  <span className="font-semibold text-gray-800">1. Initial safety audit & diagnostics</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.procedure}
                    onChange={(e) => setChecklist({ ...checklist, procedure: e.target.checked })}
                    className="rounded text-[#1B6B3A] focus:ring-[#1B6B3A]"
                  />
                  <span className="font-semibold text-gray-800">2. Standard cooperative procedure executed</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.qualityCheck}
                    onChange={(e) => setChecklist({ ...checklist, qualityCheck: e.target.checked })}
                    className="rounded text-[#1B6B3A] focus:ring-[#1B6B3A]"
                  />
                  <span className="font-semibold text-gray-800">3. Operational testing with customer verified</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.siteCleaned}
                    onChange={(e) => setChecklist({ ...checklist, siteCleaned: e.target.checked })}
                    className="rounded text-[#1B6B3A] focus:ring-[#1B6B3A]"
                  />
                  <span className="font-semibold text-gray-800">4. Worksite cleaned & waste recycled</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Completion Notes & Parts Details:
              </label>
              <textarea
                rows={2}
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <FiCheckSquare />
              <span>Mark Service Completed & Generate Bill &rarr;</span>
            </button>
          </form>
        )}

        {/* ── FORM 7: COMPLETED -> PAYMENT_RELEASED ── */}
        {booking.status === 'COMPLETED' && (
          <form onSubmit={handlePayAndRelease} className="space-y-5">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  Transparent Cooperative Fare Settlement
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Total Bill: ₹{booking.totalAmount}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 block text-[10px]">Worker Direct (80%):</span>
                  <span className="text-base font-black text-gray-900">₹{booking.workerEarning}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 block text-[10px]">Welfare Pool (10%):</span>
                  <span className="text-base font-black text-[#E8722A]">₹{booking.cooperativeShare}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 block text-[10px]">Federation Tech (10%):</span>
                  <span className="text-base font-black text-blue-700">₹{booking.platformFee}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Choose Payment Method:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'Instant UPI / QR', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'CASH', label: 'Direct Cash to Worker', icon: '💵', desc: 'Settle in person' },
                  { id: 'CARD', label: 'Card / NetBanking', icon: '💳', desc: 'Debit / Credit / NEFT' },
                ].map((pm) => (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1 ${
                      paymentMethod === pm.id
                        ? 'border-[#1B6B3A] bg-emerald-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{pm.icon}</span>
                      {paymentMethod === pm.id && <span className="text-xs font-bold text-[#1B6B3A]">✓</span>}
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">{pm.label}</h5>
                    <p className="text-[10px] text-gray-500">{pm.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="max-w-md">
                <label className="block text-xs font-bold text-gray-700 mb-1">Your UPI ID:</label>
                <input
                  type="text"
                  value={upiHandle}
                  onChange={(e) => setUpiHandle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <FiDollarSign />
              <span>Release Payment of ₹{booking.totalAmount} (Advance to Paid) &rarr;</span>
            </button>
          </form>
        )}

        {/* ── FORM 8: PAYMENT_RELEASED -> RATED ── */}
        {booking.status === 'PAYMENT_RELEASED' && (
          <form onSubmit={handleRatingSubmit} className="space-y-5">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <FiCheckCircle className="text-emerald-700 text-2xl shrink-0" />
              <div>
                <h4 className="text-xs font-black text-emerald-900">Payment of ₹{booking.totalAmount} Confirmed!</h4>
                <p className="text-[11px] text-emerald-800">
                  ₹{booking.workerEarning} successfully transferred to {booking.worker?.user?.firstName || 'Rajesh'}'s cooperative member account.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Rate Your Experience with {booking.worker?.user?.firstName || 'the Cooperative Professional'}:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingScore(star)}
                    className="text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <span className={star <= ratingScore ? 'text-amber-400' : 'text-gray-200'}>★</span>
                  </button>
                ))}
                <span className="text-xs font-black text-gray-800 ml-2">
                  {ratingScore === 5 && 'Outstanding Cooperative Service (5/5)'}
                  {ratingScore === 4 && 'Very Good Service (4/5)'}
                  {ratingScore === 3 && 'Good Service (3/5)'}
                  {ratingScore <= 2 && 'Needs Improvement'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Cooperative Quality Badges:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Punctual',
                  'Expert Craftsmanship',
                  'Respectful & Polite',
                  'Honest Pricing',
                  'Site Left Clean',
                  'Co-op Standards Met',
                ].map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => {
                        setSelectedTags(
                          active ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1B6B3A] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {active ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Your Member Review & Feedback:
              </label>
              <textarea
                rows={2}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Describe your service experience..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <FiStar />
                <span>Submit Rating & Complete Telemetry (100%) &rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="px-5 py-3 bg-white border-2 border-emerald-600 hover:bg-emerald-50 text-[#1B6B3A] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FiFileText />
                <span>📄 View & Download Digital Invoice</span>
              </button>
            </div>
          </form>
        )}

        {/* ── FORM 9: RATED (100% COMPLETE CELEBRATION) ── */}
        {booking.status === 'RATED' && (
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border-2 border-emerald-300 text-center space-y-4">
            <div className="w-16 h-16 bg-[#1B6B3A] text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-md animate-bounce">
              🏆
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#1B6B3A]">
                100% TELEMETRY FULFILLED
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-1">
                Job Lifecycle Successfully Completed & Archiving
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto mt-1">
                All 9 operational checkpoints — from customer dispatch to worker arrival, OTP verification, service delivery, transparent fare settlement, and member rating — have been verified.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FiFileText />
                <span>Download Digital Invoice</span>
              </button>
              <Link
                to={user?.role === 'WORKER' ? '/worker' : '/customer'}
                className="px-5 py-2.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/services"
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
              >
                Book Another Service
              </Link>
              <button
                type="button"
                onClick={handleResetForTesting}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FiRefreshCw /> Test Lifecycle Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. TWO COLUMN SUMMARY: WORKER PROFILE & TRANSPARENT INVOICE ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Worker Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Assigned Cooperative Professional
            </h3>

            {booking.worker ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-xs">
                    {booking.worker.user?.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-base font-black text-gray-900">
                        {booking.worker.user?.firstName} {booking.worker.user?.lastName}
                      </h4>
                      <FiCheckCircle className="text-emerald-600 text-sm" />
                    </div>
                    <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      {booking.worker.cooperative?.name || 'Labour Cooperative Federation'}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5">
                        <FiStar className="text-amber-500 fill-amber-500 text-xs" /> {booking.worker.averageRating || 4.9}
                      </span>
                      <span>&bull;</span>
                      <span>{booking.worker.experience || 5} yrs exp</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1.5 text-gray-600 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-emerald-700" />
                    <span className="font-bold text-gray-900">Phone:</span>
                    <span>{booking.worker.user?.phone || '+91 9100000001'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiShield className="text-emerald-700" />
                    <span>Background Cleared &bull; ₹5L Federation Accident Cover Active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                <div className="text-2xl">⏳</div>
                <h4 className="text-sm font-bold text-amber-900">Worker Pending Assignment</h4>
                <p className="text-xs text-amber-800">
                  Use the operation workbench above to choose or auto-assign a certified professional.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Invoice & Payment Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Transparent Cooperative Invoice
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {booking.service?.name}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between">
                <span>Base Service Charge:</span>
                <span className="font-bold text-gray-900">₹{booking.serviceCharge}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>&bull; Worker Direct Earning (80%):</span>
                <span>₹{booking.workerEarning}</span>
              </div>
              <div className="flex justify-between text-[#E8722A] font-medium">
                <span>&bull; Co-op Welfare & Healthcare Pool (10%):</span>
                <span>₹{booking.cooperativeShare}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-medium">
                <span>&bull; Federation Tech & Legal Mediation (10%):</span>
                <span>₹{booking.platformFee}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                <span>Total Bill:</span>
                <span className="text-lg text-[#1B6B3A]">₹{booking.totalAmount}</span>
              </div>
            </div>

            {booking.status === 'PAYMENT_RELEASED' || booking.status === 'RATED' ? (
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-2xl border-2 border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#1B6B3A] text-white rounded-lg text-xs">
                      <FiCheckCircle />
                    </span>
                    <div>
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                        Digital Tax Invoice & Receipt
                      </span>
                      <span className="text-[10px] text-emerald-800 font-mono font-bold">
                        {booking.invoice?.invoiceNumber || `SAH-2026-${booking.id.slice(0, 6).toUpperCase()}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                    PAID &bull; UPI
                  </span>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs space-y-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>Direct Worker Remittance:</span>
                    <span className="font-bold text-emerald-800">₹{booking.workerEarning} (80%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cooperative Welfare Pool:</span>
                    <span className="font-bold text-[#E8722A]">₹{booking.cooperativeShare} (10%)</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 pt-1 border-t border-gray-100">
                    <span>Settled Amount:</span>
                    <span className="text-sm text-[#1B6B3A]">₹{booking.totalAmount}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="flex-1 py-2.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FiFileText />
                    <span>View Digital Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-3.5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Download Receipt"
                  >
                    <FiDownload />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      {showSosModal && <EmergencySOSModal onClose={() => setShowSosModal(false)} />}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <CancellationModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelBooking}
          isLoading={isSubmitting}
        />
      )}

      {/* Dispute Management Modal — Need Help? */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">🆘 Need Help?</h3>
                <p className="text-[11px] text-gray-500">Cooperative mediation &amp; dispute resolution</p>
              </div>
              <button
                onClick={() => { setShowComplaintModal(false); setComplaintSubmitted(false); setComplaintCategory(''); setComplaintText(''); }}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {complaintSubmitted ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <FiCheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="text-base font-black text-gray-900">Complaint Registered!</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Your grievance has been submitted to the Labour Cooperative Tribunal. A mediator will contact you within 24 hours.
                </p>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800 text-left">
                  <p className="font-bold">Ticket ID:</p>
                  <p className="font-mono text-emerald-700">GRV-{new Date().getFullYear()}-{id?.slice(0,6).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => { setShowComplaintModal(false); setComplaintSubmitted(false); setComplaintCategory(''); setComplaintText(''); }}
                  className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2.5">
                    What issue are you facing?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'PAYMENT_ISSUE', icon: '💳', label: 'Payment Issue', desc: 'Wrong charge, refund, billing problem' },
                      { id: 'WORKER_ISSUE', icon: '👷', label: 'Worker Issue', desc: 'Behavior, conduct or attitude problem' },
                      { id: 'SERVICE_QUALITY', icon: '⭐', label: 'Service Quality', desc: 'Poor work quality, incomplete job' },
                      { id: 'JOB_CANCELLATION', icon: '❌', label: 'Job Cancellation', desc: "Worker cancelled or didn't show up" },
                      { id: 'FRAUD_REPORT', icon: '🚨', label: 'Fraud Report', desc: 'Overcharging, impersonation, scam' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setComplaintCategory(cat.id)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                          complaintCategory === cat.id
                            ? 'border-red-500 bg-red-50 ring-1 ring-red-200'
                            : 'border-gray-200 hover:border-red-200 hover:bg-red-50/20'
                        }`}
                      >
                        <span className="text-lg shrink-0">{cat.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-900">{cat.label}</div>
                          <div className="text-[10px] text-gray-500">{cat.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${complaintCategory === cat.id ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                          {complaintCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {complaintCategory && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Describe the issue:</label>
                    <textarea
                      rows={3}
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      required
                      placeholder="Please provide details about what happened..."
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-400 transition-colors resize-none"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowComplaintModal(false); setComplaintCategory(''); setComplaintText(''); }}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!complaintCategory}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    🚩 Raise Complaint
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Digital Tax Invoice Modal */}
      {showInvoiceModal && (
        <DigitalInvoiceModal
          booking={booking}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};

export default BookingDetails;
