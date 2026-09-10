import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { Service } from '../types';
import {
  FiSearch,
  FiFilter,
  FiShield,
  FiClock,
  FiCheck,
  FiDollarSign,
  FiAlertTriangle,
} from 'react-icons/fi';
import BookingModal from '../components/BookingModal';
import FairWageModal from '../components/FairWageModal';

const Services: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name'>('price_asc');

  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [wageService, setWageService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/services');
        setServices(res.data);
      } catch (err) {
        console.error('Error fetching services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = [
    { id: 'all', label: 'All Services', icon: '🌟' },
    { id: 'electrician', label: 'Electrician', icon: '⚡' },
    { id: 'plumber', label: 'Plumber', icon: '🚰' },
    { id: 'carpenter', label: 'Carpenter', icon: '🪚' },
    { id: 'painter', label: 'Painter', icon: '🎨' },
    { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { id: 'caregiver', label: 'Caregiver', icon: '🩺' },
    { id: 'driver', label: 'Driver', icon: '🚗' },
    { id: 'gardener', label: 'Gardener', icon: '🌱' },
    { id: 'appliance', label: 'Appliance Repair', icon: '🔧' },
    { id: 'technician', label: 'Technician', icon: '💻' },
    { id: 'domestic', label: 'Domestic Help', icon: '🏠' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
  ];

  const filteredServices = services
    .filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (
        searchQuery &&
        !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price_desc') return b.basePrice - a.basePrice;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#1B6B3A]">
            Transparent Pricing &bull; Verified Workers
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            Cooperative Trade Services Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Standard floor rates determined by Maharashtra Labour Cooperative Federation. Zero surge extortion.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold self-start md:self-auto">
          <FiShield className="text-emerald-700 text-base" />
          <span>80% Directly to Worker &bull; 10% Welfare Fund</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g., Switchboard, Tap leakage, Deep clean)..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Service Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchParams(cat.id === 'all' ? {} : { cat: cat.id });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1B6B3A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-[#1B6B3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-gray-500">Loading cooperative services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-gray-800">No matching services found</h3>
          <p className="text-xs text-gray-500">Try changing your search keywords or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => {
            const workerEarning = Math.round(srv.basePrice * 0.8);
            const welfareShare = Math.round(srv.basePrice * 0.1);

            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#1B6B3A] p-5 shadow-xs card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-2xl flex items-center justify-center">
                      {categories.find((c) => c.id === srv.category)?.icon || '🛠️'}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                      {srv.category}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-gray-900">{srv.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {srv.description || 'Reliable service certified by Labour Cooperative Federation.'}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock className="text-gray-400" /> ~{srv.estimatedDuration} mins
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <FiCheck /> Verified Workers
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                  {/* Transparent Wage Summary */}
                  <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Total Floor Price</span>
                      <span className="text-lg font-black text-gray-900">₹{srv.basePrice}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Worker gets ₹{workerEarning} (80%)
                      </span>
                      <button
                        onClick={() => setWageService(srv)}
                        className="text-[10px] text-emerald-800 underline font-semibold cursor-pointer hover:text-emerald-950"
                      >
                        View breakdown
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBookingService(srv)}
                      className="flex-1 py-2.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold rounded-xl text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      Book Service
                    </button>
                    {srv.emergencyPrice && (
                      <button
                        onClick={() => setBookingService(srv)}
                        className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        title="Emergency 15-min Dispatch"
                      >
                        <FiAlertTriangle className="inline text-red-600" /> SOS
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {bookingService && (
        <BookingModal service={bookingService} onClose={() => setBookingService(null)} />
      )}

      {/* Fair Wage Breakdown Modal */}
      {wageService && (
        <FairWageModal
          amount={wageService.basePrice}
          serviceName={wageService.name}
          onClose={() => setWageService(null)}
        />
      )}
    </div>
  );
};

export default Services;
