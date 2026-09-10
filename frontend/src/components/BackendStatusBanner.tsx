import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { FiAlertTriangle, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

export const BackendStatusBanner: React.FC = () => {
  const [isBackendDown, setIsBackendDown] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [retrySuccess, setRetrySuccess] = useState<boolean>(false);

  const checkConnection = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // Initial check on load
    checkConnection();
  }, [checkConnection]);

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
          Unable to connect to the service. Please make sure the backend server is running (port 3000).
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
      </div>
    </div>
  );
};

export default BackendStatusBanner;
