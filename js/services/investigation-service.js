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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn("[InvestigationService] Failed to save to localStorage:", e);
    }
  }

  async function syncPendingRecordsToSupabase(pending) {
    if (!SupabaseClient.isReady() || !Array.isArray(pending) || pending.length === 0) return;
    try {
      const session = await SupabaseClient.ensureAuthenticatedSession('investigation', true);
      const client = SupabaseClient.getClient();
      const currentUserId = session?.user?.id || '4a3da3db-9193-431f-a248-a22b86fef232';

      for (const rec of pending) {
        if (!rec.id || !String(rec.id).startsWith('INV-')) continue;
        const payload = {
          patient_name: rec.patientName,
          test_name: rec.testName,
          payment_amount: Number(rec.payment || 0),
          date: rec.date || CalculationEngine.getTodayDateString(),
          day: rec.day || CalculationEngine.getDayNameFromDate(rec.date, false),
          created_by: currentUserId
        };
        const { data: inserted, error } = await client
          .from('investigation_payments')
          .insert([payload])
          .select()
          .single();

        if (!error && inserted) {
          const mapped = mapRowToModel(inserted);
          const current = getLocalRecords();
          const updated = current.map(r => String(r.id) === String(rec.id) ? mapped : r);
          saveLocalRecords(updated);
        }
      }
    } catch (_) {}
  }

  async function getAll() {
    if (SupabaseClient.isReady()) {
      try {
        await SupabaseClient.ensureAuthenticatedSession('investigation', false);
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('investigation_payments')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const remoteMapped = data.map(mapRowToModel);
          // Mirror Supabase records strictly in offline read-cache
          saveLocalRecords(remoteMapped);
          return remoteMapped;
        } else if (error) {
          console.warn("[InvestigationService] Supabase query error:", error);
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
        const session = await SupabaseClient.ensureAuthenticatedSession('investigation', true);
        if (session?.user?.id) {
          payload.created_by = session.user.id;
        }
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('investigation_payments')
          .insert([payload])
          .select()
          .single();

        if (error) {
          const formattedErr = SupabaseClient.formatErrorMessage(error, "Failed to insert Investigation record in Supabase database.");
          console.error("[InvestigationService] Supabase insert error:", formattedErr, error);
          return { data: null, error: formattedErr };
        } else if (data) {
          const mapped = mapRowToModel(data);
          const current = getLocalRecords();
          const filtered = current.filter(r => String(r.id) !== String(mapped.id));
          filtered.unshift(mapped);
          saveLocalRecords(filtered);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.error("[InvestigationService] Supabase insert failed:", err);
        return { data: null, error: err.message || "Failed to reach Supabase database." };
      }
    }

    return { data: null, error: "Database not ready. All records must be saved directly to Supabase." };
  }

  async function update(id, updates) {
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
        await SupabaseClient.ensureAuthenticatedSession('investigation', true);
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('investigation_payments')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          const formattedErr = SupabaseClient.formatErrorMessage(error, "Failed to update Investigation record in Supabase database.");
          console.error("[InvestigationService] Supabase update error:", formattedErr, error);
          return { data: null, error: formattedErr };
        } else if (data) {
          const mapped = mapRowToModel(data);
          const current = getLocalRecords().map(r => r.id === String(id) ? mapped : r);
          saveLocalRecords(current);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.error("[InvestigationService] Supabase update failed:", err);
        return { data: null, error: err.message || "Failed to update record in Supabase database." };
      }
    }

    return { data: null, error: "Database not ready. All records must be updated directly in Supabase." };
  }

  async function deleteRecord(id) {
    if (!SupabaseClient.isReady()) {
      return { success: false, error: "Database not ready. All records must be deleted directly from Supabase." };
    }
    try {
      await SupabaseClient.ensureAuthenticatedSession('investigation', true);
      const client = SupabaseClient.getClient();
      const { error } = await client
        .from('investigation_payments')
        .delete()
        .eq('id', id);

      if (error) {
        const formattedErr = SupabaseClient.formatErrorMessage(error, "Failed to delete Investigation record from Supabase database.");
        console.error("[InvestigationService] Supabase delete error:", formattedErr, error);
        return { success: false, error: formattedErr };
      }

      const current = getLocalRecords().filter(r => r.id !== String(id));
      saveLocalRecords(current);
      return { success: true, error: null };
    } catch (err) {
      console.error("[InvestigationService] Supabase delete failed:", err);
      return { success: false, error: err.message || "Failed to delete record from Supabase database." };
    }
  }

  async function clearAll() {
    if (!SupabaseClient.isReady()) {
      return { success: false, error: "Database not ready. All records must be cleared directly from Supabase." };
    }
    try {
      await SupabaseClient.ensureAuthenticatedSession('investigation', true);
      const client = SupabaseClient.getClient();
      // Delete all rows accessible under current RLS policy
      const { error } = await client
        .from('investigation_payments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        const formattedErr = SupabaseClient.formatErrorMessage(error, "Failed to clear Investigation records from Supabase database.");
        console.error("[InvestigationService] Supabase clearAll error:", formattedErr, error);
        return { success: false, error: formattedErr };
      }

      saveLocalRecords([]);
      return { success: true, error: null };
    } catch (err) {
      console.error("[InvestigationService] Supabase clearAll failed:", err);
      return { success: false, error: err.message || "Failed to clear records from Supabase database." };
    }
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
