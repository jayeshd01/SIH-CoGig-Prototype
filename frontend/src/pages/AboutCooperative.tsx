import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiShield,
  FiAward,
  FiHeart,
  FiDollarSign,
  FiCheck,
  FiX,
  FiUsers,
  FiTrendingUp,
} from 'react-icons/fi';

const AboutCooperative: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Manifesto Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-black uppercase tracking-wider text-[#1B6B3A] bg-emerald-100/70 px-3.5 py-1.5 rounded-full">
          The Cooperative Gig Manifesto
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Why Cooperative Gig Work Changes Everything
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          For over a decade, venture-funded aggregator platforms extracted massive commissions from manual tradespeople while offloading all liabilities onto workers. CoGig returns ownership to the labour federations.
        </p>
      </div>

      {/* 5 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '⚖️',
            title: '80% - 90% Direct Wage Guarantee',
            desc: 'Every service bill goes directly into the worker’s account. Zero corporate profit skimming or delayed payout penalties.',
          },
          {
            icon: '🏥',
            title: 'Automatic Welfare & Insurance',
            desc: 'Every completed job automatically reserves 10% for the collective welfare fund, ensuring ₹5 Lakh accident insurance and ESIC health benefits.',
          },
          {
            icon: '🗳️',
            title: 'Democratic Worker Governance',
            desc: 'Workers are not disposable "gig partners". They are registered voting members of their respective Labour Cooperative Societies.',
          },
          {
            icon: '🔍',
            title: 'Transparent Floor Pricing',
            desc: 'No black-box surge pricing or arbitrary algorithmic rate cuts. Standard transparent rates set collaboratively by federations.',
          },
          {
            icon: '🤝',
            title: 'Neutral Dispute Mediation',
            desc: 'No unilateral account deactivations. Grievances are reviewed by community cooperative tribunals with right of representation.',
          },
          {
            icon: '🇮🇳',
            title: 'Local Wealth Retention',
            desc: 'Revenue stays inside local towns and communities rather than being funnelled to Silicon Valley or offshore holding companies.',
          },
        ].map((pillar, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="text-3xl">{pillar.icon}</div>
            <h3 className="text-base font-black text-gray-900">{pillar.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-black text-gray-900">
            Head-to-Head Comparison: Corporate Apps vs CoGig
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4 w-1/3">Feature / Metric</th>
                <th className="p-4 w-1/3 text-red-700">Corporate Aggregator Platforms</th>
                <th className="p-4 w-1/3 text-emerald-800 bg-emerald-50">CoGig Cooperative Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-4 font-bold text-gray-900">Platform Take-Rate / Cut</td>
                <td className="p-4 text-red-600 font-medium">25% - 40% deducted from worker</td>
                <td className="p-4 text-emerald-800 font-black bg-emerald-50/50">
                  80% - 90% direct to worker (10% welfare)
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-900">Worker Employment Status</td>
                <td className="p-4 text-gray-600">"Independent contractor" (No rights)</td>
                <td className="p-4 text-emerald-800 font-black bg-emerald-50/50">
                  Cooperative Member-Owner
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-900">Accidental & Health Insurance</td>
                <td className="p-4 text-gray-600">Zero or contingent on high weekly quotas</td>
                <td className="p-4 text-emerald-800 font-black bg-emerald-50/50">
                  ₹5 Lakhs Policy & ESIC standard
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-900">Dispute Handling</td>
                <td className="p-4 text-gray-600">Unilateral algorithmic deactivation</td>
                <td className="p-4 text-emerald-800 font-black bg-emerald-50/50">
                  Neutral cooperative tribunal mediation
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-900">Pricing Predictability</td>
                <td className="p-4 text-gray-600">Volatile surge algorithms</td>
                <td className="p-4 text-emerald-800 font-black bg-emerald-50/50">
                  Fair floor pricing decided by society
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#1B6B3A] to-[#2A8F4F] rounded-3xl p-8 sm:p-10 text-white text-center space-y-4">
        <h3 className="text-2xl font-black">Support Fair Gig Labour in India</h3>
        <p className="text-sm text-emerald-100 max-w-xl mx-auto">
          Whether you are a household needing a trustworthy electrician, or a skilled tradesperson seeking dignified livelihood, CoGig is built for you.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/services"
            className="px-6 py-3 bg-[#E8722A] hover:bg-[#F5943E] text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Book a Verified Worker
          </Link>
          <Link
            to="/register?role=worker"
            className="px-6 py-3 bg-white text-[#1B6B3A] hover:bg-emerald-50 font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Join as Cooperative Worker
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutCooperative;
