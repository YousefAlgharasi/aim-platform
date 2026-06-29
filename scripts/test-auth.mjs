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

async function request(method, path, body, auth) {
  const url = BASE_URL + path;
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) {
    headers['Authorization'] = 'Bearer ' + accessToken;
  }

  const opts = { method: method, headers: headers };
  if (body) opts.body = JSON.stringify(body);

  console.log('');
  console.log('--> ' + method + ' ' + url);
  if (body) console.log('    Body: ' + JSON.stringify(body, null, 2));

  try {
    const res = await fetch(url, opts);
    const status = res.status;
    const text = await res.text();
    let data = null;

    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text || '(empty)';
    }

    console.log('<-- ' + status);
    if (typeof data === 'object' && data !== null) {
      console.log('    Response: ' + JSON.stringify(data, null, 2));
    } else {
      console.log('    Response: ' + data);
    }

    return { status: status, data: data };
  } catch (err) {
    console.log('<-- ERROR: ' + err.message);
    return { status: 0, data: null };
  }
}

function printTokens() {
  console.log('');
  console.log('--- Current Session ---');
  if (accessToken) {
    console.log('  Access Token:  ' + accessToken.substring(0, 30) + '...');
    console.log('  Refresh Token: ' + (refreshToken ? refreshToken.substring(0, 30) + '...' : 'none'));
    if (currentUser) {
      console.log('  User ID:       ' + currentUser.id);
      console.log('  Email:         ' + (currentUser.email || 'n/a'));
    }
  } else {
    console.log('  Not authenticated.');
  }
  console.log('------------------------');
}

async function doLogin() {
  const email = await ask('  Email: ');
  const password = await ask('  Password: ');
  const r = await request('POST', '/auth/login', { email: email, password: password }, false);

  if (r.status === 200 && r.data && r.data.accessToken) {
    accessToken = r.data.accessToken;
    refreshToken = r.data.refreshToken;
    currentUser = r.data.user;
    console.log('\n  Login successful!');
  } else {
    console.log('\n  Login failed.');
  }
}

async function doRegister() {
  const email = await ask('  Email: ');
  const password = await ask('  Password (min 8 chars): ');
  const r = await request('POST', '/auth/register', { email: email, password: password }, false);

  if (r.status === 200 && r.data && r.data.accessToken) {
    accessToken = r.data.accessToken;
    refreshToken = r.data.refreshToken;
    currentUser = r.data.user;
    console.log('\n  Registered and logged in!');
  } else if (r.status === 200 && r.data && r.data.requiresEmailConfirmation) {
    console.log('\n  Registration successful - check your email to confirm.');
  } else {
    console.log('\n  Registration failed.');
  }
}

async function doRefreshToken() {
  if (!refreshToken) {
    console.log('\n  No refresh token available. Login first.');
    return;
  }
  const r = await request('POST', '/auth/refresh', { refreshToken: refreshToken }, false);

  if (r.status === 200 && r.data && r.data.accessToken) {
    accessToken = r.data.accessToken;
    refreshToken = r.data.refreshToken;
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
  await request('GET', '/auth/me', null, true);
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
  var r = await request('POST', '/auth/logout', {}, true);

  accessToken = null;
  refreshToken = null;
  currentUser = null;
  console.log('\n  Logged out. Local tokens cleared.');
}

async function doTestLogin() {
  console.log('  Available roles: student, admin, parent');
  const role = await ask('  Role: ');
  if (role !== 'student' && role !== 'admin' && role !== 'parent') {
    console.log('\n  Invalid role.');
    return;
  }
  const r = await request('POST', '/auth/test-login', { role: role }, false);

  if (r.status === 200 && r.data && r.data.accessToken) {
    accessToken = r.data.accessToken;
    refreshToken = r.data.refreshToken;
    currentUser = r.data.user;
    console.log('\n  Test login as ' + role + ' successful!');
  } else {
    console.log('\n  Test login failed (disabled in production).');
  }
}

async function main() {
  console.log('========================================');
  console.log('  AIM Platform - Auth Endpoint Tester');
  console.log('  Server: ' + BASE_URL);
  console.log('========================================');

  while (true) {
    printTokens();

    console.log('');
    console.log('  1) Login              POST /auth/login');
    console.log('  2) Register           POST /auth/register');
    console.log('  3) Refresh Token      POST /auth/refresh');
    console.log('  4) Get Current User   GET  /auth/me');
    console.log('  5) Bootstrap Profile  POST /auth/bootstrap');
    console.log('  6) Logout             POST /auth/logout');
    console.log('  7) Test Login (dev)   POST /auth/test-login');
    console.log('  0) Exit');
    console.log('');

    const choice = (await ask('  > ')).trim();

    if (choice === '1') await doLogin();
    else if (choice === '2') await doRegister();
    else if (choice === '3') await doRefreshToken();
    else if (choice === '4') await doGetMe();
    else if (choice === '5') await doBootstrap();
    else if (choice === '6') await doLogout();
    else if (choice === '7') await doTestLogin();
    else if (choice === '0' || choice === 'q' || choice === 'exit') {
      console.log('\n  Bye!\n');
      rl.close();
      process.exit(0);
    } else {
      console.log('\n  Invalid choice.');
    }
  }
}

main();
