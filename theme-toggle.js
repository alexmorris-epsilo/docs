(function() {
  'use strict';

  // Storage keys - Mintlify might use its own key
  const THEME_STORAGE_KEY = 'mintlify-theme-preference';
  const MINTLIFY_THEME_KEY = 'theme'; // Common key used by many apps

  /**
   * Find and click Mintlify's theme toggle button
   */
  function clickThemeToggleButton() {
    // Try various selectors for the theme toggle button
    const selectors = [
      'button[aria-label*="theme"]',
      'button[aria-label*="dark"]',
      'button[aria-label*="light"]',
      'button[aria-label*="mode"]',
      '[data-testid*="theme"]',
      '[data-testid*="toggle"]',
      '.theme-toggle',
      '[class*="theme-toggle"]',
      '[class*="mode-toggle"]'
    ];

    // Try selectors first
    for (const selector of selectors) {
      try {
        const button = document.querySelector(selector);
        if (button && button.offsetParent !== null) { // Check if visible
          button.click();
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    // Try finding buttons with sun/moon icons (without :has() selector)
    try {
      const allButtons = document.querySelectorAll('button');
      for (const button of allButtons) {
        if (button.offsetParent === null) continue; // Skip hidden buttons
        
        const svg = button.querySelector('svg');
        if (svg) {
          const svgHTML = svg.outerHTML.toLowerCase();
          // Check for sun or moon icon indicators
          if (svgHTML.includes('sun') || svgHTML.includes('moon') || 
              svgHTML.includes('light') || svgHTML.includes('dark')) {
            button.click();
            return true;
          }
        }
      }
    } catch (e) {
      // Continue to fallback
    }

    return false;
  }

  /**
   * Toggle between dark and light mode using comprehensive approach
   */
  function toggleTheme() {
    try {
      const html = document.documentElement;
      const body = document.body;
      const isDark = html.classList.contains('dark') || 
                     html.getAttribute('data-theme') === 'dark' ||
                     body.classList.contains('dark');
      
      if (isDark) {
        // Switch to light mode
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
        body.classList.remove('dark');
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
        localStorage.setItem(MINTLIFY_THEME_KEY, 'light');
      } else {
        // Switch to dark mode
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
        body.classList.add('dark');
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        localStorage.setItem(MINTLIFY_THEME_KEY, 'dark');
      }

      // Dispatch a custom event that Mintlify might listen to
      const themeChangeEvent = new CustomEvent('themechange', {
        detail: { theme: isDark ? 'light' : 'dark' }
      });
      document.dispatchEvent(themeChangeEvent);
      window.dispatchEvent(themeChangeEvent);

      // Force a reflow to ensure styles are recalculated
      void html.offsetHeight;
    } catch (error) {
      // Silently fail if localStorage is not available or other errors occur
      console.warn('Theme toggle failed:', error);
    }
  }

  /**
   * Apply saved theme preference on page load
   */
  function applySavedTheme() {
    try {
      // Check both storage keys
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 
                        localStorage.getItem(MINTLIFY_THEME_KEY);
      
      if (savedTheme) {
        const html = document.documentElement;
        const body = document.body;
        
        if (savedTheme === 'dark') {
          html.classList.add('dark');
          html.setAttribute('data-theme', 'dark');
          body.classList.add('dark');
        } else {
          html.classList.remove('dark');
          html.setAttribute('data-theme', 'light');
          body.classList.remove('dark');
        }
      }
    } catch (error) {
      // Silently fail if localStorage is not available
      console.warn('Could not apply saved theme:', error);
    }
  }

  /**
   * Handle keyboard shortcut CTRL+SHIFT+L
   */
  function handleKeyboardShortcut(event) {
    // Check for CTRL+SHIFT+L (case-insensitive)
    if (
      (event.ctrlKey || event.metaKey) && // Support both Ctrl (Windows/Linux) and Cmd (Mac)
      event.shiftKey &&
      (event.key === 'L' || event.key === 'l' || event.keyCode === 76)
    ) {
      event.preventDefault();
      event.stopPropagation();
      
      // First try to click Mintlify's theme toggle button (if it exists)
      // This ensures React state updates properly
      const buttonClicked = clickThemeToggleButton();
      
      // If no button found, use manual toggle as fallback
      if (!buttonClicked) {
        toggleTheme();
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applySavedTheme();
      document.addEventListener('keydown', handleKeyboardShortcut);
    });
  } else {
    // DOM is already ready
    applySavedTheme();
    document.addEventListener('keydown', handleKeyboardShortcut);
  }
})();

