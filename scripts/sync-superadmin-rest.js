const SUPABASE_URL = 'https://yrarpdkvdxszgxxondkt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyYXJwZGt2ZHhzemd4eG9uZGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIwMjg3OSwiZXhwIjoyMDk2Nzc4ODc5fQ.H00QC3tgjN6wBh-UlBaq5NtQwPgjeS90m_EoWT8L5HE';

const SUPABASE_AUTH_UID = 'b7eccbba-b39f-4edf-a7f4-cb442518624e';
const EMAIL = 'ghost@aim.com';

async function syncInternalUser() {
  console.log('Inserting internal user record into Supabase "users" table...');

  // 1. Insert/Upsert into users table
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      supabase_auth_uid: SUPABASE_AUTH_UID,
      email: EMAIL,
      user_type: 'admin',
      status: 'active',
    }),
  });

  const userData = await userRes.json();
  console.log('Users table upsert result:', userRes.status, JSON.stringify(userData, null, 2));

  // 2. Insert/Upsert into roles table
  console.log('Ensuring super_admin role exists in "roles" table...');
  const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/roles`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      key: 'super_admin',
      name: 'Super Admin',
      description: 'Full platform access',
      is_system: true,
    }),
  });
  const roleData = await roleRes.json();
  console.log('Roles table upsert result:', roleRes.status, JSON.stringify(roleData, null, 2));

  const internalUserId = Array.isArray(userData) ? userData[0]?.id : userData?.id;

  // Get super_admin role ID
  const getRoleRes = await fetch(`${SUPABASE_URL}/rest/v1/roles?key=eq.super_admin`, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const getRoleData = await getRoleRes.json();
  const roleId = Array.isArray(getRoleData) ? getRoleData[0]?.id : null;

  console.log('Internal User ID:', internalUserId, 'Role ID:', roleId);

  if (internalUserId && roleId) {
    console.log('Linking internal user ID', internalUserId, 'to role ID', roleId, 'in user_roles...');
    const userRoleRes = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        user_id: internalUserId,
        role_id: roleId,
      }),
    });
    console.log('user_roles link result:', userRoleRes.status, await userRoleRes.text());
  }

  console.log('\n✅ Completed internal user sync via REST!');
}

syncInternalUser();
