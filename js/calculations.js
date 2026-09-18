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
   * Formats numeric amounts into Pakistani Rupee (₨) currency format
   */
  function formatPKR(amount) {
    const num = Number(amount) || 0;
    const formattedNum = new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0
    }).format(num);

    // Provide localized presentation based on active language direction
    const isUrdu = (typeof LanguageManager !== 'undefined' && LanguageManager.isRTL());
    return isUrdu ? `${formattedNum} ₨` : `₨ ${formattedNum}`;
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
   * Calculates Operation Payment split:
   * 100% of the received Operation payment belongs to Doctor.
   * There is NO deduction and NO percentage.
   * Example: Payment = Rs. 50,000 -> Operation Total = Rs. 50,000, Doctor Amount = Rs. 50,000, Office = Rs. 0
   */
  function calculateOperationShare(paymentReceived) {
    const payment = Math.max(0, Number(paymentReceived) || 0);
    return {
      payment,
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
   * Calculates MRI summary KPI metrics from records
   */
  function calculateMRISummaryMetrics(records) {
    if (!Array.isArray(records)) records = [];
    const today = getTodayDateString();
    const todayRecords = records.filter(r => (r.date ? r.date === today : (r.createdAt && r.createdAt.startsWith(today))));
    const todayTotalReceived = todayRecords.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    const todayOfficeShare = todayRecords.reduce((sum, r) => sum + (Number(r.officeShare) || 0), 0);
    const todayDoctorAmount = todayRecords.reduce((sum, r) => sum + (Number(r.doctorAmount) || 0), 0);
    return {
      todayTotalReceived,
      todayOfficeShare,
      todayDoctorAmount,
      todayEntriesCount: todayRecords.length
    };
  }

  /**
   * Calculates Investigation summary KPI metrics from records (100% Doctor)
   */
  function calculateInvestigationSummaryMetrics(records) {
    if (!Array.isArray(records)) records = [];
    const today = getTodayDateString();
    const todayRecords = records.filter(r => (r.date ? r.date === today : (r.createdAt && r.createdAt.startsWith(today))));
    const todayTotal = todayRecords.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    return {
      todayTotalReceived: todayTotal,
      todayEntriesCount: todayRecords.length,
      todayDoctorAmount: todayTotal
    };
  }

  /**
   * Calculates Operation summary KPI metrics from records (100% Doctor)
   */
  function calculateOperationSummaryMetrics(records) {
    if (!Array.isArray(records)) records = [];
    const today = getTodayDateString();
    const todayRecords = records.filter(r => (r.date ? r.date === today : (r.createdAt && r.createdAt.startsWith(today))));
    const todayTotal = todayRecords.reduce((sum, r) => sum + (Number(r.payment) || 0), 0);
    return {
      todayTotalReceived: todayTotal,
      todayEntriesCount: todayRecords.length,
      todayDoctorAmount: todayTotal
    };
  }

  /**
   * Filters a record list by specified dateRange ('today', 'yesterday', 'this_week', 'week')
   */
  function filterRecordsByDateRange(records, dateRange) {
    if (!Array.isArray(records)) return [];
    if (!dateRange) return records;

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
      default:
        return records;
    }
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
    getDayNameFromDate,
    getTodayDateString,
    getYesterdayDateString,
    isDateInThisWeek,
    isDateInCurrentWeek: isDateInThisWeek,
    filterRecordsByDateRange,
    calculateRemainingBalance,
    resolvePaymentStatus,
    formatPKR,
    formatDate,
    formatTime
  };
})();
