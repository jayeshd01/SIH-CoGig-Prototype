import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Worker, Service } from '../types';
import {
  FiShield,
  FiCheckCircle,
  FiStar,
  FiAward,
  FiHeart,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUserCheck,
} from 'react-icons/fi';
import BookingModal from '../components/BookingModal';

import { DEFAULT_WORKERS } from '../data/mockData';

const WorkerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        setLoading(true);
        const [workerRes, reviewsRes] = await Promise.allSettled([
          api.get(`/workers/${id}`),
          api.get(`/ratings/worker/${id}`),
        ]);

        if (workerRes.status === 'fulfilled' && workerRes.value?.data && typeof workerRes.value.data === 'object' && !Array.isArray(workerRes.value.data)) {
          setWorker(workerRes.value.data);
        } else {
          const fallback = DEFAULT_WORKERS.find((w) => w.id === id) || DEFAULT_WORKERS[0];
          setWorker(fallback);
        }

        if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value?.data)) {
          setReviews(reviewsRes.value.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching worker profile, using fallback', err);
        const fallback = DEFAULT_WORKERS.find((w) => w.id === id) || DEFAULT_WORKERS[0];
        setWorker(fallback);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchWorkerData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#1B6B3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-gray-500">Loading worker profile...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Worker profile not found</h2>
        <Link to="/workers" className="text-xs font-bold text-[#1B6B3A] underline">
          &larr; Back to Worker Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        to="/workers"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        &larr; Back to Workers Directory
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1B6B3A] to-[#2A8F4F] text-white font-black text-3xl flex items-center justify-center shadow-md">
              {worker.user?.firstName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">
                  {worker.user?.firstName} {worker.user?.lastName}
                </h1>
                <FiCheckCircle className="text-emerald-600 text-lg" title="Certified Worker" />
              </div>
              <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block">
                Member of {worker.cooperative?.name || 'Labour Cooperative Federation'}
              </p>
              <div className="text-xs text-gray-500 flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1">
                  <FiMapPin /> {worker.addressText || 'Pune, Maharashtra'}
                </span>
                <span>&bull;</span>
                <span>Languages: {worker.languages || 'Hindi, Marathi'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-xs text-gray-400 font-semibold">Verification Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
              <FiShield /> {worker.verificationStatus}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <span className="text-xs text-gray-400 font-semibold block">Experience</span>
            <span className="text-2xl font-black text-gray-900">{worker.experience} Years</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <span className="text-xs text-gray-400 font-semibold block">Rating</span>
            <span className="text-2xl font-black text-gray-900 flex items-center justify-center gap-1">
              <FiStar className="text-amber-500 fill-amber-500 text-lg" /> {worker.averageRating || 4.8}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <span className="text-xs text-gray-400 font-semibold block">Services Done</span>
            <span className="text-2xl font-black text-[#1B6B3A]">{worker.totalJobs}</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <span className="text-xs text-gray-400 font-semibold block">Accident Insurance</span>
            <span className="text-2xl font-black text-blue-700">₹5 Lakhs</span>
          </div>
        </div>

        {/* About Bio */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Professional Bio</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {worker.bio ||
              'Certified trade technician affiliated with Maharashtra State Labour Cooperative. Trained in modern electrical, plumbing, and safety protocols with extensive residential experience.'}
          </p>
        </div>

        {/* Certified Skills & Direct Booking Cards */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Verified Skills & Direct Booking
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {worker.skills?.map((ws) => (
              <div
                key={ws.id}
                className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-black text-gray-900">{ws.service.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-sm">
                      Level: {ws.level}
                    </span>
                    <span className="text-xs font-black text-[#1B6B3A]">₹{ws.service.basePrice}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(ws.service)}
                  className="px-4 py-2 bg-[#1B6B3A] hover:bg-[#145A2F] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Book with {worker.user?.firstName}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cooperative Welfare & Social Security Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 rounded-2xl border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
            <FiHeart className="text-orange-600" />
            <span>Cooperative Welfare & Social Protection</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-amber-950">
            <div>
              <span className="text-amber-800/80 block text-[10px] font-bold uppercase">Pension Fund</span>
              <span className="font-bold text-sm">Co-op Defined Contribution</span>
            </div>
            <div>
              <span className="text-amber-800/80 block text-[10px] font-bold uppercase">Health Coverage</span>
              <span className="font-bold text-sm">₹2 Lakhs Annual Hospitalization</span>
            </div>
            <div>
              <span className="text-amber-800/80 block text-[10px] font-bold uppercase">Accidental Cover</span>
              <span className="font-bold text-sm">₹5 Lakhs Active Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <h3 className="text-base font-black text-gray-900">
          Customer Reviews & Verified Ratings ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No public customer reviews yet for this worker.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{rev.customerName || 'Verified Household'}</span>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                    {Array.from({ length: rev.score || 5 }).map((_, i) => (
                      <FiStar key={i} className="fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{rev.comment || 'Punctual, skilled, and polite service.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          worker={worker}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};

export default WorkerProfile;
