/**
 * Clinic Payment Management System - Financial Calculation Engine
 * Handles monetary shares, percentages, balances, and currency presentation.
 */

const CalculationEngine = (function () {
  /**
   * Calculates doctor's fee split based on total fee and percentage
   */
  function calculateDoctorShare(totalFee, doctorPercent) {
    const fee = Math.max(0, Number(totalFee) || 0);
    const pct = Math.min(100, Math.max(0, Number(doctorPercent) || 0));
    return Math.round((fee * pct) / 100);
  }

  /**
   * Calculates clinic/office facility split
   */
  function calculateOfficeShare(totalFee, doctorPercent) {
    const fee = Math.max(0, Number(totalFee) || 0);
    const doctorAmount = calculateDoctorShare(fee, doctorPercent);
    return Math.max(0, fee - doctorAmount);
  }

  /**
   * Computes outstanding balance due
   */
  function calculateRemainingBalance(totalFee, paidAmount) {
    const fee = Math.max(0, Number(totalFee) || 0);
    const paid = Math.max(0, Number(paidAmount) || 0);
    return Math.max(0, fee - paid);
  }

  /**
   * Determines status string ('paid', 'partial', 'pending')
   */
  function resolvePaymentStatus(totalFee, paidAmount) {
    const fee = Math.max(0, Number(totalFee) || 0);
    const paid = Math.max(0, Number(paidAmount) || 0);

    if (fee <= 0) return 'paid';
    if (paid >= fee) return 'paid';
    if (paid > 0 && paid < fee) return 'partial';
    return 'pending';
  }

  /**
   * Formats numeric amounts into Pakistani Rupee (₨) currency format.
   * Gracefully handles negative numbers, NaN, null, and undefined values.
   */
  function formatPKR(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      amount = 0;
    }
    const num = Number(amount) || 0;
    const isNegative = num < 0;
    const formattedNum = new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0
    }).format(Math.abs(num));

    // Provide localized presentation based on active language direction
    const isUrdu = (typeof LanguageManager !== 'undefined' && LanguageManager.isRTL());
    if (isUrdu) {
      return isNegative ? `-${formattedNum} ₨` : `${formattedNum} ₨`;
    }
    return isNegative ? `-₨ ${formattedNum}` : `₨ ${formattedNum}`;
  }

  /**
   * Formats date string into human readable localized format
   */
  function formatDate(isoString) {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      const isUrdu = (typeof LanguageManager !== 'undefined' && LanguageManager.isRTL());
      return date.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  }

  /**
   * Formats time string into 12-hour format
   */
  function formatTime(isoString) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }
  /**
   * Calculates MRI Office Share & Doctor Amount according to the fixed Rs. 3,000 threshold rule:
   * If payment >= Rs. 3,000: MRI Office = Rs. 3,000, Doctor = Payment - Rs. 3,000
   * If payment < Rs. 3,000:  MRI Office = Rs. 0,     Doctor = entire payment
   */
  function calculateMRIShare(paymentReceived) {
    const payment = Math.max(0, Number(paymentReceived) || 0);
    const FIXED_THRESHOLD = 3000;

    if (payment >= FIXED_THRESHOLD) {
      return {
        payment,
        officeShare: FIXED_THRESHOLD,
        doctorAmount: payment - FIXED_THRESHOLD
      };
    } else {
      return {
        payment,
        officeShare: 0,
        doctorAmount: payment
      };
    }
  }

  /**
   * Computes localized Day name (e.g. Sunday / اتوار) from a Date or Date string
   */
  function getDayNameFromDate(dateStr, isUrdu = null) {
    if (!dateStr) return '';
    const cleanStr = (typeof dateStr === 'string' && !dateStr.includes('T')) 
      ? `${dateStr}T00:00:00` 
      : dateStr;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return '';

    const dayIndex = d.getDay();
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysUr = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

    const urdu = (typeof isUrdu === 'boolean') 
      ? isUrdu 
      : (typeof LanguageManager !== 'undefined' && LanguageManager.isRTL());

    return urdu ? daysUr[dayIndex] : daysEn[dayIndex];
  }

  /**
   * Calculates Investigation Payment split:
   * 100% of the received Investigation payment belongs to Doctor.
   * There is NO deduction and NO percentage.
   * Example: Payment = Rs. 5,000 -> Investigation Total = Rs. 5,000, Doctor Amount = Rs. 5,000, Office = Rs. 0
   */
  function calculateInvestigationShare(paymentReceived) {
    const payment = Math.max(0, Number(paymentReceived) || 0);
    return {
      payment,
      investigationTotal: payment,
      doctorAmount: payment,
      officeShare: 0
    };
  }

  /**
   * Calculates Operation Payment split & final calculation rules:
   * Required: paymentReceived (Received Payment)
   * Optional: submittedPayment, admissionSlip, assistantFee, hduIcu, medicine (all default to 0 if empty)
   *
   * EXACT FORMULAS:
   * 1. Net to Pay Sx Day = Received Payment - Submitted Payment - Admission / Slip - Assistant
   * 2. Net Pay Later     = HDU / ICU - Medicine
   * 3. Final Total       = Net to Pay Sx Day + Net Pay Later
   */
  function calculateOperationShare(paymentReceived, optionalData = {}) {
    const payment = Math.max(0, Number(paymentReceived ?? optionalData.receivedPayment ?? optionalData.payment_amount ?? optionalData.payment) || 0);
    const submittedPayment = Math.max(0, Number(optionalData.submittedPayment ?? optionalData.submitted_payment) || 0);
    const admissionSlip = Math.max(0, Number(optionalData.admissionSlip ?? optionalData.admission_slip) || 0);
    const assistantFee = Math.max(0, Number(optionalData.assistantFee ?? optionalData.assistant ?? optionalData.assistant_fee) || 0);
    const hduIcu = Math.max(0, Number(optionalData.hduIcu ?? optionalData.hdu_icu) || 0);
    const medicine = Math.max(0, Number(optionalData.medicine ?? optionalData.medicine_expense ?? optionalData.medicineExpense) || 0);

    // 1. Net to Pay Sx Day
    const computedNetSx = payment - submittedPayment - admissionSlip - assistantFee;
    const netToPaySxDay = (optionalData.netToPaySxDay !== undefined && optionalData.netToPaySxDay !== null && Number(optionalData.netToPaySxDay) !== 0)
      ? Number(optionalData.netToPaySxDay)
      : ((optionalData.net_pay_sx_day !== undefined && optionalData.net_pay_sx_day !== null && Number(optionalData.net_pay_sx_day) !== 0)
        ? Number(optionalData.net_pay_sx_day)
        : computedNetSx);

    // 2. Net Pay Later
    const computedNetLater = hduIcu - medicine;
    const netPayLater = (hduIcu !== 0 || medicine !== 0)
      ? computedNetLater
      : ((optionalData.netPayLater !== undefined && optionalData.netPayLater !== null && Number(optionalData.netPayLater) !== 0)
        ? Number(optionalData.netPayLater)
        : ((optionalData.net_pay_later !== undefined && optionalData.net_pay_later !== null && Number(optionalData.net_pay_later) !== 0)
          ? Number(optionalData.net_pay_later)
          : computedNetLater));

    // 3. Final Total
    const computedFinal = netToPaySxDay + netPayLater;
    const finalTotal = (optionalData.finalTotal !== undefined && optionalData.finalTotal !== null && Number(optionalData.finalTotal) !== 0)
      ? Number(optionalData.finalTotal)
      : ((optionalData.final_total !== undefined && optionalData.final_total !== null && Number(optionalData.final_total) !== 0)
        ? Number(optionalData.final_total)
        : computedFinal);

    return {
      payment,
      receivedPayment: payment,
      submittedPayment,
      admissionSlip,
      assistantFee,
      assistant: assistantFee,
      hduIcu,
      medicine,
      netToPaySxDay,
      netPayLater,
      finalTotal,
      operationTotal: payment,
      doctorAmount: payment,
      officeShare: 0
    };
  }

  /**
   * Returns current local date in YYYY-MM-DD format for date inputs
   */
  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Returns yesterday's date in YYYY-MM-DD format
   */
  function getYesterdayDateString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Evaluates if a given date string (YYYY-MM-DD or ISO) falls within the current calendar week (Monday to Sunday)
   */
  function isDateInThisWeek(dateStr) {
    if (!dateStr) return false;
    const cleanStr = (typeof dateStr === 'string' && !dateStr.includes('T')) 
      ? `${dateStr}T00:00:00` 
      : dateStr;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return false;

    const now = new Date();
    // Monday as start of calendar week
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const distanceToMonday = (currentDay + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // End of week (Sunday 23:59:59)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return d >= startOfWeek && d <= endOfWeek;
  }

  /**
   * Evaluates if a given date string (YYYY-MM-DD or ISO) falls within the current calendar month
   */
  function isDateInThisMonth(dateStr) {
    if (!dateStr) return false;
    const cleanStr = (typeof dateStr === 'string' && !dateStr.includes('T')) 
      ? `${dateStr}T00:00:00` 
      : dateStr;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return false;

    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  /**
   * Calculates MRI summary KPI metrics from records
   */
  function calculateMRISummaryMetrics(records, dateRange = 'today') {
    if (!Array.isArray(records)) records = [];
    const filteredRecords = filterRecordsByDateRange(records, dateRange);
    const todayTotalReceived = filteredRecords.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    const todayOfficeShare = filteredRecords.reduce((sum, r) => sum + (Number(r.officeShare) || 0), 0);
    const todayDoctorAmount = filteredRecords.reduce((sum, r) => sum + (Number(r.doctorAmount) || 0), 0);
    const allTimeTotalReceived = records.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    return {
      todayTotalReceived,
      todayOfficeShare,
      todayDoctorAmount,
      todayEntriesCount: filteredRecords.length,
      allTimeEntriesCount: records.length,
      allTimeTotalReceived,
      dateRange
    };
  }

  /**
   * Calculates Investigation summary KPI metrics from records (100% Doctor)
   */
  function calculateInvestigationSummaryMetrics(records, dateRange = 'today') {
    if (!Array.isArray(records)) records = [];
    const filteredRecords = filterRecordsByDateRange(records, dateRange);
    const todayTotal = filteredRecords.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    const allTimeTotalReceived = records.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    return {
      todayTotalReceived: todayTotal,
      todayEntriesCount: filteredRecords.length,
      todayDoctorAmount: todayTotal,
      allTimeEntriesCount: records.length,
      allTimeTotalReceived,
      dateRange
    };
  }

  /**
   * Calculates Operation summary KPI metrics from records
   * Computes totals for Net to Pay Sx Day, Net Pay Later, and Final Total
   */
  function calculateOperationSummaryMetrics(records, dateRange = 'today') {
    if (!Array.isArray(records)) records = [];
    const filteredRecords = filterRecordsByDateRange(records, dateRange);
    const totalReceived = filteredRecords.reduce((sum, r) => sum + (Number(r.payment || r.receivedPayment) || 0), 0);
    const totalSubmitted = filteredRecords.reduce((sum, r) => sum + (Number(r.submittedPayment) || 0), 0);

    let netSxDay = 0;
    let netPayLater = 0;
    let finalTotal = 0;

    filteredRecords.forEach(r => {
      const calc = calculateOperationShare(r.payment || r.receivedPayment, r);
      netSxDay += calc.netToPaySxDay;
      netPayLater += calc.netPayLater;
      finalTotal += calc.finalTotal;
    });

    const allTimeTotalReceived = records.reduce((sum, r) => sum + (Number(r.payment || r.receivedPayment) || 0), 0);

    return {
      todayTotalReceived: totalReceived,
      todaySubmittedPayment: totalSubmitted,
      todayNetSxDay: netSxDay,
      todayNetPayLater: netPayLater,
      todayFinalTotal: finalTotal,
      todayEntriesCount: filteredRecords.length,
      todayDoctorAmount: totalReceived,
      allTimeEntriesCount: records.length,
      allTimeTotalReceived,
      dateRange
    };
  }

  /**
   * Filters a record list by specified dateRange ('today', 'yesterday', 'this_week', 'week', 'month', 'this_month', 'all')
   */
  function filterRecordsByDateRange(records, dateRange) {
    if (!Array.isArray(records)) return [];
    if (!dateRange || dateRange === 'all') return records;

    const todayStr = getTodayDateString();
    const yesterdayStr = getYesterdayDateString();

    switch (dateRange) {
      case 'today':
        return records.filter(r => (r.date ? r.date === todayStr : (r.createdAt && r.createdAt.startsWith(todayStr))));
      case 'yesterday':
        return records.filter(r => (r.date ? r.date === yesterdayStr : (r.createdAt && r.createdAt.startsWith(yesterdayStr))));
      case 'week':
      case 'this_week':
        return records.filter(r => isDateInThisWeek(r.date || r.createdAt));
      case 'month':
      case 'this_month':
        return records.filter(r => isDateInThisMonth(r.date || r.createdAt));
      case 'all':
      default:
        return records;
    }
  }

  /**
   * Calculates General KPI metrics from transactions
   */
  function calculateKPISummary(transactions, dateRange = 'all') {
    if (!Array.isArray(transactions)) transactions = [];
    const filtered = filterRecordsByDateRange(transactions, dateRange);
    const totalRevenue = filtered.reduce((sum, t) => sum + (Number(t.totalFee) || Number(t.payment) || 0), 0);
    const totalDoctorShare = filtered.reduce((sum, t) => sum + (Number(t.doctorAmount) || Number(t.doctorShare) || 0), 0);
    const totalOfficeShare = filtered.reduce((sum, t) => sum + (Number(t.officeShare) || 0), 0);
    const totalPending = filtered.reduce((sum, t) => sum + (Number(t.remainingBalance) || 0), 0);
    const today = getTodayDateString();
    const todayCollected = transactions
      .filter(t => (t.date === today || (t.createdAt && t.createdAt.startsWith(today))))
      .reduce((sum, t) => sum + (Number(t.paidAmount) || Number(t.payment) || 0), 0);

    return {
      totalRevenue,
      totalDoctorShare,
      totalOfficeShare,
      totalPending,
      todayCollected,
      casesCount: filtered.length,
      allTimeCasesCount: transactions.length,
      dateRange
    };
  }

  return {
    calculateDoctorShare,
    calculateOfficeShare,
    calculateMRIShare,
    calculateInvestigationShare,
    calculateOperationShare,
    calculateMRISummaryMetrics,
    calculateInvestigationSummaryMetrics,
    calculateOperationSummaryMetrics,
    calculateKPISummary,
    getDayNameFromDate,
    getTodayDateString,
    getYesterdayDateString,
    isDateInThisWeek,
    isDateInCurrentWeek: isDateInThisWeek,
    isDateInThisMonth,
    isDateInCurrentMonth: isDateInThisMonth,
    filterRecordsByDateRange,
    calculateRemainingBalance,
    resolvePaymentStatus,
    formatPKR,
    formatDate,
    formatTime
  };
})();
