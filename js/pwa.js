/**
 * Clinic Payment Management System - Progressive Web App (PWA) Controller
 * Service worker registration, install prompts, and offline network state.
 */

const PWAManager = (function () {
  let deferredPrompt = null;

  function init() {
    registerServiceWorker();
    setupInstallPrompt();
    setupNetworkStatusListeners();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }

  function setupInstallPrompt() {
    const installBtn = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent automatic browser mini-infobar
      e.preventDefault();
      deferredPrompt = e;

      // Show custom install button
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
          UI.Toast.info("To install on mobile or desktop, use your browser's 'Add to Home Screen' option.");
          return;
        }

        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          UI.Toast.success(LanguageManager.t('toast_pwa_installed'));
        }
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    }

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (installBtn) installBtn.style.display = 'none';
      console.log('[PWA] Application was successfully installed');
    });
  }

  function setupNetworkStatusListeners() {
    const offlineBanner = document.getElementById('offline-banner');

    function updateNetworkStatus() {
      if (!navigator.onLine) {
        if (offlineBanner) offlineBanner.classList.add('visible');
        UI.Toast.warning(LanguageManager.t('status_offline'), "Network Alert");
      } else {
        if (offlineBanner) offlineBanner.classList.remove('visible');
      }
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Initial check
    if (!navigator.onLine && offlineBanner) {
      offlineBanner.classList.add('visible');
    }
  }

  return {
    init
  };
})();
