/**
 * Refresh Handler
 * Handles page refresh and navigation to maintain state and prevent data loss
 */

export default function setupRefreshHandler() {
  if (typeof window === 'undefined') return;

  // Store form data before unload/refresh
  window.addEventListener('beforeunload', (e) => {
    // Get any active forms that might have unsaved data
    const forms = document.querySelectorAll('form[data-prevent-refresh="true"]');
    
    if (forms.length > 0) {
      // Check if any form has been modified
      let hasUnsavedChanges = false;
      
      forms.forEach(form => {
        const formElements = form.elements;
        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i];
          if (element.type !== 'submit' && element.type !== 'button' && element.value) {
            hasUnsavedChanges = true;
            break;
          }
        }
      });
      
      if (hasUnsavedChanges) {
        // Standard way of showing a confirmation dialog
        e.preventDefault();
        e.returnValue = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?';
        return e.returnValue;
      }
    }
  });

  // Handle back/forward navigation
  window.addEventListener('popstate', (e) => {
    // Custom logic for handling back/forward navigation if needed
    console.log('Navigation state changed:', e.state);
  });

  console.log('Refresh handler initialized');
  return true;
}