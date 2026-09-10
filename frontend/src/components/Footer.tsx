import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiHeart, FiPhone, FiMail, FiMapPin, FiExternalLink } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-stone-800">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1B6B3A] text-white flex items-center justify-center font-black text-xl">
                C
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                CoGig <span className="text-xs bg-[#E8722A] text-white px-2 py-0.5 rounded-sm uppercase">Co-op</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              India’s first cooperative-owned digital gig marketplace connecting certified labour cooperative federations with households and enterprises. Ensuring fair wages, dignity of labour, and worker welfare.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-800/80 p-3 rounded-xl border border-stone-700/60 max-w-sm">
              <FiShield className="text-emerald-400 text-lg shrink-0" />
              <span>Multi-State Cooperative Societies Act Registered &bull; 100% Worker Protected</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services?cat=electrician" className="hover:text-emerald-400 transition-colors">
                  Electrician Services
                </Link>
              </li>
              <li>
                <Link to="/services?cat=plumber" className="hover:text-emerald-400 transition-colors">
                  Plumbing Solutions
                </Link>
              </li>
              <li>
                <Link to="/services?cat=carpenter" className="hover:text-emerald-400 transition-colors">
                  Carpentry & Woodwork
                </Link>
              </li>
              <li>
                <Link to="/services?cat=cleaning" className="hover:text-emerald-400 transition-colors">
                  Deep Cleaning
                </Link>
              </li>
              <li>
                <Link to="/services?cat=caregiver" className="hover:text-emerald-400 transition-colors">
                  Elderly & Child Care
                </Link>
              </li>
              <li>
                <Link to="/services?cat=appliance" className="hover:text-emerald-400 transition-colors">
                  Appliance Repair
                </Link>
              </li>
            </ul>
          </div>

          {/* Cooperative Network */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Cooperative Welfare</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/welfare" className="hover:text-emerald-400 transition-colors">
                  Welfare Fund Ledger
                </Link>
              </li>
              <li>
                <Link to="/about-cooperative" className="hover:text-emerald-400 transition-colors">
                  80-90% Wage Guarantee
                </Link>
              </li>
              <li>
                <Link to="/about-cooperative" className="hover:text-emerald-400 transition-colors">
                  Accident Cover (₹5 Lakhs)
                </Link>
              </li>
              <li>
                <Link to="/about-cooperative" className="hover:text-emerald-400 transition-colors">
                  Democratized Dispute Tribunal
                </Link>
              </li>
              <li>
                <Link to="/register?role=worker" className="hover:text-emerald-400 transition-colors text-amber-400 font-semibold">
                  Register as Co-op Worker &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Federation Helpdesk</h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <FiPhone className="text-emerald-400" />
                <span>1800-889-COOP (Toll-Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-[#E8722A] shrink-0" />
                <span>support@cogig.coop</span>
              </div>
              <div className="flex items-start gap-2">
                <FiMapPin className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Shakti Labour Federation Bhawan, Shivaji Nagar, Pune 411005</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>&copy; {new Date().getFullYear()} CoGig Labour Cooperative Federation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built for Worker Dignity</span>
            <span>Zero Exploitation Protocol</span>
            <span>Made with <FiHeart className="inline text-red-500" /> in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
