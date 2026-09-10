import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: string;
  city: string;
  accuracy?: number;
  source: 'GPS' | 'MANUAL' | 'DEFAULT';
}

export interface CityPreset {
  name: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  description: string;
}

export const PUNE_PRESETS: CityPreset[] = [
  {
    name: 'Shivaji Nagar, Pune',
    neighborhood: 'Shivaji Nagar (Central Hub)',
    latitude: 18.5204,
    longitude: 73.8567,
    description: 'Pune District Court & Metro Interchange',
  },
  {
    name: 'Kothrud, Pune',
    neighborhood: 'Kothrud (West Guild)',
    latitude: 18.5074,
    longitude: 73.8077,
    description: 'Near Paud Road & Vanaz Co-op Cluster',
  },
  {
    name: 'FC Road / Deccan, Pune',
    neighborhood: 'FC Road & Deccan Gymkhana',
    latitude: 18.5246,
    longitude: 73.8415,
    description: 'Fergusson College & Deccan Hub',
  },
  {
    name: 'Viman Nagar, Pune',
    neighborhood: 'Viman Nagar (East Hub)',
    latitude: 18.5679,
    longitude: 73.9143,
    description: 'Near Phoenix & Airport Corridor',
  },
  {
    name: 'Baner / Aundh, Pune',
    neighborhood: 'Baner & Aundh Belt',
    latitude: 18.559,
    longitude: 73.7868,
    description: 'Balewadi High Street & IT Guilds',
  },
  {
    name: 'Hadapsar / Magarpatta, Pune',
    neighborhood: 'Hadapsar (South-East Hub)',
    latitude: 18.5089,
    longitude: 73.9259,
    description: 'Magarpatta City & Industrial Workers Guild',
  },
];

interface LocationContextType {
  location: UserLocation;
  isPromptOpen: boolean;
  isLocating: boolean;
  hasPermission: boolean;
  error: string | null;
  openPrompt: () => void;
  closePrompt: () => void;
  requestDeviceLocation: () => Promise<UserLocation | null>;
  setManualLocation: (preset: CityPreset) => void;
  setCustomCoords: (lat: number, lng: number, address: string) => void;
}

const DEFAULT_LOCATION: UserLocation = {
  latitude: 18.5204,
  longitude: 73.8567,
  address: '45, MG Road, Shivaji Nagar, Pune, Maharashtra 411005',
  neighborhood: 'Shivaji Nagar',
  city: 'Pune',
  source: 'DEFAULT',
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('cogig_user_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_LOCATION;
  });

  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if initial Google Maps-style location prompt should show on first app visit
  useEffect(() => {
    const prompted = localStorage.getItem('cogig_location_prompted');
    if (!prompted) {
      // Delay slightly for smooth initial mount before popping up Google Maps prompt
      const timer = setTimeout(() => {
        setIsPromptOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const openPrompt = () => {
    setIsPromptOpen(true);
    setError(null);
  };

  const closePrompt = () => {
    setIsPromptOpen(false);
    localStorage.setItem('cogig_location_prompted', 'true');
  };

  // Request browser geolocation (HTML5 Geolocation API / Google Location Services)
  const requestDeviceLocation = (): Promise<UserLocation | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your current browser.');
        resolve(null);
        return;
      }

      setIsLocating(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          let address = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E, Pune`;
          let neighborhood = 'Current GPS Location';

          // Try reverse geocoding via OpenStreetMap / BigDataCloud free reverse API
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
              { headers: { 'User-Agent': 'CoGig-Cooperative-App' } }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                address = data.display_name;
                neighborhood =
                  data.address?.suburb ||
                  data.address?.neighbourhood ||
                  data.address?.city_district ||
                  data.address?.city ||
                  'Pune';
              }
            }
          } catch (e) {
            // Keep default coordinate string on network failure
          }

          const newLoc: UserLocation = {
            latitude: lat,
            longitude: lng,
            address,
            neighborhood,
            city: 'Pune',
            accuracy,
            source: 'GPS',
          };

          setLocation(newLoc);
          setHasPermission(true);
          setIsLocating(false);
          localStorage.setItem('cogig_user_location', JSON.stringify(newLoc));
          localStorage.setItem('cogig_location_prompted', 'true');
          setIsPromptOpen(false);
          resolve(newLoc);
        },
        (geoError) => {
          setIsLocating(false);
          let msg = 'Unable to retrieve location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            msg = 'Location permission was denied. You can select a neighborhood below.';
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            msg = 'Location signal unavailable. Using selected neighborhood.';
          } else if (geoError.code === geoError.TIMEOUT) {
            msg = 'Location request timed out. Using selected neighborhood.';
          }
          setError(msg);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000,
        }
      );
    });
  };

  const setManualLocation = (preset: CityPreset) => {
    const newLoc: UserLocation = {
      latitude: preset.latitude,
      longitude: preset.longitude,
      address: `${preset.name}, Maharashtra`,
      neighborhood: preset.neighborhood,
      city: 'Pune',
      source: 'MANUAL',
    };
    setLocation(newLoc);
    localStorage.setItem('cogig_user_location', JSON.stringify(newLoc));
    localStorage.setItem('cogig_location_prompted', 'true');
    setIsPromptOpen(false);
  };

  const setCustomCoords = (latitude: number, longitude: number, address: string) => {
    const newLoc: UserLocation = {
      latitude,
      longitude,
      address,
      neighborhood: address.split(',')[0] || 'Custom',
      city: 'Pune',
      source: 'MANUAL',
    };
    setLocation(newLoc);
    localStorage.setItem('cogig_user_location', JSON.stringify(newLoc));
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isPromptOpen,
        isLocating,
        hasPermission,
        error,
        openPrompt,
        closePrompt,
        requestDeviceLocation,
        setManualLocation,
        setCustomCoords,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
