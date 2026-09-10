import React, { useState, useEffect } from 'react';
import {
  FiAlertTriangle,
  FiPhoneCall,
  FiX,
  FiCheckCircle,
  FiMapPin,
  FiLoader,
  FiZap,
  FiUser,
  FiClock,
  FiStar,
} from 'react-icons/fi';

interface EmergencySOSModalProps {
  onClose: () => void;
}

type EmergencyStep = 'SELECT' | 'SEARCHING' | 'FOUND' | 'CONFIRMED';

const EMERGENCY_TYPES = [
  {
    id: 'ELECTRICAL',
    label: '⚡ Electrical Short Circuit',
    sub: 'Sparks, power outage, wire fire',
    trade: 'Electrician',
    badge: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    badgeText: '⚡ Emergency Electrician',
    workerIcon: '⚡',
    hotline: '112',
  },
  {
    id: 'WATER_BURST',
    label: '💧 Water Pipe Burst',
    sub: 'Flooding, burst pipe, sewage overflow',
    trade: 'Plumber',
    badge: 'bg-blue-100 text-blue-900 border-blue-300',
    badgeText: '💧 Emergency Plumber',
    workerIcon: '🚰',
    hotline: '112',
  },
  {
    id: 'GAS',
    label: '🔥 Gas-Related Emergency',
    sub: 'Gas leak, cylinder issue (verified pros only)',
    trade: 'Gas Safety Technician',
    badge: 'bg-orange-100 text-orange-900 border-orange-300',
    badgeText: '🔥 Certified Gas Technician',
    workerIcon: '🔥',
    hotline: '1906',
  },
  {
    id: 'LOCK',
    label: '🔐 Lock / Door Emergency',
    sub: 'Lockout, broken lock, door damage',
    trade: 'Locksmith',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
    badgeText: '🔐 Emergency Locksmith',
    workerIcon: '🔐',
    hotline: '112',
  },
  {
    id: 'PLUMBING',
    label: '🚰 Plumbing Emergency',
    sub: 'Tap burst, water heater failure, drain block',
    trade: 'Plumber',
    badge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    badgeText: '🚰 Rapid Plumber',
    workerIcon: '🚰',
    hotline: '112',
  },
  {
    id: 'SAFETY',
    label: '🛡️ Physical Safety / Dispute',
    sub: 'Cooperative safety team dispatch',
    trade: 'Safety Coordinator',
    badge: 'bg-red-100 text-red-900 border-red-300',
    badgeText: '🛡️ Co-op Safety Team',
    workerIcon: '🛡️',
    hotline: '100',
  },
];

const MOCK_EMERGENCY_WORKERS = [
  {
    name: 'Ramesh Shinde',
    trade: '⚡ Electrician',
    rating: 4.9,
    distance: 1.1,
    eta: '8 min',
    jobs: 312,
    id: 'COOP-2024-EL-0082',
    verified: true,
  },
  {
    name: 'Suresh Patil',
    trade: '⚡ Electrician',
    rating: 4.8,
    distance: 1.6,
    eta: '12 min',
    jobs: 227,
    id: 'COOP-2024-EL-0047',
    verified: true,
  },
  {
    name: 'Manoj Kulkarni',
    trade: '⚡ Electrician',
    rating: 4.95,
    distance: 2.3,
    eta: '18 min',
    jobs: 418,
    id: 'COOP-2024-EL-0031',
    verified: true,
  },
];

const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<EmergencyStep>('SELECT');
  const [emergencyType, setEmergencyType] = useState('ELECTRICAL');
  const [locationText, setLocationText] = useState('Detecting location...');
  const [selectedWorkerIdx, setSelectedWorkerIdx] = useState(0);
  const [searchProgress, setSearchProgress] = useState(0);
  const [confirmedWorker, setConfirmedWorker] = useState<(typeof MOCK_EMERGENCY_WORKERS)[0] | null>(null);

  const selectedEmergencyType = EMERGENCY_TYPES.find((e) => e.id === emergencyType) || EMERGENCY_TYPES[0];

  // Simulate GPS location detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationText('Kothrud, Pune, Maharashtra 411038'),
        () => setLocationText('Pune, Maharashtra (GPS approximate)')
      );
    } else {
      setTimeout(() => setLocationText('Pune, Maharashtra 411038'), 1000);
    }
  }, []);

  // Progress animation for SEARCHING step
  useEffect(() => {
    if (step === 'SEARCHING') {
      setSearchProgress(0);
      const interval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('FOUND'), 400);
            return 100;
          }
          return prev + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSearch = () => {
    setStep('SEARCHING');
  };

  const handleConfirmBooking = () => {
    setConfirmedWorker(MOCK_EMERGENCY_WORKERS[selectedWorkerIdx]);
    setStep('CONFIRMED');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FiAlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">🚨 EMERGENCY SERVICE</h3>
              <p className="text-xs text-red-100">Cooperative Emergency Response — Rapid Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* ── STEP 1: SELECT TYPE ── */}
          {step === 'SELECT' && (
            <>
              {/* Location Detected */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <FiMapPin className="text-amber-600 shrink-0 text-base animate-bounce" />
                <div>
                  <span className="font-bold block">Location Detected ✓</span>
                  <span className="text-amber-800">{locationText}</span>
                </div>
              </div>

              {/* Emergency Type Selection */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Select Emergency Category:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {EMERGENCY_TYPES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setEmergencyType(item.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        emergencyType === item.id
                          ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                          : 'border-gray-200 hover:border-red-300 bg-white hover:bg-red-50/30'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        emergencyType === item.id ? 'border-red-500 bg-red-500' : 'border-gray-300'
                      }`}>
                        {emergencyType === item.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-900">{item.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{item.sub}</div>
                      </div>
                      {emergencyType === item.id && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${item.badge}`}>
                          {item.badgeText}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Hotline hint */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
                <span className="font-bold text-gray-900">Relevant hotline: </span>
                <a href={`tel:${selectedEmergencyType.hotline}`} className="text-red-600 font-black hover:underline">
                  {selectedEmergencyType.hotline}
                </a>
                {selectedEmergencyType.id === 'GAS' && (
                  <span className="block mt-1 text-orange-700 font-bold">
                    ⚠️ Only verified professionals handle gas emergencies
                  </span>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm rounded-xl shadow-lg hover:from-red-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <FiAlertTriangle className="text-lg animate-pulse" />
                Searching available verified workers...
              </button>

              {/* Direct hotlines */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-500 mb-2">Direct Emergency Hotlines:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { label: 'Police SOS', num: '112' },
                    { label: 'Ambulance', num: '108' },
                    { label: 'Co-op Help', num: '1800-COOP' },
                  ].map((h) => (
                    <a
                      key={h.num}
                      href={`tel:${h.num}`}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-red-50 hover:border-red-200 border border-transparent font-bold text-gray-800 flex flex-col items-center transition-colors"
                    >
                      <span>{h.label}</span>
                      <span className="text-red-600 text-sm">{h.num}</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2: SEARCHING ── */}
          {step === 'SEARCHING' && (
            <div className="py-6 space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <FiLoader className="w-8 h-8 text-red-600 animate-spin" />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900">Emergency Request</h4>
                <div className="space-y-1 mt-2">
                  <p className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <FiCheckCircle /> Location detected ✓
                  </p>
                  <p className="text-xs font-bold text-gray-700 animate-pulse">
                    Searching available verified workers...
                  </p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-100 rounded-full"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Scanning {selectedEmergencyType.trade}s within 5 km radius...
              </p>
            </div>
          )}

          {/* ── STEP 3: WORKER FOUND ── */}
          {step === 'FOUND' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <FiCheckCircle className="text-emerald-600 text-base" />
                <span className="text-xs font-bold text-emerald-800">Workers Found Nearby!</span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Select your emergency worker:
                </p>
                <div className="space-y-2">
                  {MOCK_EMERGENCY_WORKERS.map((w, idx) => {
                    // Adapt trade based on selected emergency type
                    const adaptedTrade = selectedEmergencyType.workerIcon + ' ' + selectedEmergencyType.trade;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedWorkerIdx(idx)}
                        className={`w-full p-3.5 rounded-xl border-2 text-left transition-all ${
                          selectedWorkerIdx === idx
                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                            : 'border-gray-200 hover:border-red-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black flex items-center justify-center text-lg shrink-0 shadow-sm">
                            {w.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-gray-900">{w.name}</span>
                              {w.verified && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500">{adaptedTrade}</div>
                            <div className="flex items-center gap-3 mt-1 text-[11px]">
                              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                <FiStar className="text-[10px]" /> {w.rating}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">{w.distance} km away</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 text-red-600 font-black text-sm">
                              <FiClock className="text-xs" />
                              {w.eta}
                            </div>
                            <div className="text-[10px] text-gray-400">ETA</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm rounded-xl shadow-lg hover:from-red-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <FiCheckCircle className="text-lg" />
                Confirm Emergency Booking
              </button>

              <button
                onClick={() => setStep('SELECT')}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 font-semibold transition-colors"
              >
                ← Back to category selection
              </button>
            </div>
          )}

          {/* ── STEP 4: CONFIRMED ── */}
          {step === 'CONFIRMED' && confirmedWorker && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                <FiCheckCircle className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-gray-900">Emergency Booking Confirmed!</h4>
                <p className="text-xs text-gray-500">Your cooperative emergency professional is on the way.</p>
              </div>

              {/* Worker card */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-2xl border-2 border-red-200 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black flex items-center justify-center text-xl shadow-sm shrink-0">
                    {confirmedWorker.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{confirmedWorker.name}</div>
                    <div className="text-xs text-gray-500">
                      {selectedEmergencyType.workerIcon} {selectedEmergencyType.trade}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <FiStar className="text-[10px]" /> {confirmedWorker.rating}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{confirmedWorker.distance} km away</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-black text-red-600">{confirmedWorker.eta}</div>
                    <div className="text-[10px] text-gray-500">ETA</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-red-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cooperative Worker ID:</span>
                    <span className="font-mono font-bold text-gray-900">{confirmedWorker.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Your Location:</span>
                    <span className="font-bold text-gray-900 max-w-[160px] text-right">{locationText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-bold">
                  <FiPhoneCall className="shrink-0" />
                  A dedicated coordinator will call you immediately.
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href="tel:112"
                  className="flex-1 py-2 bg-red-600 text-white font-black text-xs rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                >
                  <FiPhoneCall /> Call 112
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencySOSModal;
