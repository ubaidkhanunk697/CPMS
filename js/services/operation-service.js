/**
 * Clinic Payment Management System - Dedicated Operation Service Module
 * Handles all database operations and calculation mapping for Operation / Assistant records.
 * 
 * Central Business Rule:
 * 100% Doctor Amount (No deductions, No percentages)
 */

const OperationService = (function () {
  const STORAGE_KEY = 'clinic_pay_operation_records_v1';

  function mapRowToModel(row) {
    if (!row) return null;
    const payment = Number(row.payment_amount ?? row.received_payment ?? row.receivedPayment ?? row.payment ?? 0);
    const submittedPayment = Number(row.submitted_payment ?? row.submittedPayment ?? 0);
    const admissionSlip = Number(row.admission_slip ?? row.admissionSlip ?? 0);
    const assistantFee = Number(row.assistant_fee ?? row.assistantFee ?? row.assistant ?? 0);
    const hduIcu = Number(row.hdu_icu ?? row.hduIcu ?? 0);
    const medicine = Number(row.medicine ?? row.medicineExpense ?? 0);
    const opType = row.operation_type || row.operation_name || row.operationName || 'Surgical Procedure';

    const calc = CalculationEngine.calculateOperationShare(payment, {
      submittedPayment,
      admissionSlip,
      assistantFee,
      hduIcu,
      medicine,
      netToPaySxDay: row.net_pay_sx_day,
      netPayLater: row.net_pay_later,
      finalTotal: row.final_total
    });

    const netToPaySxDay = (row.net_pay_sx_day !== undefined && row.net_pay_sx_day !== null && Number(row.net_pay_sx_day) !== 0)
      ? Number(row.net_pay_sx_day)
      : calc.netToPaySxDay;

    const netPayLater = (row.net_pay_later !== undefined && row.net_pay_later !== null && Number(row.net_pay_later) !== 0)
      ? Number(row.net_pay_later)
      : calc.netPayLater;

    const finalTotal = (row.final_total !== undefined && row.final_total !== null && Number(row.final_total) !== 0)
      ? Number(row.final_total)
      : calc.finalTotal;

    return {
      id: String(row.id),
      patientName: row.patient_name || row.patientName || 'Unknown Patient',
      operationType: opType,
      operationName: opType,
      payment: payment,
      receivedPayment: payment,
      submittedPayment: submittedPayment,
      admissionSlip: admissionSlip,
      assistantFee: assistantFee,
      assistant: assistantFee,
      hduIcu: hduIcu,
      medicine: medicine,
      netToPaySxDay: netToPaySxDay,
      netPayLater: netPayLater,
      finalTotal: finalTotal,
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
      console.warn("[OperationService] Failed to save to localStorage:", e);
    }
  }

  async function syncPendingRecordsToSupabase(pending) {
    if (!SupabaseClient.isReady() || !Array.isArray(pending) || pending.length === 0) return;
    try {
      const session = await SupabaseClient.ensureAuthenticatedSession('operation', true);
      const client = SupabaseClient.getClient();
      const currentUserId = session?.user?.id || 'b05a2636-5ad6-4894-b4ed-e4fb3728a408';

      for (const rec of pending) {
        if (!rec.id || !String(rec.id).startsWith('OP-')) continue;
        const opType = (rec.operationType || rec.operationName || 'Surgical Procedure').trim();
        const payment = Number(rec.payment || rec.receivedPayment || 0);
        const submittedPayment = Math.max(0, Number(rec.submittedPayment) || 0);
        const admissionSlip = Math.max(0, Number(rec.admissionSlip) || 0);
        const assistantFee = Math.max(0, Number(rec.assistantFee ?? rec.assistant) || 0);
        const hduIcu = Math.max(0, Number(rec.hduIcu) || 0);
        const medicine = Math.max(0, Number(rec.medicine) || 0);

        const calc = CalculationEngine.calculateOperationShare(payment, {
          submittedPayment,
          admissionSlip,
          assistantFee,
          hduIcu,
          medicine
        });

        const fullPayload = {
          patient_name: rec.patientName,
          operation_name: opType,
          operation_type: opType,
          payment_amount: payment,
          submitted_payment: submittedPayment,
          admission_slip: admissionSlip,
          assistant_fee: assistantFee,
          hdu_icu: hduIcu,
          medicine: medicine,
          net_pay_sx_day: calc.netToPaySxDay,
          net_pay_later: calc.netPayLater,
          final_total: calc.finalTotal,
          date: rec.date || CalculationEngine.getTodayDateString(),
          day: rec.day || CalculationEngine.getDayNameFromDate(rec.date, false),
          created_by: currentUserId
        };

        const res = await client
          .from('operation_payments')
          .insert([fullPayload])
          .select()
          .single();

        if (!res.error && res.data) {
          const mapped = mapRowToModel(res.data);
          mapped.operationType = opType;
          mapped.submittedPayment = submittedPayment;
          mapped.admissionSlip = admissionSlip;
          mapped.assistantFee = assistantFee;
          mapped.assistant = assistantFee;
          mapped.hduIcu = hduIcu;
          mapped.medicine = medicine;
          mapped.netToPaySxDay = calc.netToPaySxDay;
          mapped.netPayLater = calc.netPayLater;
          mapped.finalTotal = calc.finalTotal;

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
        await SupabaseClient.ensureAuthenticatedSession('operation', false);
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('operation_payments')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const remoteMapped = data.map(row => {
            const m = mapRowToModel(row);
            const c = CalculationEngine.calculateOperationShare(m.payment, m);
            m.netToPaySxDay = (row.net_pay_sx_day !== undefined && row.net_pay_sx_day !== null && Number(row.net_pay_sx_day) !== 0)
              ? Number(row.net_pay_sx_day)
              : c.netToPaySxDay;
            m.netPayLater = (row.net_pay_later !== undefined && row.net_pay_later !== null && Number(row.net_pay_later) !== 0)
              ? Number(row.net_pay_later)
              : c.netPayLater;
            m.finalTotal = (row.final_total !== undefined && row.final_total !== null && Number(row.final_total) !== 0)
              ? Number(row.final_total)
              : c.finalTotal;
            return m;
          });

          // Mirror Supabase records strictly in offline read-cache
          saveLocalRecords(remoteMapped);
          return remoteMapped;
        } else if (error) {
          console.warn("[OperationService] Supabase query error:", error);
        }
      } catch (err) {
        console.warn("[OperationService] Supabase network error, using local cache:", err);
      }
    }
    return getLocalRecords();
  }

  async function getFiltered(dateFilter = 'today') {
    const all = await getAll();
    return CalculationEngine.filterRecordsByDateRange(all, dateFilter);
  }

  async function create(recordData) {
    const payment = Number(recordData.receivedPayment || recordData.payment || recordData.paymentAmount || 0);
    const submittedPayment = Math.max(0, Number(recordData.submittedPayment) || 0);
    const admissionSlip = Math.max(0, Number(recordData.admissionSlip) || 0);
    const assistantFee = Math.max(0, Number(recordData.assistantFee ?? recordData.assistant) || 0);
    const hduIcu = Math.max(0, Number(recordData.hduIcu) || 0);
    const medicine = Math.max(0, Number(recordData.medicine) || 0);
    const opType = (recordData.operationType || recordData.operationName || 'Surgical Procedure').trim();
    const date = recordData.date || CalculationEngine.getTodayDateString();
    const day = CalculationEngine.getDayNameFromDate(date, false);

    // Resolve user ID for created_by
    let currentUserId = 'b05a2636-5ad6-4894-b4ed-e4fb3728a408'; // Assist Console
    try {
      const user = (typeof AuthService !== 'undefined') ? AuthService.getCurrentUser() : null;
      if (user && user.id && user.id.includes('-')) currentUserId = user.id;
    } catch (_) {}

    const calc = CalculationEngine.calculateOperationShare(payment, {
      submittedPayment,
      admissionSlip,
      assistantFee,
      hduIcu,
      medicine
    });

    const fullPayload = {
      patient_name: recordData.patientName.trim(),
      operation_name: opType,
      operation_type: opType,
      payment_amount: payment,
      submitted_payment: submittedPayment,
      admission_slip: admissionSlip,
      assistant_fee: assistantFee,
      hdu_icu: hduIcu,
      medicine: medicine,
      net_pay_sx_day: calc.netToPaySxDay,
      net_pay_later: calc.netPayLater,
      final_total: calc.finalTotal,
      date: date,
      day: day,
      created_by: currentUserId
    };

    if (SupabaseClient.isReady()) {
      try {
        const session = await SupabaseClient.ensureAuthenticatedSession('operation', true);
        if (session?.user?.id) {
          fullPayload.created_by = session.user.id;
        }
        const client = SupabaseClient.getClient();
        const res = await client
          .from('operation_payments')
          .insert([fullPayload])
          .select()
          .single();

        if (res.error) {
          const formattedErr = SupabaseClient.formatErrorMessage(res.error, "Failed to insert Operation record in Supabase database.");
          console.error("[OperationService] Supabase insert error:", formattedErr, res.error);
          return { data: null, error: formattedErr };
        } else if (res.data) {
          const mapped = mapRowToModel(res.data);
          // Preserve all optional & calculated fields
          mapped.operationType = opType;
          mapped.submittedPayment = submittedPayment;
          mapped.admissionSlip = admissionSlip;
          mapped.assistantFee = assistantFee;
          mapped.assistant = assistantFee;
          mapped.hduIcu = hduIcu;
          mapped.medicine = medicine;
          mapped.netToPaySxDay = calc.netToPaySxDay;
          mapped.netPayLater = calc.netPayLater;
          mapped.finalTotal = calc.finalTotal;

          const current = getLocalRecords();
          const filtered = current.filter(r => String(r.id) !== String(mapped.id));
          filtered.unshift(mapped);
          saveLocalRecords(filtered);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.error("[OperationService] Supabase insert failed:", err);
        return { data: null, error: err.message || "Failed to reach Supabase database." };
      }
    }

    return { data: null, error: "Database not ready. All records must be saved directly to Supabase." };
  }

  async function update(id, updates) {
    if (!updates) updates = {};
    const payment = Number(updates.receivedPayment || updates.payment || updates.paymentAmount || 0);
    const submittedPayment = Math.max(0, Number(updates.submittedPayment) || 0);
    const admissionSlip = Math.max(0, Number(updates.admissionSlip) || 0);
    const assistantFee = Math.max(0, Number(updates.assistantFee ?? updates.assistant) || 0);
    const hduIcu = Math.max(0, Number(updates.hduIcu) || 0);
    const medicine = Math.max(0, Number(updates.medicine) || 0);
    const opType = (updates.operationType || updates.operationName || updates.patient_name || 'Surgical Procedure').trim();
    const date = updates.date || CalculationEngine.getTodayDateString();
    const day = CalculationEngine.getDayNameFromDate(date, false);

    const calc = CalculationEngine.calculateOperationShare(payment, {
      submittedPayment,
      admissionSlip,
      assistantFee,
      hduIcu,
      medicine
    });

    const fullPayload = {
      patient_name: (updates.patientName || updates.patient_name || '').trim(),
      operation_name: opType,
      operation_type: opType,
      payment_amount: payment,
      submitted_payment: submittedPayment,
      admission_slip: admissionSlip,
      assistant_fee: assistantFee,
      hdu_icu: hduIcu,
      medicine: medicine,
      net_pay_sx_day: calc.netToPaySxDay,
      net_pay_later: calc.netPayLater,
      final_total: calc.finalTotal,
      date: date,
      day: day
    };

    if (SupabaseClient.isReady()) {
      try {
        await SupabaseClient.ensureAuthenticatedSession('operation', true);
        const client = SupabaseClient.getClient();
        const res = await client
          .from('operation_payments')
          .update(fullPayload)
          .eq('id', id)
          .select()
          .single();

        if (res.error) {
          const formattedErr = SupabaseClient.formatErrorMessage(res.error, "Failed to update Operation record in Supabase database.");
          console.error("[OperationService] Supabase update error:", formattedErr, res.error);
          return { data: null, error: formattedErr };
        } else if (res.data) {
          const mapped = mapRowToModel(res.data);
          mapped.operationType = opType;
          mapped.submittedPayment = submittedPayment;
          mapped.admissionSlip = admissionSlip;
          mapped.assistantFee = assistantFee;
          mapped.assistant = assistantFee;
          mapped.hduIcu = hduIcu;
          mapped.medicine = medicine;
          mapped.netToPaySxDay = calc.netToPaySxDay;
          mapped.netPayLater = calc.netPayLater;
          mapped.finalTotal = calc.finalTotal;

          const current = getLocalRecords().map(r => r.id === String(id) ? mapped : r);
          saveLocalRecords(current);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.error("[OperationService] Supabase update failed:", err);
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
      await SupabaseClient.ensureAuthenticatedSession('operation', true);
      const client = SupabaseClient.getClient();
      const { error } = await client
        .from('operation_payments')
        .delete()
        .eq('id', id);

      if (error) {
        const formattedErr = SupabaseClient.formatErrorMessage(error, "Failed to delete Operation record from Supabase database.");
        console.error("[OperationService] Supabase delete error:", formattedErr, error);
        return { success: false, error: formattedErr };
      }

      const current = getLocalRecords().filter(r => r.id !== String(id));
      saveLocalRecords(current);
      return { success: true, error: null };
    } catch (err) {
      console.error("[OperationService] Supabase delete failed:", err);
      return { success: false, error: err.message || "Failed to delete record from Supabase database." };
    }
  }

  async function clearAll() {
    if (!SupabaseClient.isReady()) {
      return { success: false, error: "Database not ready. All records must be cleared directly from Supabase." };
    }
    try {
      await SupabaseClient.ensureAuthenticatedSession('operation', true);
      const client = SupabaseClient.getClient();
      // Delete all rows accessible under current RLS policy
      const { error } = await client
        .from('operation_payments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        const formattedErr = SupabaseClient.formatErrorMessage(error, "Failed to clear Operation records from Supabase database.");
        console.error("[OperationService] Supabase clearAll error:", formattedErr, error);
        return { success: false, error: formattedErr };
      }

      saveLocalRecords([]);
      return { success: true, error: null };
    } catch (err) {
      console.error("[OperationService] Supabase clearAll failed:", err);
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
    saveLocalRecords,
    getLocalRecords
  };
})();
