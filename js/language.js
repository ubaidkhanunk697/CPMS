/**
 * Clinic Payment Management System - i18n & RTL Language Engine
 * Supports: English ('en') & Urdu ('ur')
 */

const LanguageManager = (function () {
  const STORAGE_KEY = 'clinic_pay_language';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  const translations = {
    en: {
      // App Branding
      app_title: "Glossary Payment System",
      app_subtitle: "Financial record of fees, Admin shares, and office collections",
      clinic_name: "Glossary Shop",
      
      // Offices
      mri_office: "Local Office",
      investigation_office: "Constraction Office",
      operation_office: "Assis Office",
      doctor_office: "Head Office",
      
      // Officers & Doctor
      officer_aqeb: "Aqeb Khan",
      officer_shezaad: "Shezaad",
      officer_mustajab: "Assis Console",
      assistant_console: "Assis Console",
      doctor_nawaz: "Admin Console",
      admin_console: "Admin Console",
      role_mri_officer: "MRI Incharge",
      role_inv_officer: "Investigation Officer",
      role_asst_officer: "Surgical Assistant Incharge",
      role_consultant: "Lead Consultant Surgeon",
      assigned_officer: "Assigned Officer",

      // Navigation Groups
      nav_offices: "Glossary Offices",
      nav_system: "System & Tools",
      nav_reports: "Financial Reports",
      nav_settings: "Settings",

      // Header Actions
      btn_record_payment: "Record Payment",
      btn_export: "Export Report",
      btn_install_app: "Install App",
      status_online: "Online",
      status_offline: "You are currently offline. Local cache is active.",

      // KPI Metrics
      kpi_total_revenue: "Total Revenue",
      kpi_doctor_share: "Doctor's Share",
      kpi_office_share: "Office Net Share",
      kpi_pending_balance: "Pending Dues",
      kpi_cases_count: "Total Procedures / Scans",
      kpi_today_collected: "Collected Today",
      trend_vs_last_month: "vs last month",
      trend_settled: "100% Accounted",

      // Table & Filter Headers
      filter_search_placeholder: "Search by Glossary name, ID, or phone...",
      filter_all_statuses: "All Statuses",
      filter_status_paid: "Paid",
      filter_status_pending: "Pending",
      filter_status_partial: "Partial",
      filter_all_time: "All Time",
      filter_today: "Today",
      filter_this_week: "This Week",
      filter_this_month: "This Month",

      table_id: "ID",
      table_patient: "Patient Info",
      table_service: "Service / Test",
      table_total: "Total Fee",
      table_doctor_cut: "Doctor Share",
      table_office_cut: "Office Share",
      table_status: "Status",
      table_date: "Date",
      table_actions: "Actions",

      // Empty & Loading States
      empty_title: "No Payment Records Found",
      empty_desc: "There are currently no transaction entries matching your filters.",
      empty_cta: "Create First Record",
      loading_data: "Loading office records and calculating totals...",
      error_load_title: "Unable to load transactions",
      error_load_desc: "An error occurred while fetching repository data.",
      btn_retry: "Retry",

      // Modals
      modal_new_payment_title: "Record Glossary Payment",
      form_patient_name: "P Full Name",
      form_patient_placeholder: "Enter Full Name",
      form_patient_contact: "Contact Number",
      form_office_select: "Target Office",
      form_service_description: "Procedure / Scan / Constraction",
      form_total_fee: "Total Fee (₨)",
      form_doctor_percentage: "Admin Share (%)",
      form_paid_amount: "Amount Received (₨)",
      form_payment_method: "Payment Method",
      form_method_cash: "Cash",
      form_method_bank: "Online / Bank Transfer",
      form_method_card: "Debit / Credit Card",
      form_notes: "Additional Remarks / Reference",
      
      // Financial Calculation Breakdown
      calc_preview_heading: "Payment Calculation Summary",
      calc_doctor_amount: "Calculated Admin Share:",
      calc_office_amount: "Calculated Office Share:",
      calc_remaining_due: "Remaining Due Balance:",

      btn_cancel: "Cancel",
      btn_save: "Save & Record",
      btn_confirm: "Confirm",
      modal_confirm_title: "Confirm Action",
      modal_confirm_text: "Are you sure you want to proceed with this operation?",

      // Local / MRI Office Dedicated Strings
      mri_payment_entry: "Local Payment Entry",
      mri_patient_name: "P Name",
      mri_type: "Service",
      mri_payment_received: "Payment Received",
      mri_date: "Date",
      mri_day: "Day",
      mri_type_placeholder: "Select or enter service type...",
      btn_add_mri_entry: "Record Local Payment",
      btn_update_mri_entry: "Save Changes",
      mri_calc_rule_hint: "Fixed Rule: Payment ≥ Rs. 3,000 → Office: Rs. 3,000 | Admin: Balance",
      mri_office_share_fixed: "Local Office Share:",
      doctor_amount_cut: "Admin Amount:",
      mri_profit: "Local Profit:",

      // Local Dashboard Summary Cards
      kpi_today_total_received: "Today's Total Received",
      kpi_today_mri_entries: "Today's Local Entries",
      kpi_mri_office_share: "Local Office Share",
      kpi_mri_profit: "Local Profit",
      kpi_doctor_amount: "Admin Amount",

      // Local Payment History Table
      mri_payment_history: "Local Payment History",
      col_patient_name: "P Name",
      col_mri_type: "Local Type",
      col_payment: "Payment",
      col_office_share: "Local Office Share",
      col_mri_profit: "Local Profit",
      col_doctor_amount: "Admin Amount",
      col_date: "Date",
      col_day: "Day",
      col_actions: "Actions",

      // Actions & Confirmations
      btn_edit: "Edit",
      btn_delete: "Delete",
      btn_clear_all: "Clear All",
      confirm_clear_all_title: "Delete All Local Records",
      confirm_clear_all_text: "Are you sure you want to delete all Local records?",
      btn_yes_delete_all: "Yes, Delete All",
      confirm_delete_single_title: "Delete Local Entry",
      confirm_delete_single_text: "Are you sure you want to delete this Local record?",
      btn_yes_delete: "Yes, Delete",
      modal_edit_mri_title: "Edit Local Payment Record",

      // Toasts
      toast_success_title: "Success",
      toast_payment_added: "Payment record added and balance calculated successfully.",
      toast_mri_added: "Local payment recorded successfully.",
      toast_mri_updated: "Local record updated successfully.",
      toast_mri_deleted: "Local record deleted successfully.",
      // Constraction / Investigation Office Dedicated Strings (Officer: Shezaad)
      inv_payment_entry: "Constraction Payment Entry",
      inv_patient_name: "P Name",
      inv_test_name: "Material Name",
      inv_payment_received: "Payment Received",
      inv_date: "Date",
      inv_day: "Day",
      inv_test_placeholder: "Select or enter material name...",
      btn_add_inv_entry: "Record Constraction Payment",
      btn_update_inv_entry: "Save Changes",
      inv_calc_rule_hint: "Payment Rule: 100% Admin Amount (No Deduction)",
      inv_total_received: "Constraction Total:",
      inv_payment_history: "Constraction Payment History",
      col_test_name: "Material Name",

      // Constraction Summary Cards
      kpi_today_inv_entries: "Today's Constraction Entries",

      // Actions & Confirmations for Constraction
      confirm_clear_all_inv_title: "Delete All Constraction Records",
      confirm_clear_all_inv_text: "Are you sure you want to delete all Constraction records?",
      confirm_delete_single_inv_title: "Delete Constraction Entry",
      confirm_delete_single_inv_text: "Are you sure you want to delete this Constraction record?",
      modal_edit_inv_title: "Edit Constraction Payment Record",

      // Toasts for Constraction
      toast_inv_added: "Constraction payment recorded successfully.",
      toast_inv_updated: "Constraction record updated successfully.",
      toast_inv_deleted: "Constraction record deleted successfully.",
      toast_inv_cleared: "All Constraction records have been deleted.",

      // Operation / Glossary Office Dedicated Strings (Officer: Qari Mustajab)
      op_payment_entry: "Glossary Payment Entry",
      op_patient_name: "Name",
      op_edit_patient_name: "P Name",
      op_patient_placeholder: "Enter Name",
      op_operation_name: "Service",
      op_operation_type: "Service",
      op_payment_received: "R Payment",
      op_received_payment: "R Payment",
      op_payment_placeholder: "Glossery Pay",
      op_submitted_payment: "S Payment",
      op_admission_slip: "Slip",
      op_assistant_fee: "Assist",
      op_hdu_icu: "HIU",
      op_medicine: "Purchase",
      op_optional_details: "Glossery Amount Breakdown (Defaults to 0 if left empty)",
      op_date: "Date",
      op_day: "Day",
      op_operation_placeholder: "Select or enter Glossery type...",
      btn_add_op_entry: "Record Glossary Payment",
      btn_update_op_entry: "Save Changes",
      op_calc_rule_hint: "Payment Rule: 100% Admin Amount (No Deduction)",
      op_total_received: "Glossary Total",
      op_payment_history: "Glossary Payment History",
      col_operation_name: "Service",
      col_operation_type: "Service",
      col_received: "Received",
      col_submitted: "Submitted",
      col_net_sx_day: "Net Sx Day",
      col_net_pay_later: "Net Pay Later",
      col_final_total: "Final Total",
      op_net_sx_day: "Net to Pay Sx Day",
      op_net_pay_later: "Net Pay Later",
      op_final_total: "Final Total",

      // Glossary Summary Cards
      kpi_today_op_entries: "Today's Glossary Entries",

      // Actions & Confirmations for Operation
      confirm_clear_all_op_title: "Delete All Glossary Records",
      confirm_clear_all_op_text: "Are you sure you want to delete all Glossary records?",
      confirm_delete_single_op_title: "Delete Glossary Entry",
      confirm_delete_single_op_text: "Are you sure you want to delete this Glossary record?",
      modal_edit_op_title: "Edit Glossary Payment Record",

      // Toasts for Operation
      toast_op_added: "Glossary payment recorded successfully.",
      toast_op_updated: "Glossary record updated successfully.",
      toast_op_deleted: "Glossary record deleted successfully.",
      toast_op_cleared: "All Glossary records have been deleted.",

      // Doctor Main Dashboard Dedicated Strings (Doctor: Dr. Nawaz Khattak)
      doctor_dashboard_title: "FINANCIAL OVERVIEW DASHBOARD",
      doctor_name_title: "Financial Summary",
      doctor_grand_total: "Total Earnings",
      doctor_grand_total_desc: "Net revenue aggregated across Local, Constraction, and Assist units",
      doctor_total_clinic_revenue: "Total Glossary Collection",
      doctor_total_clinic_entries: "Total Glossary Entries",
      doctor_formula_mri: "Local Share:",
      doctor_formula_inv: "Constraction Share:",
      doctor_formula_asst: "Assist Share:",
      doctor_formula_equals: "Grand Total:",

      // Doctor Tabs
      doctor_tab_mri: "Local",
      doctor_tab_investigation: "Constraction",
      doctor_tab_assistant: "Assist",

      // Date Filters (Strictly Only 3)
      filter_opt_today: "Today",
      filter_opt_yesterday: "Yesterday",
      filter_opt_week: "This Week",

      // Tab Summaries & KPI Titles
      doc_summary_total_received: "Total Received",
      doc_summary_mri_share: "Local Office Share",
      doc_summary_mri_profit: "Local Profit",
      doc_summary_doctor_amount: "Admin Amount",
      doc_summary_entries_count: "Number of Entries",
      col_mri_machine_exp: "Local Office Share",
      col_mri_profit: "Local Profit",

      // Doctor Tab Table Headers & Titles
      doc_mri_records_title: "Local Department Records",
      doc_inv_records_title: "Constraction Department Records",
      doc_op_records_title: "Assist Department Records",

      // Actions & Modals for Doctor
      btn_clear_tab: "Clear Tab Records",
      confirm_clear_doctor_tab_title: "Clear All Records for Active Tab",
      confirm_clear_doctor_tab_text: "Are you sure you want to delete all records in this department tab? This action cannot be undone.",
      toast_doctor_tab_cleared: "All records for the selected tab have been cleared.",

      toast_positive_payment: "Payment Received must be a valid positive numeric amount.",
      toast_error_title: "Validation Error",
      toast_fill_required: "Please complete all required fields correctly.",
      toast_pwa_installed: "Clinic Payment App installed successfully.",

      // Authentication & Access Control
      login_title: "Glossary Portal",
      login_subtitle: "Sign in to access your designated Glossery office",
      login_field_identity: "Email or Username",
      login_field_password: "Password",
      login_placeholder_identity: "Enter your Email",
      login_placeholder_password: "Enter your password",
      login_btn_submit: "Sign In",
      login_btn_signing_in: "Verifying...",
      login_quick_roles_title: "Quick Staff Switcher (Demo / Testing)",
      login_quick_roles_desc: "Click any staff member to auto-fill credentials:",
      auth_badge_mri: "Local Office (Aqeb)",
      auth_badge_inv: "Constraction (Shezaad)",
      auth_badge_op: "Assist Office (Mustajab)",
      auth_badge_doc: "Admin (Dr. Nawaz)",
      auth_notice_title: "Supabase Ready Authentication Layer",
      auth_notice_desc: "This authentication interface is built with standard Supabase Auth signatures. Role-based access control is actively enforced.",
      auth_error_missing: "Please enter both your email/username and password.",
      auth_error_invalid: "Invalid credentials or account not found in clinic directory.",
      auth_success_welcome: "Welcome back",
      btn_logout: "Sign Out",
      btn_switch_account: "Switch Account",
      logout_confirm_title: "Confirm Sign Out",
      toast_logged_out: "You have been safely signed out.",
      access_denied_title: "Access Restricted",
      access_denied_desc: "You do not have administrative permission to view this department office.",

      // Supabase Integration & Status
      supabase_status_connected: "Supabase Connected",
      supabase_status_unconfigured: "Supabase Standby (Local Mode)",
      supabase_status_error: "Supabase Reconnecting",
      supabase_config_title: "Supabase Database Settings",
      supabase_config_desc: "Configure your Supabase Project URL and public anon key. The service-role key must NEVER be entered here.",
      supabase_url_label: "Supabase Project URL",
      supabase_url_placeholder: "https://xyzcompany.supabase.co",
      supabase_anon_label: "Supabase Anon Key (Public)",
      supabase_anon_placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      supabase_btn_save_config: "Save & Connect",
      supabase_btn_clear_config: "Reset to Local Mode",
      supabase_btn_test: "Test Connection",
      supabase_test_success: "Successfully connected to Supabase database.",
      supabase_saved_success: "Supabase configuration updated successfully.",
      db_error_generic: "A database error occurred. Please try again.",
      db_permission_denied: "Permission Denied: Your assigned role cannot perform this database operation.",
      db_network_error: "Database server unreachable. Switched to offline cache."
    },

    ur: {
      // App Branding
      app_title: "Glossary Payment System",
      app_subtitle: "Financial record of fees, Admin shares, and office collections",
      clinic_name: "Glossary Shop",
      
      // Offices
      mri_office: "Local Office",
      investigation_office: "Constraction Office",
      operation_office: "Assis Office",
      doctor_office: "ہیڈ آفس",
      
      // Officers & Doctor
      officer_aqeb: "عاقب خان",
      officer_shezaad: "شہزاد",
      officer_mustajab: "Assis Console",
      assistant_console: "Assis Console",
      doctor_nawaz: "ایڈمن کنسول",
      admin_console: "ایڈمن کنسول",
      role_mri_officer: "لوکل انچارج",
      role_inv_officer: "کنسٹرکشن افسر",
      role_asst_officer: "اسسٹ انچارج",
      role_consultant: "لیڈ کنسلٹنٹ",
      assigned_officer: "متعلقہ افسر",

      // Navigation Groups
      nav_offices: "Glossary Offices",
      nav_system: "سسٹم اور اوزار",
      nav_reports: "مالیاتی رپورٹس",
      nav_settings: "ترتیبات",

      // Header Actions
      btn_record_payment: "ادائیگی درج کریں",
      btn_export: "رپورٹ ایکسپورٹ",
      btn_install_app: "ایپ انسٹال کریں",
      status_online: "آن لائن",
      status_offline: "آپ اس وقت آف لائن ہیں۔ لوکل کیش فعال ہے۔",

      // KPI Metrics
      kpi_total_revenue: "کل آمدنی",
      kpi_doctor_share: "ایڈمن کا حصہ",
      kpi_office_share: "دفتر کا خالص حصہ",
      kpi_pending_balance: "واجب الادا بقایا",
      kpi_cases_count: "کل کیسز / اسکینز",
      kpi_today_collected: "آج کی وصولی",
      trend_vs_last_month: "گزشتہ ماہ کے مقابلے",
      trend_settled: "مکمل حساب شدہ",

      // Table & Filter Headers
      filter_search_placeholder: "Search by Glossary name, ID, or phone...",
      filter_all_statuses: "تمام کیفیات",
      filter_status_paid: "مکمل ادا شدہ",
      filter_status_pending: "زیر التواء",
      filter_status_partial: "جزوی ادا شدہ",
      filter_all_time: "تمام اوقات",
      filter_today: "آج",
      filter_this_week: "اس ہفتے",
      filter_this_month: "اس مہینے",

      table_id: "کوڈ",
      table_patient: "مریض کی تفصیل",
      table_service: "سروس / ٹیسٹ",
      table_total: "کل فیس",
      table_doctor_cut: "ایڈمن کا حصہ",
      table_office_cut: "دفتر کا حصہ",
      table_status: "حیثیت",
      table_date: "تاریخ",
      table_actions: "اقدامات",

      // Empty & Loading States
      empty_title: "کوئی ریکارڈ نہیں ملا",
      empty_desc: "منتخب کردہ فلٹرز کے مطابق کوئی ٹرانزیکشن موجود نہیں ہے۔",
      empty_cta: "نیا ریکارڈ درج کریں",
      loading_data: "ریکارڈز اور مالیاتی حسابات لوڈ ہو رہے ہیں...",
      error_load_title: "ڈیٹا لوڈ کرنے میں ناکامی",
      error_load_desc: "ڈیٹا بیس سے ریکارڈ حاصل کرتے وقت مسئلہ پیش آیا۔",
      btn_retry: "دوبارہ کوشش کریں",

      // Modals
      modal_new_payment_title: "Record Glossary Payment",
      form_patient_name: "P Full Name",
      form_patient_placeholder: "Enter Full Name",
      form_patient_contact: "رابطہ نمبر",
      form_office_select: "متعلقہ دفتر",
      form_service_description: "Procedure / Scan / Constraction",
      form_total_fee: "کل فیس (روپے)",
      form_doctor_percentage: "Admin Share (%)",
      form_paid_amount: "موصول شدہ رقم (روپے)",
      form_payment_method: "ادائیگی کا طریقہ",
      form_method_cash: "نقد (Cash)",
      form_method_bank: "آن لائن / بینک ٹرانسفر",
      form_method_card: "ڈیبٹ / کریڈٹ کارڈ",
      form_notes: "اضافی ریمارکس / نوٹ",
      
      // Financial Calculation Breakdown
      calc_preview_heading: "ادائیگی کے حساب کا خلاصہ",
      calc_doctor_amount: "Calculated Admin Share:",
      calc_office_amount: "دفتر کا متوقع حصہ:",
      calc_remaining_due: "باقی واجب الادا رقم:",

      btn_cancel: "منسوخ کریں",
      btn_save: "محفوظ اور درج کریں",
      btn_confirm: "تصدیق کریں",
      modal_confirm_title: "کارروائی کی تصدیق",
      modal_confirm_text: "کیا آپ واقعی یہ کارروائی جاری رکھنا چاہتے ہیں؟",

      // Local Office Dedicated Strings (Urdu)
      mri_payment_entry: "Local Payment Entry",
      mri_patient_name: "P Name",
      mri_type: "Service",
      mri_payment_received: "Payment Received",
      mri_date: "تاریخ",
      mri_day: "دن",
      mri_type_placeholder: "سروس کی قسم منتخب کریں یا لکھیں...",
      btn_add_mri_entry: "Record Local Payment",
      btn_update_mri_entry: "تبدیلیاں محفوظ کریں",
      mri_calc_rule_hint: "طے شدہ اصول: ادائیگی ≥ 3,000 روپے → دفتر: 3,000 روپے | ایڈمن: بقیہ رقم",
      mri_office_share_fixed: "Local Office Share:",
      doctor_amount_cut: "Admin Amount:",
      mri_profit: "Local Profit:",

      // Local Dashboard Summary Cards
      kpi_today_total_received: "آج کی کل موصولی",
      kpi_today_mri_entries: "Today's Local Entries",
      kpi_mri_office_share: "Local Office Share",
      kpi_mri_profit: "Local Profit",
      kpi_doctor_amount: "Admin Amount",

      // Local Payment History Table
      mri_payment_history: "Local Payment History",
      col_patient_name: "P Name",
      col_mri_type: "Local Type",
      col_payment: "Payment",
      col_office_share: "Local Office Share",
      col_mri_profit: "Local Profit",
      col_doctor_amount: "Admin Amount",
      col_date: "تاریخ",
      col_day: "دن",
      col_actions: "اقدامات",

      // Actions & Confirmations
      btn_edit: "ترمیم",
      btn_delete: "حذف",
      btn_clear_all: "تمام ریکارڈ صاف کریں",
      confirm_clear_all_title: "تمام لوکل ریکارڈز حذف کریں",
      confirm_clear_all_text: "کیا آپ واقعی تمام لوکل ریکارڈز حذف کرنا چاہتے ہیں؟",
      btn_yes_delete_all: "Yes, Delete All - جی ہاں، سب حذف کریں",
      confirm_delete_single_title: "لوکل ریکارڈ حذف کریں",
      confirm_delete_single_text: "کیا آپ واقعی یہ لوکل ریکارڈ حذف کرنا چاہتے ہیں؟",
      btn_yes_delete: "جی ہاں، حذف کریں",
      modal_edit_mri_title: "Edit Local Payment Record",

      // Toasts
      toast_success_title: "کامیابی",
      toast_payment_added: "ادائیگی کا ریکارڈ کامیابی کے ساتھ درج اور حساب کر دیا گیا۔",
      toast_mri_added: "لوکل ادائیگی کا ریکارڈ کامیابی کے ساتھ محفوظ ہو گیا۔",
      toast_mri_updated: "لوکل ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا۔",
      toast_mri_deleted: "لوکل ریکارڈ حذف کر دیا گیا۔",
      toast_mri_cleared: "تمام لوکل ریکارڈز کامیابی سے حذف کر دیے گئے۔",

      // Constraction Office Dedicated Strings (Officer: Shezaad)
      inv_payment_entry: "Constraction Payment Entry",
      inv_patient_name: "P Name",
      inv_test_name: "Material Name",
      inv_payment_received: "Payment Received",
      inv_date: "تاریخ",
      inv_day: "دن",
      inv_test_placeholder: "مٹیریل کا نام منتخب یا درج کریں...",
      btn_add_inv_entry: "Record Constraction Payment",
      btn_update_inv_entry: "تبدیلیاں محفوظ کریں",
      inv_calc_rule_hint: "ضابطہ: موصول شدہ رقم 100٪ ایڈمن کی ہے (کوئی کٹوتی نہیں)",
      inv_total_received: "Constraction Total:",
      inv_payment_history: "Constraction Payment History",
      col_test_name: "Material Name",

      // Constraction Summary Cards
      kpi_today_inv_entries: "Today's Constraction Entries",

      // Actions & Confirmations for Constraction
      confirm_clear_all_inv_title: "تمام کنسٹرکشن ریکارڈ صاف کریں",
      confirm_clear_all_inv_text: "کیا آپ واقعی تمام کنسٹرکشن ریکارڈز کو حذف کرنا چاہتے ہیں؟",
      confirm_delete_single_inv_title: "کنسٹرکشن ریکارڈ حذف کریں",
      confirm_delete_single_inv_text: "کیا آپ واقعی یہ کنسٹرکشن ریکارڈ حذف کرنا چاہتے ہیں؟",
      modal_edit_inv_title: "Edit Constraction Payment Record",

      // Toasts for Constraction
      toast_inv_added: "کنسٹرکشن فیس کامیابی سے محفوظ ہو گئی۔",
      toast_inv_updated: "کنسٹرکشن ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا۔",
      toast_inv_deleted: "کنسٹرکشن ریکارڈ حذف کر دیا گیا۔",
      toast_inv_cleared: "تمام کنسٹرکشن ریکارڈز حذف کر دیے گئے۔",

      // Operation / Glossary Office Dedicated Strings (Officer: Qari Mustajab)
      op_payment_entry: "Glossary Payment Entry",
      op_patient_name: "Name",
      op_edit_patient_name: "P Name",
      op_patient_placeholder: "Enter Name",
      op_operation_name: "Service",
      op_operation_type: "Service",
      op_payment_received: "R Payment",
      op_received_payment: "R Payment",
      op_payment_placeholder: "Glossery Pay",
      op_submitted_payment: "S Payment",
      op_admission_slip: "Slip",
      op_assistant_fee: "Assist",
      op_hdu_icu: "HIU",
      op_medicine: "Purchase",
      op_optional_details: "Glossery Amount Breakdown (Defaults to 0 if left empty)",
      op_date: "تاریخ",
      op_day: "دن",
      op_operation_placeholder: "Select or enter Glossery type...",
      btn_add_op_entry: "Record Glossary Payment",
      btn_update_op_entry: "تبدیلیاں محفوظ کریں",
      op_calc_rule_hint: "ادائیگی کا اصول: %100 ایڈمن کی رقم (کوئی کٹوتی نہیں)",
      op_total_received: "Glossary Total",
      op_payment_history: "Glossary Payment History",
      col_operation_name: "Service",
      col_operation_type: "Service",
      col_received: "Received",
      col_submitted: "Submitted",
      col_net_sx_day: "Net Sx Day",
      col_net_pay_later: "Net Pay Later",
      col_final_total: "Final Total",
      op_net_sx_day: "Net to Pay Sx Day",
      op_net_pay_later: "Net Pay Later",
      op_final_total: "Final Total",

      // Glossary Summary Cards
      kpi_today_op_entries: "Today's Glossary Entries",

      // Actions & Confirmations for Operation
      confirm_clear_all_op_title: "تمام گلوسری ریکارڈ صاف کریں",
      confirm_clear_all_op_text: "کیا آپ واقعی تمام گلوسری ریکارڈز کو حذف کرنا چاہتے ہیں؟",
      confirm_delete_single_op_title: "گلوسری ریکارڈ حذف کریں",
      confirm_delete_single_op_text: "کیا آپ واقعی یہ گلوسری ریکارڈ حذف کرنا چاہتے ہیں؟",
      modal_edit_op_title: "Edit Glossary Payment Record",

      // Toasts for Operation
      toast_op_added: "گلوسری فیس کامیابی سے محفوظ ہو گئی۔",
      toast_op_updated: "گلوسری ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا۔",
      toast_op_deleted: "گلوسری ریکارڈ حذف کر دیا گیا۔",
      toast_op_cleared: "تمام گلوسری ریکارڈز حذف کر دیے گئے۔",

      // Doctor Main Dashboard Dedicated Strings (Urdu)
      doctor_dashboard_title: "مالیاتی جائزہ ڈیش بورڈ",
      doctor_name_title: "Financial Summary",
      doctor_grand_total: "Total Earnings",
      doctor_grand_total_desc: "Net revenue aggregated across Local, Constraction, and Assist units",
      doctor_total_clinic_revenue: "Total Glossary Collection",
      doctor_total_clinic_entries: "Total Glossary Entries",
      doctor_formula_mri: "Local Share:",
      doctor_formula_inv: "Constraction Share:",
      doctor_formula_asst: "Assist Share:",
      doctor_formula_equals: "Grand Total:",

      // Doctor Tabs
      doctor_tab_mri: "Local",
      doctor_tab_investigation: "Constraction",
      doctor_tab_assistant: "Assist",

      // Date Filters (Strictly Only 3)
      filter_opt_today: "آج",
      filter_opt_yesterday: "گزشتہ کل",
      filter_opt_week: "اس ہفتے",

      // Tab Summaries & KPI Titles
      doc_summary_total_received: "کل موصولی",
      doc_summary_mri_share: "Local Office Share",
      doc_summary_mri_profit: "Local Profit",
      doc_summary_doctor_amount: "Admin Amount",
      doc_summary_entries_count: "اندراجات کی تعداد",
      col_mri_machine_exp: "Local Office Share",
      col_mri_profit: "Local Profit",

      // Doctor Tab Table Headers & Titles
      doc_mri_records_title: "Local Department Records",
      doc_inv_records_title: "Constraction Department Records",
      doc_op_records_title: "Assist Department Records",

      // Actions & Modals for Doctor
      btn_clear_tab: "ٹیب ریکارڈز صاف کریں",
      confirm_clear_doctor_tab_title: "فعال ٹیب کے تمام ریکارڈز حذف کریں",
      confirm_clear_doctor_tab_text: "کیا آپ واقعی اس شعبہ کے تمام ریکارڈز حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔",
      toast_doctor_tab_cleared: "منتخب شعبہ کے تمام ریکارڈز کامیابی سے حذف کر دیے گئے۔",

      toast_positive_payment: "موصول شدہ رقم ایک مثبت اور درست عدد ہونی چاہیے۔",
      toast_error_title: "درستی کی ضرورت",
      toast_fill_required: "براہ کرم تمام مطلوبہ خانے درست طریقے سے پُر کریں۔",
      toast_pwa_installed: "کلینک ادائیگی ایپ کامیابی سے انسٹال ہو گئی۔",

      // Authentication & Access Control
      login_title: "Glossary Portal",
      login_subtitle: "اپنے مخصوص Glossery دفتر تک رسائی کے لیے لاگ ان کریں",
      login_field_identity: "ای میل یا یوزر نام",
      login_field_password: "پاس ورڈ",
      login_placeholder_identity: "Enter your Email",
      login_placeholder_password: "اپنا پاس ورڈ درج کریں",
      login_btn_submit: "لاگ ان کریں",
      login_btn_signing_in: "توثیق جاری ہے...",
      login_quick_roles_title: "فوری عملہ سوئچر (ڈیمو / ٹیسٹنگ)",
      login_quick_roles_desc: "کسی بھی عملے پر کلک کر کے معلومات خودکار طریقے سے پُر کریں:",
      auth_badge_mri: "Local Office (عاقب)",
      auth_badge_inv: "Constraction لیب (شہزاد)",
      auth_badge_op: "Assist Office (مستجاب)",
      auth_badge_doc: "Admin (ڈاکٹر نواز)",
      auth_notice_title: "سُوپا بیس کے لیے تیار تصدیقی ڈھانچہ",
      auth_notice_desc: "یہ تصدیقی انٹرفیس معیاری سپابیس آتھ کے مطابق ڈیزائن کیا گیا ہے۔ ہر افسر کے لیے ان کے متعلقہ دفتر تک رسائی نافذ العمل ہے۔",
      auth_error_missing: "براہ کرم ای میل/یوزر نام اور پاس ورڈ دونوں درج کریں۔",
      auth_error_invalid: "غلط معلومات یا اکاؤنٹ کلینک ڈائریکٹری میں موجود نہیں ہے۔",
      auth_success_welcome: "خوش آمدید",
      btn_logout: "لاگ آؤٹ",
      btn_switch_account: "اکاؤنٹ تبدیل کریں",
      logout_confirm_title: "لاگ آؤٹ کی تصدیق",
      logout_confirm_text: "کیا آپ واقعی کلینک ادائیگی سسٹم سے لاگ آؤٹ کرنا چاہتے ہیں؟",
      toast_logged_out: "آپ بحفاظت لاگ آؤٹ ہو چکے ہیں۔",
      access_denied_title: "رسائی ممنوع ہے",
      access_denied_desc: "آپ کو اس شعبہ کا دفتر دیکھنے کی اجازت نہیں ہے۔",

      // Supabase Integration & Status
      supabase_status_connected: "سوپابیس متصل ہے",
      supabase_status_unconfigured: "سوپابیس اسٹینڈ بائی (لوکل موڈ)",
      supabase_status_error: "سوپابیس دوبارہ رابطہ کر رہا ہے",
      supabase_config_title: "سوپابیس ڈیٹا بیس ترتیبات",
      supabase_config_desc: "اپنا سوپابیس پروجیکٹ یو آر ایل اور پبلک اینون کی درج کریں۔ سروس رول کی یہاں کبھی درج نہ کریں۔",
      supabase_url_label: "سوپابیس پروجیکٹ یو آر ایل",
      supabase_url_placeholder: "https://xyzcompany.supabase.co",
      supabase_anon_label: "سوپابیس اینون کی (پبلک)",
      supabase_anon_placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      supabase_btn_save_config: "محفوظ اور متصل کریں",
      supabase_btn_clear_config: "لوکل موڈ پر واپس جائیں",
      supabase_btn_test: "کنکشن ٹیسٹ کریں",
      supabase_test_success: "سوپابیس ڈیٹا بیس سے رابطہ کامیابی سے قائم ہو گیا۔",
      supabase_saved_success: "سوپابیس کی ترتیبات کامیابی سے محفوظ ہو گئیں۔",
      db_error_generic: "ڈیٹا بیس میں خرابی پیش آگئی ہے۔ براہ کرم دوبارہ کوشش کریں۔",
      db_permission_denied: "رسائی مسترد: آپ کے کردار کو اس آپریشن کی اجازت نہیں ہے۔",
      db_network_error: "ڈیٹا بیس سرور تک رسائی ناممکن ہے۔ لوکل کیش فعال ہے۔"
    }
  };

  function init() {
    setLanguage(currentLang);
  }

  function setLanguage(lang) {
    if (!translations[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    const isRtl = (lang === 'ur');
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    // Update active state in language selector UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Translate all DOM elements containing data-i18n attribute
    applyTranslations();

    // Dispatch event so other modules can react (e.g., re-render tables)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, isRtl } }));
  }

  function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang] && translations[currentLang][key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.getAttribute('placeholder')) {
            el.setAttribute('placeholder', translations[currentLang][key]);
          }
        } else {
          el.textContent = translations[currentLang][key];
        }
      }
    });

    // Handle attributes like data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[currentLang] && translations[currentLang][key]) {
        el.setAttribute('placeholder', translations[currentLang][key]);
      }
    });
  }

  function t(key) {
    if (translations[currentLang] && translations[currentLang][key]) {
      return translations[currentLang][key];
    }
    // Fallback to English if translation is missing
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    return key;
  }

  function getLanguage() {
    return currentLang;
  }

  function isRTL() {
    return currentLang === 'ur';
  }

  return {
    init,
    setLanguage,
    applyTranslations,
    t,
    getLanguage,
    isRTL
  };
})();
