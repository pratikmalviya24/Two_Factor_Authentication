import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
  status?: number;
  error?: string;
}

interface UseApiErrorReturn {
  error: string;
  loading: boolean;
  setError: (error: string) => void;
  handleError: (error: unknown) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useApiError = (): UseApiErrorReturn => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    console.log('Error response:', error);
    if (error instanceof Error) {
      setError(error.message);
    } else if (error instanceof AxiosError) {
      console.log('Axios error response:', error.response?.data);
      if (typeof error.response?.data === 'string') {
        setError(error.response.data);
      } else if (error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        setError(errorData.message || errorData.error || 'An error occurred');
      } else {
        setError('No response received from server');
      }
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError('');
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return {
    error,
    loading,
    setError,
    handleError,
    startLoading,
    stopLoading
  };
};

export default useApiError;
