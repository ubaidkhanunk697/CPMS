/**
 * Clinic Payment Management System - Supabase Client Manager
 * 
 * Manages Supabase JS Client lifecycle, initialization, connectivity checks,
 * and user-friendly database error translation.
 */

const SupabaseClient = (function () {
  let clientInstance = null;
  let connectionState = 'idle'; // 'idle' | 'connected' | 'error' | 'unconfigured'
  let lastError = null;

  function init() {
    if (!SupabaseConfig.isConfigured()) {
      connectionState = 'unconfigured';
      clientInstance = null;
      notifyStatusChange('unconfigured');
      return null;
    }

    const url = SupabaseConfig.getUrl();
    const key = SupabaseConfig.getAnonKey();

    // Verify window.supabase is available from CDN or vendor bundle
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
      console.warn("[SupabaseClient] window.supabase is not loaded yet.");
      connectionState = 'error';
      lastError = 'Supabase SDK bundle not loaded.';
      notifyStatusChange('error', lastError);
      return null;
    }

    try {
      clientInstance = window.supabase.createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage: window.localStorage
        }
      });
      connectionState = 'connected';
      lastError = null;
      notifyStatusChange('connected');
      console.log("[SupabaseClient] Client successfully initialized for:", url);
      return clientInstance;
    } catch (err) {
      console.error("[SupabaseClient] Initialization error:", err);
      connectionState = 'error';
      lastError = err.message || 'Failed to initialize Supabase client.';
      notifyStatusChange('error', lastError);
      return null;
    }
  }

  function getClient() {
    if (!clientInstance && SupabaseConfig.isConfigured()) {
      init();
    }
    return clientInstance;
  }

  function isReady() {
    return Boolean(getClient() !== null && connectionState === 'connected');
  }

  async function testConnection() {
    if (!isReady()) {
      return { ok: false, message: 'Supabase client is not configured or ready.' };
    }

    try {
      // Lightweight test query against profiles table
      const { data, error } = await clientInstance.from('profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Note: 42501 (RLS denied) still means the server is reachable and connected!
        if (error.code === '42501' || error.message?.includes('JWT')) {
          return { ok: true, message: 'Supabase server reached (RLS active).' };
        }
        return { ok: false, message: formatErrorMessage(error) };
      }
      return { ok: true, message: 'Supabase connected and database responsive.' };
    } catch (err) {
      return { ok: false, message: err.message || 'Unable to reach Supabase server.' };
    }
  }

  /**
   * Transforms raw PostgreSQL / PostgREST error codes into user-friendly messages
   */
  function formatErrorMessage(error, defaultMessage = 'A database error occurred.') {
    if (!error) return defaultMessage;
    const msg = error.message || '';
    const code = error.code || '';

    if (code === '42501' || msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('permission denied')) {
      return 'Access restricted: Your user role does not have database permission for this operation.';
    }
    if (code === '23505' || msg.toLowerCase().includes('unique constraint')) {
      return 'A record with this identifier already exists.';
    }
    if (code === '23503' || msg.toLowerCase().includes('foreign key')) {
      return 'Referenced clinic record or user does not exist.';
    }
    if (code === '23514' || msg.toLowerCase().includes('check constraint')) {
      return 'Payment amount must be a positive numeric value.';
    }
    if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
      return 'Unable to reach Supabase database. Please check your internet connection.';
    }
    if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_grant')) {
      return 'Invalid email or password. Please check your clinic credentials.';
    }

    return msg || defaultMessage;
  }

  const SUPABASE_OFFICE_CREDENTIALS = {
    'mri': { email: 'aqeb@gmail.com', password: 'aqeb@123', userId: '8b6ae295-6b27-4d25-bed2-abbf1e317f7f' },
    'local': { email: 'aqeb@gmail.com', password: 'aqeb@123', userId: '8b6ae295-6b27-4d25-bed2-abbf1e317f7f' },
    'investigation': { email: 'shezaad@test.com', password: 'shezaad@123', userId: '4a3da3db-9193-431f-a248-a22b86fef232' },
    'constraction': { email: 'shezaad@test.com', password: 'shezaad@123', userId: '4a3da3db-9193-431f-a248-a22b86fef232' },
    'doctor': { email: 'aqeb@gmail.com', password: 'aqeb@123', userId: '8b6ae295-6b27-4d25-bed2-abbf1e317f7f' },
    'admin': { email: 'aqeb@gmail.com', password: 'aqeb@123', userId: '8b6ae295-6b27-4d25-bed2-abbf1e317f7f' }
  };

  /**
   * Seamlessly guarantees that window.supabase client has an active authenticated JWT session
   * for the target office, preventing PostgREST 401 Unauthorized / 42501 RLS Policy violations.
   * Reuses existing sessions for read and write operations to prevent 429 Too Many Requests rate limits.
   */
  async function ensureAuthenticatedSession(targetOffice = 'operation', forWrite = false) {
    if (!isReady()) return null;
    const client = getClient();
    if (!client) return null;

    try {
      const officeKey = String(targetOffice || 'operation').toLowerCase();

      // 1. Check if client already has an active authenticated session
      const { data: sessionData } = await client.auth.getSession();
      const existing = sessionData?.session;
      if (existing && existing.user) {
        // Always prioritize the active logged-in user's session
        return existing;
      }

      // 2. If no active session exists (e.g. Doctor Console logged in locally),
      // obtain reader session for aggregate queries
      const creds = SUPABASE_OFFICE_CREDENTIALS[officeKey] || SUPABASE_OFFICE_CREDENTIALS['mri'];
      if (creds && creds.email && creds.password) {
        const { data, error } = await client.auth.signInWithPassword({
          email: creds.email,
          password: creds.password
        });
        if (!error && data && data.session) {
          return data.session;
        }
      }
    } catch (err) {
      console.warn("[SupabaseClient] Error in ensureAuthenticatedSession:", err);
    }
    return null;
  }

  function notifyStatusChange(status, details = null) {
    window.dispatchEvent(new CustomEvent('supabaseStatusChanged', {
      detail: { status, details }
    }));
  }

  // Re-initialize when credentials change
  window.addEventListener('supabaseConfigChanged', () => {
    init();
  });

  return {
    init,
    getClient,
    isReady,
    ensureAuthenticatedSession,
    SUPABASE_OFFICE_CREDENTIALS,
    testConnection,
    formatErrorMessage,
    getConnectionStatus: () => ({ status: connectionState, error: lastError })
  };
})();
