import toast from "react-hot-toast";

// Toast types
const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

// Common error messages
const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection and try again.",
  SERVER: "Server error. Please try again later.",
  AUTH: "Authentication error. Please log in again.",
  PERMISSION: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  DEFAULT: "Something went wrong. Please try again.",
};

// Icons for different toast types
const ICONS = {
  [TOAST_TYPES.SUCCESS]: "✓",
  [TOAST_TYPES.ERROR]: "✕",
  [TOAST_TYPES.WARNING]: "⚠️",
  [TOAST_TYPES.INFO]: "ℹ️",
};

/**
 * Show a success toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    duration: 3000,
    position: "top-center",
    ...options,
  });
};

/**
 * Show an error toast notification
 * @param {string|Error} error - The error message or Error object
 * @param {Object} options - Additional toast options
 */
export const showError = (error, options = {}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  
  toast.error(errorMessage || ERROR_MESSAGES.DEFAULT, {
    duration: 4000,
    position: "top-center",
    ...options,
  });
};

/**
 * Show an info toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showInfo = (message, options = {}) => {
  toast(message, {
    duration: 3000,
    position: "top-center",
    icon: ICONS[TOAST_TYPES.INFO],
    ...options,
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showWarning = (message, options = {}) => {
  toast(message, {
    duration: 4000,
    position: "top-center",
    style: {
      background: "#FEF3C7",
      color: "#92400E",
    },
    icon: ICONS[TOAST_TYPES.WARNING],
    ...options,
  });
};

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {Object} options - Additional error handling options
 */
export const handleApiError = (error, options = {}) => {
  console.error("API Error:", error);
  
  const { status } = error.response || {};
  let errorMessage = ERROR_MESSAGES.DEFAULT;
  
  // Handle different error status codes
  if (!navigator.onLine) {
    errorMessage = ERROR_MESSAGES.NETWORK;
  } else if (status === 401) {
    errorMessage = ERROR_MESSAGES.AUTH;
  } else if (status === 403) {
    errorMessage = ERROR_MESSAGES.PERMISSION;
  } else if (status === 404) {
    errorMessage = ERROR_MESSAGES.NOT_FOUND;
  } else if (status === 422 || status === 400) {
    errorMessage = ERROR_MESSAGES.VALIDATION;
  } else if (status >= 500) {
    errorMessage = ERROR_MESSAGES.SERVER;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  showError(errorMessage, options);
  return errorMessage;
};

/**
 * Show a loading toast notification
 * @param {string} message - The message to display while loading
 * @returns {Function} - Call this function to dismiss the toast
 */
export const showLoading = (message = "Loading...") => {
  return toast.loading(message, {
    position: "top-center",
  });
};

/**
 * Show a promise-based toast notification
 * @param {Promise} promise - The promise to track
 * @param {Object} messages - Object containing loading, success, and error messages
 * @param {Object} options - Additional toast options
 */
export const showPromise = (
  promise,
  messages = {
    loading: "Loading...",
    success: "Completed successfully!",
    error: ERROR_MESSAGES.DEFAULT,
  },
  options = {}
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: (err) => messages.error || handleApiError(err),
    },
    {
      position: "top-center",
      ...options,
    }
  );
};

export default {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
  showPromise,
  handleApiError,
  ERROR_MESSAGES,
}; 