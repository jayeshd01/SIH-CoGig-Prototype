import React from 'react';
import { FiHeart, FiShield, FiDollarSign, FiCheckCircle, FiFileText, FiAward } from 'react-icons/fi';

const WelfareFund: React.FC = () => {
  const claims = [
    {
      id: 'CLM-2024-041',
      worker: 'Suresh J.',
      trade: 'Plumber',
      coop: 'Shakti Labour Co-op',
      amount: '₹42,500',
      type: 'Medical Hospitalization (Fracture Repair)',
      date: '28 Aug 2024',
      status: 'SETTLED',
    },
    {
      id: 'CLM-2024-039',
      worker: 'Manoj K.',
      trade: 'Carpenter',
      coop: 'Sahara Shramik Sangh',
      amount: '₹15,000',
      type: 'Tool Upgrade & Safety Gear Grant',
      date: '15 Aug 2024',
      status: 'SETTLED',
    },
    {
      id: 'CLM-2024-036',
      worker: 'Prashant G.',
      trade: 'Caregiver',
      coop: 'Pragati Mahila Seva',
      amount: '₹25,000',
      type: 'Children Education Scholarship',
      date: '04 Aug 2024',
      status: 'SETTLED',
    },
    {
      id: 'CLM-2024-031',
      worker: 'Rajesh P.',
      trade: 'Electrician',
      coop: 'Shakti Labour Co-op',
      amount: '₹30,000',
      type: 'Family Maternity Benefit',
      date: '19 Jul 2024',
      status: 'SETTLED',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold">
          <FiHeart className="text-orange-600" />
          <span>Public Transparency Ledger &bull; Zero Leakage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Cooperative Worker Welfare Fund
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Every rupee collected via the 10% co-op social contribution is accounted for publicly. Providing real safety nets for informal labour.
        </p>
      </div>

      {/* Treasury Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase">Total Welfare Reserve</span>
            <FiDollarSign className="text-emerald-600 text-xl" />
          </div>
          <div className="text-3xl font-black text-[#1B6B3A]">₹42,85,400</div>
          <span className="text-[11px] text-gray-500 block">Invested in State Co-op Bank FD</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase">Claims Settled (FY24)</span>
            <FiCheckCircle className="text-orange-600 text-xl" />
          </div>
          <div className="text-3xl font-black text-[#E8722A]">₹18,45,000</div>
          <span className="text-[11px] text-gray-500 block">142 Worker Families Supported</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase">Active Coverage</span>
            <FiShield className="text-blue-600 text-xl" />
          </div>
          <div className="text-3xl font-black text-blue-700">100% Members</div>
          <span className="text-[11px] text-gray-500 block">₹5 Lakhs Accident Cover each</span>
        </div>
      </div>

      {/* Recent Disbursed Claims Ledger */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Recent Disbursed Claims & Social Welfare Grants
            </h2>
            <p className="text-xs text-gray-500">Audited by Registrar of Cooperative Societies, Maharashtra.</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            Audit Status: Clean & Certified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Claim ID</th>
                <th className="p-3.5">Beneficiary / Trade</th>
                <th className="p-3.5">Purpose / Cause</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70">
                  <td className="p-3.5 font-mono text-gray-500">{c.id}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-gray-900 block">{c.worker}</span>
                    <span className="text-[10px] text-gray-500">{c.trade} ({c.coop})</span>
                  </td>
                  <td className="p-3.5 text-gray-700 font-medium">{c.type}</td>
                  <td className="p-3.5 font-black text-emerald-800">{c.amount}</td>
                  <td className="p-3.5 text-gray-500">{c.date}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WelfareFund;
