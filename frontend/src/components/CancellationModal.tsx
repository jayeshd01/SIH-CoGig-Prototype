import React, { useState } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface CancellationModalProps {
  onClose: () => void;
  onConfirm: (reason: string, details: string) => void;
  isLoading?: boolean;
}

const CANCELLATION_REASONS = [
  { id: 'WORKER_UNAVAILABLE', label: 'Worker unavailable', icon: '👷', desc: 'Assigned worker is not responding or unavailable' },
  { id: 'CHANGED_MIND', label: 'Changed my mind', icon: '💭', desc: 'I no longer need this service' },
  { id: 'WRONG_BOOKING', label: 'Wrong booking', icon: '❌', desc: 'I booked the wrong service or wrong time' },
  { id: 'EMERGENCY_RESOLVED', label: 'Emergency resolved', icon: '✅', desc: 'The issue was fixed without professional help' },
  { id: 'FOUND_ALTERNATIVE', label: 'Found another service', icon: '🔄', desc: 'Found a better option elsewhere' },
  { id: 'SCHEDULED_CONFLICT', label: 'Schedule conflict', icon: '🗓️', desc: 'Cannot accommodate the worker\'s arrival time' },
];

const CancellationModal: React.FC<CancellationModalProps> = ({ onClose, onConfirm, isLoading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    setConfirmed(true);
    onConfirm(selectedReason, additionalDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <FiAlertCircle className="text-red-600 w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Cancel Booking</h3>
              <p className="text-[11px] text-gray-500">Please tell us why you're cancelling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h4 className="text-base font-black text-gray-900">Cancellation Submitted</h4>
            <p className="text-xs text-gray-500">Your booking has been cancelled. Any applicable refund will be processed within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Reason Selection */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2.5">
                Reason for cancellation:
              </label>
              <div className="space-y-2">
                {CANCELLATION_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      selectedReason === reason.id
                        ? 'border-red-500 bg-red-50 ring-1 ring-red-200'
                        : 'border-gray-200 hover:border-red-200 hover:bg-red-50/20'
                    }`}
                  >
                    <span className="text-base shrink-0">{reason.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900">{reason.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">{reason.desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selectedReason === reason.id ? 'border-red-500 bg-red-500' : 'border-gray-300'
                    }`}>
                      {selectedReason === reason.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details (optional) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                Additional details (optional):
              </label>
              <textarea
                rows={2}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Any other information..."
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-400 transition-colors resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
              <span className="font-bold">Cooperative Policy:</span> Cancellations made more than 2 hours before scheduled service are eligible for full refund. Late cancellations may incur a small co-op management fee.
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="submit"
                disabled={!selectedReason || isLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CancellationModal;
