import { useState, useCallback } from 'react';
import { message } from 'antd';

/**
 * Hook for handling async operations with loading states
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, successMessage = null) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      
      if (successMessage) {
        message.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra';
      setError(err);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook for managing form states
 */
export const useFormState = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const setError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    dirty,
    setValue,
    setError,
    setErrors,
    reset
  };
};

export default {
  useAsyncOperation,
  useFormState
};
