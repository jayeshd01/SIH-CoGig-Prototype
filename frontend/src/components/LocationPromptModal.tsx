import React from 'react';
import { useLocation, PUNE_PRESETS } from '../contexts/LocationContext';
import {
  FiMapPin,
  FiNavigation,
  FiX,
  FiCheck,
  FiCompass,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';

const LocationPromptModal: React.FC = () => {
  const {
    location,
    isPromptOpen,
    isLocating,
    error,
    closePrompt,
    requestDeviceLocation,
    setManualLocation,
  } = useLocation();

  if (!isPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden space-y-5 p-6 sm:p-7 relative">
        {/* Close Button */}
        <button
          onClick={closePrompt}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="text-lg" />
        </button>

        {/* Google Maps Styled Beacon & Radar */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-2xl shadow-xs">
              <FiNavigation className="rotate-45" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a73e8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#1a73e8]"></span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1a73e8] block">
              Google Location Services
            </span>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              Turn on device location?
            </h3>
          </div>
        </div>

        {/* Description Body */}
        <p className="text-xs text-gray-600 leading-relaxed">
          CoGig uses Google Maps and device location to find certified cooperative workers nearest to your doorstep, calculate fair travel times, and provide real-time turn-by-turn navigation.
        </p>

        {/* Error notice if permission denied */}
        {error && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <FiAlertCircle className="text-amber-600 text-base shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Notice:</p>
              <p className="text-[11px] text-amber-800">{error}</p>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={() => requestDeviceLocation()}
          disabled={isLocating}
          className="w-full py-3 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Detecting GPS Coordinates...</span>
            </>
          ) : (
            <>
              <FiNavigation />
              <span>Turn On Location (Use Device GPS)</span>
            </>
          )}
        </button>

        {/* Quick Area Presets */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Or Choose Your Pune Neighborhood:
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
              <FiShield /> 6 Co-op Hubs Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
            {PUNE_PRESETS.map((preset) => {
              const isSelected = location.neighborhood === preset.neighborhood;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setManualLocation(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-1.5 ${
                    isSelected
                      ? 'border-[#1B6B3A] bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/60 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold leading-tight">{preset.neighborhood.split('(')[0]}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">Pune</div>
                  </div>
                  {isSelected && <FiCheck className="text-[#1B6B3A] shrink-0 text-xs mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary / Dismiss */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[10px] text-gray-400">
            Current: {location.neighborhood}
          </span>
          <button
            type="button"
            onClick={closePrompt}
            className="text-gray-500 hover:text-gray-800 font-bold text-xs cursor-pointer py-1 px-2 rounded hover:bg-gray-100 transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPromptModal;
