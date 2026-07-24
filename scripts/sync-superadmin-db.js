const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.yrarpdkvdxszgxxondkt:yEsQLkfSEyCrmRmL@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require';
const SUPABASE_AUTH_UID = 'b7eccbba-b39f-4edf-a7f4-cb442518624e';
const EMAIL = 'ghost@aim.com';

async function syncSuperAdmin() {
  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    // 1. Upsert internal user
    console.log('Upserting internal user in "users" table...');
    const userRes = await client.query(
      `INSERT INTO users (supabase_auth_uid, email, user_type, status)
       VALUES ($1, $2, 'super_admin', 'active')
       ON CONFLICT (supabase_auth_uid)
       DO UPDATE SET status = 'active', email = EXCLUDED.email
       RETURNING id, supabase_auth_uid, email, status;`,
      [SUPABASE_AUTH_UID, EMAIL]
    );
    const internalUser = userRes.rows[0];
    console.log('Internal User:', internalUser);

    // 2. Ensure super_admin and admin roles exist in roles table
    console.log('Ensuring system roles exist in "roles" table...');
    await client.query(`
      INSERT INTO roles (id, key, name, description, is_system)
      VALUES 
        (gen_random_uuid(), 'super_admin', 'Super Admin', 'Full platform access', true),
        (gen_random_uuid(), 'admin', 'Administrator', 'Admin dashboard access', true)
      ON CONFLICT (key) DO NOTHING;
    `);

    // Get super_admin role ID
    const roleRes = await client.query(`SELECT id, key FROM roles WHERE key = 'super_admin'`);
    const superAdminRole = roleRes.rows[0];
    console.log('Super Admin Role:', superAdminRole);

    // 3. Link user to role in user_roles table if user_roles table exists
    console.log('Linking user to super_admin role in "user_roles"...');
    try {
      await client.query(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [internalUser.id, superAdminRole.id]);
      console.log('User role linked successfully!');
    } catch (err) {
      console.log('Note on user_roles table:', err.message);
    }

    console.log('\n✅ Super Admin account is now fully provisioned and active in the database!');
  } catch (err) {
    console.error('Database provisioning error:', err);
  } finally {
    await client.end();
  }
}

syncSuperAdmin();
