/**
 * Simple Router
 * A lightweight router for SPA navigation
 */

// Store the current route for reference
let currentRoute = '/';

/**
 * Navigate to a specific route
 * @param {string} path - The path to navigate to
 * @param {Object} options - Navigation options
 * @param {boolean} options.replace - Whether to replace the current history entry
 * @param {Object} options.state - State to pass to the history entry
 */
export function navigateTo(path, options = {}) {
  const { replace = false, state = {} } = options;
  
  // Handle query parameters
  const queryParams = window.location.search;
  const fullPath = path + (queryParams && !path.includes('?') ? queryParams : '');
  
  // Update history
  if (replace) {
    window.history.replaceState(state, '', fullPath);
  } else {
    window.history.pushState(state, '', fullPath);
  }
  
  // Dispatch a custom event for components to react to
  const navigationEvent = new CustomEvent('navigationchange', {
    detail: { path: fullPath, previousPath: currentRoute }
  });
  
  window.dispatchEvent(navigationEvent);
  currentRoute = fullPath;
  
  // Scroll to top on navigation
  window.scrollTo(0, 0);
}

/**
 * Get URL parameters as an object
 * @param {string} url - URL to parse (defaults to current URL)
 * @returns {Object} - Object containing URL parameters
 */
export function getUrlParams(url = window.location.href) {
  const params = {};
  const searchParams = new URL(url).searchParams;
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Setup router event listeners
 */
export function setupRouter() {
  // Handle back/forward browser navigation
  window.addEventListener('popstate', () => {
    const navigationEvent = new CustomEvent('navigationchange', {
      detail: { path: window.location.pathname + window.location.search, previousPath: currentRoute }
    });
    
    window.dispatchEvent(navigationEvent);
    currentRoute = window.location.pathname + window.location.search;
  });
  
  // Initialize current route
  currentRoute = window.location.pathname + window.location.search;
  
  // Handle clicks on anchor tags
  document.addEventListener('click', (e) => {
    // Find closest anchor tag
    const anchor = e.target.closest('a');
    
    if (anchor && anchor.getAttribute('href') && 
        !anchor.getAttribute('target') && 
        !anchor.getAttribute('download') &&
        !anchor.getAttribute('rel')?.includes('external')) {
      
      const href = anchor.getAttribute('href');
      
      // Only handle internal links
      if (href.startsWith('/') || href.startsWith('#') || href === '') {
        e.preventDefault();
        navigateTo(href);
      }
    }
  });
  
  console.log('Router initialized');
  return true;
}