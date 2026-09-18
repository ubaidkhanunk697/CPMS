/**
 * Clinic Payment Management System - Supabase Configuration Module
 * 
 * SECURITY NOTICE:
 * Never put the Supabase service-role secret key here. Only use the public anon key.
 * This configuration allows runtime overrides stored in localStorage so clinic 
 * administrators can plug in any live Supabase project directly from the UI.
 */

const SupabaseConfig = (function () {
  const STORAGE_KEY_URL = 'clinic_pay_sb_url';
  const STORAGE_KEY_KEY = 'clinic_pay_sb_anon_key';

  // Default placeholders or environment values
  // Can be configured here or entered dynamically via UI Settings
  const DEFAULT_CONFIG = {
    url: 'https://mqwxnewtuvokdrpuhcfc.supabase.co',
    anonKey: 'sb_publishable_RVArrib6NKQMARKEYWpnSQ_yA6Cf42w'
  };

  function getUrl() {
    return localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_CONFIG.url || '';
  }

  function getAnonKey() {
    return localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_CONFIG.anonKey || '';
  }

  function setCredentials(url, anonKey) {
    if (!url || typeof url !== 'string') {
      return { success: false, error: 'Valid Supabase project URL is required.' };
    }

    if (!anonKey || typeof anonKey !== 'string') {
      return { success: false, error: 'Valid Supabase anon public key is required.' };
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();

    // Prevent accidental usage of service_role key
    if (cleanKey.toLowerCase().includes('service_role')) {
      return { 
        success: false, 
        error: 'SECURITY WARNING: Do not enter a service_role key! Only use the public "anon" key on frontend.' 
      };
    }

    // Deep inspection: Check if JWT payload contains service_role or admin role
    try {
      const parts = cleanKey.split('.');
      if (parts.length === 3) {
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const decoded = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf-8');
        const payload = JSON.parse(decoded);
        if (payload && (payload.role === 'service_role' || payload.role === 'supabase_admin')) {
          return {
            success: false,
            error: 'SECURITY WARNING: Detected service_role JWT key! Never use administrative secret keys on the frontend. Please use the public "anon" key.'
          };
        }
      }
    } catch (_) {
      // Not a decodable JWT or malformed, continue standard validation
    }

    try {
      new URL(cleanUrl);
    } catch (_) {
      return { success: false, error: 'Invalid URL format. Expected format: https://xyzcompany.supabase.co' };
    }

    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);

    window.dispatchEvent(new CustomEvent('supabaseConfigChanged', {
      detail: { url: cleanUrl, hasKey: true }
    }));

    return { success: true };
  }

  function clearCredentials() {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    window.dispatchEvent(new CustomEvent('supabaseConfigChanged', {
      detail: { url: '', hasKey: false }
    }));
    return { success: true };
  }

  function isConfigured() {
    const url = getUrl();
    const key = getAnonKey();
    return Boolean(url && key && url.length > 8 && key.length > 20);
  }

  return {
    getUrl,
    getAnonKey,
    setCredentials,
    clearCredentials,
    isConfigured
  };
})();
