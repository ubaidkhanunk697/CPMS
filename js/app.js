/**
 * Clinic Payment Management System - Main Application Orchestrator
 * Bootstraps sub-modules, handles filters, forms, calculations, and data rendering.
 * Includes complete specialized MRI Office Dashboard for Officer Aqeb Khan.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Foundational Systems
  LanguageManager.init();
  PWAManager.init();
  ClinicRepository.initStorage();
  AuthService.init();

  // 2. Global State Filter Cache
  const currentFilters = {
    search: '',
    status: 'all',
    dateRange: 'all'
  };

  // Authentication & RBAC UI Element References
  const authView = document.getElementById('auth-view');
  const appRoot = document.getElementById('app-root');
  const loginForm = document.getElementById('login-form');
  const loginIdentityInput = document.getElementById('login-identity');
  const loginPasswordInput = document.getElementById('login-password');
  const loginSubmitBtn = document.getElementById('btn-login-submit');
  const loginBtnText = document.getElementById('btn-login-text');
  const authErrorBanner = document.getElementById('auth-error-banner');
  const authErrorText = document.getElementById('auth-error-text');
  const btnTogglePwd = document.getElementById('btn-toggle-pwd');
  const pwdIconEye = document.getElementById('pwd-icon-eye');
  const pwdIconEyeOff = document.getElementById('pwd-icon-eye-off');
  const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
  const btnHeaderLogout = document.getElementById('btn-header-logout');
  const rolePillButtons = document.querySelectorAll('.role-pill-btn');

  // Supabase Database Connection & Settings References
  const btnSupabaseStatus = document.getElementById('btn-supabase-status');
  const btnAuthSupabaseStatus = document.getElementById('btn-auth-supabase-status');
  const supabaseStatusText = document.getElementById('supabase-status-text');
  const supabaseConfigModal = document.getElementById('supabase-config-modal');
  const sbModalUrl = document.getElementById('sb-modal-url');
  const sbModalKey = document.getElementById('sb-modal-key');
  const btnSbSaveConfig = document.getElementById('btn-sb-save-config');
  const btnSbClearConfig = document.getElementById('btn-sb-clear-config');
  const btnSbTestConn = document.getElementById('btn-sb-test-conn');
  const sbConfigAlert = document.getElementById('supabase-config-alert');

  // 3. UI Element References
  const kpiContainer = document.getElementById('kpi-container');
  const transactionsTbody = document.getElementById('transactions-tbody');
  const tableCard = document.getElementById('table-content-card');
  const tablePanelTitle = document.getElementById('table-panel-title');
  const searchInput = document.getElementById('filter-search');
  const statusFilter = document.getElementById('filter-status');
  const dateFilter = document.getElementById('filter-date');
  const paymentModal = document.getElementById('payment-modal');
  const paymentForm = document.getElementById('payment-form');
  const btnOpenPaymentModal = document.getElementById('btn-open-payment-modal');
  const btnClearAllMRI = document.getElementById('btn-clear-all-mri');
  const btnClearAllInvestigation = document.getElementById('btn-clear-all-investigation');
  const btnClearAllOperation = document.getElementById('btn-clear-all-operation');
  const btnExport = document.getElementById('btn-export-report');

  // Doctor Dedicated State and UI Elements (Doctor: Dr. Nawaz Khattak)
  let doctorActiveTab = 'mri'; // 'mri' | 'investigation' | 'assistant'
  let doctorDateFilter = 'today'; // 'today' | 'yesterday' | 'week'
  const doctorContainer = document.getElementById('doctor-dashboard-container');
  const doctorTabKPISurface = document.getElementById('doctor-tab-kpi-container');
  const doctorTableHead = document.getElementById('doctor-table-head');
  const doctorTableTbody = document.getElementById('doctor-table-tbody');
  const doctorEmptyContainer = document.getElementById('doctor-empty-container');
  const doctorTableTitle = document.getElementById('doctor-table-title');
  const doctorTableSubtitle = document.getElementById('doctor-table-subtitle');
  const btnDoctorClearTab = document.getElementById('btn-doctor-clear-tab');
  const btnDoctorExport = document.getElementById('btn-doctor-export');

  // MRI Dedicated UI Elements
  const mriEntryCard = document.getElementById('mri-entry-card');

  // Investigation Dedicated UI Elements (Officer: Shezaad)
  const invEntryCard = document.getElementById('investigation-entry-card');
  const invEntryForm = document.getElementById('investigation-entry-form');
  const invPatientName = document.getElementById('inv-patient-name');
  const invTestNameInput = document.getElementById('inv-test-name');
  const invPaymentInput = document.getElementById('inv-payment-input');
  const invDateInput = document.getElementById('inv-date-input');
  const invDayInput = document.getElementById('inv-day-input');
  const invLivePayment = document.getElementById('inv-live-payment');
  const invLiveTotal = document.getElementById('inv-live-total');
  const invLiveDoctor = document.getElementById('inv-live-doctor');

  // Investigation Edit Modal Elements
  const invEditModal = document.getElementById('inv-edit-modal');
  const invEditForm = document.getElementById('inv-edit-form');
  const invEditId = document.getElementById('inv-edit-id');
  const invEditPatientName = document.getElementById('inv-edit-patient-name');
  const invEditTestNameInput = document.getElementById('inv-edit-test-name');
  const invEditPaymentInput = document.getElementById('inv-edit-payment-input');
  const invEditDateInput = document.getElementById('inv-edit-date-input');
  const invEditDayInput = document.getElementById('inv-edit-day-input');
  const invEditPreviewTotal = document.getElementById('inv-edit-preview-total');
  const invEditPreviewDoctor = document.getElementById('inv-edit-preview-doctor');

  // Operation Dedicated UI Elements (Officer: Qari Mustajab)
  const opEntryCard = document.getElementById('operation-entry-card');
  const opEntryForm = document.getElementById('operation-entry-form');
  const opPatientName = document.getElementById('op-patient-name');
  const opOperationNameInput = document.getElementById('op-operation-name');
  const opPaymentInput = document.getElementById('op-payment-input');
  const opDateInput = document.getElementById('op-date-input');
  const opDayInput = document.getElementById('op-day-input');
  const opLivePayment = document.getElementById('op-live-payment');
  const opLiveTotal = document.getElementById('op-live-total');
  const opLiveDoctor = document.getElementById('op-live-doctor');

  // Operation Edit Modal Elements
  const opEditModal = document.getElementById('op-edit-modal');
  const opEditForm = document.getElementById('op-edit-form');
  const opEditId = document.getElementById('op-edit-id');
  const opEditPatientName = document.getElementById('op-edit-patient-name');
  const opEditOperationNameInput = document.getElementById('op-edit-operation-name');
  const opEditPaymentInput = document.getElementById('op-edit-payment-input');
  const opEditDateInput = document.getElementById('op-edit-date-input');
  const opEditDayInput = document.getElementById('op-edit-day-input');
  const opEditPreviewTotal = document.getElementById('op-edit-preview-total');
  const opEditPreviewDoctor = document.getElementById('op-edit-preview-doctor');

  const mriEntryForm = document.getElementById('mri-entry-form');
  const mriPatientName = document.getElementById('mri-patient-name');
  const mriTypeInput = document.getElementById('mri-type-input');
  const mriPaymentInput = document.getElementById('mri-payment-input');
  const mriDateInput = document.getElementById('mri-date-input');
  const mriDayInput = document.getElementById('mri-day-input');
  const mriLivePayment = document.getElementById('mri-live-payment');
  const mriLiveOffice = document.getElementById('mri-live-office');
  const mriLiveDoctor = document.getElementById('mri-live-doctor');

  // MRI Edit Modal Elements
  const mriEditModal = document.getElementById('mri-edit-modal');
  const mriEditForm = document.getElementById('mri-edit-form');
  const mriEditId = document.getElementById('mri-edit-id');
  const mriEditPatientName = document.getElementById('mri-edit-patient-name');
  const mriEditTypeInput = document.getElementById('mri-edit-type-input');
  const mriEditPaymentInput = document.getElementById('mri-edit-payment-input');
  const mriEditDateInput = document.getElementById('mri-edit-date-input');
  const mriEditDayInput = document.getElementById('mri-edit-day-input');
  const mriEditPreviewOffice = document.getElementById('mri-edit-preview-office');
  const mriEditPreviewDoctor = document.getElementById('mri-edit-preview-doctor');

  // Modal Calculation Elements (Generic payment modal)
  const inputTotalFee = document.getElementById('field-total-fee');
  const inputDoctorPct = document.getElementById('field-doctor-pct');
  const inputPaidAmount = document.getElementById('field-paid-amount');
  const previewDoctorAmt = document.getElementById('calc-preview-doctor');
  const previewOfficeAmt = document.getElementById('calc-preview-office');
  const previewBalanceDue = document.getElementById('calc-preview-balance');

  /* ------------------------------------------------------------------------
     4. Date & Day Automatic Synchronization
     - Date defaults to today's date
     - Day automatically computes from selected date
     - Officer can manually change date; Day automatically updates
     ------------------------------------------------------------------------ */
  function syncDateAndDay(dateEl, dayEl) {
    if (!dateEl || !dayEl) return;
    if (!dateEl.value) {
      dateEl.value = CalculationEngine.getTodayDateString();
    }
    const computedDay = CalculationEngine.getDayNameFromDate(dateEl.value);
    dayEl.value = computedDay || '';
  }

  // Initialize entry form date & day
  if (mriDateInput && mriDayInput) {
    syncDateAndDay(mriDateInput, mriDayInput);
    mriDateInput.addEventListener('input', () => syncDateAndDay(mriDateInput, mriDayInput));
    mriDateInput.addEventListener('change', () => syncDateAndDay(mriDateInput, mriDayInput));
  }

  // Initialize edit form date & day listeners
  if (mriEditDateInput && mriEditDayInput) {
    mriEditDateInput.addEventListener('input', () => syncDateAndDay(mriEditDateInput, mriEditDayInput));
    mriEditDateInput.addEventListener('change', () => syncDateAndDay(mriEditDateInput, mriEditDayInput));
  }

  // Initialize Investigation entry form date & day
  if (invDateInput && invDayInput) {
    syncDateAndDay(invDateInput, invDayInput);
    invDateInput.addEventListener('input', () => syncDateAndDay(invDateInput, invDayInput));
    invDateInput.addEventListener('change', () => syncDateAndDay(invDateInput, invDayInput));
  }

  // Initialize Investigation edit form date & day listeners
  if (invEditDateInput && invEditDayInput) {
    invEditDateInput.addEventListener('input', () => syncDateAndDay(invEditDateInput, invEditDayInput));
    invEditDateInput.addEventListener('change', () => syncDateAndDay(invEditDateInput, invEditDayInput));
  }

  // Initialize Operation entry form date & day
  if (opDateInput && opDayInput) {
    syncDateAndDay(opDateInput, opDayInput);
    opDateInput.addEventListener('input', () => syncDateAndDay(opDateInput, opDayInput));
    opDateInput.addEventListener('change', () => syncDateAndDay(opDateInput, opDayInput));
  }

  // Initialize Operation edit form date & day listeners
  if (opEditDateInput && opEditDayInput) {
    opEditDateInput.addEventListener('input', () => syncDateAndDay(opEditDateInput, opEditDayInput));
    opEditDateInput.addEventListener('change', () => syncDateAndDay(opEditDateInput, opEditDayInput));
  }

  /* ------------------------------------------------------------------------
     5. Real-Time Calculation Previews for MRI
     - Fixed Rule: Payment >= Rs. 3,000 -> Office: Rs. 3,000 | Doctor: Payment - 3,000
     - If payment < Rs. 3,000: Office: Rs. 0 | Doctor: entire payment
     ------------------------------------------------------------------------ */
  function updateMRILiveCalculation() {
    if (!mriPaymentInput) return;
    const paymentVal = Number(mriPaymentInput.value) || 0;
    const splits = CalculationEngine.calculateMRIShare(paymentVal);

    if (mriLivePayment) mriLivePayment.textContent = CalculationEngine.formatPKR(splits.payment);
    if (mriLiveOffice) mriLiveOffice.textContent = CalculationEngine.formatPKR(splits.officeShare);
    if (mriLiveDoctor) mriLiveDoctor.textContent = CalculationEngine.formatPKR(splits.doctorAmount);
  }

  if (mriPaymentInput) {
    mriPaymentInput.addEventListener('input', updateMRILiveCalculation);
    mriPaymentInput.addEventListener('change', updateMRILiveCalculation);
  }

  function updateMRIEditLiveCalculation() {
    if (!mriEditPaymentInput) return;
    const paymentVal = Number(mriEditPaymentInput.value) || 0;
    const splits = CalculationEngine.calculateMRIShare(paymentVal);

    if (mriEditPreviewOffice) mriEditPreviewOffice.textContent = CalculationEngine.formatPKR(splits.officeShare);
    if (mriEditPreviewDoctor) mriEditPreviewDoctor.textContent = CalculationEngine.formatPKR(splits.doctorAmount);
  }

  if (mriEditPaymentInput) {
    mriEditPaymentInput.addEventListener('input', updateMRIEditLiveCalculation);
    mriEditPaymentInput.addEventListener('change', updateMRIEditLiveCalculation);
  }

  /* ------------------------------------------------------------------------
     5B. Real-Time Calculation Previews for Investigation (Officer: Shezaad)
     - 100% of the received payment belongs to Doctor.
     - NO deduction and NO percentage.
     ------------------------------------------------------------------------ */
  function updateInvestigationLiveCalculation() {
    if (!invPaymentInput) return;
    const paymentVal = Number(invPaymentInput.value) || 0;
    const splits = CalculationEngine.calculateInvestigationShare(paymentVal);

    if (invLivePayment) invLivePayment.textContent = CalculationEngine.formatPKR(splits.payment);
    if (invLiveTotal) invLiveTotal.textContent = CalculationEngine.formatPKR(splits.investigationTotal);
    if (invLiveDoctor) invLiveDoctor.textContent = CalculationEngine.formatPKR(splits.doctorAmount);
  }

  if (invPaymentInput) {
    invPaymentInput.addEventListener('input', updateInvestigationLiveCalculation);
    invPaymentInput.addEventListener('change', updateInvestigationLiveCalculation);
  }

  function updateInvestigationEditLiveCalculation() {
    if (!invEditPaymentInput) return;
    const paymentVal = Number(invEditPaymentInput.value) || 0;
    const splits = CalculationEngine.calculateInvestigationShare(paymentVal);

    if (invEditPreviewTotal) invEditPreviewTotal.textContent = CalculationEngine.formatPKR(splits.investigationTotal);
    if (invEditPreviewDoctor) invEditPreviewDoctor.textContent = CalculationEngine.formatPKR(splits.doctorAmount);
  }

  if (invEditPaymentInput) {
    invEditPaymentInput.addEventListener('input', updateInvestigationEditLiveCalculation);
    invEditPaymentInput.addEventListener('change', updateInvestigationEditLiveCalculation);
  }

  /* ------------------------------------------------------------------------
     5C. Real-Time Calculation Previews for Operation (Officer: Qari Mustajab)
     - 100% of the received payment belongs to Doctor.
     - NO deduction and NO percentage.
     ------------------------------------------------------------------------ */
  function updateOperationLiveCalculation() {
    if (!opPaymentInput) return;
    const paymentVal = Number(opPaymentInput.value) || 0;
    const splits = CalculationEngine.calculateOperationShare(paymentVal);

    if (opLivePayment) opLivePayment.textContent = CalculationEngine.formatPKR(splits.payment);
    if (opLiveTotal) opLiveTotal.textContent = CalculationEngine.formatPKR(splits.operationTotal);
    if (opLiveDoctor) opLiveDoctor.textContent = CalculationEngine.formatPKR(splits.doctorAmount);
  }

  if (opPaymentInput) {
    opPaymentInput.addEventListener('input', updateOperationLiveCalculation);
    opPaymentInput.addEventListener('change', updateOperationLiveCalculation);
  }

  function updateOperationEditLiveCalculation() {
    if (!opEditPaymentInput) return;
    const paymentVal = Number(opEditPaymentInput.value) || 0;
    const splits = CalculationEngine.calculateOperationShare(paymentVal);

    if (opEditPreviewTotal) opEditPreviewTotal.textContent = CalculationEngine.formatPKR(splits.operationTotal);
    if (opEditPreviewDoctor) opEditPreviewDoctor.textContent = CalculationEngine.formatPKR(splits.doctorAmount);
  }

  if (opEditPaymentInput) {
    opEditPaymentInput.addEventListener('input', updateOperationEditLiveCalculation);
    opEditPaymentInput.addEventListener('change', updateOperationEditLiveCalculation);
  }

  /* ------------------------------------------------------------------------
     6. Dashboard Refresh Logic (Doctor vs MRI vs Investigation vs Operation)
     ------------------------------------------------------------------------ */
  let currentDashboardSeq = 0;

  async function refreshDashboard() {
    const seq = ++currentDashboardSeq;
    const activeOfficeId = NavigationManager.getActiveOfficeId();

    if (activeOfficeId === 'doctor') {
      await refreshDoctorDashboard(seq);
    } else if (activeOfficeId === 'mri') {
      await refreshMRIDashboard(seq);
    } else if (activeOfficeId === 'investigation') {
      await refreshInvestigationDashboard(seq);
    } else if (activeOfficeId === 'operation') {
      await refreshOperationDashboard(seq);
    } else {
      await refreshStandardDashboard(activeOfficeId, seq);
    }
  }

  let doctorRenderSeq = 0;

  async function refreshDoctorDashboard(seq) {
    const currentSeq = ++doctorRenderSeq;
    const tabToRender = doctorActiveTab;
    const filterToRender = doctorDateFilter;

    try {
      // 1. Hide non-doctor containers & office entry cards
      if (mriEntryCard) mriEntryCard.style.display = 'none';
      if (btnClearAllMRI) btnClearAllMRI.style.display = 'none';
      if (invEntryCard) invEntryCard.style.display = 'none';
      if (btnClearAllInvestigation) btnClearAllInvestigation.style.display = 'none';
      if (opEntryCard) opEntryCard.style.display = 'none';
      if (btnClearAllOperation) btnClearAllOperation.style.display = 'none';
      if (kpiContainer) kpiContainer.style.display = 'none';
      if (tableCard) tableCard.style.display = 'none';

      // 2. Show Doctor Dashboard container
      if (doctorContainer) doctorContainer.style.display = 'flex';

      // 3. Fetch Doctor Grand Metrics and Active Tab records concurrently
      const [doctorMetrics, tabRecords] = await Promise.all([
        ClinicRepository.getDoctorSummaryMetrics(filterToRender),
        ClinicRepository.getDoctorFilteredRecords(tabToRender, filterToRender)
      ]);

      // If a newer render request was initiated while awaiting, discard stale results
      if (currentSeq !== doctorRenderSeq) {
        return;
      }
      if (seq && seq !== currentDashboardSeq) {
        return;
      }
      if (NavigationManager.getActiveOfficeId() !== 'doctor') {
        return;
      }

      // 4. Render Executive Grand Total Banner & Tab badges
      UI.renderDoctorGrandTotal(doctorMetrics);

      // 5. Render Active Tab KPI Summary Cards
      UI.renderDoctorTabKPIs(doctorTabKPISurface, tabToRender, doctorMetrics);

      // 6. Update Table Title & Subtitle according to active tab
      if (doctorTableTitle) {
        if (tabToRender === 'mri') {
          doctorTableTitle.setAttribute('data-i18n', 'doc_mri_records_title');
          doctorTableTitle.textContent = LanguageManager.t('doc_mri_records_title');
        } else if (tabToRender === 'investigation') {
          doctorTableTitle.setAttribute('data-i18n', 'doc_inv_records_title');
          doctorTableTitle.textContent = LanguageManager.t('doc_inv_records_title');
        } else {
          doctorTableTitle.setAttribute('data-i18n', 'doc_op_records_title');
          doctorTableTitle.textContent = LanguageManager.t('doc_op_records_title');
        }
      }

      // 7. Render Active Tab Data Table
      UI.renderDoctorTabTable(doctorTableHead, doctorTableTbody, doctorEmptyContainer, tabToRender, tabRecords);

    } catch (err) {
      if (currentSeq !== doctorRenderSeq) return;
      if (seq && seq !== currentDashboardSeq) return;
      if (NavigationManager.getActiveOfficeId() !== 'doctor') return;
      console.error("Doctor Dashboard render error:", err);
      if (doctorContainer) UI.renderError(doctorContainer, refreshDoctorDashboard);
    }
  }

  async function refreshMRIDashboard(seq) {
    try {
      // Hide Doctor Dashboard, ensure standard sections are visible
      if (doctorContainer) doctorContainer.style.display = 'none';
      if (kpiContainer) kpiContainer.style.display = 'grid';
      if (tableCard) tableCard.style.display = 'block';

      // Configure MRI-specific UI container states
      if (mriEntryCard) mriEntryCard.style.display = 'block';
      if (btnClearAllMRI) btnClearAllMRI.style.display = 'inline-flex';

      // Hide Investigation & Operation controls
      if (invEntryCard) invEntryCard.style.display = 'none';
      if (btnClearAllInvestigation) btnClearAllInvestigation.style.display = 'none';
      if (opEntryCard) opEntryCard.style.display = 'none';
      if (btnClearAllOperation) btnClearAllOperation.style.display = 'none';

      if (tablePanelTitle) {
        tablePanelTitle.setAttribute('data-i18n', 'mri_payment_history');
        tablePanelTitle.textContent = LanguageManager.t('mri_payment_history');
      }

      // Ensure table headers match MRI columns
      renderMRITableHeaders();

      // Fetch MRI metrics and records concurrently
      const [metrics, records] = await Promise.all([
        ClinicRepository.getMRISummaryMetrics(),
        ClinicRepository.getMRIRecords(currentFilters)
      ]);

      if (seq && seq !== currentDashboardSeq) return;
      if (NavigationManager.getActiveOfficeId() !== 'mri') return;

      // Render 4 Summary Cards: Today's Total Received, Today's MRI Entries, MRI Office Share, Doctor Amount
      UI.renderMRISummaryCards(kpiContainer, metrics);

      // Render MRI records table
      UI.renderMRITable(transactionsTbody, records);

    } catch (err) {
      if (seq && seq !== currentDashboardSeq) return;
      if (NavigationManager.getActiveOfficeId() !== 'mri') return;
      console.error("MRI Dashboard render error:", err);
      UI.renderError(tableCard, refreshMRIDashboard);
    }
  }

  async function refreshInvestigationDashboard(seq) {
    try {
      // Hide Doctor Dashboard, ensure standard sections are visible
      if (doctorContainer) doctorContainer.style.display = 'none';
      if (kpiContainer) kpiContainer.style.display = 'grid';
      if (tableCard) tableCard.style.display = 'block';

      // Hide MRI & Operation controls
      if (mriEntryCard) mriEntryCard.style.display = 'none';
      if (btnClearAllMRI) btnClearAllMRI.style.display = 'none';
      if (opEntryCard) opEntryCard.style.display = 'none';
      if (btnClearAllOperation) btnClearAllOperation.style.display = 'none';

      // Configure Investigation controls
      if (invEntryCard) invEntryCard.style.display = 'block';
      if (btnClearAllInvestigation) btnClearAllInvestigation.style.display = 'inline-flex';

      if (tablePanelTitle) {
        tablePanelTitle.setAttribute('data-i18n', 'inv_payment_history');
        tablePanelTitle.textContent = LanguageManager.t('inv_payment_history');
      }

      // Ensure table headers match Investigation columns
      renderInvestigationTableHeaders();

      // Fetch Investigation metrics and records concurrently
      const [metrics, records] = await Promise.all([
        ClinicRepository.getInvestigationSummaryMetrics(),
        ClinicRepository.getInvestigationRecords(currentFilters)
      ]);

      if (seq && seq !== currentDashboardSeq) return;
      if (NavigationManager.getActiveOfficeId() !== 'investigation') return;

      // Render 3 Summary Cards: Today's Total Received, Today's Investigation Entries, Doctor Amount (100%)
      UI.renderInvestigationSummaryCards(kpiContainer, metrics);

      // Render Investigation records table
      UI.renderInvestigationTable(transactionsTbody, records);

    } catch (err) {
      if (seq && seq !== currentDashboardSeq) return;
      if (NavigationManager.getActiveOfficeId() !== 'investigation') return;
      console.error("Investigation Dashboard render error:", err);
      UI.renderError(tableCard, refreshInvestigationDashboard);
    }
  }

  async function refreshOperationDashboard(seq) {
    try {
      // Hide Doctor Dashboard, ensure standard sections are visible
      if (doctorContainer) doctorContainer.style.display = 'none';
      if (kpiContainer) kpiContainer.style.display = 'grid';
      if (tableCard) tableCard.style.display = 'block';

      // Hide MRI & Investigation controls
      if (mriEntryCard) mriEntryCard.style.display = 'none';
      if (btnClearAllMRI) btnClearAllMRI.style.display = 'none';
      if (invEntryCard) invEntryCard.style.display = 'none';
      if (btnClearAllInvestigation) btnClearAllInvestigation.style.display = 'none';

      // Configure Operation controls
      if (opEntryCard) opEntryCard.style.display = 'block';
      if (btnClearAllOperation) btnClearAllOperation.style.display = 'inline-flex';

      if (tablePanelTitle) {
        tablePanelTitle.setAttribute('data-i18n', 'op_payment_history');
        tablePanelTitle.textContent = LanguageManager.t('op_payment_history');
      }

      // Ensure table headers match Operation columns
      renderOperationTableHeaders();

      // Fetch Operation metrics and records concurrently
      const [metrics, records] = await Promise.all([
        ClinicRepository.getOperationSummaryMetrics(),
        ClinicRepository.getOperationRecords(currentFilters)
      ]);

      if (seq && seq !== currentDashboardSeq) return;
      if (NavigationManager.getActiveOfficeId() !== 'operation') return;

      // Render 3 Summary Cards: Today's Total Received, Today's Operation Entries, Doctor Amount (100%)
      UI.renderOperationSummaryCards(kpiContainer, metrics);

      // Render Operation records table
      UI.renderOperationTable(transactionsTbody, records);

    } catch (err) {
      if (seq && seq !== currentDashboardSeq) return;
      if (NavigationManager.getActiveOfficeId() !== 'operation') return;
      console.error("Operation Dashboard render error:", err);
      UI.renderError(tableCard, refreshOperationDashboard);
    }
  }

  async function refreshStandardDashboard(activeOfficeId) {
    try {
      // Hide Doctor Dashboard, ensure standard sections are visible
      if (doctorContainer) doctorContainer.style.display = 'none';
      if (kpiContainer) kpiContainer.style.display = 'grid';
      if (tableCard) tableCard.style.display = 'block';

      // Hide MRI, Investigation, & Operation controls
      if (mriEntryCard) mriEntryCard.style.display = 'none';
      if (btnClearAllMRI) btnClearAllMRI.style.display = 'none';
      if (invEntryCard) invEntryCard.style.display = 'none';
      if (btnClearAllInvestigation) btnClearAllInvestigation.style.display = 'none';
      if (opEntryCard) opEntryCard.style.display = 'none';
      if (btnClearAllOperation) btnClearAllOperation.style.display = 'none';

      if (tablePanelTitle) {
        tablePanelTitle.setAttribute('data-i18n', 'nav_reports');
        tablePanelTitle.textContent = LanguageManager.t('nav_reports');
      }

      renderStandardTableHeaders();

      // Fetch standard metrics and transactions
      const [metrics, transactions] = await Promise.all([
        ClinicRepository.getMetrics(activeOfficeId),
        ClinicRepository.getTransactions(activeOfficeId, currentFilters)
      ]);

      UI.renderKPICards(kpiContainer, metrics, activeOfficeId);

      if (transactions.length === 0) {
        UI.renderEmptyState(tableCard);
      } else {
        UI.hideEmptyState(tableCard);
        UI.renderTransactionsTable(transactionsTbody, transactions);
      }
    } catch (err) {
      console.error("Dashboard render error:", err);
      UI.renderError(tableCard, refreshDashboard);
    }
  }

  function renderMRITableHeaders() {
    const headRow = document.getElementById('table-headers-row');
    if (!headRow) return;

    headRow.innerHTML = `
      <th data-i18n="col_patient_name">${LanguageManager.t('col_patient_name')}</th>
      <th data-i18n="col_mri_type">${LanguageManager.t('col_mri_type')}</th>
      <th data-i18n="col_payment">${LanguageManager.t('col_payment')}</th>
      <th data-i18n="col_office_share">${LanguageManager.t('col_office_share')}</th>
      <th data-i18n="col_doctor_amount">${LanguageManager.t('col_doctor_amount')}</th>
      <th data-i18n="col_date">${LanguageManager.t('col_date')}</th>
      <th data-i18n="col_day">${LanguageManager.t('col_day')}</th>
      <th data-i18n="col_actions">${LanguageManager.t('col_actions')}</th>
    `;
  }

  function renderInvestigationTableHeaders() {
    const headRow = document.getElementById('table-headers-row');
    if (!headRow) return;

    headRow.innerHTML = `
      <th data-i18n="col_patient_name">${LanguageManager.t('col_patient_name')}</th>
      <th data-i18n="col_test_name">${LanguageManager.t('col_test_name')}</th>
      <th data-i18n="col_payment">${LanguageManager.t('col_payment')}</th>
      <th data-i18n="col_date">${LanguageManager.t('col_date')}</th>
      <th data-i18n="col_day">${LanguageManager.t('col_day')}</th>
      <th data-i18n="col_actions">${LanguageManager.t('col_actions')}</th>
    `;
  }

  function renderOperationTableHeaders() {
    const headRow = document.getElementById('table-headers-row');
    if (!headRow) return;

    headRow.innerHTML = `
      <th data-i18n="col_patient_name">${LanguageManager.t('col_patient_name')}</th>
      <th data-i18n="col_operation_name">${LanguageManager.t('col_operation_name')}</th>
      <th data-i18n="col_payment">${LanguageManager.t('col_payment')}</th>
      <th data-i18n="col_date">${LanguageManager.t('col_date')}</th>
      <th data-i18n="col_day">${LanguageManager.t('col_day')}</th>
      <th data-i18n="col_actions">${LanguageManager.t('col_actions')}</th>
    `;
  }

  function renderStandardTableHeaders() {
    const headRow = document.getElementById('table-headers-row');
    if (!headRow) return;

    headRow.innerHTML = `
      <th data-i18n="table_id">${LanguageManager.t('table_id')}</th>
      <th data-i18n="table_patient">${LanguageManager.t('table_patient')}</th>
      <th data-i18n="table_service">${LanguageManager.t('table_service')}</th>
      <th data-i18n="table_total">${LanguageManager.t('table_total')}</th>
      <th data-i18n="table_doctor_cut">${LanguageManager.t('table_doctor_cut')}</th>
      <th data-i18n="table_office_cut">${LanguageManager.t('table_office_cut')}</th>
      <th data-i18n="table_status">${LanguageManager.t('table_status')}</th>
      <th data-i18n="table_date">${LanguageManager.t('table_date')}</th>
      <th data-i18n="table_actions">${LanguageManager.t('table_actions')}</th>
    `;
  }

  /* ------------------------------------------------------------------------
     7. MRI Payment Entry Form Submission
     ------------------------------------------------------------------------ */
  if (mriEntryForm) {
    mriEntryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const patientName = FormValidator.sanitize(mriPatientName.value);
      const mriType = FormValidator.sanitize(mriTypeInput.value);
      const payment = Number(mriPaymentInput.value);
      const date = mriDateInput.value || CalculationEngine.getTodayDateString();

      // Validation
      if (!patientName || patientName.length < 2) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        mriPatientName.focus();
        return;
      }

      if (!mriType) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        mriTypeInput.focus();
        return;
      }

      if (isNaN(payment) || payment <= 0) {
        UI.Toast.error(LanguageManager.t('toast_positive_payment'));
        mriPaymentInput.focus();
        return;
      }

      try {
        await ClinicRepository.addMRIRecord({
          patientName,
          mriType,
          payment,
          date
        });

        UI.Toast.success(LanguageManager.t('toast_mri_added'));

        // Reset inputs while preserving today's date & day
        mriPatientName.value = '';
        mriTypeInput.value = '';
        mriPaymentInput.value = '';
        syncDateAndDay(mriDateInput, mriDayInput);
        updateMRILiveCalculation();

        await refreshMRIDashboard();
      } catch (err) {
        console.error("Error adding MRI record:", err);
        UI.Toast.error("Failed to save MRI record.");
      }
    });
  }

  /* ------------------------------------------------------------------------
     7B. Investigation Payment Entry Form Submission (Officer: Shezaad)
     ------------------------------------------------------------------------ */
  if (invEntryForm) {
    invEntryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const patientName = FormValidator.sanitize(invPatientName.value);
      const testName = FormValidator.sanitize(invTestNameInput.value);
      const payment = Number(invPaymentInput.value);
      const date = invDateInput.value || CalculationEngine.getTodayDateString();

      // Validation
      if (!patientName || patientName.length < 2) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        invPatientName.focus();
        return;
      }

      if (!testName) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        invTestNameInput.focus();
        return;
      }

      if (isNaN(payment) || payment <= 0) {
        UI.Toast.error(LanguageManager.t('toast_positive_payment'));
        invPaymentInput.focus();
        return;
      }

      try {
        await ClinicRepository.addInvestigationRecord({
          patientName,
          testName,
          payment,
          date
        });

        UI.Toast.success(LanguageManager.t('toast_inv_added'));

        // Reset inputs while preserving today's date & day
        invPatientName.value = '';
        invTestNameInput.value = '';
        invPaymentInput.value = '';
        syncDateAndDay(invDateInput, invDayInput);
        updateInvestigationLiveCalculation();

        await refreshInvestigationDashboard();
      } catch (err) {
        console.error("Error adding Investigation record:", err);
        UI.Toast.error("Failed to save Investigation record.");
      }
    });
  }

  /* ------------------------------------------------------------------------
     7C. Operation Payment Entry Form Submission (Officer: Qari Mustajab)
     ------------------------------------------------------------------------ */
  if (opEntryForm) {
    opEntryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const patientName = FormValidator.sanitize(opPatientName.value);
      const operationName = FormValidator.sanitize(opOperationNameInput.value);
      const payment = Number(opPaymentInput.value);
      const date = opDateInput.value || CalculationEngine.getTodayDateString();

      // Validation
      if (!patientName || patientName.length < 2) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        opPatientName.focus();
        return;
      }

      if (!operationName) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        opOperationNameInput.focus();
        return;
      }

      if (isNaN(payment) || payment <= 0) {
        UI.Toast.error(LanguageManager.t('toast_positive_payment'));
        opPaymentInput.focus();
        return;
      }

      try {
        await ClinicRepository.addOperationRecord({
          patientName,
          operationName,
          payment,
          date
        });

        UI.Toast.success(LanguageManager.t('toast_op_added'));

        // Reset inputs while preserving today's date & day
        opPatientName.value = '';
        opOperationNameInput.value = '';
        opPaymentInput.value = '';
        syncDateAndDay(opDateInput, opDayInput);
        updateOperationLiveCalculation();

        await refreshOperationDashboard();
      } catch (err) {
        console.error("Error adding Operation record:", err);
        UI.Toast.error("Failed to save Operation record.");
      }
    });
  }

  /* ------------------------------------------------------------------------
     8. Table Actions: Edit, Delete, and Clear All (MRI, Investigation, & Operation)
     ------------------------------------------------------------------------ */
  if (transactionsTbody) {
    transactionsTbody.addEventListener('click', async (e) => {
      // 1A. Edit Investigation Entry Action
      const invEditBtn = e.target.closest('.btn-inv-edit');
      if (invEditBtn) {
        const id = invEditBtn.getAttribute('data-id');
        const record = await ClinicRepository.getInvestigationRecordById(id);
        if (record) {
          invEditId.value = record.id;
          invEditPatientName.value = record.patientName;
          invEditTestNameInput.value = record.testName;
          invEditPaymentInput.value = record.payment;
          invEditDateInput.value = record.date;
          syncDateAndDay(invEditDateInput, invEditDayInput);
          updateInvestigationEditLiveCalculation();
          UI.Modal.open('inv-edit-modal');
        }
        return;
      }

      // 1B. Edit Operation Entry Action
      const opEditBtn = e.target.closest('.btn-op-edit');
      if (opEditBtn) {
        const id = opEditBtn.getAttribute('data-id');
        const record = await ClinicRepository.getOperationRecordById(id);
        if (record) {
          opEditId.value = record.id;
          opEditPatientName.value = record.patientName;
          opEditOperationNameInput.value = record.operationName;
          opEditPaymentInput.value = record.payment;
          opEditDateInput.value = record.date;
          syncDateAndDay(opEditDateInput, opEditDayInput);
          updateOperationEditLiveCalculation();
          UI.Modal.open('op-edit-modal');
        }
        return;
      }

      // 1C. Edit MRI Entry Action
      const editBtn = e.target.closest('.btn-action-edit:not(.btn-inv-edit):not(.btn-op-edit)');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const record = await ClinicRepository.getMRIRecordById(id);
        if (record) {
          mriEditId.value = record.id;
          mriEditPatientName.value = record.patientName;
          mriEditTypeInput.value = record.mriType;
          mriEditPaymentInput.value = record.payment;
          mriEditDateInput.value = record.date;
          syncDateAndDay(mriEditDateInput, mriEditDayInput);
          updateMRIEditLiveCalculation();
          UI.Modal.open('mri-edit-modal');
        }
        return;
      }

      // 2A. Delete Investigation Entry Action
      const invDeleteBtn = e.target.closest('.btn-inv-delete');
      if (invDeleteBtn) {
        const id = invDeleteBtn.getAttribute('data-id');
        UI.Modal.confirm(
          LanguageManager.t('confirm_delete_single_inv_title'),
          LanguageManager.t('confirm_delete_single_inv_text'),
          async () => {
            await ClinicRepository.deleteInvestigationRecord(id);
            UI.Toast.success(LanguageManager.t('toast_inv_deleted'));
            await refreshInvestigationDashboard();
          },
          LanguageManager.t('btn_yes_delete'),
          true
        );
        return;
      }

      // 2B. Delete Operation Entry Action
      const opDeleteBtn = e.target.closest('.btn-op-delete');
      if (opDeleteBtn) {
        const id = opDeleteBtn.getAttribute('data-id');
        UI.Modal.confirm(
          LanguageManager.t('confirm_delete_single_op_title'),
          LanguageManager.t('confirm_delete_single_op_text'),
          async () => {
            await ClinicRepository.deleteOperationRecord(id);
            UI.Toast.success(LanguageManager.t('toast_op_deleted'));
            await refreshOperationDashboard();
          },
          LanguageManager.t('btn_yes_delete'),
          true
        );
        return;
      }

      // 2C. Delete MRI Entry Action
      const deleteBtn = e.target.closest('.btn-action-delete:not(.btn-inv-delete):not(.btn-op-delete)');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        UI.Modal.confirm(
          LanguageManager.t('confirm_delete_single_title'),
          LanguageManager.t('confirm_delete_single_text'),
          async () => {
            await ClinicRepository.deleteMRIRecord(id);
            UI.Toast.success(LanguageManager.t('toast_mri_deleted'));
            await refreshMRIDashboard();
          },
          LanguageManager.t('btn_yes_delete'),
          true
        );
        return;
      }

      // 3. View Details Action (for standard office transactions)
      const viewBtn = e.target.closest('.btn-action-view');
      if (viewBtn) {
        const txId = viewBtn.getAttribute('data-id');
        const transactions = await ClinicRepository.getTransactions();
        const tx = transactions.find(t => t.id === txId);
        if (tx) {
          const detailHtml = `
            <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: start;">
              <div><strong>${LanguageManager.t('table_id')}:</strong> ${tx.id}</div>
              <div><strong>${LanguageManager.t('form_patient_name')}:</strong> ${tx.patientName} (${tx.patientContact || 'N/A'})</div>
              <div><strong>${LanguageManager.t('form_service_description')}:</strong> ${tx.service}</div>
              <div><strong>${LanguageManager.t('table_total')}:</strong> ${CalculationEngine.formatPKR(tx.totalFee)}</div>
              <div><strong>${LanguageManager.t('kpi_doctor_share')}:</strong> ${CalculationEngine.formatPKR(tx.doctorAmount)} (${tx.doctorPercent}%)</div>
              <div><strong>${LanguageManager.t('kpi_office_share')}:</strong> ${CalculationEngine.formatPKR(tx.officeAmount)}</div>
              <div><strong>${LanguageManager.t('kpi_pending_balance')}:</strong> ${CalculationEngine.formatPKR(tx.remainingBalance)}</div>
              <div><strong>${LanguageManager.t('table_status')}:</strong> ${tx.status.toUpperCase()}</div>
              <div><strong>${LanguageManager.t('form_notes')}:</strong> ${tx.notes || 'No remarks provided'}</div>
            </div>
          `;
          UI.Modal.confirm(`Transaction ${tx.id}`, detailHtml, () => {});
        }
      }
    });
  }

  // Handle MRI Edit Form Submit
  if (mriEditForm) {
    mriEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = mriEditId.value;
      const patientName = FormValidator.sanitize(mriEditPatientName.value);
      const mriType = FormValidator.sanitize(mriEditTypeInput.value);
      const payment = Number(mriEditPaymentInput.value);
      const date = mriEditDateInput.value;

      if (!patientName || !mriType) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        return;
      }

      if (isNaN(payment) || payment <= 0) {
        UI.Toast.error(LanguageManager.t('toast_positive_payment'));
        return;
      }

      try {
        await ClinicRepository.updateMRIRecord(id, {
          patientName,
          mriType,
          payment,
          date
        });

        UI.Modal.close('mri-edit-modal');
        UI.Toast.success(LanguageManager.t('toast_mri_updated'));
        if (NavigationManager.getActiveOfficeId() === 'doctor') {
          await refreshDoctorDashboard();
        } else {
          await refreshMRIDashboard();
        }
      } catch (err) {
        console.error("Error updating MRI record:", err);
        UI.Toast.error("Failed to update MRI record.");
      }
    });
  }

  // Handle Clear All Button (with confirmation requirement)
  if (btnClearAllMRI) {
    btnClearAllMRI.addEventListener('click', () => {
      UI.Modal.confirm(
        LanguageManager.t('confirm_clear_all_title'),
        LanguageManager.t('confirm_clear_all_text'),
        async () => {
          await ClinicRepository.clearAllMRIRecords();
          UI.Toast.success(LanguageManager.t('toast_mri_cleared'));
          await refreshMRIDashboard();
        },
        LanguageManager.t('btn_yes_delete_all'),
        true
      );
    });
  }

  // Handle Investigation Edit Form Submit
  if (invEditForm) {
    invEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = invEditId.value;
      const patientName = FormValidator.sanitize(invEditPatientName.value);
      const testName = FormValidator.sanitize(invEditTestNameInput.value);
      const payment = Number(invEditPaymentInput.value);
      const date = invEditDateInput.value;

      if (!patientName || !testName) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        return;
      }

      if (isNaN(payment) || payment <= 0) {
        UI.Toast.error(LanguageManager.t('toast_positive_payment'));
        return;
      }

      try {
        await ClinicRepository.updateInvestigationRecord(id, {
          patientName,
          testName,
          payment,
          date
        });

        UI.Modal.close('inv-edit-modal');
        UI.Toast.success(LanguageManager.t('toast_inv_updated'));
        if (NavigationManager.getActiveOfficeId() === 'doctor') {
          await refreshDoctorDashboard();
        } else {
          await refreshInvestigationDashboard();
        }
      } catch (err) {
        console.error("Error updating Investigation record:", err);
        UI.Toast.error("Failed to update Investigation record.");
      }
    });
  }

  // Handle Clear All Investigation Button (with confirmation requirement)
  if (btnClearAllInvestigation) {
    btnClearAllInvestigation.addEventListener('click', () => {
      UI.Modal.confirm(
        LanguageManager.t('confirm_clear_all_inv_title'),
        LanguageManager.t('confirm_clear_all_inv_text'),
        async () => {
          await ClinicRepository.clearAllInvestigationRecords();
          UI.Toast.success(LanguageManager.t('toast_inv_cleared'));
          await refreshInvestigationDashboard();
        },
        LanguageManager.t('btn_yes_delete_all'),
        true
      );
    });
  }

  // Handle Operation Edit Form Submit
  if (opEditForm) {
    opEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = opEditId.value;
      const patientName = FormValidator.sanitize(opEditPatientName.value);
      const operationName = FormValidator.sanitize(opEditOperationNameInput.value);
      const payment = Number(opEditPaymentInput.value);
      const date = opEditDateInput.value;

      if (!patientName || !operationName) {
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        return;
      }

      if (isNaN(payment) || payment <= 0) {
        UI.Toast.error(LanguageManager.t('toast_positive_payment'));
        return;
      }

      try {
        await ClinicRepository.updateOperationRecord(id, {
          patientName,
          operationName,
          payment,
          date
        });

        UI.Modal.close('op-edit-modal');
        UI.Toast.success(LanguageManager.t('toast_op_updated'));
        if (NavigationManager.getActiveOfficeId() === 'doctor') {
          await refreshDoctorDashboard();
        } else {
          await refreshOperationDashboard();
        }
      } catch (err) {
        console.error("Error updating Operation record:", err);
        UI.Toast.error("Failed to update Operation record.");
      }
    });
  }

  // Handle Clear All Operation Button (with confirmation requirement)
  if (btnClearAllOperation) {
    btnClearAllOperation.addEventListener('click', () => {
      UI.Modal.confirm(
        LanguageManager.t('confirm_clear_all_op_title'),
        LanguageManager.t('confirm_clear_all_op_text'),
        async () => {
          await ClinicRepository.clearAllOperationRecords();
          UI.Toast.success(LanguageManager.t('toast_op_cleared'));
          await refreshOperationDashboard();
        },
        LanguageManager.t('btn_yes_delete_all'),
        true
      );
    });
  }

  /* ------------------------------------------------------------------------
     9. Live Modal Calculation Preview (Generic Office Payment)
     ------------------------------------------------------------------------ */
  function updateModalCalculations() {
    if (!inputTotalFee) return;
    const totalFee = Number(inputTotalFee.value) || 0;
    const doctorPct = Number(inputDoctorPct.value) || 0;
    const paidAmount = Number(inputPaidAmount.value) || 0;

    const doctorShare = CalculationEngine.calculateDoctorShare(totalFee, doctorPct);
    const officeShare = CalculationEngine.calculateOfficeShare(totalFee, doctorPct);
    const balanceDue = CalculationEngine.calculateRemainingBalance(totalFee, paidAmount);

    if (previewDoctorAmt) previewDoctorAmt.textContent = CalculationEngine.formatPKR(doctorShare);
    if (previewOfficeAmt) previewOfficeAmt.textContent = CalculationEngine.formatPKR(officeShare);
    if (previewBalanceDue) previewBalanceDue.textContent = CalculationEngine.formatPKR(balanceDue);
  }

  if (inputTotalFee && inputDoctorPct && inputPaidAmount) {
    inputTotalFee.addEventListener('input', updateModalCalculations);
    inputDoctorPct.addEventListener('input', updateModalCalculations);
    inputPaidAmount.addEventListener('input', updateModalCalculations);
  }

  // Generic Payment Modal Submission
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(paymentForm);
      const payload = {
        patientName: FormValidator.sanitize(formData.get('patientName')),
        patientContact: FormValidator.sanitize(formData.get('patientContact')),
        officeId: formData.get('officeId'),
        service: FormValidator.sanitize(formData.get('service')),
        totalFee: Number(formData.get('totalFee')),
        doctorPercent: Number(formData.get('doctorPercent')),
        paidAmount: Number(formData.get('paidAmount')),
        paymentMethod: formData.get('paymentMethod'),
        notes: FormValidator.sanitize(formData.get('notes'))
      };

      const validation = FormValidator.validatePaymentPayload(payload);
      if (!validation.isValid) {
        FormValidator.applyErrorsToForm(paymentForm, validation.errors);
        UI.Toast.error(LanguageManager.t('toast_fill_required'));
        return;
      }

      payload.doctorAmount = CalculationEngine.calculateDoctorShare(payload.totalFee, payload.doctorPercent);
      payload.officeAmount = CalculationEngine.calculateOfficeShare(payload.totalFee, payload.doctorPercent);
      payload.remainingBalance = CalculationEngine.calculateRemainingBalance(payload.totalFee, payload.paidAmount);
      payload.status = CalculationEngine.resolvePaymentStatus(payload.totalFee, payload.paidAmount);

      try {
        await ClinicRepository.addTransaction(payload);
        UI.Modal.close('payment-modal');
        UI.Toast.success(LanguageManager.t('toast_payment_added'));
        paymentForm.reset();
        await refreshDashboard();
      } catch (err) {
        console.error("Save transaction error:", err);
        UI.Toast.error("Failed to store payment transaction.");
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. Event Listeners: Navigation, Language, and Filters
     ------------------------------------------------------------------------ */
  window.addEventListener('officeChanged', async (e) => {
    const officeId = e.detail.officeId;

    const office = await ClinicRepository.getOfficeById(officeId);
    if (office && inputDoctorPct) {
      inputDoctorPct.value = office.defaultDoctorSharePercent;
      updateModalCalculations();
    }

    refreshDashboard();
  });

  window.addEventListener('languageChanged', () => {
    syncDateAndDay(mriDateInput, mriDayInput);
    if (mriEditDateInput && mriEditDayInput) {
      syncDateAndDay(mriEditDateInput, mriEditDayInput);
    }
    syncDateAndDay(invDateInput, invDayInput);
    if (invEditDateInput && invEditDayInput) {
      syncDateAndDay(invEditDateInput, invEditDayInput);
    }
    syncDateAndDay(opDateInput, opDayInput);
    if (opEditDateInput && opEditDayInput) {
      syncDateAndDay(opEditDateInput, opEditDayInput);
    }
    updateMRILiveCalculation();
    updateInvestigationLiveCalculation();
    updateOperationLiveCalculation();
    refreshDashboard();
  });

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilters.search = e.target.value;
        refreshDashboard();
      }, 250);
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentFilters.status = e.target.value;
      refreshDashboard();
    });
  }

  if (dateFilter) {
    dateFilter.addEventListener('change', (e) => {
      currentFilters.dateRange = e.target.value;
      refreshDashboard();
    });
  }

  if (btnOpenPaymentModal) {
    btnOpenPaymentModal.addEventListener('click', () => {
      const activeOffice = NavigationManager.getActiveOfficeId();
      const officeSelect = document.getElementById('modal-office-select');
      if (officeSelect) officeSelect.value = activeOffice;
      
      paymentForm.reset();
      ClinicRepository.getOfficeById(activeOffice).then(off => {
        if (off && inputDoctorPct) {
          inputDoctorPct.value = off.defaultDoctorSharePercent;
          updateModalCalculations();
        }
      });

      UI.Modal.open('payment-modal');
    });
  }

  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetModal = btn.closest('.modal-backdrop');
      if (targetModal) UI.Modal.close(targetModal.id);
    });
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      LanguageManager.setLanguage(lang);
    });
  });

  // Export Report CSV (Handles MRI, Investigation, Operation, Doctor, and Standard Transactions)
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      const activeOffice = NavigationManager.getActiveOfficeId();
      if (activeOffice === 'doctor') {
        await exportDoctorReportCSV();
        return;
      }
      let csvContent = "data:text/csv;charset=utf-8,";

      if (activeOffice === 'mri') {
        const records = await ClinicRepository.getMRIRecords();
        csvContent += "ID,Patient Name,MRI Type,Payment,MRI Office Share,Doctor Amount,Date,Day\n";
        records.forEach(r => {
          csvContent += `"${r.id}","${r.patientName}","${r.mriType}",${r.payment},${r.officeShare},${r.doctorAmount},"${r.date}","${r.day}"\n`;
        });
      } else if (activeOffice === 'investigation') {
        const records = await ClinicRepository.getInvestigationRecords();
        csvContent += "ID,Patient Name,Test Name,Payment,Doctor Amount,Date,Day\n";
        records.forEach(r => {
          csvContent += `"${r.id}","${r.patientName}","${r.testName}",${r.payment},${r.doctorAmount},"${r.date}","${r.day}"\n`;
        });
      } else if (activeOffice === 'operation') {
        const records = await ClinicRepository.getOperationRecords();
        csvContent += "ID,Patient Name,Operation Name,Payment,Doctor Amount,Date,Day\n";
        records.forEach(r => {
          csvContent += `"${r.id}","${r.patientName}","${r.operationName}",${r.payment},${r.doctorAmount},"${r.date}","${r.day}"\n`;
        });
      } else {
        const transactions = await ClinicRepository.getTransactions(activeOffice);
        csvContent += "ID,Office,Patient Name,Contact,Service,Total Fee,Doctor Share,Office Share,Paid Amount,Remaining Due,Status,Date\n";
        transactions.forEach(t => {
          csvContent += `"${t.id}","${t.officeId}","${t.patientName}","${t.patientContact || ''}","${t.service}",${t.totalFee},${t.doctorAmount},${t.officeAmount},${t.paidAmount},${t.remainingBalance},"${t.status}","${t.date}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Clinic_Payments_${activeOffice}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      UI.Toast.success("Financial statement exported as CSV.");
    });
  }

  /* ------------------------------------------------------------------------
     10B. Doctor Dashboard Interactive Listeners
     - Strictly 3 Date Filters: Today, Yesterday, This Week
     - 3 Department Tabs: MRI, Investigation, Assistant
     - Clear Tab Records (with confirmation)
     - Table Row Edit & Delete (with confirmation)
     - CSV Export for Doctor
     ------------------------------------------------------------------------ */

  // 1. Doctor Department Tabs Navigation
  document.querySelectorAll('.doctor-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab');
      if (!tab || tab === doctorActiveTab) return;

      document.querySelectorAll('.doctor-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      doctorActiveTab = tab;
      refreshDoctorDashboard();
    });
  });

  // 2. Doctor Date Range Filters (STRICTLY ONLY: today, yesterday, week)
  document.querySelectorAll('.doctor-date-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const range = btn.getAttribute('data-range');
      if (!range || range === doctorDateFilter) return;

      document.querySelectorAll('.doctor-date-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      doctorDateFilter = range;
      refreshDoctorDashboard();
    });
  });

  // 3. Clear All Records For Active Tab
  if (btnDoctorClearTab) {
    btnDoctorClearTab.addEventListener('click', () => {
      UI.Modal.confirm(
        LanguageManager.t('confirm_clear_doctor_tab_title'),
        LanguageManager.t('confirm_clear_doctor_tab_text'),
        async () => {
          if (doctorActiveTab === 'mri') {
            await ClinicRepository.clearAllMRIRecords();
          } else if (doctorActiveTab === 'investigation') {
            await ClinicRepository.clearAllInvestigationRecords();
          } else if (doctorActiveTab === 'assistant') {
            await ClinicRepository.clearAllOperationRecords();
          }
          UI.Toast.success(LanguageManager.t('toast_doctor_tab_cleared'));
          await refreshDoctorDashboard();
        },
        LanguageManager.t('btn_yes_delete_all'),
        true
      );
    });
  }

  // 4. Doctor Tab Table Action Delegation (Edit & Delete)
  if (doctorTableTbody) {
    doctorTableTbody.addEventListener('click', async (e) => {
      // Edit record
      const editBtn = e.target.closest('.btn-doc-edit');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const dept = editBtn.getAttribute('data-dept');

        if (dept === 'mri') {
          const record = await ClinicRepository.getMRIRecordById(id);
          if (record) {
            mriEditId.value = record.id;
            mriEditPatientName.value = record.patientName;
            mriEditTypeInput.value = record.mriType;
            mriEditPaymentInput.value = record.payment;
            mriEditDateInput.value = record.date;
            syncDateAndDay(mriEditDateInput, mriEditDayInput);
            updateMRIEditLiveCalculation();
            UI.Modal.open('mri-edit-modal');
          }
        } else if (dept === 'investigation') {
          const record = await ClinicRepository.getInvestigationRecordById(id);
          if (record) {
            invEditId.value = record.id;
            invEditPatientName.value = record.patientName;
            invEditTestNameInput.value = record.testName;
            invEditPaymentInput.value = record.payment;
            invEditDateInput.value = record.date;
            syncDateAndDay(invEditDateInput, invEditDayInput);
            updateInvestigationEditLiveCalculation();
            UI.Modal.open('inv-edit-modal');
          }
        } else if (dept === 'assistant') {
          const record = await ClinicRepository.getOperationRecordById(id);
          if (record) {
            opEditId.value = record.id;
            opEditPatientName.value = record.patientName;
            opEditOperationNameInput.value = record.operationName;
            opEditPaymentInput.value = record.payment;
            opEditDateInput.value = record.date;
            syncDateAndDay(opEditDateInput, opEditDayInput);
            updateOperationEditLiveCalculation();
            UI.Modal.open('op-edit-modal');
          }
        }
        return;
      }

      // Delete record (requires confirmation)
      const deleteBtn = e.target.closest('.btn-doc-delete');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const dept = deleteBtn.getAttribute('data-dept');

        let titleKey = 'confirm_delete_single_title';
        let textKey = 'confirm_delete_single_text';
        let toastKey = 'toast_mri_deleted';

        if (dept === 'investigation') {
          titleKey = 'confirm_delete_single_inv_title';
          textKey = 'confirm_delete_single_inv_text';
          toastKey = 'toast_inv_deleted';
        } else if (dept === 'assistant') {
          titleKey = 'confirm_delete_single_op_title';
          textKey = 'confirm_delete_single_op_text';
          toastKey = 'toast_op_deleted';
        }

        UI.Modal.confirm(
          LanguageManager.t(titleKey),
          LanguageManager.t(textKey),
          async () => {
            if (dept === 'mri') {
              await ClinicRepository.deleteMRIRecord(id);
            } else if (dept === 'investigation') {
              await ClinicRepository.deleteInvestigationRecord(id);
            } else if (dept === 'assistant') {
              await ClinicRepository.deleteOperationRecord(id);
            }
            UI.Toast.success(LanguageManager.t(toastKey));
            await refreshDoctorDashboard();
          },
          LanguageManager.t('btn_yes_delete'),
          true
        );
      }
    });
  }

  // 5. Doctor Export Report CSV Handler
  async function exportDoctorReportCSV() {
    const records = await ClinicRepository.getDoctorFilteredRecords(doctorActiveTab, doctorDateFilter);
    let csvContent = "data:text/csv;charset=utf-8,";

    if (doctorActiveTab === 'mri') {
      csvContent += "ID,Patient Name,MRI Type,Payment,MRI Office Share,Doctor Amount,Date,Day\n";
      records.forEach(r => {
        csvContent += `"${r.id}","${r.patientName}","${r.mriType}",${r.payment},${r.officeShare},${r.doctorAmount},"${r.date}","${r.day}"\n`;
      });
    } else if (doctorActiveTab === 'investigation') {
      csvContent += "ID,Patient Name,Test Name,Payment,Doctor Amount,Date,Day\n";
      records.forEach(r => {
        csvContent += `"${r.id}","${r.patientName}","${r.testName}",${r.payment},${r.doctorAmount},"${r.date}","${r.day}"\n`;
      });
    } else {
      csvContent += "ID,Patient Name,Operation Name,Payment,Doctor Amount,Date,Day\n";
      records.forEach(r => {
        csvContent += `"${r.id}","${r.patientName}","${r.operationName}",${r.payment},${r.doctorAmount},"${r.date}","${r.day}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_${doctorActiveTab.toUpperCase()}_${doctorDateFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    UI.Toast.success("Doctor report exported as CSV.");
  }

  if (btnDoctorExport) {
    btnDoctorExport.addEventListener('click', exportDoctorReportCSV);
  }

  // ==========================================================================
  // Authentication & Role-Based Access Control (RBAC) Controller
  // ==========================================================================

  function showAuthError(msg) {
    if (authErrorBanner && authErrorText) {
      authErrorText.textContent = msg;
      authErrorBanner.classList.add('visible');
    }
  }

  function hideAuthError() {
    if (authErrorBanner) {
      authErrorBanner.classList.remove('visible');
    }
  }

  function renderAuthState(session) {
    if (session && session.user) {
      // User is authenticated: Show main application, hide login portal
      if (authView) authView.style.display = 'none';
      if (appRoot) appRoot.style.display = 'flex';

      // Clear any prior table and KPI content immediately to prevent visual bleed across sessions
      if (transactionsTbody) transactionsTbody.innerHTML = '';
      if (kpiContainer) kpiContainer.innerHTML = '';
      if (doctorTableTbody) doctorTableTbody.innerHTML = '';
      if (doctorTabKPISurface) doctorTabKPISurface.innerHTML = '';

      // Enforce role-based sidebar visibility (restrict each officer to their own office)
      NavigationManager.syncRoleNavigation(session.user);

      // Always direct user to their designated related dashboard upon login
      NavigationManager.setActiveOffice(session.user.office, true, true);
    } else {
      // User is unauthenticated: Show login portal, hide main application
      if (authView) authView.style.display = 'flex';
      if (appRoot) appRoot.style.display = 'none';

      // Invalidate all pending render sequences so in-flight async calls are discarded
      ++currentDashboardSeq;
      ++doctorRenderSeq;

      // Clear all UI tables and metrics
      if (transactionsTbody) transactionsTbody.innerHTML = '';
      if (kpiContainer) kpiContainer.innerHTML = '';
      if (doctorTableTbody) doctorTableTbody.innerHTML = '';
      if (doctorTabKPISurface) doctorTabKPISurface.innerHTML = '';

      if (loginForm) loginForm.reset();
      hideAuthError();
      if (loginPasswordInput) loginPasswordInput.type = 'password';
      if (pwdIconEye) pwdIconEye.style.display = '';
      if (pwdIconEyeOff) pwdIconEyeOff.style.display = 'none';
      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = false;
        if (loginBtnText) loginBtnText.textContent = LanguageManager.t('login_btn_submit');
      }
    }
  }

  // Bind Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthError();

      const identity = loginIdentityInput ? loginIdentityInput.value.trim() : '';
      const password = loginPasswordInput ? loginPasswordInput.value : '';

      if (!identity || !password) {
        showAuthError(LanguageManager.t('auth_error_missing'));
        return;
      }

      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        if (loginBtnText) loginBtnText.textContent = LanguageManager.t('login_btn_signing_in');
      }

      try {
        const { data, error } = await AuthService.signInWithPassword({ email: identity, password });

        if (error) {
          showAuthError(LanguageManager.t('auth_error_invalid'));
          if (loginSubmitBtn) {
            loginSubmitBtn.disabled = false;
            if (loginBtnText) loginBtnText.textContent = LanguageManager.t('login_btn_submit');
          }
          return;
        }

        // Authentication Success
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          if (loginBtnText) loginBtnText.textContent = LanguageManager.t('login_btn_submit');
        }

        const officerName = LanguageManager.t(data.user.nameKey);
        UI.Toast.success(`${LanguageManager.t('auth_success_welcome')}, ${officerName}!`);
        renderAuthState(data.session);

      } catch (err) {
        console.error("Login authentication error:", err);
        showAuthError(LanguageManager.t('auth_error_invalid'));
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          if (loginBtnText) loginBtnText.textContent = LanguageManager.t('login_btn_submit');
        }
      }
    });
  }

  // Bind Quick Role Switcher Pills (Demo & Verification)
  rolePillButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      const roleId = btn.getAttribute('data-role-id');
      if (loginIdentityInput && loginPasswordInput) {
        let fillEmail = email;
        let fillPass = 'clinic2026';

        if (SupabaseClient.isReady()) {
          if (roleId === 'usr_aqeb_01' || (email && email.includes('aqeb'))) {
            fillEmail = 'aqeb@gmail.com';
            fillPass = 'aqeb@123';
          } else if (roleId === 'usr_shezaad_02' || (email && email.includes('shezaad'))) {
            fillEmail = 'shezaad@test.com';
            fillPass = 'shezaad@123';
          } else if (roleId === 'usr_mustajab_03' || (email && email.includes('mustajab'))) {
            fillEmail = 'mustajab@test.com';
            fillPass = 'mustajab@123';
          } else if (roleId === 'usr_nawaz_04' || (email && (email.includes('doctor') || email.includes('nawaz')))) {
            fillEmail = 'drnawaz@test.com';
            fillPass = 'drnawaz@123';
          }
        }

        loginIdentityInput.value = fillEmail;
        loginPasswordInput.value = fillPass;
        hideAuthError();

        if (fillPass && loginSubmitBtn) {
          loginSubmitBtn.click();
        } else if (!fillPass) {
          loginPasswordInput.focus();
        }
      }
    });
  });

  // Password Visibility Toggle
  if (btnTogglePwd && loginPasswordInput) {
    btnTogglePwd.addEventListener('click', () => {
      const isPassword = loginPasswordInput.type === 'password';
      loginPasswordInput.type = isPassword ? 'text' : 'password';
      if (pwdIconEye) pwdIconEye.style.display = isPassword ? 'none' : '';
      if (pwdIconEyeOff) pwdIconEyeOff.style.display = isPassword ? '' : 'none';
    });
  }

  // Logout Handlers (Sidebar Footer and Top Header)
  function promptSignOut() {
    UI.Modal.confirm(
      LanguageManager.t('logout_confirm_title'),
      LanguageManager.t('logout_confirm_text'),
      async () => {
        await AuthService.signOut();
        UI.Toast.info(LanguageManager.t('toast_logged_out'));
        renderAuthState(null);
      },
      LanguageManager.t('btn_logout'),
      false
    );
  }

  if (btnSidebarLogout) {
    btnSidebarLogout.addEventListener('click', promptSignOut);
  }
  if (btnHeaderLogout) {
    btnHeaderLogout.addEventListener('click', promptSignOut);
  }

  // Listen to Auth State Changes & Language Switch Events
  AuthService.onAuthStateChange((event, session) => {
    renderAuthState(session);
  });

  // ==========================================================================
  // Supabase Status & Configuration Controller
  // ==========================================================================

  function updateSupabaseStatusDisplay() {
    const isReady = SupabaseClient.isReady();
    const connStatus = SupabaseClient.getConnectionStatus();

    [btnSupabaseStatus, btnAuthSupabaseStatus].forEach(btn => {
      if (!btn) return;
      if (isReady && connStatus.status === 'connected') {
        btn.classList.add('connected');
        btn.classList.remove('error');
      } else if (connStatus.status === 'error') {
        btn.classList.remove('connected');
        btn.classList.add('error');
      } else {
        btn.classList.remove('connected', 'error');
      }
    });

    if (supabaseStatusText) {
      if (isReady && connStatus.status === 'connected') {
        supabaseStatusText.setAttribute('data-i18n', 'supabase_status_connected');
        supabaseStatusText.textContent = LanguageManager.t('supabase_status_connected');
      } else if (connStatus.status === 'error') {
        supabaseStatusText.setAttribute('data-i18n', 'supabase_status_error');
        supabaseStatusText.textContent = LanguageManager.t('supabase_status_error');
      } else {
        supabaseStatusText.setAttribute('data-i18n', 'supabase_status_unconfigured');
        supabaseStatusText.textContent = LanguageManager.t('supabase_status_unconfigured');
      }
    }
  }

  function openSupabaseConfigModal() {
    if (sbModalUrl) sbModalUrl.value = SupabaseConfig.getUrl();
    if (sbModalKey) sbModalKey.value = SupabaseConfig.getAnonKey();
    if (sbConfigAlert) {
      sbConfigAlert.style.display = 'none';
      sbConfigAlert.textContent = '';
      sbConfigAlert.className = 'auth-error-banner';
    }
    UI.Modal.open('supabase-config-modal');
  }

  if (btnSupabaseStatus) {
    btnSupabaseStatus.addEventListener('click', openSupabaseConfigModal);
  }
  if (btnAuthSupabaseStatus) {
    btnAuthSupabaseStatus.addEventListener('click', openSupabaseConfigModal);
  }

  if (btnSbSaveConfig) {
    btnSbSaveConfig.addEventListener('click', async () => {
      const url = sbModalUrl ? sbModalUrl.value.trim() : '';
      const key = sbModalKey ? sbModalKey.value.trim() : '';

      const res = SupabaseConfig.setCredentials(url, key);
      if (!res.success) {
        if (sbConfigAlert) {
          sbConfigAlert.style.display = 'flex';
          sbConfigAlert.className = 'auth-error-banner visible';
          sbConfigAlert.textContent = res.error;
        }
        return;
      }

      SupabaseClient.init();
      const test = await SupabaseClient.testConnection();
      UI.Modal.close('supabase-config-modal');

      if (test.ok) {
        UI.Toast.success(LanguageManager.t('supabase_saved_success'));
      } else {
        UI.Toast.info(`${LanguageManager.t('supabase_saved_success')} (${test.message})`);
      }
      updateSupabaseStatusDisplay();
    });
  }

  if (btnSbClearConfig) {
    btnSbClearConfig.addEventListener('click', () => {
      SupabaseConfig.clearCredentials();
      SupabaseClient.init();
      UI.Modal.close('supabase-config-modal');
      UI.Toast.info("Reset to Local Standby Mode.");
      updateSupabaseStatusDisplay();
    });
  }

  if (btnSbTestConn) {
    btnSbTestConn.addEventListener('click', async () => {
      const url = sbModalUrl ? sbModalUrl.value.trim() : '';
      const key = sbModalKey ? sbModalKey.value.trim() : '';

      if (!url || !key) {
        if (sbConfigAlert) {
          sbConfigAlert.style.display = 'flex';
          sbConfigAlert.className = 'auth-error-banner visible';
          sbConfigAlert.textContent = "Please enter both URL and Anon Key to test.";
        }
        return;
      }

      if (sbConfigAlert) {
        sbConfigAlert.style.display = 'flex';
        sbConfigAlert.className = 'auth-error-banner visible';
        sbConfigAlert.style.background = '#EFF6FF';
        sbConfigAlert.style.borderColor = '#93C5FD';
        sbConfigAlert.style.color = '#1E40AF';
        sbConfigAlert.textContent = "Connecting to Supabase...";
      }

      if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        try {
          const testClient = window.supabase.createClient(url, key);
          const { error } = await testClient.from('profiles').select('id').limit(1);
          if (error && error.code !== 'PGRST116' && error.code !== '42501' && !error.message?.includes('JWT')) {
            sbConfigAlert.style.background = '#FEF2F2';
            sbConfigAlert.style.borderColor = '#FCA5A5';
            sbConfigAlert.style.color = '#991B1B';
            sbConfigAlert.textContent = SupabaseClient.formatErrorMessage(error);
          } else {
            sbConfigAlert.style.background = '#ECFDF5';
            sbConfigAlert.style.borderColor = '#A7F3D0';
            sbConfigAlert.style.color = '#065F46';
            sbConfigAlert.textContent = LanguageManager.t('supabase_test_success');
          }
        } catch (e) {
          sbConfigAlert.style.background = '#FEF2F2';
          sbConfigAlert.style.borderColor = '#FCA5A5';
          sbConfigAlert.style.color = '#991B1B';
          sbConfigAlert.textContent = e.message || "Failed to reach Supabase URL.";
        }
      } else {
        sbConfigAlert.style.background = '#FEF2F2';
        sbConfigAlert.style.borderColor = '#FCA5A5';
        sbConfigAlert.style.color = '#991B1B';
        sbConfigAlert.textContent = "Supabase JS SDK not loaded.";
      }
    });
  }

  window.addEventListener('supabaseStatusChanged', () => {
    updateSupabaseStatusDisplay();
  });

  window.addEventListener('languageChanged', () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      NavigationManager.syncRoleNavigation(user);
    }
    updateSupabaseStatusDisplay();
  });

  // 11. Initial Startup & Session Verification
  SupabaseClient.init();
  updateSupabaseStatusDisplay();
  NavigationManager.init();
  const sessionRes = await AuthService.getSession();
  renderAuthState(sessionRes.data.session);

  window.addEventListener('refreshDashboard', () => {
    refreshDashboard();
  });

  // Expose AppController facade for testing and external triggers
  window.AppController = {
    refresh: refreshDashboard,
    renderAuthState: renderAuthState
  };
});
