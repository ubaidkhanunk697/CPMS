/**
 * Clinic Payment Management System - User & Role Service Module
 * Handles staff profiles, roles, and office permissions.
 */

const UserService = (function () {
  // Pre-seeded clinic staff directory with official assignments
  const CLINIC_STAFF = [
    {
      id: '8b6ae295-6b27-4d25-bed2-abbf1e317f7f',
      email: 'aqeb@gmail.com',
      altEmail: 'aqeb@clinic.local',
      username: 'aqeb',
      name: 'Aqeb Khan',
      nameKey: 'officer_aqeb',
      role: 'mri_officer',
      roleKey: 'role_mri_officer',
      office: 'mri',
      officeNameKey: 'mri_office',
      initials: 'AK',
      accentColor: 'var(--red-500)'
    },
    {
      id: '4a3da3db-9193-431f-a248-a22b86fef232',
      email: 'shezaad@test.com',
      altEmail: 'shezaad@clinic.local',
      username: 'shezaad',
      name: 'Shezaad',
      nameKey: 'officer_shezaad',
      role: 'investigation_officer',
      roleKey: 'role_inv_officer',
      office: 'investigation',
      officeNameKey: 'investigation_office',
      initials: 'SH',
      accentColor: 'var(--info-badge)'
    },
    {
      id: 'b05a2636-5ad6-4894-b4ed-e4fb3728a408',
      email: 'glossar1933@gmail.com',
      altEmail: 'glossary@clinic.local',
      username: 'glossar1933',
      altUsername: 'assis',
      aliases: ['assis', 'glossary', 'operation', 'assis console', 'glossary console'],
      name: 'Assis Console',
      nameKey: 'officer_mustajab',
      role: 'operation_officer',
      roleKey: 'role_asst_officer',
      office: 'operation',
      officeNameKey: 'operation_office',
      initials: 'AC',
      accentColor: 'var(--warning-badge)'
    },
    {
      id: '1ff28414-74cc-4009-976b-3fba3382d93f',
      email: 'drnawaz@test.com',
      altEmail: 'doctor@clinic.local',
      username: 'drnawaz',
      altUsername: 'doctor',
      aliases: ['admin', 'doctor', 'drnawaz', 'dr.nawaz', 'head office'],
      name: 'Admin Console',
      nameKey: 'doctor_nawaz',
      role: 'doctor',
      roleKey: 'role_consultant',
      office: 'doctor',
      officeNameKey: 'doctor_office',
      initials: 'AC',
      accentColor: 'var(--navy-900)'
    }
  ];

  function findStaffInDirectory(clean) {
    if (!clean) return null;
    return CLINIC_STAFF.find(u => 
      u.email.toLowerCase() === clean || 
      (u.altEmail && u.altEmail.toLowerCase() === clean) ||
      u.username.toLowerCase() === clean ||
      (u.altUsername && u.altUsername.toLowerCase() === clean) ||
      (Array.isArray(u.aliases) && u.aliases.some(a => a.toLowerCase() === clean))
    ) || null;
  }

  async function getProfile(userId) {
    if (!userId) return null;

    // 1. Check local directory first
    const local = CLINIC_STAFF.find(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase() || u.username === userId);
    if (local) return local;

    // 2. Try Supabase if ready
    if (SupabaseClient.isReady()) {
      try {
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          return mapProfileRow(data);
        }
      } catch (err) {
        console.warn("[UserService] Error fetching Supabase profile, falling back:", err);
      }
    }

    return null;
  }

  async function getProfileByEmailOrUsername(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();

    // 1. Check staff directory first for instant resolution without network roundtrips
    const matched = findStaffInDirectory(clean);
    if (matched) return matched;

    // 2. Check Supabase profiles table safely with maybeSingle (avoids 406 Not Acceptable)
    if (SupabaseClient.isReady()) {
      try {
        const client = SupabaseClient.getClient();
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .or(`email.eq.${clean},username.eq.${clean}`)
          .maybeSingle();

        if (!error && data) {
          return mapProfileRow(data);
        }
      } catch (err) {
        console.warn("[UserService] Supabase profile query failed:", err);
      }
    }

    return null;
  }

  function mapProfileRow(row) {
    if (!row) return null;

    // Explicit mapping for Assist Console (Glossary)
    const isAssist = (
      row.id === 'b05a2636-5ad6-4894-b4ed-e4fb3728a408' ||
      (row.email && row.email.toLowerCase() === 'glossar1933@gmail.com') ||
      (row.username && row.username.toLowerCase() === 'glossar1933')
    );

    if (isAssist) {
      return {
        id: row.id || 'b05a2636-5ad6-4894-b4ed-e4fb3728a408',
        email: row.email || 'glossar1933@gmail.com',
        username: row.username || 'glossar1933',
        name: 'Assis Console',
        nameKey: 'officer_mustajab',
        role: 'operation_officer',
        roleKey: 'role_asst_officer',
        office: 'operation',
        officeNameKey: 'operation_office',
        initials: 'AC',
        accentColor: 'var(--warning-badge)'
      };
    }

    const known = CLINIC_STAFF.find(u => 
      (row.email && (u.email.toLowerCase() === row.email.toLowerCase() || (u.altEmail && u.altEmail.toLowerCase() === row.email.toLowerCase()))) ||
      (row.username && (u.username.toLowerCase() === row.username.toLowerCase() || (u.altUsername && u.altUsername.toLowerCase() === row.username.toLowerCase()))) ||
      (row.office && u.office === row.office) ||
      (row.role && u.role === row.role)
    ) || {};

    const officeRoleMap = {
      mri: { nameKey: 'officer_aqeb', roleKey: 'role_mri_officer', officeNameKey: 'mri_office', initials: 'AK', accentColor: 'var(--red-500)' },
      investigation: { nameKey: 'officer_shezaad', roleKey: 'role_inv_officer', officeNameKey: 'investigation_office', initials: 'SH', accentColor: 'var(--info-badge)' },
      operation: { nameKey: 'officer_mustajab', roleKey: 'role_asst_officer', officeNameKey: 'operation_office', initials: 'AC', accentColor: 'var(--warning-badge)' },
      doctor: { nameKey: 'doctor_nawaz', roleKey: 'role_consultant', officeNameKey: 'doctor_office', initials: 'AC', accentColor: 'var(--navy-900)' }
    };

    const targetOffice = row.office || known.office || 'mri';
    const defaults = officeRoleMap[targetOffice] || officeRoleMap[row.role] || {};

    return {
      id: row.id,
      email: row.email,
      username: row.username || known.username || row.email.split('@')[0],
      name: row.full_name || known.name || 'Clinic Staff',
      nameKey: known.nameKey || defaults.nameKey || 'app_title',
      role: row.role || known.role || 'mri_officer',
      roleKey: known.roleKey || defaults.roleKey || 'role_mri_officer',
      office: targetOffice,
      officeNameKey: known.officeNameKey || defaults.officeNameKey || 'mri_office',
      initials: (row.initials && row.initials !== 'CP') ? row.initials : (known.initials || defaults.initials || 'CP'),
      accentColor: (row.accent_color && row.accent_color !== '#1E293B') ? row.accent_color : (known.accentColor || defaults.accentColor || '#1E293B')
    };
  }

  function getStaffDirectory() {
    return [...CLINIC_STAFF];
  }

  return {
    getProfile,
    getProfileByEmailOrUsername,
    getStaffDirectory
  };
})();
