/**
 * API Helper functions for consistent API interactions
 */

// Default timeout for API requests (10 seconds)
const DEFAULT_TIMEOUT = 10000;

/**
 * Creates a timeout promise that rejects after specified milliseconds
 * @param {number} ms - Milliseconds before timeout
 * @returns {Promise} - A promise that rejects after the specified time
 */
const timeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * Fetch with timeout and error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} - Response promise
 */
export const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT) => {
  try {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutPromise = timeout(timeoutMs);
    const fetchPromise = fetch(url, { ...options, signal });
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // Enhance error with additional context
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} was aborted`);
    }
    
    // Add request URL to error for better debugging
    error.url = url;
    throw error;
  }
};

/**
 * Handles API errors consistently
 * @param {Error} error - The error object
 * @param {Function} toastFn - Toast function for displaying errors
 * @returns {void}
 */
export const handleApiError = (error, toastFn) => {
  console.error('API Error:', error);
  
  // Display user-friendly error message
  if (toastFn) {
    toastFn({
      title: 'Error',
      description: getErrorMessage(error),
      variant: 'destructive',
    });
  }
};

/**
 * Gets a user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }
  
  if (error.message.includes('timed out')) {
    return 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.';
  }
  
  if (error.message.includes('API Error 401')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  
  if (error.message.includes('API Error 403')) {
    return 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
  }
  
  if (error.message.includes('API Error 404')) {
    return 'Data yang diminta tidak ditemukan.';
  }
  
  if (error.message.includes('API Error 500')) {
    return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
  }
  
  return error.message || 'Terjadi kesalahan. Silakan coba lagi.';
};

/**
 * Retries a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Result of the function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 300) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error.message.includes('API Error 401') || 
          error.message.includes('API Error 403') ||
          error.message.includes('API Error 404')) {
        throw error;
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};