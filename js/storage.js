/**
 * Clinic Payment Management System - Repository & Service Facade Layer
 * 
 * ARCHITECTURE NOTE:
 * ClinicRepository serves as the unified orchestration facade coordinating
 * dedicated service modules (MRIService, InvestigationService, OperationService, UserService).
 * 
 * All queries route through the dedicated service layer to Supabase with PostgreSQL Row Level 
 * Security (RLS), falling back gracefully to local cached state when offline or unconfigured.
 */

const ClinicRepository = (function () {
  const STORAGE_KEY_OFFICES = 'clinic_pay_offices_v1';
  const STORAGE_KEY_TRANSACTIONS = 'clinic_pay_transactions_v1';
  const STORAGE_KEY_MRI = 'clinic_pay_mri_records_v1';
  const STORAGE_KEY_INVESTIGATION = 'clinic_pay_investigation_records_v1';
  const STORAGE_KEY_OPERATION = 'clinic_pay_operation_records_v1';

  // Seed sample initial mock data if localStorage is completely blank
  const INITIAL_OFFICES = [
    {
      id: "mri",
      name: "MRI Office",
      nameKey: "mri_office",
      officer: "Aqeb Khan",
      officerKey: "officer_aqeb",
      role: "MRI Incharge",
      roleKey: "role_mri_officer",
      initials: "AK",
      accentColor: "var(--red-500)",
      description: "High-resolution diagnostic MRI magnetic resonance imaging facility."
    },
    {
      id: "investigation",
      name: "Investigation Office",
      nameKey: "investigation_office",
      officer: "Shezaad",
      officerKey: "officer_shezaad",
      role: "Investigation Officer",
      roleKey: "role_inv_officer",
      initials: "SH",
      accentColor: "var(--info-badge)",
      description: "Comprehensive pathology, blood biochemistry, histology & molecular laboratory."
    },
    {
      id: "operation",
      name: "Operation / Assistant Office",
      nameKey: "operation_office",
      officer: "Assistant Console",
      officerKey: "officer_mustajab",
      role: "Surgical Assistant Incharge",
      roleKey: "role_asst_officer",
      initials: "AC",
      accentColor: "var(--warning-badge)",
      description: "Operating theater coordination, surgical procedures, and minor operations."
    },
    {
      id: "doctor",
      name: "Head Office",
      nameKey: "doctor_office",
      officer: "Admin Console",
      officerKey: "doctor_nawaz",
      role: "Lead Consultant Surgeon",
      roleKey: "role_consultant",
      initials: "AC",
      accentColor: "var(--navy-900)",
      description: "Primary physician clinical consultation, surgery planning, and financial oversight."
    }
  ];

  function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY_OFFICES)) {
      localStorage.setItem(STORAGE_KEY_OFFICES, JSON.stringify(INITIAL_OFFICES));
    }
    if (!localStorage.getItem(STORAGE_KEY_TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
    }
  }

  // --------------------------------------------------------------------------
  // 1. MRI Office Methods (Delegates to MRIService)
  // --------------------------------------------------------------------------

  async function getMRIRecords(filters) {
    const all = await MRIService.getAll();
    if (!filters) return all;
    let filtered = all;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(r => (r.patientName && r.patientName.toLowerCase().includes(q)) || (r.mriType && r.mriType.toLowerCase().includes(q)));
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      filtered = CalculationEngine.filterRecordsByDateRange(filtered, filters.dateRange);
    }
    return filtered;
  }

  async function getMRIRecordById(id) {
    const records = await MRIService.getAll();
    return records.find(r => String(r.id) === String(id)) || null;
  }

  async function addMRIRecord(record) {
    const res = await MRIService.create(record);
    if (res.error) throw new Error(res.error);
    return res.data;
  }

  async function updateMRIRecord(idOrRecord, optionalUpdates) {
    const id = (typeof idOrRecord === 'object' && idOrRecord !== null) ? idOrRecord.id : idOrRecord;
    const updates = (typeof optionalUpdates === 'object' && optionalUpdates !== null) ? optionalUpdates : idOrRecord;
    const res = await MRIService.update(id, updates);
    if (res.error) throw new Error(res.error);
    return res.data;
  }

  async function deleteMRIRecord(id) {
    const res = await MRIService.delete(id);
    if (res.error) throw new Error(res.error);
    return true;
  }

  async function clearAllMRIRecords() {
    const res = await MRIService.clearAll();
    if (res.error) throw new Error(res.error);
    return true;
  }

  async function getMRISummaryMetrics() {
    const records = await MRIService.getAll();
    return CalculationEngine.calculateMRISummaryMetrics(records);
  }

  // --------------------------------------------------------------------------
  // 2. Investigation Office Methods (Delegates to InvestigationService)
  // --------------------------------------------------------------------------

  async function getInvestigationRecords(filters) {
    const all = await InvestigationService.getAll();
    if (!filters) return all;
    let filtered = all;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(r => (r.patientName && r.patientName.toLowerCase().includes(q)) || (r.testName && r.testName.toLowerCase().includes(q)));
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      filtered = CalculationEngine.filterRecordsByDateRange(filtered, filters.dateRange);
    }
    return filtered;
  }

  async function getInvestigationRecordById(id) {
    const records = await InvestigationService.getAll();
    return records.find(r => String(r.id) === String(id)) || null;
  }

  async function addInvestigationRecord(record) {
    const res = await InvestigationService.create(record);
    if (res.error) throw new Error(res.error);
    return res.data;
  }

  async function updateInvestigationRecord(idOrRecord, optionalUpdates) {
    const id = (typeof idOrRecord === 'object' && idOrRecord !== null) ? idOrRecord.id : idOrRecord;
    const updates = (typeof optionalUpdates === 'object' && optionalUpdates !== null) ? optionalUpdates : idOrRecord;
    const res = await InvestigationService.update(id, updates);
    if (res.error) throw new Error(res.error);
    return res.data;
  }

  async function deleteInvestigationRecord(id) {
    const res = await InvestigationService.delete(id);
    if (res.error) throw new Error(res.error);
    return true;
  }

  async function clearAllInvestigationRecords() {
    const res = await InvestigationService.clearAll();
    if (res.error) throw new Error(res.error);
    return true;
  }

  async function getInvestigationSummaryMetrics() {
    const records = await InvestigationService.getAll();
    return CalculationEngine.calculateInvestigationSummaryMetrics(records);
  }

  // --------------------------------------------------------------------------
  // 3. Operation / Assistant Office Methods (Delegates to OperationService)
  // --------------------------------------------------------------------------

  async function getOperationRecords(filters) {
    const all = await OperationService.getAll();
    if (!filters) return all;
    let filtered = all;
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(r => 
        (r.patientName && r.patientName.toLowerCase().includes(q)) || 
        (r.operationType && r.operationType.toLowerCase().includes(q)) ||
        (r.operationName && r.operationName.toLowerCase().includes(q))
      );
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      filtered = CalculationEngine.filterRecordsByDateRange(filtered, filters.dateRange);
    }
    return filtered;
  }

  async function getOperationRecordById(id) {
    if (OperationService.getLocalRecords) {
      const local = OperationService.getLocalRecords();
      const match = local.find(r => String(r.id) === String(id));
      if (match) return match;
    }
    const records = await OperationService.getAll();
    return records.find(r => String(r.id) === String(id)) || null;
  }

  async function addOperationRecord(record) {
    const res = await OperationService.create(record);
    if (res.error) throw new Error(res.error);
    return res.data;
  }

  async function updateOperationRecord(idOrRecord, optionalUpdates) {
    const id = (typeof idOrRecord === 'object' && idOrRecord !== null) ? idOrRecord.id : idOrRecord;
    const updates = (typeof optionalUpdates === 'object' && optionalUpdates !== null) ? optionalUpdates : idOrRecord;
    const res = await OperationService.update(id, updates);
    if (res.error) throw new Error(res.error);
    return res.data;
  }

  async function deleteOperationRecord(id) {
    const res = await OperationService.delete(id);
    if (res.error) throw new Error(res.error);
    return true;
  }

  async function clearAllOperationRecords() {
    const res = await OperationService.clearAll();
    if (res.error) throw new Error(res.error);
    return true;
  }

  async function getOperationSummaryMetrics() {
    const records = await OperationService.getAll();
    return CalculationEngine.calculateOperationSummaryMetrics(records);
  }

  // --------------------------------------------------------------------------
  // 4. Doctor Dashboard Unified Aggregations
  // --------------------------------------------------------------------------

  async function getDoctorSummaryMetrics(dateRange = 'today') {
    const [mriAll, invAll, opAll] = await Promise.all([
      MRIService.getAll(),
      InvestigationService.getAll(),
      OperationService.getAll()
    ]);

    const mriFiltered = CalculationEngine.filterRecordsByDateRange(mriAll, dateRange);
    const invFiltered = CalculationEngine.filterRecordsByDateRange(invAll, dateRange);
    const opFiltered = CalculationEngine.filterRecordsByDateRange(opAll, dateRange);

    const mriTotalReceived = mriFiltered.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    const mriOfficeShare = mriFiltered.reduce((sum, r) => sum + (Number(r.officeShare) || 0), 0);
    const mriDoctorAmount = mriFiltered.reduce((sum, r) => sum + (Number(r.doctorAmount) || 0), 0);

    const invTotalReceived = invFiltered.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    const invDoctorAmount = invFiltered.reduce((sum, r) => sum + (Number(r.doctorAmount) || 0), 0);

    const opTotalReceived = opFiltered.reduce((sum, r) => sum + (Number(r.payment || r.receivedPayment) || 0), 0);
    const opDoctorAmount = opFiltered.reduce((sum, r) => sum + (Number(r.doctorAmount) || 0), 0);

    let opSubmittedPayment = 0;
    let opNetSxDay = 0;
    let opNetPayLater = 0;
    let opFinalTotal = 0;

    opFiltered.forEach(r => {
      const calc = CalculationEngine.calculateOperationShare(r.payment || r.receivedPayment, r);
      opSubmittedPayment += calc.submittedPayment;
      opNetSxDay += calc.netToPaySxDay;
      opNetPayLater += calc.netPayLater;
      opFinalTotal += calc.finalTotal;
    });

    const grandDoctorTotal = mriDoctorAmount + invDoctorAmount + opDoctorAmount;
    const totalReceivedAcrossOffices = mriTotalReceived + invTotalReceived + opTotalReceived;
    const totalEntriesAcrossOffices = mriFiltered.length + invFiltered.length + opFiltered.length;

    return {
      dateRange,
      mriTotalReceived,
      mriOfficeShare,
      mriDoctorAmount,
      mriCount: mriFiltered.length,
      invTotalReceived,
      invDoctorAmount,
      invCount: invFiltered.length,
      opTotalReceived,
      opDoctorAmount,
      opSubmittedPayment,
      opNetSxDay,
      opNetPayLater,
      opFinalTotal,
      opCount: opFiltered.length,
      allTimeOpCount: opAll.length,
      grandDoctorTotal,
      totalReceivedAcrossOffices,
      totalEntriesAcrossOffices
    };
  }

  async function getDoctorFilteredRecords(officeType, dateRange = 'today') {
    if (officeType === 'mri') {
      return MRIService.getFiltered(dateRange);
    } else if (officeType === 'investigation') {
      return InvestigationService.getFiltered(dateRange);
    } else if (officeType === 'assistant' || officeType === 'operation') {
      return OperationService.getFiltered(dateRange);
    }
    return [];
  }

  // --------------------------------------------------------------------------
  // 5. General Legacy Transaction & Offices Methods
  // --------------------------------------------------------------------------

  function getOffices() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_OFFICES)) || INITIAL_OFFICES;
  }

  function getOfficeById(officeId) {
    const offices = getOffices();
    return offices.find(o => o.id === officeId) || null;
  }

  async function getTransactions(filters = {}) {
    initStorage();
    let records = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS)) || [];
    if (filters.office && filters.office !== 'all') {
      records = records.filter(r => r.officeId === filters.office);
    }
    if (filters.status && filters.status !== 'all') {
      records = records.filter(r => r.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(r => 
        (r.patientName && r.patientName.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
    }
    return records;
  }

  async function addTransaction(data) {
    initStorage();
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS)) || [];
    records.unshift(data);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(records));
    return data;
  }

  async function getMetrics(officeId = 'all') {
    const txs = await getTransactions({ office: officeId });
    return CalculationEngine.calculateKPISummary(txs);
  }

  return {
    initStorage,
    getOffices,
    getOfficeById,
    getTransactions,
    addTransaction,
    getMetrics,
    getMRIRecords,
    getMRIRecordById,
    addMRIRecord,
    updateMRIRecord,
    deleteMRIRecord,
    clearAllMRIRecords,
    getMRISummaryMetrics,
    saveMRIRecord: async (rec) => rec.id ? updateMRIRecord(rec.id, rec) : addMRIRecord(rec),
    getInvestigationRecords,
    getInvestigationRecordById,
    addInvestigationRecord,
    updateInvestigationRecord,
    deleteInvestigationRecord,
    clearAllInvestigationRecords,
    getInvestigationSummaryMetrics,
    saveInvestigationRecord: async (rec) => rec.id ? updateInvestigationRecord(rec.id, rec) : addInvestigationRecord(rec),
    getOperationRecords,
    getOperationRecordById,
    addOperationRecord,
    updateOperationRecord,
    deleteOperationRecord,
    clearAllOperationRecords,
    getOperationSummaryMetrics,
    saveOperationRecord: async (rec) => rec.id ? updateOperationRecord(rec.id, rec) : addOperationRecord(rec),
    getDoctorSummaryMetrics,
    getDoctorFilteredRecords
  };
})();
