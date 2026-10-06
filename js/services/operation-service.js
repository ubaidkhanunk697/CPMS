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
      medicine
    });

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
      netToPaySxDay: calc.netToPaySxDay,
      netPayLater: calc.netPayLater,
      finalTotal: calc.finalTotal,
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
        const basePayload = {
          patient_name: rec.patientName,
          operation_name: opType,
          payment_amount: Number(rec.payment || rec.receivedPayment || 0),
          date: rec.date || CalculationEngine.getTodayDateString(),
          day: rec.day || CalculationEngine.getDayNameFromDate(rec.date, false),
          created_by: currentUserId
        };

        const res = await client
          .from('operation_payments')
          .insert([basePayload])
          .select()
          .single();

        if (!res.error && res.data) {
          const mapped = mapRowToModel(res.data);
          mapped.operationType = opType;
          mapped.submittedPayment = rec.submittedPayment;
          mapped.admissionSlip = rec.admissionSlip;
          mapped.assistantFee = rec.assistantFee;
          mapped.assistant = rec.assistant;
          mapped.hduIcu = rec.hduIcu;
          mapped.medicine = rec.medicine;
          const c = CalculationEngine.calculateOperationShare(mapped.payment, mapped);
          mapped.netToPaySxDay = c.netToPaySxDay;
          mapped.netPayLater = c.netPayLater;
          mapped.finalTotal = c.finalTotal;

          const current = getLocalRecords();
          const updated = current.map(r => String(r.id) === String(rec.id) ? mapped : r);
          saveLocalRecords(updated);
        }
      }
    } catch (_) {}
  }

  async function getAll() {
    const localRecords = getLocalRecords();
    const localMap = new Map(localRecords.map(r => [String(r.id), r]));

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
          if (data.length > 0) {
            const remoteMapped = data.map(row => {
              const m = mapRowToModel(row);
              const local = localMap.get(String(m.id));
              if (local) {
                m.operationType = (row.operation_type !== undefined && row.operation_type !== null)
                  ? row.operation_type
                  : (local.operationType || m.operationType);

                m.submittedPayment = (row.submitted_payment !== undefined && row.submitted_payment !== null)
                  ? Number(row.submitted_payment)
                  : Number(local.submittedPayment || 0);

                m.admissionSlip = (row.admission_slip !== undefined && row.admission_slip !== null)
                  ? Number(row.admission_slip)
                  : Number(local.admissionSlip || 0);

                m.assistantFee = (row.assistant_fee !== undefined && row.assistant_fee !== null)
                  ? Number(row.assistant_fee)
                  : Number(local.assistantFee ?? local.assistant ?? 0);
                m.assistant = m.assistantFee;

                m.hduIcu = (row.hdu_icu !== undefined && row.hdu_icu !== null)
                  ? Number(row.hdu_icu)
                  : Number(local.hduIcu || 0);

                m.medicine = (row.medicine !== undefined && row.medicine !== null)
                  ? Number(row.medicine)
                  : Number(local.medicine || 0);
              }
              const c = CalculationEngine.calculateOperationShare(m.payment, m);
              m.netToPaySxDay = c.netToPaySxDay;
              m.netPayLater = c.netPayLater;
              m.finalTotal = c.finalTotal;
              return m;
            });

            const remoteIdSet = new Set(remoteMapped.map(r => String(r.id)));
            const localOnly = localRecords.filter(r => !remoteIdSet.has(String(r.id)));
            const merged = [...remoteMapped, ...localOnly];
            merged.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

            saveLocalRecords(merged);

            if (localOnly.length > 0) {
              syncPendingRecordsToSupabase(localOnly);
            }
            return merged;
          } else {
            // Supabase returned empty array (could be due to RLS, anon session, or empty table).
            // Retain and return local records so data is never lost or wiped.
            return localRecords;
          }
        } else if (error) {
          console.warn("[OperationService] Supabase query error, using local cache:", error);
        }
      } catch (err) {
        console.warn("[OperationService] Supabase network error, using local cache:", err);
      }
    }
    return localRecords;
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

    const basePayload = {
      patient_name: recordData.patientName.trim(),
      operation_name: opType,
      payment_amount: payment,
      date: date,
      day: day,
      created_by: currentUserId
    };

    if (SupabaseClient.isReady()) {
      try {
        const session = await SupabaseClient.ensureAuthenticatedSession('operation', true);
        if (session?.user?.id) {
          basePayload.created_by = session.user.id;
        }
        const client = SupabaseClient.getClient();
        const res = await client
          .from('operation_payments')
          .insert([basePayload])
          .select()
          .single();

        if (res.error) {
          console.warn("[OperationService] Supabase insert warning:", res.error);
        } else if (res.data) {
          const mapped = mapRowToModel(res.data);
          // Preserve all optional fields in local storage record
          mapped.operationType = opType;
          mapped.submittedPayment = submittedPayment;
          mapped.admissionSlip = admissionSlip;
          mapped.assistantFee = assistantFee;
          mapped.assistant = assistantFee;
          mapped.hduIcu = hduIcu;
          mapped.medicine = medicine;

          const c = CalculationEngine.calculateOperationShare(mapped.payment, mapped);
          mapped.netToPaySxDay = c.netToPaySxDay;
          mapped.netPayLater = c.netPayLater;
          mapped.finalTotal = c.finalTotal;

          const current = getLocalRecords();
          const filtered = current.filter(r => String(r.id) !== String(mapped.id));
          filtered.unshift(mapped);
          saveLocalRecords(filtered);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn("[OperationService] Supabase insert failed, saving to local cache fallback:", err);
      }
    }

    // Local Storage Fallback
    const localCalc = CalculationEngine.calculateOperationShare(payment, {
      submittedPayment,
      admissionSlip,
      assistantFee,
      assistant: assistantFee,
      hduIcu,
      medicine
    });
    const localRecord = {
      id: 'OP-' + Date.now().toString(36).toUpperCase(),
      patientName: basePayload.patient_name,
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
      doctorAmount: payment,
      officeShare: 0,
      netToPaySxDay: localCalc.netToPaySxDay,
      netPayLater: localCalc.netPayLater,
      finalTotal: localCalc.finalTotal,
      date: basePayload.date,
      day: basePayload.day,
      createdAt: new Date().toISOString(),
      createdBy: basePayload.created_by
    };
    const current = getLocalRecords();
    current.unshift(localRecord);
    saveLocalRecords(current);
    return { data: localRecord, error: null };
  }

  async function update(id, updates) {
    if (!updates) updates = {};
    const payment = Number(updates.receivedPayment || updates.payment || updates.paymentAmount || 0);
    const submittedPayment = Math.max(0, Number(updates.submittedPayment) || 0);
    const admissionSlip = Math.max(0, Number(updates.admissionSlip) || 0);
    const assistantFee = Math.max(0, Number(updates.assistantFee ?? updates.assistant) || 0);
    const hduIcu = Math.max(0, Number(updates.hduIcu) || 0);
    const medicine = Math.max(0, Number(updates.medicine) || 0);
    const opType = (updates.operationType || updates.operationName || updates.patient_name || '').trim();
    const date = updates.date || CalculationEngine.getTodayDateString();
    const day = CalculationEngine.getDayNameFromDate(date, false);

    const basePayload = {
      patient_name: (updates.patientName || updates.patient_name || '').trim(),
      operation_name: opType,
      payment_amount: payment,
      date: date,
      day: day
    };

    if (SupabaseClient.isReady()) {
      try {
        await SupabaseClient.ensureAuthenticatedSession('operation', true);
        const client = SupabaseClient.getClient();
        const res = await client
          .from('operation_payments')
          .update(basePayload)
          .eq('id', id)
          .select()
          .single();

        if (res.data) {
          const mapped = mapRowToModel(res.data);
          mapped.operationType = opType;
          mapped.submittedPayment = submittedPayment;
          mapped.admissionSlip = admissionSlip;
          mapped.assistantFee = assistantFee;
          mapped.assistant = assistantFee;
          mapped.hduIcu = hduIcu;
          mapped.medicine = medicine;

          const c = CalculationEngine.calculateOperationShare(mapped.payment, mapped);
          mapped.netToPaySxDay = c.netToPaySxDay;
          mapped.netPayLater = c.netPayLater;
          mapped.finalTotal = c.finalTotal;

          const current = getLocalRecords().map(r => r.id === String(id) ? mapped : r);
          saveLocalRecords(current);
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn("[OperationService] Supabase update failed, using local fallback:", err);
      }
    }

    // Local Storage Fallback
    const current = getLocalRecords();
    const index = current.findIndex(r => r.id === String(id));
    if (index !== -1) {
      const localCalc = CalculationEngine.calculateOperationShare(payment, {
        submittedPayment,
        admissionSlip,
        assistantFee,
        assistant: assistantFee,
        hduIcu,
        medicine
      });
      current[index] = {
        ...current[index],
        patientName: basePayload.patient_name,
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
        doctorAmount: payment,
        netToPaySxDay: localCalc.netToPaySxDay,
        netPayLater: localCalc.netPayLater,
        finalTotal: localCalc.finalTotal,
        date: basePayload.date,
        day: basePayload.day
      };
      saveLocalRecords(current);
      return { data: current[index], error: null };
    }
    return { data: null, error: 'Record not found.' };
  }

  async function deleteRecord(id) {
    if (SupabaseClient.isReady()) {
      try {
        await SupabaseClient.ensureAuthenticatedSession('operation', true);
        const client = SupabaseClient.getClient();
        const { error } = await client
          .from('operation_payments')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn("[OperationService] Supabase delete warning:", error);
        }
      } catch (err) {
        console.warn("[OperationService] Supabase delete failed, using local fallback:", err);
      }
    }

    const current = getLocalRecords().filter(r => r.id !== String(id));
    saveLocalRecords(current);
    return { success: true, error: null };
  }

  async function clearAll() {
    if (SupabaseClient.isReady()) {
      try {
        await SupabaseClient.ensureAuthenticatedSession('operation', true);
        const client = SupabaseClient.getClient();
        // Delete all rows accessible under current RLS policy
        const { error } = await client
          .from('operation_payments')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          console.warn("[OperationService] Supabase clearAll warning:", error);
        }
      } catch (err) {
        console.warn("[OperationService] Supabase clearAll failed, using local fallback:", err);
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
    saveLocalRecords,
    getLocalRecords
  };
})();
