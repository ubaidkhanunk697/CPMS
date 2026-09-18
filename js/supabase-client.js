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
    testConnection,
    formatErrorMessage,
    getConnectionStatus: () => ({ status: connectionState, error: lastError })
  };
})();
