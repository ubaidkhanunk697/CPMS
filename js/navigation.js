/**
 * Clinic Payment Management System - Navigation & Routing Controller
 * Handles Office Switching, Hash Routing, Mobile Drawer, and Header Context.
 */

const NavigationManager = (function () {
  let activeOfficeId = 'mri';

  const officeMetadata = {
    mri: {
      nameKey: 'mri_office',
      officerKey: 'officer_aqeb',
      officerRoleKey: 'role_mri_officer',
      initials: 'AK',
      accentColor: 'var(--red-500)'
    },
    investigation: {
      nameKey: 'investigation_office',
      officerKey: 'officer_shezaad',
      officerRoleKey: 'role_inv_officer',
      initials: 'SH',
      accentColor: 'var(--info-badge)'
    },
    operation: {
      nameKey: 'operation_office',
      officerKey: 'officer_mustajab',
      officerRoleKey: 'role_asst_officer',
      initials: 'QM',
      accentColor: 'var(--warning-badge)'
    },
    doctor: {
      nameKey: 'doctor_office',
      officerKey: 'doctor_nawaz',
      officerRoleKey: 'role_consultant',
      initials: 'NK',
      accentColor: 'var(--navy-900)'
    }
  };

  function init() {
    setupHashRouting();
    setupMobileDrawer();
    setupKeyboardListeners();

    const currentUser = (typeof AuthService !== 'undefined') ? AuthService.getCurrentUser() : null;
    if (currentUser) {
      syncRoleNavigation(currentUser);
      const hash = window.location.hash.replace('#', '');
      if (hash && officeMetadata[hash] && AuthService.hasAccessToOffice(hash)) {
        setActiveOffice(hash, false);
      } else {
        setActiveOffice(currentUser.office, true);
      }
    } else {
      // Fallback route from URL hash if valid
      const hash = window.location.hash.replace('#', '');
      if (officeMetadata[hash]) {
        setActiveOffice(hash, false);
      } else {
        setActiveOffice('mri', true);
      }
    }
  }

  function setupHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (officeMetadata[hash] && hash !== activeOfficeId) {
        setActiveOffice(hash, false);
      }
    });

    // Nav link click events
    document.querySelectorAll('.nav-link[data-office]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const officeId = link.getAttribute('data-office');
        setActiveOffice(officeId, true);
        closeMobileSidebar();
      });
    });
  }

  function syncRoleNavigation(user) {
    const navLinks = document.querySelectorAll('.nav-link[data-office]');
    if (!user) {
      navLinks.forEach(link => {
        const parentLi = link.closest('li');
        if (parentLi) parentLi.style.display = '';
      });
      return;
    }

    // Role-based visibility: Each officer only sees their specific assigned office in the sidebar
    navLinks.forEach(link => {
      const officeId = link.getAttribute('data-office');
      const parentLi = link.closest('li');
      if (parentLi) {
        if (user.office === officeId) {
          parentLi.style.display = '';
        } else {
          parentLi.style.display = 'none';
        }
      }
    });

    // Sync officer badge at bottom of sidebar
    const avatarEl = document.getElementById('sidebar-officer-avatar');
    const nameEl = document.getElementById('sidebar-officer-name');
    const roleEl = document.getElementById('sidebar-officer-role');

    if (avatarEl) {
      avatarEl.textContent = user.initials || 'CP';
      if (user.accentColor) {
        avatarEl.style.backgroundColor = user.accentColor;
      }
    }
    if (nameEl) {
      nameEl.setAttribute('data-i18n', user.nameKey);
      nameEl.textContent = LanguageManager.t(user.nameKey);
    }
    if (roleEl) {
      roleEl.setAttribute('data-i18n', user.roleKey);
      roleEl.textContent = LanguageManager.t(user.roleKey);
    }
  }

  function setActiveOffice(officeId, updateHash = true, force = false) {
    if (!officeMetadata[officeId]) return;

    // RBAC Route Guard: Block navigation to unauthorized offices
    const currentUser = (typeof AuthService !== 'undefined') ? AuthService.getCurrentUser() : null;
    if (currentUser && !AuthService.hasAccessToOffice(officeId)) {
      console.warn(`[RBAC Route Guard] Denied access for ${currentUser.username} (${currentUser.role}) to office ${officeId}`);
      if (typeof UI !== 'undefined' && UI.Toast) {
        UI.Toast.show(LanguageManager.t('access_denied_desc'), 'warning');
      }
      if (activeOfficeId !== currentUser.office) {
        setActiveOffice(currentUser.office, true);
      }
      return;
    }

    const isDifferent = (activeOfficeId !== officeId);
    activeOfficeId = officeId;

    if (updateHash && window.location.hash !== `#${officeId}`) {
      window.location.hash = `#${officeId}`;
    }

    // Update active class on nav links
    document.querySelectorAll('.nav-link[data-office]').forEach(link => {
      if (link.getAttribute('data-office') === officeId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Update header contextual display
    updateHeaderContext(officeId);

    // Update sidebar officer card at the bottom
    updateSidebarOfficer(officeId);

    // Sync modal office select if available
    const officeSelect = document.getElementById('modal-office-select');
    if (officeSelect) {
      officeSelect.value = officeId;
    }

    // Fire custom officeChanged event for App controller ONLY if office changed or forced
    if (isDifferent || force) {
      window.dispatchEvent(new CustomEvent('officeChanged', { detail: { officeId } }));
    }
  }

  function updateHeaderContext(officeId) {
    const meta = officeMetadata[officeId];
    const headerTitleEl = document.getElementById('header-active-office-title');
    const headerOfficerEl = document.getElementById('header-active-officer-name');

    if (headerTitleEl) {
      headerTitleEl.setAttribute('data-i18n', meta.nameKey);
      headerTitleEl.textContent = LanguageManager.t(meta.nameKey);
    }

    if (headerOfficerEl) {
      headerOfficerEl.setAttribute('data-i18n', meta.officerKey);
      headerOfficerEl.textContent = LanguageManager.t(meta.officerKey);
    }
  }

  function updateSidebarOfficer(officeId) {
    const meta = officeMetadata[officeId];
    const avatarEl = document.getElementById('sidebar-officer-avatar');
    const nameEl = document.getElementById('sidebar-officer-name');
    const roleEl = document.getElementById('sidebar-officer-role');

    if (avatarEl) {
      avatarEl.textContent = meta.initials;
    }
    if (nameEl) {
      nameEl.setAttribute('data-i18n', meta.officerKey);
      nameEl.textContent = LanguageManager.t(meta.officerKey);
    }
    if (roleEl) {
      roleEl.setAttribute('data-i18n', meta.officerRoleKey);
      roleEl.textContent = LanguageManager.t(meta.officerRoleKey);
    }
  }

  function setupMobileDrawer() {
    const toggleBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileSidebar);
    }
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileSidebar();
        // Also close any active modals
        document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
          UI.Modal.close(modal.id);
        });
      }
    });
  }

  function getActiveOfficeId() {
    return activeOfficeId;
  }

  return {
    init,
    setActiveOffice,
    getActiveOfficeId,
    openMobileSidebar,
    closeMobileSidebar,
    syncRoleNavigation
  };
})();
