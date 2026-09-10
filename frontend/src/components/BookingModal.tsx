import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service, Worker } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, PUNE_PRESETS, CityPreset } from '../contexts/LocationContext';
import api from '../api/client';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiShield,
  FiX,
  FiCheck,
  FiInfo,
  FiNavigation,
  FiExternalLink,
  FiCompass,
} from 'react-icons/fi';

interface BookingModalProps {
  service: Service;
  worker?: Worker;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ service, worker, onClose }) => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const { location: globalLocation, requestDeviceLocation, isLocating: isGlobalLocating } = useLocation();

  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [addressText, setAddressText] = useState(
    globalLocation.address || user?.customer?.addressText || '45, MG Road, Shivaji Nagar, Pune 411005'
  );
  const [latitude, setLatitude] = useState<number>(globalLocation.latitude || 18.5204);
  const [longitude, setLongitude] = useState<number>(globalLocation.longitude || 73.8567);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string>('');
  const [selectedCluster, setSelectedCluster] = useState<string>(globalLocation.neighborhood || 'Shivaji Nagar');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle "Use my current location" via HTML5 Geolocation + Google Location Services
  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    setLocationNotice('');
    try {
      const loc = await requestDeviceLocation();
      if (loc) {
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
        setAddressText(loc.address);
        setSelectedCluster(loc.neighborhood);
        setLocationNotice(`Current GPS Location locked (${loc.latitude.toFixed(4)}° N, ${loc.longitude.toFixed(4)}° E)`);
      } else {
        // Fallback to active context location
        setLatitude(globalLocation.latitude);
        setLongitude(globalLocation.longitude);
        setAddressText(globalLocation.address);
        setSelectedCluster(globalLocation.neighborhood);
        setLocationNotice(`Location set to ${globalLocation.neighborhood}`);
      }
    } catch (err) {
      console.error('Error obtaining location', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectPreset = (preset: CityPreset) => {
    setLatitude(preset.latitude);
    setLongitude(preset.longitude);
    setAddressText(`${preset.description}, ${preset.name}`);
    setSelectedCluster(preset.neighborhood);
    setLocationNotice(`Selected ${preset.neighborhood.split('(')[0]}`);
  };

  const basePrice = service.basePrice;
  const platformFee = Math.round(basePrice * 0.1 * 100) / 100;
  const totalAmount = basePrice + platformFee;
  const workerEarning = Math.round(basePrice * 0.8 * 100) / 100;
  const coopWelfare = Math.round(basePrice * 0.1 * 100) / 100;

  const timeSlots = [
    '08:00 AM',
    '10:00 AM',
    '12:00 PM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // If user is not logged in, seamlessly auto-login as demo customer
      if (!user) {
        try {
          await loginAsDemo('CUSTOMER');
        } catch (authErr) {
          console.error('Auto login failed', authErr);
          setError('Could not initialize session. Please log in first.');
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        serviceId: service.id,
        workerId: worker?.id || undefined,
        scheduledDate: new Date(scheduledDate).toISOString(),
        scheduledTime,
        addressText: addressText.trim() || '45, Shivaji Nagar, Pune, Maharashtra',
        description: description.trim() || `${service.name} requested by customer.`,
        latitude: latitude || 18.5204,
        longitude: longitude || 73.8567,
      };

      const res = await api.post('/bookings', payload);
      onClose();
      navigate(`/booking/${res.data.id}`);
    } catch (err: any) {
      console.error('Failed to create booking', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit booking request. Please try again.';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-emerald-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B6B3A] to-[#2A8F4F] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight">Confirm Cooperative Booking</h3>
            <p className="text-xs text-emerald-100">
              {service.name} {worker ? `• Assigned to ${worker.user?.firstName || 'Worker'}` : '• Nearby verified worker'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBooking} className="p-6 space-y-5">
          {/* User Account / Demo Indicator */}
          {!user ? (
            <div className="bg-emerald-50/90 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-medium">
                <span className="text-base">⚡</span>
                <span>
                  <strong>Instant Demo Mode:</strong> Auto-booking as <em>Anita Sharma (Customer)</em>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login?redirect=booking');
                }}
                className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
              >
                Sign in
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl flex items-center justify-between text-xs text-gray-600">
              <span>
                Booking as: <strong className="text-gray-900">{user.firstName} {user.lastName}</strong> ({user.role})
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Verified Member
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FiCalendar className="text-emerald-700" /> Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FiClock className="text-emerald-700" /> Time Slot
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Address & Location Detection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FiMapPin className="text-emerald-700" /> Service Location
              </label>

              {/* Use My Current Location Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetecting || isGlobalLocating}
                className="flex items-center gap-1.5 text-xs font-black text-[#1a73e8] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs group"
                title="Detect exact customer coordinates via device GPS / Google Location Services"
              >
                <FiNavigation
                  className={`text-sm ${
                    isDetecting || isGlobalLocating
                      ? 'animate-spin text-blue-600'
                      : 'rotate-45 text-[#1a73e8] group-hover:scale-110 transition-transform'
                  }`}
                />
                <span>
                  {isDetecting || isGlobalLocating
                    ? 'Detecting GPS...'
                    : 'Use my current location'}
                </span>
              </button>
            </div>

            <textarea
              rows={2}
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              required
              placeholder="Flat no, Street, Landmark, City, Pincode..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#1B6B3A] focus:outline-none resize-none shadow-2xs transition-colors"
            />

            {/* GPS Telemetry & Coordinates Confirmation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-gray-700">
                  Customer GPS Locked:
                </span>
                <span className="font-mono text-emerald-900 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-black text-[#1a73e8] hover:text-[#1557b0] hover:underline flex items-center gap-1 cursor-pointer"
                title="Verify customer pin on Google Maps"
              >
                <span>Preview on Google Maps</span>
                <FiExternalLink className="text-[10px]" />
              </a>
            </div>

            {/* Quick Pune Co-op Area Clusters */}
            <div className="space-y-1.5 pt-0.5">
              <div className="text-[10px] uppercase font-black tracking-wider text-gray-400 flex items-center justify-between">
                <span>Or Select Customer Area in Pune:</span>
                <span className="text-emerald-700 font-bold">Fast Geo-Matching</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PUNE_PRESETS.map((p) => {
                  const isSelected = selectedCluster.includes(p.name.split(',')[0]);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B6B3A] text-white border-[#1B6B3A] shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p.name.split(',')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Job Details / Instructions (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Switchboard sparking, bring replacement 16A socket"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
            />
          </div>

          {/* Transparent Fair Wage Breakdown */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-200 pb-1.5">
              <span className="flex items-center gap-1.5">
                <FiShield className="text-emerald-700" /> Transparent Bill Breakdown
              </span>
              <span>100% Federation Audited</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Direct to Skilled Worker (80%):</span>
              <span className="font-bold text-gray-900">₹{workerEarning}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Cooperative Welfare & Pension Fund (10%):</span>
              <span className="font-bold text-[#E8722A]">₹{coopWelfare}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Federation Governance & Tech Ops (10%):</span>
              <span className="font-bold text-blue-700">₹{platformFee}</span>
            </div>

            <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm font-black text-gray-900">
              <span>Total Payable Amount:</span>
              <span className="text-base text-[#1B6B3A]">₹{totalAmount}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirming Booking...</span>
            ) : (
              <>
                <FiCheck className="w-5 h-5" /> Confirm & Dispatch Co-op Worker (₹{totalAmount})
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
