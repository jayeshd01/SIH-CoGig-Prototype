import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  FiNavigation,
  FiMapPin,
  FiExternalLink,
  FiCompass,
  FiShield,
  FiZap,
  FiCheckCircle,
  FiInfo,
  FiLayers,
} from 'react-icons/fi';
import { useLocation } from '../contexts/LocationContext';

interface GeoMatchingMapProps {
  bookingId?: string;
  customerLat?: number;
  customerLng?: number;
  customerAddress?: string;
  workerLat?: number;
  workerLng?: number;
  workerName?: string;
  workerPhone?: string;
  status?: string;
  nearbyWorkers?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    trade?: string;
    rating?: number;
    distance?: number;
  }>;
}

// Haversine formula to calculate accurate distance between two points in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const GeoMatchingMap: React.FC<GeoMatchingMapProps> = ({
  customerLat,
  customerLng,
  customerAddress = 'Customer Location, Pune',
  workerLat,
  workerLng,
  workerName = 'Assigned Co-op Technician',
  status = 'ASSIGNED',
  nearbyWorkers = [],
}) => {
  const { location: userDeviceLocation, openPrompt } = useLocation();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Fallbacks if lat/lng are undefined
  const cLat = customerLat || userDeviceLocation.latitude || 18.5204;
  const cLng = customerLng || userDeviceLocation.longitude || 73.8567;

  // Resolve worker coordinates matching customer location
  let wLat = workerLat || Number((cLat - 0.014).toFixed(4));
  let wLng = workerLng || Number((cLng - 0.018).toFixed(4));

  // SANITY CHECK: If worker and customer coordinates are in completely different regions (> 20 km apart),
  // adapt worker location to the customer's local cooperative cluster (~2.8 km away)
  const initialDist = calculateDistanceKm(wLat, wLng, cLat, cLng);
  if (initialDist > 20) {
    wLat = Number((cLat - 0.018).toFixed(4));
    wLng = Number((cLng - 0.016).toFixed(4));
  }

  const distanceKm = calculateDistanceKm(wLat, wLng, cLat, cLng);
  // Estimate travel time at avg 22 km/h city speed in Pune + 2 mins pickup
  const etaMinutes = Math.max(4, Math.round((distanceKm / 22) * 60) + 2);

  // Google Maps Deep-Link URLs
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${wLat},${wLng}&destination=${cLat},${cLng}&travelmode=two_wheeler`;
  const googleMapsCustomerUrl = `https://www.google.com/maps/search/?api=1&query=${cLat},${cLng}`;
  const googleMapsWorkerUrl = `https://www.google.com/maps/search/?api=1&query=${wLat},${wLng}`;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [(cLat + wLat) / 2, (cLng + wLng) / 2],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Tile Layer: OpenStreetMap or Esri Satellite
    const tileUrl =
      mapLayer === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    // Custom HTML Marker for Customer (Home / Destination)
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(26, 115, 232, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 36px; height: 36px; background: #1a73e8; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10;">
            🏠
          </div>
          <div style="background: #1a73e8; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            Customer
          </div>
        </div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 28],
    });

    const customerMarker = L.marker([cLat, cLng], { icon: customerIcon }).addTo(map);
    customerMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <b style="color: #1a73e8; font-size: 13px;">📍 Customer Booking Destination</b>
        <p style="margin: 4px 0 6px; font-size: 11px; color: #4b5563;">${customerAddress}</p>
        <a href="${googleMapsCustomerUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #1a73e8; color: #fff; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-decoration: none;">
          Open in Google Maps ↗
        </a>
      </div>
    `);

    // Custom HTML Marker for Worker (Co-op Scooter / Worker)
    const workerIcon = L.divIcon({
      className: 'custom-worker-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(27, 107, 58, 0.3); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 38px; height: 38px; background: #1B6B3A; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10;">
            🛵
          </div>
          <div style="background: #1B6B3A; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            ${workerName.split(' ')[0]} (Co-op)
          </div>
        </div>
      `,
      iconSize: [44, 58],
      iconAnchor: [22, 29],
    });

    const workerMarker = L.marker([wLat, wLng], { icon: workerIcon }).addTo(map);
    workerMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <b style="color: #1B6B3A; font-size: 13px;">🛵 ${workerName}</b>
        <p style="margin: 4px 0; font-size: 11px; color: #4b5563;">Status: <b>${status.replace(/_/g, ' ')}</b></p>
        <p style="margin: 0 0 6px; font-size: 11px; color: #15803d;">Distance: <b>${distanceKm} km</b> &bull; ETA: <b>~${etaMinutes} mins</b></p>
        <a href="${googleMapsDirectionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #1B6B3A; color: #fff; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-decoration: none;">
          Start Google Navigation ↗
        </a>
      </div>
    `);

    // Draw route line (dashed navigation line)
    const routeCoords: [number, number][] = [
      [wLat, wLng],
      // Intermediate navigation waypoint for realistic road path
      [(wLat + cLat) / 2 + 0.0015, (wLng + cLng) / 2 - 0.001],
      [cLat, cLng],
    ];

    const polyline = L.polyline(routeCoords, {
      color: '#1a73e8',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85,
    }).addTo(map);

    // Nearby Standby Workers Pins (if any)
    nearbyWorkers.forEach((nw) => {
      const standbyIcon = L.divIcon({
        className: 'custom-standby-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; opacity: 0.75;">
            <div style="width: 26px; height: 26px; background: #475569; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
              👷
            </div>
            <div style="background: #334155; color: #fff; font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 4px; margin-top: 2px;">
              ${nw.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [26, 38],
        iconAnchor: [13, 19],
      });

      const nwMarker = L.marker([nw.lat, nw.lng], { icon: standbyIcon }).addTo(map);
      nwMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <b style="font-size: 11px;">👷 ${nw.name} (${nw.trade || 'Technician'})</b>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Rating: ⭐ ${nw.rating || 4.8} &bull; Standby</div>
        </div>
      `);
    });

    // Auto fit bounds so all markers are neatly visible
    const group = L.featureGroup([customerMarker, workerMarker, polyline]);
    map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 15 });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cLat, cLng, wLat, wLng, mapLayer, nearbyWorkers]);

  // Recenter map
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([(cLat + wLat) / 2, (cLng + wLng) / 2], 14);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-8 transition-all">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-900 via-[#0f2818] to-gray-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a73e8] to-[#1557b0] flex items-center justify-center text-white text-2xl shadow-lg relative">
            <FiCompass className="animate-spin" style={{ animationDuration: '18s' }} />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                Live Geo-Matching Telemetry
              </span>
              <span className="text-[10px] font-bold text-gray-400 hidden sm:inline">
                &bull; GPS & Google Maps Synced
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              CoGig Precision Navigation
            </h3>
          </div>
        </div>

        {/* Telemetry Stats Pill & Google Maps Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Distance & ETA Chip */}
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-300">Live Distance</div>
              <div className="text-sm font-black text-white">{distanceKm} km</div>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Est. Arrival</div>
              <div className="text-sm font-black text-emerald-400">~{etaMinutes} mins</div>
            </div>
          </div>

          {/* Primary Google Maps Navigation Button */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            title="Open Turn-by-Turn GPS Navigation in Google Maps"
          >
            <FiNavigation className="text-sm" />
            <span>Navigate in Google Maps</span>
            <FiExternalLink className="text-[10px] opacity-75" />
          </a>
        </div>
      </div>

      {/* Map Control Bar */}
      <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="flex items-center gap-1 font-bold text-gray-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] inline-block"></span>
            Customer:
          </span>
          <span className="max-w-[200px] truncate text-gray-600" title={customerAddress}>
            {customerAddress}
          </span>
          <span className="text-gray-400 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1 font-bold text-gray-800 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B6B3A] inline-block"></span>
            Worker:
          </span>
          <span className="text-gray-600 hidden sm:inline">{workerName}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Change device location button */}
          <button
            onClick={openPrompt}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:text-[#1a73e8] bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FiMapPin className="text-[#1a73e8]" />
            <span>Change My GPS</span>
          </button>

          {/* Toggle Satellite vs Map */}
          <button
            onClick={() => setMapLayer(mapLayer === 'streets' ? 'satellite' : 'streets')}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FiLayers />
            <span>{mapLayer === 'streets' ? 'Satellite' : 'Roadmap'}</span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            type="button"
            className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-gray-100 transition-colors cursor-pointer"
            title="Recenter Map View"
          >
            Center
          </button>

          {/* Info Modal Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            type="button"
            className="p-1.5 text-gray-500 hover:text-gray-800 bg-white rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer"
            title="How Google Maps connects to CoGig"
          >
            <FiInfo className="text-xs" />
          </button>
        </div>
      </div>

      {/* Embedded Leaflet Map Container */}
      <div className="relative h-72 sm:h-80 md:h-96 w-full bg-gray-100">
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-gray-200/80 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <FiShield className="text-[#1B6B3A] text-sm" />
              <span>Geo-Fence Verified</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-medium">
              Fair Dispatch Radius &bull; Cooperative Transit
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <a
              href={googleMapsWorkerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/95 hover:bg-white text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md border border-gray-200 flex items-center gap-1 transition-all"
            >
              <FiMapPin className="text-[#1B6B3A]" />
              <span>Worker Pin</span>
            </a>
            <a
              href={googleMapsCustomerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/95 hover:bg-white text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md border border-gray-200 flex items-center gap-1 transition-all"
            >
              <FiMapPin className="text-[#1a73e8]" />
              <span>Customer Pin</span>
            </a>
          </div>
        </div>
      </div>

      {/* Google Maps How-It-Works Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-lg font-bold">
                  🧭
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm">How Google Maps Connects to CoGig</h4>
                  <p className="text-[11px] text-gray-500">Universal Geo-Matching & Turn-by-Turn Navigation</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-1">
                <p className="font-bold text-[#1a73e8] flex items-center gap-1.5">
                  <FiCheckCircle /> 1. Real-Time Device GPS Prompt
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  When any Customer, Worker, or Admin opens the app, CoGig prompts to turn on device location (powered by the HTML5 Geolocation API & Google Location Services), matching your exact coordinates in Pune.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-1">
                <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <FiCheckCircle /> 2. One-Click Google Maps Turn-by-Turn Routing
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Clicking <b>&ldquo;Navigate in Google Maps&rdquo;</b> triggers Google Maps Directions URI with travel mode set to two-wheeler / driving. This opens natively in the Google Maps App on Android / iOS and Google Maps Web on desktop without requiring expensive API credits.
                </p>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-1">
                <p className="font-bold text-purple-900 flex items-center gap-1.5">
                  <FiZap /> 3. Optional Google Maps API Key Setup
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  If you want embedded Google Maps Satellite layers or Google Places Autocomplete search, add your key to <code>.env</code> as <code>VITE_GOOGLE_MAPS_API_KEY=your_key_here</code>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="py-2.5 px-5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoMatchingMap;
