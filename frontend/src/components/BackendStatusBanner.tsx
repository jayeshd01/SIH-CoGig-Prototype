import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { FiAlertTriangle, FiRefreshCw, FiCheckCircle, FiX } from 'react-icons/fi';

export const BackendStatusBanner: React.FC = () => {
  const [isBackendDown, setIsBackendDown] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [retrySuccess, setRetrySuccess] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('dismiss_backend_banner') === 'true';
  });

  // Only consider showing connection alert in local development environments
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.'));

  const checkConnection = useCallback(async () => {
    // Never show on remote production hosts (e.g. netlify.app)
    if (!isLocalhost) {
      setIsBackendDown(false);
      return;
    }

    setIsChecking(true);
    setRetrySuccess(false);
    try {
      // Fast lightweight ping to backend services or health
      const res = await api.get('/services', { timeout: 3500 });
      if (Array.isArray(res.data)) {
        setIsBackendDown(false);
        setRetrySuccess(true);
        setTimeout(() => setRetrySuccess(false), 3000);
      } else {
        setIsBackendDown(true);
      }
    } catch (err: any) {
      setIsBackendDown(true);
    } finally {
      setIsChecking(false);
    }
  }, [isLocalhost]);

  useEffect(() => {
    if (isLocalhost) {
      checkConnection();
    }
  }, [checkConnection, isLocalhost]);

  // If not running on localhost or dismissed by user, do not render
  if (!isLocalhost || isDismissed) {
    return null;
  }

  if (retrySuccess) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 transition-all">
        <FiCheckCircle className="text-sm" />
        <span>Connected to Sahyog Backend API successfully!</span>
      </div>
    );
  }

  if (!isBackendDown) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 text-xs shadow-inner flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30 transition-all">
      <div className="flex items-center gap-2">
        <FiAlertTriangle className="text-base flex-shrink-0 text-amber-100" />
        <span className="font-medium">
          Local backend server is not running on port 3000. Operating in standalone demo mode.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-amber-900 font-bold text-xs rounded-md shadow-2xs hover:bg-amber-50 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={isChecking ? 'animate-spin' : ''} />
          <span>{isChecking ? 'Checking...' : 'Retry Connection'}</span>
        </button>
        <button
          onClick={() => {
            setIsDismissed(true);
            sessionStorage.setItem('dismiss_backend_banner', 'true');
          }}
          className="p-1 text-white/80 hover:text-white transition cursor-pointer"
          title="Dismiss"
        >
          <FiX className="text-base" />
        </button>
      </div>
    </div>
  );
};

export default BackendStatusBanner;
