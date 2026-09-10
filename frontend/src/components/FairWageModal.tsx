import React from 'react';
import { FiDollarSign, FiHeart, FiShield, FiX, FiCheck, FiInfo } from 'react-icons/fi';

interface FairWageModalProps {
  amount: number;
  serviceName?: string;
  onClose: () => void;
}

const FairWageModal: React.FC<FairWageModalProps> = ({ amount, serviceName = 'Service', onClose }) => {
  const workerEarning = Math.round(amount * 0.8 * 100) / 100;
  const welfareContribution = Math.round(amount * 0.1 * 100) / 100;
  const platformGovernance = Math.round(amount * 0.1 * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B6B3A] to-[#2A8F4F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FiShield className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Fair Wage & Co-op Fund Transparency</h3>
              <p className="text-xs text-emerald-100">Every Rupee Accounted For &bull; Zero Hidden Margins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Bill Total Card */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-800">Total Invoice Amount ({serviceName})</div>
              <div className="text-2xl font-black text-gray-900 mt-0.5">₹{amount}</div>
            </div>
            <div className="text-right text-xs text-emerald-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
              Cooperative Fair Floor Certified
            </div>
          </div>

          {/* Visual Percentage Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-700">
              <span>80% Direct to Worker</span>
              <span>10% Welfare Fund</span>
              <span>10% Governance</span>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: '80%' }} className="bg-[#1B6B3A] transition-all duration-500" title="80% Worker"></div>
              <div style={{ width: '10%' }} className="bg-[#E8722A] transition-all duration-500" title="10% Welfare"></div>
              <div style={{ width: '10%' }} className="bg-blue-600 transition-all duration-500" title="10% Ops"></div>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3">
            {/* Worker Portion */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white mt-0.5">
                <FiDollarSign className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-gray-900">Direct Worker Take-Home (80%)</span>
                  <span className="text-base font-black text-[#1B6B3A]">₹{workerEarning}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Deposited directly into the worker’s bank account immediately upon OTP job completion.
                </p>
              </div>
            </div>

            {/* Cooperative Welfare Fund */}
            <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#E8722A] text-white mt-0.5">
                <FiHeart className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-gray-900">Labour Co-op Welfare Fund (10%)</span>
                  <span className="text-base font-black text-[#E8722A]">₹{welfareContribution}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Powers the collective pool for worker accidental cover (₹5L), ESIC health insurance, and pension contributions.
                </p>
              </div>
            </div>

            {/* Federation Governance */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white mt-0.5">
                <FiShield className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-gray-900">Federation Tech & Dispute Pool (10%)</span>
                  <span className="text-base font-black text-blue-700">₹{platformGovernance}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Supports server infrastructure, maps API, consumer grievance mediation, and regional training centers.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison vs Aggregators Note */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
            <FiInfo className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <span>
              <strong>Contrast with corporate gig apps:</strong> Most platforms deduct 25% - 40% as commission, leaving workers with no social security, insurance, or ownership stake.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold rounded-xl shadow-md transition-colors text-sm"
          >
            I Support Fair Cooperative Gig Work
          </button>
        </div>
      </div>
    </div>
  );
};

export default FairWageModal;
