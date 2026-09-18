/**
 * Clinic Payment Management System - Dedicated Investigation Service Module
 * Handles all database operations and calculation mapping for Investigation Office records.
 * 
 * Central Business Rule:
 * 100% Doctor Amount (No deductions, No percentages)
 */

const InvestigationService = (function () {
  const STORAGE_KEY = 'clinic_pay_investigation_records_v1';

  function mapRowToModel(row) {
    if (!row) return null;
    const payment = Number(row.payment_amount ?? row.payment ?? 0);

    return {
      id: String(row.id),
      patientName: row.patient_name || row.patientName || 'Unknown Patient',
      testName: row.test_name || row.testName || 'Laboratory Test',
      payment: payment,
      doctorAmount: payment, // 100% to Doctor
      officeShare: 0,
      date: row.date || CalculationEngine.getTodayDateString(),
      day: row.day || CalculationEngine.getDayNameFromDate(row.date || CalculationEngine.getTodayDateString(), false),
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      createdBy: row.created_by || null
    };
  }

  function getLocalRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).map(mapRowToModel) : [];
    } catch (_) {
      return [];
    }
  }

  function saveLocalRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  async function getAll() {
    if (SupabaseClient.isReady()) {
      try {
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('investigation_payments')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped = data.map(mapRowToModel);
          saveLocalRecords(mapped);
          return mapped;
        } else if (error) {
          console.warn("[InvestigationService] Supabase query error, using local cache:", error);
        }
      } catch (err) {
        console.warn("[InvestigationService] Supabase network error, using local cache:", err);
      }
    }
    return getLocalRecords();
  }

  async function getFiltered(dateFilter = 'today') {
    const all = await getAll();
    return CalculationEngine.filterRecordsByDateRange(all, dateFilter);
  }

  async function create(recordData) {
    const payment = Number(recordData.payment || recordData.paymentAmount || 0);
    const date = recordData.date || CalculationEngine.getTodayDateString();
    const day = CalculationEngine.getDayNameFromDate(date, false);

    // Resolve user ID for created_by
    let currentUserId = '4a3da3db-9193-431f-a248-a22b86fef232'; // Officer Shezaad
    try {
      const user = (typeof AuthService !== 'undefined') ? AuthService.getCurrentUser() : null;
      if (user && user.id && user.id.includes('-')) currentUserId = user.id;
    } catch (_) {}

    const payload = {
      patient_name: recordData.patientName.trim(),
      test_name: recordData.testName.trim(),
      payment_amount: payment,
      date: date,
      day: day,
      created_by: currentUserId
    };

    if (SupabaseClient.isReady()) {
      try {
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('investigation_payments')
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.warn("[InvestigationService] Supabase insert warning:", error);
          throw new Error(SupabaseClient.formatErrorMessage(error));
        }
        if (data) {
          const mapped = mapRowToModel(data);
          const current = getLocalRecords();
          current.unshift(mapped);
          saveLocalRecords(current);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn("[InvestigationService] Supabase insert failed, saving to local cache fallback:", err);
      }
    }

    // Local Storage Fallback
    const localRecord = {
      id: 'INV-' + Date.now().toString(36).toUpperCase(),
      patientName: payload.patient_name,
      testName: payload.test_name,
      payment: payload.payment_amount,
      doctorAmount: payload.payment_amount,
      officeShare: 0,
      date: payload.date,
      day: payload.day,
      createdAt: new Date().toISOString(),
      createdBy: payload.created_by
    };
    const current = getLocalRecords();
    current.unshift(localRecord);
    saveLocalRecords(current);
    return { data: localRecord, error: null };
  }

  async function update(id, updates) {
    if (!updates) updates = {};
    const payment = Number(updates.payment || updates.paymentAmount || 0);
    const date = updates.date || CalculationEngine.getTodayDateString();
    const day = CalculationEngine.getDayNameFromDate(date, false);

    const payload = {
      patient_name: (updates.patientName || updates.patient_name || '').trim(),
      test_name: (updates.testName || updates.test_name || '').trim(),
      payment_amount: payment,
      date: date,
      day: day
    };

    if (SupabaseClient.isReady()) {
      try {
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('investigation_payments')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.warn("[InvestigationService] Supabase update warning:", error);
        } else if (data) {
          const mapped = mapRowToModel(data);
          const current = getLocalRecords().map(r => r.id === String(id) ? mapped : r);
          saveLocalRecords(current);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn("[InvestigationService] Supabase update failed, using local fallback:", err);
      }
    }

    // Local Storage Fallback
    const current = getLocalRecords();
    const index = current.findIndex(r => r.id === String(id));
    if (index !== -1) {
      current[index] = {
        ...current[index],
        patientName: payload.patient_name,
        testName: payload.test_name,
        payment: payload.payment_amount,
        doctorAmount: payload.payment_amount,
        date: payload.date,
        day: payload.day
      };
      saveLocalRecords(current);
      return { data: current[index], error: null };
    }
    return { data: null, error: 'Record not found.' };
  }

  async function deleteRecord(id) {
    if (SupabaseClient.isReady()) {
      try {
        const client = SupabaseClient.getClient();
        const { error } = await client
          .from('investigation_payments')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn("[InvestigationService] Supabase delete warning:", error);
        }
      } catch (err) {
        console.warn("[InvestigationService] Supabase delete failed, using local fallback:", err);
      }
    }

    const current = getLocalRecords().filter(r => r.id !== String(id));
    saveLocalRecords(current);
    return { success: true, error: null };
  }

  async function clearAll() {
    if (SupabaseClient.isReady()) {
      try {
        const client = SupabaseClient.getClient();
        // Delete all rows accessible under current RLS policy
        const { error } = await client
          .from('investigation_payments')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          console.warn("[InvestigationService] Supabase clearAll warning:", error);
        }
      } catch (err) {
        console.warn("[InvestigationService] Supabase clearAll failed, using local fallback:", err);
      }
    }

    saveLocalRecords([]);
    return { success: true, error: null };
  }

  return {
    getAll,
    getFiltered,
    create,
    update,
    delete: deleteRecord,
    clearAll,
    saveLocalRecords
  };
})();
