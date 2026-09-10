import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { Booking } from '../types';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiHeart,
  FiArrowRight,
  FiPlus,
  FiDollarSign,
  FiFileText,
} from 'react-icons/fi';

import EmergencySOSModal from '../components/EmergencySOSModal';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceModalBooking, setInvoiceModalBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings/my');
        const list = Array.isArray(res.data) ? res.data : (res.data?.bookings || []);
        setBookings(list);
      } catch (err) {
        console.error('Failed to load user bookings', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const bookingList = Array.isArray(bookings) ? bookings : [];
  const activeBookings = bookingList.filter(
    (b) => !['COMPLETED', 'PAYMENT_RELEASED', 'RATED', 'CANCELLED'].includes(b.status)
  );
  const completedBookings = bookingList.filter((b) =>
    ['COMPLETED', 'PAYMENT_RELEASED', 'RATED'].includes(b.status)
  );

  const totalWelfareFundContributed = completedBookings.reduce(
    (sum, b) => sum + (b.cooperativeShare || Math.round(b.totalAmount * 0.1)),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-[#1B6B3A] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Household Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Namaste, {user?.firstName || 'Customer'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
            By choosing CoGig, you guarantee that 80-90% of your money reaches skilled workers and their families directly.
          </p>
        </div>

        {/* Social Impact Counter Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
          <div className="p-3 bg-orange-500 text-white rounded-xl text-xl">
            <FiHeart />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">
              Your Contribution to Co-op Welfare
            </span>
            <span className="text-2xl font-black text-white">₹{totalWelfareFundContributed}</span>
            <span className="text-[10px] text-emerald-200 block mt-0.5">
              Pension & Health cover funded
            </span>
          </div>
        </div>
      </div>

      {/* ─── ACTIVE BOOKINGS ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FiCalendar className="text-[#1B6B3A]" /> Active Bookings ({activeBookings.length})
          </h2>
          <Link
            to="/services"
            className="text-xs font-bold text-[#1B6B3A] hover:text-[#145A2F] flex items-center gap-1"
          >
            <FiPlus /> Book New Service
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-[#1B6B3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 space-y-3">
            <p className="text-xs text-gray-500">No active bookings right now.</p>
            <Link
              to="/services"
              className="inline-block px-4 py-2 bg-[#1B6B3A] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Browse Services & Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#1B6B3A] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-black text-gray-900">{b.service?.name}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full status-${b.status.toLowerCase().replace(/_/g, '-')}`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-gray-400" />
                      <span>{new Date(b.scheduledDate).toLocaleDateString()} at {b.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-gray-400" />
                      <span className="truncate">{b.addressText || 'Pune'}</span>
                    </div>
                  </div>

                  {b.worker && (
                    <div className="mt-3 p-2.5 bg-gray-50 rounded-xl flex items-center gap-2.5 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                        {b.worker.user?.firstName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">
                          {b.worker.user?.firstName} {b.worker.user?.lastName}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {b.worker.cooperative?.name || 'Labour Co-op'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-black text-[#1B6B3A]">₹{b.totalAmount}</span>
                  <Link
                    to={`/booking/${b.id}`}
                    className="text-xs font-bold px-3 py-1.5 bg-[#1B6B3A] text-white hover:bg-[#145A2F] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Track Live Job</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── COMPLETED BOOKINGS HISTORY ───────────────────────────────────────── */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <FiCheckCircle className="text-emerald-600" /> Service History ({completedBookings.length})
        </h2>

        {completedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 text-xs text-gray-500">
            No completed bookings yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Service</th>
                    <th className="p-4">Worker / Co-op</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4">Welfare Fund</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedBookings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/70">
                      <td className="p-4 font-bold text-gray-900">{b.service?.name}</td>
                      <td className="p-4">
                        {b.worker ? `${b.worker.user?.firstName} (${b.worker.cooperative?.name?.slice(0, 12)}...)` : 'Co-op Worker'}
                      </td>
                      <td className="p-4 text-gray-500">{new Date(b.scheduledDate).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-[#1B6B3A]">₹{b.totalAmount}</td>
                      <td className="p-4 font-bold text-[#E8722A]">₹{b.cooperativeShare || Math.round(b.totalAmount * 0.1)}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setInvoiceModalBooking(b)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1B6B3A] border border-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="View and download tax invoice"
                          >
                            <FiFileText />
                            <span>Invoice</span>
                          </button>
                          <Link
                            to={`/booking/${b.id}`}
                            className="text-gray-500 hover:text-gray-900 font-bold px-2 py-1"
                          >
                            Track &rarr;
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Digital Tax Invoice Modal */}
      {invoiceModalBooking && (
        <DigitalInvoiceModal
          booking={invoiceModalBooking}
          onClose={() => setInvoiceModalBooking(null)}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
