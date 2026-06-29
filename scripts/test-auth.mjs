#!/usr/bin/env node

import readline from 'node:readline';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

let accessToken = null;
let refreshToken = null;
let currentUser = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function askHidden(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);

    let input = '';
    const onData = (ch) => {
      const c = ch.toString();
      if (c === '\n' || c === '\r') {
        stdin.removeListener('data', onData);
        if (stdin.isTTY) stdin.setRawMode(wasRaw);
        process.stdout.write('\n');
        resolve(input);
      } else if (c === '') {
        process.exit();
      } else if (c === '' || c === '\b') {
        input = input.slice(0, -1);
        process.stdout.write('\r' + question + '*'.repeat(input.length) + ' \b');
      } else {
        input += c;
        process.stdout.write('*');
      }
    };
    stdin.on('data', onData);
  });
}

async function request(method, path, body = null, auth = false) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  console.log(`\n--> ${method} ${url}`);
  if (body) console.log('    Body:', JSON.stringify(body, null, 2));

  try {
    const res = await fetch(url, opts);
    const status = res.status;
    let data = null;

    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text || '(empty)';
    }

    console.log(`<-- ${status}`);
    if (typeof data === 'object' && data !== null) {
      console.log('    Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('    Response:', data);
    }

    return { status, data };
  } catch (err) {
    console.log(`<-- ERROR: ${err.message}`);
    return { status: 0, data: null };
  }
}

function printTokens() {
  console.log('\n--- Current Session ---');
  if (accessToken) {
    console.log(`  Access Token:  ${accessToken.substring(0, 30)}...`);
    console.log(`  Refresh Token: ${refreshToken ? refreshToken.substring(0, 30) + '...' : 'none'}`);
    if (currentUser) {
      console.log(`  User ID:       ${currentUser.id}`);
      console.log(`  Email:         ${currentUser.email || 'n/a'}`);
    }
  } else {
    console.log('  Not authenticated.');
  }
  console.log('------------------------');
}

// ── Auth Actions ──

async function doLogin() {
  const email = await ask('  Email: ');
  const password = await askHidden('  Password: ');
  const { status, data } = await request('POST', '/auth/login', { email, password });

  if (status === 200 && data?.accessToken) {
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    currentUser = data.user;
    console.log('\n  Login successful!');
  } else {
    console.log('\n  Login failed.');
  }
}

async function doRegister() {
  const email = await ask('  Email: ');
  const password = await askHidden('  Password (min 8 chars): ');
  const { status, data } = await request('POST', '/auth/register', { email, password });

  if (status === 200 && data?.accessToken) {
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    currentUser = data.user;
    console.log('\n  Registered and logged in!');
  } else if (status === 200 && data?.requiresEmailConfirmation) {
    console.log('\n  Registration successful — check your email to confirm.');
  } else {
    console.log('\n  Registration failed.');
  }
}

async function doRefreshToken() {
  if (!refreshToken) {
    console.log('\n  No refresh token available. Login first.');
    return;
  }
  const { status, data } = await request('POST', '/auth/refresh', { refreshToken });

  if (status === 200 && data?.accessToken) {
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    console.log('\n  Tokens refreshed!');
  } else {
    console.log('\n  Refresh failed.');
  }
}

async function doGetMe() {
  if (!accessToken) {
    console.log('\n  Not authenticated. Login first.');
    return;
  }
  const { status, data } = await request('GET', '/auth/me', null, true);

  if (status === 200) {
    console.log('\n  Current user loaded.');
  }
}

async function doBootstrap() {
  if (!accessToken) {
    console.log('\n  Not authenticated. Login first.');
    return;
  }
  await request('POST', '/auth/bootstrap', {}, true);
}

async function doLogout() {
  if (!accessToken) {
    console.log('\n  Not authenticated. Nothing to logout.');
    return;
  }
  const { status } = await request('POST', '/auth/logout', {}, true);

  if (status === 204 || status === 200) {
    accessToken = null;
    refreshToken = null;
    currentUser = null;
    console.log('\n  Logged out successfully.');
  } else {
    console.log('\n  Logout request sent (clearing local tokens anyway).');
    accessToken = null;
    refreshToken = null;
    currentUser = null;
  }
}

async function doTestLogin() {
  console.log('  Available roles: student, admin, parent');
  const role = await ask('  Role: ');
  if (!['student', 'admin', 'parent'].includes(role)) {
    console.log('\n  Invalid role.');
    return;
  }
  const { status, data } = await request('POST', '/auth/test-login', { role });

  if (status === 200 && data?.accessToken) {
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    currentUser = data.user;
    console.log(`\n  Test login as ${role} successful!`);
  } else {
    console.log('\n  Test login failed (disabled in production).');
  }
}

// ── Main Menu ──

async function mainMenu() {
  console.log('\n========================================');
  console.log('  AIM Platform — Auth Endpoint Tester');
  console.log(`  Server: ${BASE_URL}`);
  console.log('========================================');

  while (true) {
    printTokens();

    console.log('\n  Choose an action:\n');
    console.log('  1) Login              POST /auth/login');
    console.log('  2) Register           POST /auth/register');
    console.log('  3) Refresh Token      POST /auth/refresh');
    console.log('  4) Get Current User   GET  /auth/me');
    console.log('  5) Bootstrap Profile  POST /auth/bootstrap');
    console.log('  6) Logout             POST /auth/logout');
    console.log('  7) Test Login (dev)   POST /auth/test-login');
    console.log('  0) Exit');
    console.log('');

    const choice = await ask('  > ');

    switch (choice.trim()) {
      case '1': await doLogin(); break;
      case '2': await doRegister(); break;
      case '3': await doRefreshToken(); break;
      case '4': await doGetMe(); break;
      case '5': await doBootstrap(); break;
      case '6': await doLogout(); break;
      case '7': await doTestLogin(); break;
      case '0':
      case 'q':
      case 'exit':
        console.log('\n  Bye!\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n  Invalid choice.');
    }
  }
}

mainMenu();
