require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Ensure required environment variables exist
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase URL or Key in environment.");
    console.error("Please ensure you have a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_PUBLISHABLE_KEY (or SUPABASE_SERVICE_ROLE_KEY).");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PILOT_ACCOUNTS = [
    { name: "Student 1", email: "aim.pilot.student1@example.com", password: "AimPilot2026!S1X8XJaXc5", level: "A1" },
    { name: "Student 2", email: "aim.pilot.student2@example.com", password: "AimPilot2026!S2HOKZXLL0", level: "A1" },
    { name: "Student 3", email: "aim.pilot.student3@example.com", password: "AimPilot2026!S3PWJXEzRw", level: "A1" },
    { name: "Student 4", email: "aim.pilot.student4@example.com", password: "AimPilot2026!S4igqN8t4w", level: "A1" },
    { name: "Student 5", email: "aim.pilot.student5@example.com", password: "AimPilot2026!S5v3Gk06Fm", level: "A1" },
];

async function setupAccounts() {
    console.log(`🚀 Starting Pilot Account Setup on: ${SUPABASE_URL}`);
    console.log(`-----------------------------------------------------`);

    for (const account of PILOT_ACCOUNTS) {
        console.log(`\n⏳ Processing: ${account.name} (${account.email})...`);

        // 1. Create account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
                data: {
                    name: account.name,
                    level: account.level,
                    is_pilot_student: true
                }
            }
        });

        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                console.log(`   ✅ Account already exists.`);
            } else {
                console.error(`   ❌ Failed to create account: ${signUpError.message}`);
                continue;
            }
        } else {
            console.log(`   ✅ Account created successfully.`);
        }

        // 2. Verify Login
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: account.password
        });

        if (signInError) {
            console.error(`   ❌ Login verification failed: ${signInError.message}`);
        } else {
            console.log(`   ✅ Login verification passed! User ID: ${signInData.user.id}`);
            
            // 3. Optional: Trigger backend student link creation if required by the backend.
            // Normally, the web frontend calls POST /students after login. 
            // We verify the credentials work.
        }
    }

    console.log(`\n🎉 Setup Script Complete.`);
}

setupAccounts().catch(console.error);
