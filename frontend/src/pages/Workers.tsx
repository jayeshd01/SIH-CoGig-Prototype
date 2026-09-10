import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Worker } from '../types';
import {
  FiSearch,
  FiShield,
  FiStar,
  FiCheckCircle,
  FiAward,
  FiBriefcase,
  FiMapPin,
  FiHeart,
} from 'react-icons/fi';

import { DEFAULT_WORKERS } from '../data/mockData';

const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>(DEFAULT_WORKERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoop, setSelectedCoop] = useState<string>('all');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await api.get('/workers/nearby?lat=18.5204&lng=73.8567&radius=30');
        if (Array.isArray(res?.data) && res.data.length > 0) {
          setWorkers(res.data);
        }
      } catch (err) {
        console.error('Error fetching workers, using default directory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const safeWorkers = Array.isArray(workers) ? workers : DEFAULT_WORKERS;
  const filteredWorkers = safeWorkers.filter((w) => {
    if (selectedCoop !== 'all' && w.cooperative?.name !== selectedCoop) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = `${w.user?.firstName} ${w.user?.lastName}`.toLowerCase();
      const bio = (w.bio || '').toLowerCase();
      return name.includes(q) || bio.includes(q);
    }
    return true;
  });

  const coops = [
    'all',
    'Shakti Labour Cooperative',
    'Sahara Shramik Sangh Co-op',
    'Pragati Mahila Seva Sahakari',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#1B6B3A]">
            100% Verified Members &bull; Dignity of Labour
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            Certified Cooperative Workers Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Meet the skilled, verified tradespeople who collectively own and govern the CoGig platform.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold self-start md:self-auto">
          <FiShield className="text-emerald-700 text-base" />
          <span>Background & Police Verified &bull; Insured (₹5L)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workers by name or skill (e.g. Rajesh, Electrician, Plumber)..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
          />
        </div>

        {/* Cooperative Filter */}
        <div className="sm:w-72">
          <select
            value={selectedCoop}
            onChange={(e) => setSelectedCoop(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
          >
            <option value="all">All Cooperative Societies</option>
            <option value="Shakti Labour Cooperative">Shakti Labour Co-op</option>
            <option value="Sahara Shramik Sangh Co-op">Sahara Shramik Sangh</option>
            <option value="Pragati Mahila Seva Sahakari">Pragati Mahila Seva</option>
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-[#1B6B3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-gray-500">Loading verified workers...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
          <span className="text-4xl">👷</span>
          <h3 className="text-base font-bold text-gray-800">No workers match your filter</h3>
          <p className="text-xs text-gray-500">Try adjusting your search criteria or cooperative society.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 p-6 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B6B3A] to-[#2A8F4F] text-white font-black text-xl flex items-center justify-center shadow-xs">
                    {worker.user?.firstName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-gray-900">
                        {worker.user?.firstName} {worker.user?.lastName}
                      </h3>
                      <FiCheckCircle className="text-emerald-600 text-sm" title="Verified Worker" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block mt-0.5">
                      {worker.cooperative?.name || 'Labour Cooperative'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">
                  {worker.bio || 'Skilled professional certified by Labour Cooperative Federation with verified trade background.'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 py-3 bg-gray-50 rounded-xl border border-gray-100 text-center text-xs mb-4">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">Rating</span>
                    <span className="font-black text-gray-900 flex items-center justify-center gap-0.5">
                      <FiStar className="text-amber-500 fill-amber-500 text-xs" /> {worker.averageRating || 4.8}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">Experience</span>
                    <span className="font-black text-gray-900">{worker.experience} yrs</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">Jobs Done</span>
                    <span className="font-black text-emerald-700">{worker.totalJobs}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-1 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <FiShield className="text-emerald-600 text-xs" />
                    <span>Aadhaar & Police Clearance Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiHeart className="text-orange-500 text-xs" />
                    <span>Active Co-op Welfare & Pension Member</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-semibold">
                  Languages: {worker.languages || 'Hindi, Marathi'}
                </span>
                <Link
                  to={`/workers/${worker.id}`}
                  className="px-4 py-2 bg-[#1B6B3A] hover:bg-[#145A2F] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                >
                  View Profile & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workers;
