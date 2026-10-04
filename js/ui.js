/**
 * Clinic Payment Management System - UI Components & Renderers
 * Manages Toasts, Modals, Dynamic Tables, KPI Cards, and States.
 */

const UI = (function () {
  /* ------------------------------------------------------------------------
     1. Toast Notification Manager
     ------------------------------------------------------------------------ */
  const Toast = {
    show: function (title, message, type = 'info', duration = 3500) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      // Defensive argument normalization if called as show(message, type)
      if (['success', 'error', 'warning', 'info'].includes(message) && type === 'info') {
        type = message;
        message = title;
        title = type.charAt(0).toUpperCase() + type.slice(1);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'alert');

      // Icon determination
      let iconSvg = '';
      if (type === 'success') {
        iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
      } else if (type === 'error') {
        iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
      } else if (type === 'warning') {
        iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      } else {
        iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
      }

      toast.innerHTML = `
        ${iconSvg}
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
      `;

      // Auto close and manual close
      const removeToast = () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 250);
      };

      toast.querySelector('.toast-close').addEventListener('click', removeToast);
      setTimeout(removeToast, duration);

      container.appendChild(toast);
    },

    success: function (msg, title) {
      this.show(title || LanguageManager.t('toast_success_title'), msg, 'success');
    },
    error: function (msg, title) {
      this.show(title || LanguageManager.t('toast_error_title'), msg, 'error');
    },
    warning: function (msg, title) {
      this.show(title || 'Warning', msg, 'warning');
    },
    info: function (msg, title) {
      this.show(title || 'Information', msg, 'info');
    }
  };

  /* ------------------------------------------------------------------------
     2. Modal Dialog Manager
     ------------------------------------------------------------------------ */
  const Modal = {
    open: function (modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus first input or button
      const focusable = modal.querySelector('input, select, textarea, button:not(.modal-close-btn)');
      if (focusable) focusable.focus();
    },

    close: function (modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.remove('active');
      document.body.style.overflow = '';
    },

    confirm: function (title, message, onConfirmCallback, confirmBtnText = null, isDanger = false) {
      const modal = document.getElementById('confirm-modal');
      if (!modal) return;

      modal.querySelector('#confirm-modal-title').textContent = title;
      modal.querySelector('#confirm-modal-body').textContent = message;

      const confirmBtn = modal.querySelector('#btn-confirm-action');
      const newConfirmBtn = confirmBtn.cloneNode(true);
      if (confirmBtnText) {
        newConfirmBtn.textContent = confirmBtnText;
      } else {
        newConfirmBtn.textContent = LanguageManager.t('btn_confirm');
      }

      if (isDanger) {
        newConfirmBtn.className = 'btn-primary';
        newConfirmBtn.style.backgroundColor = 'var(--red-600)';
      } else {
        newConfirmBtn.className = 'btn-primary';
        newConfirmBtn.style.backgroundColor = '';
      }

      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

      newConfirmBtn.addEventListener('click', () => {
        Modal.close('confirm-modal');
        if (typeof onConfirmCallback === 'function') {
          onConfirmCallback();
        }
      });

      Modal.open('confirm-modal');
    }
  };

  // Keyboard and backdrop accessibility for modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) {
        Modal.close(activeModal.id);
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop') && e.target.classList.contains('active')) {
      Modal.close(e.target.id);
    }
  });

  /* ------------------------------------------------------------------------
     3. KPI Dashboard Cards Renderer
     ------------------------------------------------------------------------ */
  function renderKPICards(container, metrics, officeId) {
    if (!container) return;

    const cards = [
      {
        title: LanguageManager.t('kpi_total_revenue'),
        value: CalculationEngine.formatPKR(metrics.totalRevenue),
        accent: 'accent-navy',
        footer: `${metrics.casesCount} ${LanguageManager.t('kpi_cases_count')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
      },
      {
        title: LanguageManager.t('kpi_doctor_share'),
        value: CalculationEngine.formatPKR(metrics.totalDoctorShare),
        accent: 'accent-red',
        footer: LanguageManager.t('doctor_nawaz'),
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
      },
      {
        title: LanguageManager.t('kpi_office_share'),
        value: CalculationEngine.formatPKR(metrics.totalOfficeShare),
        accent: 'accent-green',
        footer: LanguageManager.t('trend_settled'),
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`
      },
      {
        title: LanguageManager.t('kpi_pending_balance'),
        value: CalculationEngine.formatPKR(metrics.totalPending),
        accent: 'accent-amber',
        footer: `${CalculationEngine.formatPKR(metrics.todayCollected)} ${LanguageManager.t('kpi_today_collected')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
      }
    ];

    container.innerHTML = cards.map(c => `
      <div class="kpi-card ${c.accent}">
        <div class="kpi-header">
          <span class="kpi-title">${c.title}</span>
          <div class="kpi-icon-wrap">${c.icon}</div>
        </div>
        <div class="kpi-value">${c.value}</div>
        <div class="kpi-footer">
          <span class="kpi-trend neutral">${c.footer}</span>
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     3B. MRI Office Dedicated Summary Cards Renderer
     Summary cards: Today's Total Received, Today's MRI Entries, MRI Office Share, Doctor Amount
     ------------------------------------------------------------------------ */
  function renderMRISummaryCards(container, metrics) {
    if (!container) return;

    const cards = [
      {
        key: 'kpi_today_total_received',
        title: LanguageManager.t('kpi_today_total_received'),
        value: CalculationEngine.formatPKR(metrics.todayTotalReceived),
        accent: 'accent-navy',
        footer: `${metrics.allTimeTotalReceived ? CalculationEngine.formatPKR(metrics.allTimeTotalReceived) : '₨ 0'} ${LanguageManager.t('filter_all_time')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
      },
      {
        key: 'kpi_today_mri_entries',
        title: LanguageManager.t('kpi_today_mri_entries'),
        value: `${metrics.todayEntriesCount}`,
        accent: 'accent-amber',
        footer: `${metrics.allTimeEntriesCount} ${LanguageManager.t('kpi_cases_count')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`
      },
      {
        key: 'kpi_mri_office_share',
        title: LanguageManager.t('kpi_mri_office_share'),
        value: CalculationEngine.formatPKR(metrics.todayOfficeShare),
        accent: 'accent-green',
        footer: LanguageManager.t('mri_office_share_fixed'),
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/></svg>`
      },
      {
        key: 'kpi_mri_profit',
        title: LanguageManager.t('kpi_mri_profit'),
        value: CalculationEngine.formatPKR(metrics.todayDoctorAmount),
        accent: 'accent-red',
        footer: LanguageManager.t('doctor_nawaz'),
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
      }
    ];

    container.innerHTML = cards.map(c => `
      <div class="kpi-card ${c.accent}">
        <div class="kpi-header">
          <span class="kpi-title" data-i18n="${c.key}">${c.title}</span>
          <div class="kpi-icon-wrap">${c.icon}</div>
        </div>
        <div class="kpi-value">${c.value}</div>
        <div class="kpi-footer">
          <span class="kpi-trend neutral">${c.footer}</span>
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     3C. Investigation Office Dedicated Summary Cards Renderer
     Officer: Shezaad
     Summary cards: Today's Total Received, Today's Investigation Entries, Doctor Amount (100%)
     ------------------------------------------------------------------------ */
  function renderInvestigationSummaryCards(container, metrics) {
    if (!container) return;

    const cards = [
      {
        key: 'kpi_today_total_received',
        title: LanguageManager.t('kpi_today_total_received'),
        value: CalculationEngine.formatPKR(metrics.todayTotalReceived),
        accent: 'accent-navy',
        footer: `${metrics.allTimeTotalReceived ? CalculationEngine.formatPKR(metrics.allTimeTotalReceived) : '₨ 0'} ${LanguageManager.t('filter_all_time')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
      },
      {
        key: 'kpi_today_inv_entries',
        title: LanguageManager.t('kpi_today_inv_entries'),
        value: `${metrics.todayEntriesCount}`,
        accent: 'accent-amber',
        footer: `${metrics.allTimeEntriesCount} ${LanguageManager.t('kpi_cases_count')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>`
      },
      {
        key: 'kpi_doctor_amount',
        title: LanguageManager.t('kpi_doctor_amount'),
        value: CalculationEngine.formatPKR(metrics.todayDoctorAmount),
        accent: 'accent-red',
        footer: `${LanguageManager.t('doctor_nawaz')} (100%)`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
      }
    ];

    container.innerHTML = cards.map(c => `
      <div class="kpi-card ${c.accent}">
        <div class="kpi-header">
          <span class="kpi-title" data-i18n="${c.key}">${c.title}</span>
          <div class="kpi-icon-wrap">${c.icon}</div>
        </div>
        <div class="kpi-value">${c.value}</div>
        <div class="kpi-footer">
          <span class="kpi-trend neutral">${c.footer}</span>
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     3D. Operation/Assistant Office Dedicated Summary Cards Renderer
     Officer: Qari Mustajab
     Summary cards: Final Total, Net to Pay Sx Day, Net Pay Later, Today's Operation Entries
     ------------------------------------------------------------------------ */
  function renderOperationSummaryCards(container, metrics) {
    if (!container) return;

    const cards = [
      {
        key: 'op_final_total',
        title: LanguageManager.t('op_final_total'),
        value: CalculationEngine.formatPKR(metrics.todayFinalTotal),
        accent: 'accent-navy',
        footer: `${LanguageManager.t('op_received_payment')}: ${CalculationEngine.formatPKR(metrics.todayTotalReceived)}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
      },
      {
        key: 'op_net_sx_day',
        title: LanguageManager.t('op_net_sx_day'),
        value: CalculationEngine.formatPKR(metrics.todayNetSxDay),
        accent: 'accent-green',
        footer: `${LanguageManager.t('op_submitted_payment')}: ${CalculationEngine.formatPKR(metrics.todaySubmittedPayment)}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
      },
      {
        key: 'op_net_pay_later',
        title: LanguageManager.t('op_net_pay_later'),
        value: CalculationEngine.formatPKR(metrics.todayNetPayLater),
        accent: 'accent-amber',
        footer: `${LanguageManager.t('op_hdu_icu')} − ${LanguageManager.t('op_medicine')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
      },
      {
        key: 'kpi_today_op_entries',
        title: LanguageManager.t('kpi_today_op_entries'),
        value: `${metrics.todayEntriesCount}`,
        accent: 'accent-red',
        footer: `${metrics.allTimeEntriesCount || metrics.todayEntriesCount} ${LanguageManager.t('kpi_cases_count')}`,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`
      }
    ];

    container.innerHTML = cards.map(c => `
      <div class="kpi-card ${c.accent}">
        <div class="kpi-header">
          <span class="kpi-title" data-i18n="${c.key}">${c.title}</span>
          <div class="kpi-icon-wrap">${c.icon}</div>
        </div>
        <div class="kpi-value">${c.value}</div>
        <div class="kpi-footer">
          <span class="kpi-trend neutral">${c.footer}</span>
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     4B. MRI Payment History Table Renderer
     Columns: Patient Name | MRI Type | Payment | MRI Office Share | Doctor Amount | Date | Day | Actions
     ------------------------------------------------------------------------ */
  function renderMRITable(tbody, records) {
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.35rem;">${LanguageManager.t('empty_title')}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">${LanguageManager.t('empty_desc')}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = records.map(r => {
      const localizedDay = CalculationEngine.getDayNameFromDate(r.date);
      const isUrdu = LanguageManager.isRTL();

      return `
        <tr data-mri-id="${r.id}">
          <td>
            <div class="td-patient">
              <span class="td-patient-name">${r.patientName}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-family-mono);">${r.id}</span>
            </div>
          </td>
          <td>
            <span style="font-weight: 500;">${r.mriType}</span>
          </td>
          <td class="td-numeric" style="font-weight: 700; color: var(--navy-900);">
            ${CalculationEngine.formatPKR(r.payment)}
          </td>
          <td class="td-numeric" style="font-weight: 600; color: var(--success-badge);">
            ${CalculationEngine.formatPKR(r.officeShare)}
          </td>
          <td class="td-numeric" style="font-weight: 600; color: var(--red-600);">
            ${CalculationEngine.formatPKR(r.doctorAmount)}
          </td>
          <td style="font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;">
            ${CalculationEngine.formatDate(r.date)}
          </td>
          <td>
            <span class="badge badge-office" style="font-weight: 600;">${localizedDay}</span>
          </td>
          <td>
            <div class="table-actions-cell">
              <button type="button" class="btn-action-edit" data-id="${r.id}" title="${LanguageManager.t('btn_edit')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>${LanguageManager.t('btn_edit')}</span>
              </button>
              <button type="button" class="btn-action-delete" data-id="${r.id}" title="${LanguageManager.t('btn_delete')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                <span>${LanguageManager.t('btn_delete')}</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /* ------------------------------------------------------------------------
     4C. Investigation Payment History Table Renderer
     Officer: Shezaad
     Columns: Patient Name | Test Name | Payment | Date | Day | Actions (Edit, Delete)
     ------------------------------------------------------------------------ */
  function renderInvestigationTable(tbody, records) {
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.35rem;">${LanguageManager.t('empty_title')}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">${LanguageManager.t('empty_desc')}</div>
          </td>
        </tr>
      `;
      return;
    }

    const isUrdu = LanguageManager.isRTL();

    tbody.innerHTML = records.map(r => {
      const localizedDay = CalculationEngine.getDayNameFromDate(r.date, isUrdu) || r.day || '-';

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--navy-900);">${r.patientName}</div>
            <small style="color: var(--text-muted); font-size: 0.75rem;">${r.id}</small>
          </td>
          <td style="font-weight: 600; color: var(--text-main);">
            ${r.testName}
          </td>
          <td>
            <strong style="color: var(--navy-900); font-variant-numeric: tabular-nums;">${CalculationEngine.formatPKR(r.payment)}</strong>
          </td>
          <td style="font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;">
            ${CalculationEngine.formatDate(r.date)}
          </td>
          <td>
            <span class="badge badge-office" style="font-weight: 600;">${localizedDay}</span>
          </td>
          <td>
            <div class="table-actions-cell">
              <button type="button" class="btn-action-edit btn-inv-edit" data-id="${r.id}" title="${LanguageManager.t('btn_edit')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>${LanguageManager.t('btn_edit')}</span>
              </button>
              <button type="button" class="btn-action-delete btn-inv-delete" data-id="${r.id}" title="${LanguageManager.t('btn_delete')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                <span>${LanguageManager.t('btn_delete')}</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /* ------------------------------------------------------------------------
     4D. Operation Payment History Table Renderer
     Officer: Qari Mustajab
     Columns: Patient Name | Operation Type | Received | Net Sx Day | Net Pay Later | Final Total | Date | Day | Actions
     ------------------------------------------------------------------------ */
  function renderOperationTable(tbody, records) {
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.35rem;">${LanguageManager.t('empty_title')}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">${LanguageManager.t('empty_desc')}</div>
          </td>
        </tr>
      `;
      return;
    }

    const isUrdu = LanguageManager.isRTL();

    tbody.innerHTML = records.map(r => {
      const localizedDay = CalculationEngine.getDayNameFromDate(r.date, isUrdu) || r.day || '-';
      const opType = r.operationType || r.operationName || '-';
      const calc = CalculationEngine.calculateOperationShare(r.payment || r.receivedPayment, r);

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--navy-900);">${r.patientName}</div>
            <small style="color: var(--text-muted); font-size: 0.75rem;">${r.id}</small>
          </td>
          <td style="font-weight: 600; color: var(--text-main);">
            ${opType}
          </td>
          <td>
            <strong style="color: var(--navy-900); font-variant-numeric: tabular-nums;">${CalculationEngine.formatPKR(r.payment || r.receivedPayment)}</strong>
          </td>
          <td>
            <span style="font-variant-numeric: tabular-nums; color: #047857; font-weight: 600;">
              ${CalculationEngine.formatPKR(calc.netToPaySxDay)}
            </span>
          </td>
          <td>
            <span style="font-variant-numeric: tabular-nums; color: #B45309; font-weight: 600;">
              ${CalculationEngine.formatPKR(calc.netPayLater)}
            </span>
          </td>
          <td>
            <strong style="color: #1E40AF; font-variant-numeric: tabular-nums; font-weight: 700;">
              ${CalculationEngine.formatPKR(calc.finalTotal)}
            </strong>
          </td>
          <td style="font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;">
            ${CalculationEngine.formatDate(r.date)}
          </td>
          <td>
            <span class="badge badge-office" style="font-weight: 600;">${localizedDay}</span>
          </td>
          <td>
            <div class="table-actions-cell">
              <button type="button" class="btn-action-edit btn-op-edit" data-id="${r.id}" title="${LanguageManager.t('btn_edit')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>${LanguageManager.t('btn_edit')}</span>
              </button>
              <button type="button" class="btn-action-delete btn-op-delete" data-id="${r.id}" title="${LanguageManager.t('btn_delete')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                <span>${LanguageManager.t('btn_delete')}</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderTransactionsTable(tbody, transactions) {
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!transactions || transactions.length === 0) return;

    tbody.innerHTML = transactions.map(tx => {
      const statusBadge = `<span class="badge badge-${tx.status}">${LanguageManager.t('status_' + tx.status)}</span>`;
      const formattedDate = new Date(tx.date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <tr>
          <td><strong>${tx.id}</strong></td>
          <td>
            <div style="font-weight: 600; color: var(--navy-900);">${tx.patientName}</div>
            <small style="color: var(--text-muted);">${tx.patientContact || ''}</small>
          </td>
          <td style="font-weight: 500;">${tx.service}</td>
          <td><strong style="color: var(--navy-900);">${CalculationEngine.formatPKR(tx.totalFee)}</strong></td>
          <td><span style="color: var(--red-600); font-weight: 700;">${CalculationEngine.formatPKR(tx.doctorAmount)}</span></td>
          <td><span style="color: var(--success-badge); font-weight: 700;">${CalculationEngine.formatPKR(tx.officeAmount)}</span></td>
          <td>${statusBadge}</td>
          <td style="font-size: 0.82rem; color: var(--text-secondary);">${formattedDate}</td>
          <td>
            <button class="btn-action btn-action-view" data-id="${tx.id}" title="${LanguageManager.t('btn_view_details')}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>${LanguageManager.t('btn_view')}</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /* ------------------------------------------------------------------------
     5. Empty, Loading, and Error States
     ------------------------------------------------------------------------ */
  function renderEmptyState(container) {
    if (!container) return;
    const tableContainer = container.querySelector('.table-responsive');
    if (tableContainer) tableContainer.style.display = 'none';

    let emptyEl = container.querySelector('.empty-state');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      container.appendChild(emptyEl);
    }
    emptyEl.style.display = 'flex';

    emptyEl.innerHTML = `
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <div class="empty-state-title" data-i18n="empty_title">${LanguageManager.t('empty_title')}</div>
      <div class="empty-state-desc" data-i18n="empty_desc">${LanguageManager.t('empty_desc')}</div>
      <button class="btn-primary" id="empty-state-add-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span data-i18n="btn_record_payment">${LanguageManager.t('btn_record_payment')}</span>
      </button>
    `;

    emptyEl.querySelector('#empty-state-add-btn').addEventListener('click', () => {
      Modal.open('payment-modal');
    });
  }

  function hideEmptyState(container) {
    if (!container) return;
    const tableContainer = container.querySelector('.table-responsive');
    if (tableContainer) tableContainer.style.display = 'block';
    const emptyEl = container.querySelector('.empty-state');
    if (emptyEl) emptyEl.style.display = 'none';
  }

  function renderLoading(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
        <div class="loading-text">${LanguageManager.t('loading_data')}</div>
      </div>
    `;
  }

  function renderError(container, onRetry) {
    if (!container) return;
    container.innerHTML = `
      <div class="error-state">
        <div class="error-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="error-state-body">
          <div class="error-state-title">${LanguageManager.t('error_load_title')}</div>
          <div class="error-state-desc">${LanguageManager.t('error_load_desc')}</div>
        </div>
        <button class="btn-secondary btn-retry" style="margin-inline-start: auto;">${LanguageManager.t('btn_retry')}</button>
      </div>
    `;
    const retryBtn = container.querySelector('.btn-retry');
    if (retryBtn && typeof onRetry === 'function') {
      retryBtn.addEventListener('click', onRetry);
    }
  }

  /* ------------------------------------------------------------------------
     6. Doctor Executive Dashboard Renderers (Doctor: Dr. Nawaz Khattak)
     ------------------------------------------------------------------------ */

  function renderDoctorGrandTotal(metrics) {
    const grossRevEl = document.getElementById('doc-gross-collection');
    const grossEntriesEl = document.getElementById('doc-gross-entries');
    const grandValEl = document.getElementById('doc-grand-total-val');
    const formulaMriEl = document.getElementById('doc-formula-mri');
    const formulaInvEl = document.getElementById('doc-formula-inv');
    const formulaAsstEl = document.getElementById('doc-formula-asst');
    const formulaGrandEl = document.getElementById('doc-formula-grand');
    const badgeMri = document.getElementById('doc-tab-badge-mri');
    const badgeInv = document.getElementById('doc-tab-badge-inv');
    const badgeAsst = document.getElementById('doc-tab-badge-asst');

    if (grossRevEl) grossRevEl.textContent = CalculationEngine.formatPKR(metrics.totalReceivedAcrossOffices);
    if (grossEntriesEl) grossEntriesEl.textContent = metrics.totalEntriesAcrossOffices;
    if (grandValEl) grandValEl.textContent = CalculationEngine.formatPKR(metrics.grandDoctorTotal);

    if (formulaMriEl) formulaMriEl.textContent = CalculationEngine.formatPKR(metrics.mriDoctorAmount);
    if (formulaInvEl) formulaInvEl.textContent = CalculationEngine.formatPKR(metrics.invDoctorAmount);
    if (formulaAsstEl) formulaAsstEl.textContent = CalculationEngine.formatPKR(metrics.opDoctorAmount);
    if (formulaGrandEl) formulaGrandEl.textContent = CalculationEngine.formatPKR(metrics.grandDoctorTotal);

    if (badgeMri) badgeMri.textContent = metrics.mriCount;
    if (badgeInv) badgeInv.textContent = metrics.invCount;
    if (badgeAsst) badgeAsst.textContent = metrics.opCount;
  }

  function renderDoctorTabKPIs(container, tabId, metrics) {
    if (!container) return;
    container.innerHTML = '';

    if (tabId === 'mri') {
      // 4 MRI Summary Cards
      container.innerHTML = `
        <article class="kpi-card accent-blue">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="doc_summary_total_received">${LanguageManager.t('doc_summary_total_received')}</span>
            <div class="kpi-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="20"/></svg>
            </div>
          </div>
          <div class="kpi-value">${CalculationEngine.formatPKR(metrics.mriTotalReceived)}</div>
          <div class="kpi-footer">
            <span class="kpi-trend" style="color: var(--navy-900); font-weight: 600;">${LanguageManager.t('mri_office')}</span>
          </div>
        </article>

        <article class="kpi-card accent-green">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="doc_summary_mri_share">${LanguageManager.t('doc_summary_mri_share')}</span>
            <div class="kpi-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
          </div>
          <div class="kpi-value" style="color: var(--success-badge);">${CalculationEngine.formatPKR(metrics.mriOfficeShare)}</div>
          <div class="kpi-footer">
            <span class="kpi-trend trend-up">Fixed Rs. 3,000 / Scan</span>
          </div>
        </article>

        <article class="kpi-card accent-red">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="doc_summary_mri_profit">${LanguageManager.t('doc_summary_mri_profit')}</span>
            <div class="kpi-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div class="kpi-value" style="color: var(--red-600);">${CalculationEngine.formatPKR(metrics.mriDoctorAmount)}</div>
          <div class="kpi-footer">
            <span class="kpi-trend trend-up">Payment - Rs. 3,000</span>
          </div>
        </article>

        <article class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="doc_summary_entries_count">${LanguageManager.t('doc_summary_entries_count')}</span>
            <div class="kpi-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
          <div class="kpi-value">${metrics.mriCount}</div>
          <div class="kpi-footer">
            <span class="kpi-trend" style="color: var(--text-secondary);">${LanguageManager.t('filter_opt_' + metrics.dateRange)}</span>
          </div>
        </article>
      `;
    } else if (tabId === 'investigation') {
      // 3 Investigation Summary Cards (100% Doctor)
      container.innerHTML = `
        <article class="kpi-card accent-blue">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="doc_summary_total_received">${LanguageManager.t('doc_summary_total_received')}</span>
            <div class="kpi-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31L4.69 18.5a2 2 0 0 0 1.62 3.5h15.38a2 2 0 0 0 1.62-3.5L18 9.31V2"/></svg>
            </div>
          </div>
          <div class="kpi-value">${CalculationEngine.formatPKR(metrics.invTotalReceived)}</div>
          <div class="kpi-footer">
            <span class="kpi-trend" style="color: var(--navy-900); font-weight: 600;">${LanguageManager.t('investigation_office')}</span>
          </div>
        </article>

        <article class="kpi-card accent-red">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="doc_summary_doctor_amount">${LanguageManager.t('doc_summary_doctor_amount')}</span>
            <div class="kpi-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div class="kpi-value" style="color: var(--red-600);">${CalculationEngine.formatPKR(metrics.invDoctorAmount)}</div>
          <div class="kpi-footer">
            <span class="kpi-trend trend-up">100% Doctor Amount (No Deduction)</span>
          </div>
        </article>

        <article class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="doc_summary_entries_count">${LanguageManager.t('doc_summary_entries_count')}</span>
            <div class="kpi-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
          <div class="kpi-value">${metrics.invCount}</div>
          <div class="kpi-footer">
            <span class="kpi-trend" style="color: var(--text-secondary);">${LanguageManager.t('filter_opt_' + metrics.dateRange)}</span>
          </div>
        </article>
      `;
    } else {
      // 4 Assistant (Operation) Summary Cards matching Assistant Dashboard exactly
      const opFinalTotal = metrics.opFinalTotal ?? metrics.todayFinalTotal ?? 0;
      const opTotalReceived = metrics.opTotalReceived ?? metrics.todayTotalReceived ?? 0;
      const opNetSxDay = metrics.opNetSxDay ?? metrics.todayNetSxDay ?? 0;
      const opSubmittedPayment = metrics.opSubmittedPayment ?? metrics.todaySubmittedPayment ?? 0;
      const opNetPayLater = metrics.opNetPayLater ?? metrics.todayNetPayLater ?? 0;
      const opCount = metrics.opCount ?? metrics.todayEntriesCount ?? 0;
      const totalOpCount = metrics.allTimeOpCount || metrics.allTimeEntriesCount || opCount;

      const cards = [
        {
          key: 'op_final_total',
          title: LanguageManager.t('op_final_total'),
          value: CalculationEngine.formatPKR(opFinalTotal),
          accent: 'accent-navy',
          footer: `${LanguageManager.t('op_received_payment')}: ${CalculationEngine.formatPKR(opTotalReceived)}`,
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
        },
        {
          key: 'op_net_sx_day',
          title: LanguageManager.t('op_net_sx_day'),
          value: CalculationEngine.formatPKR(opNetSxDay),
          accent: 'accent-green',
          footer: `${LanguageManager.t('op_submitted_payment')}: ${CalculationEngine.formatPKR(opSubmittedPayment)}`,
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
        },
        {
          key: 'op_net_pay_later',
          title: LanguageManager.t('op_net_pay_later'),
          value: CalculationEngine.formatPKR(opNetPayLater),
          accent: 'accent-amber',
          footer: `${LanguageManager.t('op_hdu_icu')} − ${LanguageManager.t('op_medicine')}`,
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
        },
        {
          key: 'kpi_today_op_entries',
          title: LanguageManager.t('kpi_today_op_entries'),
          value: `${opCount}`,
          accent: 'accent-red',
          footer: `${totalOpCount} ${LanguageManager.t('kpi_cases_count')}`,
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`
        }
      ];

      container.innerHTML = cards.map(c => `
        <article class="kpi-card ${c.accent}">
          <div class="kpi-header">
            <span class="kpi-title" data-i18n="${c.key}">${c.title}</span>
            <div class="kpi-icon-wrap">${c.icon}</div>
          </div>
          <div class="kpi-value">${c.value}</div>
          <div class="kpi-footer">
            <span class="kpi-trend neutral">${c.footer}</span>
          </div>
        </article>
      `).join('');
    }
  }

  function renderDoctorTabTable(thead, tbody, emptyContainer, tabId, records) {
    if (!thead || !tbody) return;

    // 1. Render Table Headers
    if (tabId === 'mri') {
      thead.innerHTML = `
        <tr>
          <th data-i18n="col_patient_name">${LanguageManager.t('col_patient_name')}</th>
          <th data-i18n="col_mri_type">${LanguageManager.t('col_mri_type')}</th>
          <th data-i18n="col_payment">${LanguageManager.t('col_payment')}</th>
          <th data-i18n="col_mri_machine_exp">${LanguageManager.t('col_mri_machine_exp')}</th>
          <th data-i18n="col_mri_profit">${LanguageManager.t('col_mri_profit')}</th>
          <th data-i18n="col_date">${LanguageManager.t('col_date')}</th>
          <th data-i18n="col_day">${LanguageManager.t('col_day')}</th>
          <th data-i18n="col_actions">${LanguageManager.t('col_actions')}</th>
        </tr>
      `;
    } else if (tabId === 'investigation') {
      thead.innerHTML = `
        <tr>
          <th data-i18n="col_patient_name">${LanguageManager.t('col_patient_name')}</th>
          <th data-i18n="col_test_name">${LanguageManager.t('col_test_name')}</th>
          <th data-i18n="col_payment">${LanguageManager.t('col_payment')}</th>
          <th data-i18n="col_doctor_amount">${LanguageManager.t('col_doctor_amount')}</th>
          <th data-i18n="col_date">${LanguageManager.t('col_date')}</th>
          <th data-i18n="col_day">${LanguageManager.t('col_day')}</th>
          <th data-i18n="col_actions">${LanguageManager.t('col_actions')}</th>
        </tr>
      `;
    } else {
      thead.innerHTML = `
        <tr>
          <th data-i18n="col_patient_name">${LanguageManager.t('col_patient_name')}</th>
          <th data-i18n="col_operation_type">${LanguageManager.t('col_operation_type')}</th>
          <th data-i18n="col_received">${LanguageManager.t('col_received')}</th>
          <th data-i18n="col_net_sx_day">${LanguageManager.t('col_net_sx_day')}</th>
          <th data-i18n="col_net_pay_later">${LanguageManager.t('col_net_pay_later')}</th>
          <th data-i18n="col_final_total">${LanguageManager.t('col_final_total')}</th>
          <th data-i18n="col_date">${LanguageManager.t('col_date')}</th>
          <th data-i18n="col_day">${LanguageManager.t('col_day')}</th>
          <th data-i18n="col_actions">${LanguageManager.t('col_actions')}</th>
        </tr>
      `;
    }

    // 2. Render Table Body
    tbody.innerHTML = '';
    if (!records || records.length === 0) {
      if (emptyContainer) {
        emptyContainer.innerHTML = `
          <div class="empty-state" style="display: flex;">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <div class="empty-state-title" data-i18n="empty_title">${LanguageManager.t('empty_title')}</div>
            <div class="empty-state-desc" data-i18n="empty_desc">${LanguageManager.t('empty_desc')}</div>
          </div>
        `;
      }
      return;
    }

    if (emptyContainer) emptyContainer.innerHTML = '';

    tbody.innerHTML = records.map(r => {
      const formattedDate = new Date(r.date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      if (tabId === 'mri') {
        return `
          <tr>
            <td style="font-weight: 600; color: var(--navy-900);">${r.patientName}</td>
            <td style="font-weight: 500;">${r.mriType}</td>
            <td><strong style="color: var(--navy-900);">${CalculationEngine.formatPKR(r.payment)}</strong></td>
            <td><span style="color: var(--success-badge); font-weight: 700;">${CalculationEngine.formatPKR(r.officeShare)}</span></td>
            <td><span style="color: var(--red-600); font-weight: 700;">${CalculationEngine.formatPKR(r.doctorAmount)}</span></td>
            <td style="font-size: 0.82rem; color: var(--text-secondary);">${formattedDate}</td>
            <td><span class="badge" style="background: var(--bg-subtle); color: var(--navy-900);">${r.day}</span></td>
            <td>
              <div class="action-btn-group">
                <button type="button" class="btn-action-edit btn-doc-edit" data-id="${r.id}" data-dept="mri" title="${LanguageManager.t('btn_edit')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>${LanguageManager.t('btn_edit')}</span>
                </button>
                <button type="button" class="btn-action-delete btn-doc-delete" data-id="${r.id}" data-dept="mri" title="${LanguageManager.t('btn_delete')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  <span>${LanguageManager.t('btn_delete')}</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      } else if (tabId === 'investigation') {
        return `
          <tr>
            <td style="font-weight: 600; color: var(--navy-900);">${r.patientName}</td>
            <td style="font-weight: 500;">${r.testName}</td>
            <td><strong style="color: var(--navy-900);">${CalculationEngine.formatPKR(r.payment)}</strong></td>
            <td><span style="color: var(--red-600); font-weight: 700;">${CalculationEngine.formatPKR(r.doctorAmount)}</span></td>
            <td style="font-size: 0.82rem; color: var(--text-secondary);">${formattedDate}</td>
            <td><span class="badge" style="background: var(--bg-subtle); color: var(--navy-900);">${r.day}</span></td>
            <td>
              <div class="action-btn-group">
                <button type="button" class="btn-action-edit btn-doc-edit" data-id="${r.id}" data-dept="investigation" title="${LanguageManager.t('btn_edit')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>${LanguageManager.t('btn_edit')}</span>
                </button>
                <button type="button" class="btn-action-delete btn-doc-delete" data-id="${r.id}" data-dept="investigation" title="${LanguageManager.t('btn_delete')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  <span>${LanguageManager.t('btn_delete')}</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      } else {
        // Assistant (Operation)
        const opType = r.operationType || r.operationName || '-';
        const calc = CalculationEngine.calculateOperationShare(r.payment || r.receivedPayment, r);

        return `
          <tr>
            <td style="font-weight: 600; color: var(--navy-900);">${r.patientName}</td>
            <td style="font-weight: 500;">${opType}</td>
            <td><strong style="color: var(--navy-900); font-variant-numeric: tabular-nums;">${CalculationEngine.formatPKR(r.payment || r.receivedPayment)}</strong></td>
            <td><span style="font-variant-numeric: tabular-nums; color: #047857; font-weight: 600;">${CalculationEngine.formatPKR(calc.netToPaySxDay)}</span></td>
            <td><span style="font-variant-numeric: tabular-nums; color: #B45309; font-weight: 600;">${CalculationEngine.formatPKR(calc.netPayLater)}</span></td>
            <td><strong style="color: #1E40AF; font-variant-numeric: tabular-nums; font-weight: 700;">${CalculationEngine.formatPKR(calc.finalTotal)}</strong></td>
            <td style="font-size: 0.82rem; color: var(--text-secondary);">${formattedDate}</td>
            <td><span class="badge" style="background: var(--bg-subtle); color: var(--navy-900);">${r.day}</span></td>
            <td>
              <div class="action-btn-group">
                <button type="button" class="btn-action-edit btn-doc-edit" data-id="${r.id}" data-dept="assistant" title="${LanguageManager.t('btn_edit')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>${LanguageManager.t('btn_edit')}</span>
                </button>
                <button type="button" class="btn-action-delete btn-doc-delete" data-id="${r.id}" data-dept="assistant" title="${LanguageManager.t('btn_delete')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  <span>${LanguageManager.t('btn_delete')}</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }
    }).join('');
  }

  return {
    Toast,
    Modal,
    renderKPICards,
    renderMRISummaryCards,
    renderInvestigationSummaryCards,
    renderOperationSummaryCards,
    renderTransactionsTable,
    renderMRITable,
    renderInvestigationTable,
    renderOperationTable,
    renderDoctorGrandTotal,
    renderDoctorTabKPIs,
    renderDoctorTabTable,
    renderEmptyState,
    hideEmptyState,
    renderLoading,
    renderError
  };
})();
