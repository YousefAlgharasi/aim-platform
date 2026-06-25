#!/usr/bin/env npx ts-node
// =============================================================================
// AIM Platform — Backend API Endpoint Test Script (Node.js / TypeScript)
// =============================================================================
//
// Tests every backend endpoint using native fetch.
//
// Usage:
//   npx ts-node scripts/test-all-endpoints.ts
//   npx ts-node scripts/test-all-endpoints.ts --base-url http://localhost:3000
//   npx ts-node scripts/test-all-endpoints.ts --email student@example.com --password secret
//
// Flags:
//   --base-url <url>        API base URL          (default: http://localhost:3000)
//   --email <email>         Student login email    (default: student@example.com)
//   --password <pass>       Student login password (default: password123)
//   --admin-email <email>   Admin login email      (default: admin@example.com)
//   --admin-password <pass> Admin login password   (default: admin123)
//   --skip-admin            Skip admin-only endpoints
//   --skip-destructive      Skip POST/PATCH/DELETE that mutate data
//   --verbose               Print response bodies on failure
//   --json                  Output results as JSON at the end
// =============================================================================

// ── Types ───────────────────────────────────────────────────────────────────

interface TestResult {
  method: string;
  path: string;
  description: string;
  status: number | 'SKIP' | 'ERROR';
  expected: number[];
  passed: boolean;
  responseBody?: string;
  error?: string;
  durationMs: number;
}

interface Config {
  baseUrl: string;
  email: string;
  password: string;
  adminEmail: string;
  adminPassword: string;
  skipAdmin: boolean;
  skipDestructive: boolean;
  verbose: boolean;
  json: boolean;
}

// ── Colours ─────────────────────────────────────────────────────────────────

const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

// ── Parse CLI args ──────────────────────────────────────────────────────────

function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    email: process.env.TEST_EMAIL || 'student@example.com',
    password: process.env.TEST_PASSWORD || 'password123',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    skipAdmin: process.env.SKIP_ADMIN === '1',
    skipDestructive: process.env.SKIP_DESTRUCTIVE === '1',
    verbose: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--base-url':       config.baseUrl = args[++i]; break;
      case '--email':          config.email = args[++i]; break;
      case '--password':       config.password = args[++i]; break;
      case '--admin-email':    config.adminEmail = args[++i]; break;
      case '--admin-password': config.adminPassword = args[++i]; break;
      case '--skip-admin':     config.skipAdmin = true; break;
      case '--skip-destructive': config.skipDestructive = true; break;
      case '--verbose':        config.verbose = true; break;
      case '--json':           config.json = true; break;
      default:
        console.error(`Unknown flag: ${args[i]}`);
        process.exit(1);
    }
  }

  return config;
}

// ── Test runner ─────────────────────────────────────────────────────────────

class EndpointTester {
  private results: TestResult[] = [];
  private config: Config;
  private studentToken = '';
  private adminToken = '';
  private studentUserId = '';
  private refreshToken = '';

  constructor(config: Config) {
    this.config = config;
  }

  // ── HTTP helper ───────────────────────────────────────────────────────

  private async request(
    method: string,
    path: string,
    opts: { token?: string; body?: unknown; timeout?: number } = {},
  ): Promise<{ status: number; body: string; json: unknown }> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (opts.token) {
      headers['Authorization'] = `Bearer ${opts.token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeout || 10_000);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });
      const body = await res.text();
      let json: unknown = null;
      try { json = JSON.parse(body); } catch {}
      return { status: res.status, body, json };
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Test a single endpoint ────────────────────────────────────────────

  async test(
    method: string,
    path: string,
    expected: number[],
    opts: {
      description?: string;
      token?: string;
      body?: unknown;
    } = {},
  ): Promise<TestResult> {
    const desc = opts.description || `${method} ${path}`;
    const start = Date.now();

    try {
      const res = await this.request(method, path, {
        token: opts.token,
        body: opts.body,
      });

      const passed = expected.includes(res.status);
      const result: TestResult = {
        method,
        path,
        description: desc,
        status: res.status,
        expected,
        passed,
        durationMs: Date.now() - start,
      };

      if (!passed && this.config.verbose) {
        result.responseBody = res.body.substring(0, 500);
      }

      this.results.push(result);
      this.logResult(result);
      return result;
    } catch (err: any) {
      const result: TestResult = {
        method,
        path,
        description: desc,
        status: 'ERROR',
        expected,
        passed: false,
        error: err.message,
        durationMs: Date.now() - start,
      };
      this.results.push(result);
      this.logResult(result);
      return result;
    }
  }

  skip(description: string): void {
    const result: TestResult = {
      method: '',
      path: '',
      description,
      status: 'SKIP',
      expected: [],
      passed: true,
      durationMs: 0,
    };
    this.results.push(result);
    console.log(`  ${c.yellow('○')} SKIP: ${description}`);
  }

  // ── Logging ───────────────────────────────────────────────────────────

  private logResult(r: TestResult): void {
    if (r.status === 'ERROR') {
      console.log(`  ${c.red('✗')} ${r.description} — ${c.red('ERROR')}: ${r.error}`);
    } else if (r.passed) {
      console.log(`  ${c.green('✓')} ${r.description} — ${r.status} ${c.dim(`${r.durationMs}ms`)}`);
    } else {
      console.log(
        `  ${c.red('✗')} ${r.description} — got ${c.red(String(r.status))}, expected ${r.expected.join(',')}`,
      );
      if (r.responseBody) {
        console.log(`    ${c.dim(r.responseBody.substring(0, 200))}`);
      }
    }
  }

  section(title: string): void {
    console.log('');
    console.log(c.bold(c.cyan('═══════════════════════════════════════════════════════════')));
    console.log(c.bold(c.cyan(`  ${title}`)));
    console.log(c.bold(c.cyan('═══════════════════════════════════════════════════════════')));
  }

  subsection(title: string): void {
    console.log('');
    console.log(c.bold(`── ${title} ──`));
  }

  // ── Auth helpers ──────────────────────────────────────────────────────

  async login(email: string, password: string, label: string): Promise<{
    token: string;
    refreshToken: string;
    userId: string;
    raw: any;
  } | null> {
    try {
      const res = await this.request('POST', '/auth/login', {
        body: { email, password },
      });
      const data = res.json as any;
      if (data?.accessToken) {
        console.log(`  ${c.green('✓')} Logged in as ${label} (${email})`);
        return {
          token: data.accessToken,
          refreshToken: data.refreshToken || '',
          userId: data.user?.id || '',
          raw: data,
        };
      }
      console.log(`  ${c.red('✗')} Failed to login as ${label} — ${res.body.substring(0, 200)}`);
      return null;
    } catch (err: any) {
      console.log(`  ${c.red('✗')} Failed to login as ${label} — ${err.message}`);
      return null;
    }
  }

  // ── Run all tests ─────────────────────────────────────────────────────

  async run(): Promise<void> {
    const cfg = this.config;
    const DUMMY = '00000000-0000-0000-0000-000000000001';

    console.log(c.bold('AIM Platform — Backend API Endpoint Test Suite'));
    console.log(`Base URL:  ${cfg.baseUrl}`);
    console.log(`Student:   ${cfg.email}`);
    console.log(`Admin:     ${cfg.adminEmail}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    // ────────────────────────────────────────────────────────────────────
    // 0. HEALTH / FOUNDATION
    // ────────────────────────────────────────────────────────────────────

    this.section('0. HEALTH / FOUNDATION (public)');

    await this.test('GET', '/health', [200], { description: 'GET /health' });
    await this.test('GET', '/version', [200], { description: 'GET /version' });
    await this.test('GET', '/health/db-tables', [200], { description: 'GET /health/db-tables' });

    // ────────────────────────────────────────────────────────────────────
    // 1. AUTH — PUBLIC
    // ────────────────────────────────────────────────────────────────────

    this.section('1. AUTH — PUBLIC ENDPOINTS');

    if (cfg.skipDestructive) {
      this.skip('POST /auth/register (destructive)');
    } else {
      await this.test('POST', '/auth/register', [200, 201, 400, 409], {
        description: 'POST /auth/register',
        body: { email: 'test-script-user@example.com', password: 'TestPass123!' },
      });
    }

    await this.test('POST', '/auth/login', [200, 201, 401], {
      description: 'POST /auth/login (student)',
      body: { email: cfg.email, password: cfg.password },
    });

    // Obtain tokens
    this.subsection('Obtaining auth tokens');

    const studentLogin = await this.login(cfg.email, cfg.password, 'student');
    if (studentLogin) {
      this.studentToken = studentLogin.token;
      this.refreshToken = studentLogin.refreshToken;
      this.studentUserId = studentLogin.userId;
      console.log(`  Student user ID: ${this.studentUserId || 'unknown'}`);
    }

    if (!cfg.skipAdmin) {
      const adminLogin = await this.login(cfg.adminEmail, cfg.adminPassword, 'admin');
      if (adminLogin) {
        this.adminToken = adminLogin.token;
      } else {
        console.log(`  ${c.yellow('○')} Could not obtain admin token. Admin tests will be skipped.`);
        cfg.skipAdmin = true;
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 2. AUTH — PROTECTED
    // ────────────────────────────────────────────────────────────────────

    this.section('2. AUTH — PROTECTED ENDPOINTS');

    await this.test('GET', '/auth/me', [200], {
      description: 'GET /auth/me',
      token: this.studentToken,
    });

    await this.test('POST', '/auth/bootstrap', [200], {
      description: 'POST /auth/bootstrap',
      token: this.studentToken,
    });

    if (this.refreshToken) {
      await this.test('POST', '/auth/refresh', [200, 201], {
        description: 'POST /auth/refresh',
        body: { refreshToken: this.refreshToken },
      });
    } else {
      this.skip('POST /auth/refresh (no refresh token)');
    }

    if (cfg.skipDestructive) {
      this.skip('POST /auth/logout (destructive)');
    } else {
      const logoutLogin = await this.login(cfg.email, cfg.password, 'logout-session');
      if (logoutLogin) {
        await this.test('POST', '/auth/logout', [204, 200], {
          description: 'POST /auth/logout',
          token: logoutLogin.token,
        });
      } else {
        this.skip('POST /auth/logout (could not get token)');
      }
    }

    await this.test('GET', '/auth/me', [401], {
      description: 'GET /auth/me (no token → 401)',
    });

    // ────────────────────────────────────────────────────────────────────
    // 3. PROFILE
    // ────────────────────────────────────────────────────────────────────

    this.section('3. PROFILE');

    await this.test('GET', '/profile/me', [200, 404], {
      description: 'GET /profile/me',
      token: this.studentToken,
    });

    if (cfg.skipDestructive) {
      this.skip('PATCH /profile/me (destructive)');
    } else {
      await this.test('PATCH', '/profile/me', [200, 404], {
        description: 'PATCH /profile/me',
        token: this.studentToken,
        body: { displayName: 'Test User' },
      });
    }

    // ────────────────────────────────────────────────────────────────────
    // 4. PLACEMENT TEST
    // ────────────────────────────────────────────────────────────────────

    this.section('4. PLACEMENT TEST');

    await this.test('GET', '/placement/active', [200, 404], {
      description: 'GET /placement/active',
      token: this.studentToken,
    });

    await this.test('GET', '/placement/sections', [200, 400, 404], {
      description: 'GET /placement/sections',
      token: this.studentToken,
    });

    if (cfg.skipDestructive) {
      this.skip('POST /placement/attempts (destructive)');
      this.skip('POST /placement/attempts/:id/answers (destructive)');
      this.skip('POST /placement/attempts/:id/complete (destructive)');
      this.skip('GET /placement/attempts/:id/result (destructive)');
    } else {
      const attemptRes = await this.request('POST', '/placement/attempts', {
        token: this.studentToken,
      });
      const attemptId = (attemptRes.json as any)?.id;

      await this.test('POST', '/placement/attempts', [200, 201, 400, 409], {
        description: 'POST /placement/attempts',
        token: this.studentToken,
      });

      if (attemptId) {
        await this.test('GET', '/placement/questions', [200, 400], {
          description: 'GET /placement/questions',
          token: this.studentToken,
        });

        await this.test('POST', `/placement/attempts/${attemptId}/answers`, [200, 201, 400], {
          description: 'POST /placement/attempts/:id/answers',
          token: this.studentToken,
          body: { questionId: DUMMY, selectedOptionId: 'opt-1' },
        });

        await this.test('POST', `/placement/attempts/${attemptId}/complete`, [200, 400, 409], {
          description: 'POST /placement/attempts/:id/complete',
          token: this.studentToken,
        });

        await this.test('GET', `/placement/attempts/${attemptId}/result`, [200, 400, 404], {
          description: 'GET /placement/attempts/:id/result',
          token: this.studentToken,
        });
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 5. CURRICULUM
    // ────────────────────────────────────────────────────────────────────

    this.section('5. CURRICULUM');

    this.subsection('Courses');
    await this.test('GET', '/curriculum/courses', [200], { token: this.studentToken });
    await this.test('GET', `/curriculum/courses/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/courses/:id' });

    this.subsection('Levels');
    await this.test('GET', `/curriculum/courses/${DUMMY}/levels`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/courses/:courseId/levels' });
    await this.test('GET', `/curriculum/courses/${DUMMY}/levels/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/courses/:courseId/levels/:id' });

    this.subsection('Chapters');
    await this.test('GET', '/curriculum/chapters', [200], { token: this.studentToken });
    await this.test('GET', `/curriculum/chapters/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/chapters/:id' });

    this.subsection('Lessons');
    await this.test('GET', '/curriculum/lessons', [200], { token: this.studentToken });
    await this.test('GET', `/curriculum/lessons/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/lessons/:id' });
    await this.test('GET', `/curriculum/lessons/${DUMMY}/publish-validation`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/lessons/:id/publish-validation' });
    await this.test('GET', `/curriculum/lessons/${DUMMY}/objectives`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/lessons/:id/objectives' });
    await this.test('GET', `/curriculum/lessons/${DUMMY}/skills`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/lessons/:id/skills' });

    this.subsection('Skills');
    await this.test('GET', '/curriculum/skills', [200], { token: this.studentToken });
    await this.test('GET', `/curriculum/skills/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/skills/:id' });
    await this.test('GET', '/curriculum/skills/by-key/test-key', [200, 404], { token: this.studentToken, description: 'GET /curriculum/skills/by-key/:key' });

    this.subsection('Objectives');
    await this.test('GET', '/curriculum/objectives', [200], { token: this.studentToken });
    await this.test('GET', `/curriculum/objectives/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/objectives/:id' });
    await this.test('GET', '/curriculum/objectives/by-key/test-key', [200, 404], { token: this.studentToken, description: 'GET /curriculum/objectives/by-key/:key' });

    this.subsection('Questions');
    await this.test('GET', '/curriculum/questions', [200], { token: this.studentToken });
    await this.test('GET', `/curriculum/questions/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/questions/:id' });
    await this.test('GET', `/curriculum/questions/${DUMMY}/skills`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/questions/:id/skills' });

    this.subsection('Lesson Assets');
    await this.test('GET', '/curriculum/lesson-assets', [200], { token: this.studentToken });
    await this.test('GET', `/curriculum/lesson-assets/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /curriculum/lesson-assets/:id' });

    this.subsection('Audit Logs');
    await this.test('GET', '/curriculum/audit-logs', [200, 403], { token: this.studentToken });

    // Curriculum write endpoints
    if (cfg.skipDestructive) {
      const curriculumWrites = [
        'POST /curriculum/courses', 'PATCH /curriculum/courses/:id',
        'POST /curriculum/chapters', 'PATCH /curriculum/chapters/:id',
        'POST /curriculum/lessons', 'PATCH /curriculum/lessons/:id',
        'POST /curriculum/skills', 'PATCH /curriculum/skills/:id',
        'POST /curriculum/objectives', 'PATCH /curriculum/objectives/:id',
        'POST /curriculum/questions', 'PATCH /curriculum/questions/:id',
        'POST /curriculum/lesson-assets', 'PATCH /curriculum/lesson-assets/:id',
        'POST /curriculum/lesson-assets/:id/archive',
        'POST /curriculum/lessons/:id/objectives', 'DELETE /curriculum/lessons/:id/objectives/:oid',
        'POST /curriculum/lessons/:id/skills', 'DELETE /curriculum/lessons/:id/skills/:sid',
        'POST /curriculum/questions/:id/skills', 'PUT /curriculum/questions/:id/skills/:sid/primary',
        'DELETE /curriculum/questions/:id/skills/:sid',
        'GET /curriculum/workflow/:entityType/:entityId/publish',
        'PATCH /curriculum/workflow/:entityType/:entityId/archive',
        'PATCH /curriculum/workflow/:entityType/:entityId/restore',
      ];
      curriculumWrites.forEach(d => this.skip(`${d} (destructive)`));
    } else {
      const tkn = this.adminToken || this.studentToken;
      await this.test('POST', '/curriculum/courses', [200, 201, 400, 403], { token: tkn, body: { title: 'Test Course', slug: 'test-course' }, description: 'POST /curriculum/courses' });
      await this.test('PATCH', `/curriculum/courses/${DUMMY}`, [200, 404, 403], { token: tkn, body: { title: 'Updated' }, description: 'PATCH /curriculum/courses/:id' });
      await this.test('POST', '/curriculum/chapters', [200, 201, 400, 403], { token: tkn, body: { title: 'Test Chapter' }, description: 'POST /curriculum/chapters' });
      await this.test('PATCH', `/curriculum/chapters/${DUMMY}`, [200, 404, 403], { token: tkn, body: { title: 'Updated' }, description: 'PATCH /curriculum/chapters/:id' });
      await this.test('POST', '/curriculum/lessons', [200, 201, 400, 403], { token: tkn, body: { title: 'Test Lesson' }, description: 'POST /curriculum/lessons' });
      await this.test('PATCH', `/curriculum/lessons/${DUMMY}`, [200, 404, 403], { token: tkn, body: { title: 'Updated' }, description: 'PATCH /curriculum/lessons/:id' });
      await this.test('POST', '/curriculum/skills', [200, 201, 400, 403], { token: tkn, body: { name: 'test-skill', key: 'test-skill' }, description: 'POST /curriculum/skills' });
      await this.test('PATCH', `/curriculum/skills/${DUMMY}`, [200, 404, 403], { token: tkn, body: { name: 'Updated' }, description: 'PATCH /curriculum/skills/:id' });
      await this.test('POST', '/curriculum/objectives', [200, 201, 400, 403], { token: tkn, body: { title: 'test-obj', key: 'test-obj' }, description: 'POST /curriculum/objectives' });
      await this.test('PATCH', `/curriculum/objectives/${DUMMY}`, [200, 404, 403], { token: tkn, body: { title: 'Updated' }, description: 'PATCH /curriculum/objectives/:id' });
      await this.test('POST', '/curriculum/questions', [200, 201, 400, 403], { token: tkn, body: { text: 'Test question?' }, description: 'POST /curriculum/questions' });
      await this.test('PATCH', `/curriculum/questions/${DUMMY}`, [200, 404, 403], { token: tkn, body: { text: 'Updated?' }, description: 'PATCH /curriculum/questions/:id' });
      await this.test('POST', '/curriculum/lesson-assets', [200, 201, 400, 403], { token: tkn, body: { lessonId: DUMMY, type: 'text' }, description: 'POST /curriculum/lesson-assets' });
      await this.test('PATCH', `/curriculum/lesson-assets/${DUMMY}`, [200, 404, 403], { token: tkn, body: { type: 'text' }, description: 'PATCH /curriculum/lesson-assets/:id' });
      await this.test('POST', `/curriculum/lesson-assets/${DUMMY}/archive`, [200, 404, 403], { token: tkn, description: 'POST /curriculum/lesson-assets/:id/archive' });
      await this.test('POST', `/curriculum/lessons/${DUMMY}/objectives`, [200, 201, 400, 403, 404], { token: tkn, body: { objectiveId: DUMMY }, description: 'POST /curriculum/lessons/:id/objectives' });
      await this.test('DELETE', `/curriculum/lessons/${DUMMY}/objectives/${DUMMY}`, [200, 204, 404, 403], { token: tkn, description: 'DELETE /curriculum/lessons/:id/objectives/:oid' });
      await this.test('POST', `/curriculum/lessons/${DUMMY}/skills`, [200, 201, 400, 403, 404], { token: tkn, body: { skillId: DUMMY }, description: 'POST /curriculum/lessons/:id/skills' });
      await this.test('DELETE', `/curriculum/lessons/${DUMMY}/skills/${DUMMY}`, [200, 204, 404, 403], { token: tkn, description: 'DELETE /curriculum/lessons/:id/skills/:sid' });
      await this.test('POST', `/curriculum/questions/${DUMMY}/skills`, [200, 201, 400, 403, 404], { token: tkn, body: { skillId: DUMMY }, description: 'POST /curriculum/questions/:id/skills' });
      await this.test('PUT', `/curriculum/questions/${DUMMY}/skills/${DUMMY}/primary`, [200, 404, 403], { token: tkn, description: 'PUT /curriculum/questions/:id/skills/:sid/primary' });
      await this.test('DELETE', `/curriculum/questions/${DUMMY}/skills/${DUMMY}`, [200, 204, 404, 403], { token: tkn, description: 'DELETE /curriculum/questions/:id/skills/:sid' });
      await this.test('GET', `/curriculum/workflow/lesson/${DUMMY}/publish`, [200, 400, 404, 403], { token: tkn, description: 'GET /curriculum/workflow/:entityType/:entityId/publish' });
      await this.test('PATCH', `/curriculum/workflow/lesson/${DUMMY}/archive`, [200, 400, 404, 403], { token: tkn, description: 'PATCH /curriculum/workflow/:entityType/:entityId/archive' });
      await this.test('PATCH', `/curriculum/workflow/lesson/${DUMMY}/restore`, [200, 400, 404, 403], { token: tkn, description: 'PATCH /curriculum/workflow/:entityType/:entityId/restore' });
    }

    // ────────────────────────────────────────────────────────────────────
    // 6. LEARNING SESSIONS
    // ────────────────────────────────────────────────────────────────────

    this.section('6. LEARNING SESSIONS');

    if (cfg.skipDestructive) {
      this.skip('POST /sessions/start (destructive)');
      this.skip('POST /sessions/:id/attempt (destructive)');
    } else {
      await this.test('POST', '/sessions/start', [200, 201, 400, 403], {
        description: 'POST /sessions/start',
        token: this.studentToken,
        body: { lessonId: DUMMY },
      });
      await this.test('POST', `/sessions/${DUMMY}/attempt`, [200, 201, 400, 404], {
        description: 'POST /sessions/:id/attempt',
        token: this.studentToken,
        body: { answers: [] },
      });
    }

    // ────────────────────────────────────────────────────────────────────
    // 7. AIM
    // ────────────────────────────────────────────────────────────────────

    this.section('7. AIM (Adaptive Instruction Model)');

    const sid = this.studentUserId || DUMMY;

    await this.test('GET', `/aim/students/${sid}/skill-states`, [200, 403, 404], { token: this.studentToken, description: 'GET /aim/students/:studentId/skill-states' });
    await this.test('GET', `/aim/students/${sid}/review-schedules`, [200, 403, 404], { token: this.studentToken, description: 'GET /aim/students/:studentId/review-schedules' });
    await this.test('GET', `/aim/students/${sid}/weakness-records`, [200, 403, 404], { token: this.studentToken, description: 'GET /aim/students/:studentId/weakness-records' });
    await this.test('GET', `/aim/students/${sid}/recommendations`, [200, 403, 404], { token: this.studentToken, description: 'GET /aim/students/:studentId/recommendations' });
    await this.test('GET', `/aim/students/${sid}/sessions/${DUMMY}/state`, [200, 403, 404], { token: this.studentToken, description: 'GET /aim/students/:studentId/sessions/:sessionId/state' });

    // ────────────────────────────────────────────────────────────────────
    // 8. ASSESSMENTS
    // ────────────────────────────────────────────────────────────────────

    this.section('8. ASSESSMENTS');

    await this.test('GET', '/student/assessments', [200], { token: this.studentToken });
    await this.test('GET', '/student/assessments/deadlines', [200], { token: this.studentToken });
    await this.test('GET', `/student/assessments/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /student/assessments/:id' });
    await this.test('GET', `/student/assessments/${DUMMY}/history`, [200, 404], { token: this.studentToken, description: 'GET /student/assessments/:id/history' });

    if (cfg.skipDestructive) {
      this.skip('POST /student/assessments/:id/attempts (destructive)');
      this.skip('POST /student/assessments/attempts/:id/submit (destructive)');
    } else {
      await this.test('POST', `/student/assessments/${DUMMY}/attempts`, [200, 201, 400, 404, 409], { token: this.studentToken, description: 'POST /student/assessments/:id/attempts' });
      await this.test('POST', `/student/assessments/attempts/${DUMMY}/submit`, [200, 400, 404, 409], { token: this.studentToken, body: { answers: [] }, description: 'POST /student/assessments/attempts/:id/submit' });
    }

    await this.test('GET', `/student/assessments/attempts/${DUMMY}/resume`, [200, 404], { token: this.studentToken, description: 'GET /student/assessments/attempts/:id/resume' });
    await this.test('GET', `/student/assessments/attempts/${DUMMY}/result`, [200, 404], { token: this.studentToken, description: 'GET /student/assessments/attempts/:id/result' });

    // ────────────────────────────────────────────────────────────────────
    // 9. AI TEACHER
    // ────────────────────────────────────────────────────────────────────

    this.section('9. AI TEACHER');

    await this.test('GET', '/ai-teacher/sessions', [200], { token: this.studentToken });

    if (cfg.skipDestructive) {
      this.skip('POST /ai-teacher/sessions (destructive)');
      this.skip('GET /ai-teacher/sessions/:id/messages (needs session)');
      this.skip('POST /ai-teacher/sessions/:id/messages (destructive)');
      this.skip('POST /ai-teacher/sessions/:id/messages/stream (destructive)');
      this.skip('GET /ai-teacher/sessions/:id/safety-status (needs session)');
      this.skip('POST /ai-teacher/messages/:id/feedback (destructive)');
    } else {
      const sessionRes = await this.request('POST', '/ai-teacher/sessions', {
        token: this.studentToken,
        body: { contextRef: 'general' },
      });
      const aiSessionId = (sessionRes.json as any)?.id;

      await this.test('POST', '/ai-teacher/sessions', [200, 201, 400, 429], {
        description: 'POST /ai-teacher/sessions',
        token: this.studentToken,
        body: { contextRef: 'general' },
      });

      if (aiSessionId) {
        await this.test('GET', `/ai-teacher/sessions/${aiSessionId}/messages`, [200], { token: this.studentToken, description: 'GET /ai-teacher/sessions/:id/messages' });
        await this.test('POST', `/ai-teacher/sessions/${aiSessionId}/messages`, [200, 201, 400, 429], { token: this.studentToken, body: { content: 'Hello teacher' }, description: 'POST /ai-teacher/sessions/:id/messages' });
        await this.test('GET', `/ai-teacher/sessions/${aiSessionId}/safety-status`, [200], { token: this.studentToken, description: 'GET /ai-teacher/sessions/:id/safety-status' });
      } else {
        this.skip('GET /ai-teacher/sessions/:id/messages (no session created)');
        this.skip('POST /ai-teacher/sessions/:id/messages (no session created)');
        this.skip('GET /ai-teacher/sessions/:id/safety-status (no session created)');
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 10. BILLING
    // ────────────────────────────────────────────────────────────────────

    this.section('10. BILLING');

    await this.test('GET', '/billing/pricing', [200], { token: this.studentToken });
    await this.test('GET', '/billing/pricing/plans', [200], { token: this.studentToken });
    await this.test('GET', '/billing/pricing/prices', [200], { token: this.studentToken });
    await this.test('GET', '/billing/invoices', [200], { token: this.studentToken });
    await this.test('GET', '/billing/subscriptions', [200], { token: this.studentToken });
    await this.test('GET', '/billing/checkout/recent', [200], { token: this.studentToken });
    await this.test('GET', `/billing/invoices/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /billing/invoices/:id' });
    await this.test('GET', `/billing/subscriptions/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /billing/subscriptions/:id' });
    await this.test('GET', `/billing/checkout/${DUMMY}/status`, [200, 404], { token: this.studentToken, description: 'GET /billing/checkout/:sessionId/status' });
    await this.test('GET', `/billing/refunds/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /billing/refunds/:id' });

    if (cfg.skipDestructive) {
      this.skip('POST /billing/checkout (destructive)');
      this.skip('POST /billing/subscriptions/:id/cancel (destructive)');
      this.skip('POST /billing/refunds (destructive)');
    } else {
      await this.test('POST', '/billing/checkout', [200, 201, 400], { token: this.studentToken, body: { priceId: DUMMY }, description: 'POST /billing/checkout' });
      await this.test('POST', `/billing/subscriptions/${DUMMY}/cancel`, [200, 400, 404], { token: this.studentToken, description: 'POST /billing/subscriptions/:id/cancel' });
      await this.test('POST', '/billing/refunds', [200, 201, 400, 404], { token: this.studentToken, body: { paymentId: DUMMY, reason: 'test' }, description: 'POST /billing/refunds' });
    }

    await this.test('POST', '/billing/webhooks/provider', [200, 400, 401, 403], { body: {}, description: 'POST /billing/webhooks/provider (webhook)' });

    // ────────────────────────────────────────────────────────────────────
    // 11. NOTIFICATIONS
    // ────────────────────────────────────────────────────────────────────

    this.section('11. NOTIFICATIONS');

    await this.test('GET', '/api/v1/notifications/inbox', [200], { token: this.studentToken });
    await this.test('GET', '/api/v1/notifications/inbox/unread-count', [200], { token: this.studentToken });
    await this.test('GET', '/api/v1/notifications/preferences', [200], { token: this.studentToken });
    await this.test('GET', '/api/v1/notifications/quiet-hours', [200], { token: this.studentToken });
    await this.test('GET', '/api/v1/notifications/reminders', [200], { token: this.studentToken });

    if (cfg.skipDestructive) {
      ['POST /api/v1/notifications/device-tokens', 'DELETE /api/v1/notifications/device-tokens/:id',
       'PATCH /api/v1/notifications/inbox/:id/read', 'PATCH /api/v1/notifications/inbox/:id/dismiss',
       'PATCH /api/v1/notifications/preferences', 'PATCH /api/v1/notifications/quiet-hours',
       'PATCH /api/v1/notifications/reminders/:id/pause', 'PATCH /api/v1/notifications/reminders/:id/resume',
       'PATCH /api/v1/notifications/reminders/:id/cancel',
      ].forEach(d => this.skip(`${d} (destructive)`));
    } else {
      await this.test('POST', '/api/v1/notifications/device-tokens', [200, 201, 400], { token: this.studentToken, body: { token: 'test-token', platform: 'android' } });
      await this.test('PATCH', `/api/v1/notifications/inbox/${DUMMY}/read`, [200, 404], { token: this.studentToken, description: 'PATCH /api/v1/notifications/inbox/:eventId/read' });
      await this.test('PATCH', `/api/v1/notifications/inbox/${DUMMY}/dismiss`, [200, 404], { token: this.studentToken, description: 'PATCH /api/v1/notifications/inbox/:eventId/dismiss' });
      await this.test('PATCH', '/api/v1/notifications/preferences', [200, 400], { token: this.studentToken, body: { channel: 'push', enabled: true } });
      await this.test('PATCH', '/api/v1/notifications/quiet-hours', [200, 400], { token: this.studentToken, body: { enabled: false } });
      await this.test('PATCH', `/api/v1/notifications/reminders/${DUMMY}/pause`, [200, 404], { token: this.studentToken, description: 'PATCH /api/v1/notifications/reminders/:id/pause' });
      await this.test('PATCH', `/api/v1/notifications/reminders/${DUMMY}/resume`, [200, 404], { token: this.studentToken, description: 'PATCH /api/v1/notifications/reminders/:id/resume' });
      await this.test('PATCH', `/api/v1/notifications/reminders/${DUMMY}/cancel`, [200, 404], { token: this.studentToken, description: 'PATCH /api/v1/notifications/reminders/:id/cancel' });
    }

    // ────────────────────────────────────────────────────────────────────
    // 12. ANALYTICS (STUDENT)
    // ────────────────────────────────────────────────────────────────────

    this.section('12. ANALYTICS (STUDENT)');

    await this.test('GET', '/student/analytics/summary', [200, 403], { token: this.studentToken });

    if (cfg.skipDestructive) {
      this.skip('POST /analytics/exports (destructive)');
    } else {
      await this.test('POST', '/analytics/exports', [200, 201, 400, 403], { token: this.studentToken, body: { runId: DUMMY } });
    }

    await this.test('GET', `/analytics/exports/${DUMMY}`, [200, 403, 404], { token: this.studentToken, description: 'GET /analytics/exports/:exportJobId' });

    // ────────────────────────────────────────────────────────────────────
    // 13. VOICE TEACHER
    // ────────────────────────────────────────────────────────────────────

    this.section('13. VOICE TEACHER');

    await this.test('GET', '/voice-teacher/sessions', [200], { token: this.studentToken });
    await this.test('GET', `/voice-teacher/sessions/${DUMMY}/messages`, [200, 404], { token: this.studentToken, description: 'GET /voice-teacher/sessions/:id/messages' });

    if (cfg.skipDestructive) {
      this.skip('POST /voice-teacher/sessions (destructive)');
      this.skip('POST /voice-teacher/sessions/:id/audio (destructive)');
      this.skip('POST /voice-teacher/sessions/:id/feedback (destructive)');
    } else {
      await this.test('POST', '/voice-teacher/sessions', [200, 201, 400], { token: this.studentToken, body: {} });
    }

    await this.test('GET', `/voice-teacher/audio/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /voice-teacher/audio/:audioRef' });

    // ────────────────────────────────────────────────────────────────────
    // 14. OPERATIONS
    // ────────────────────────────────────────────────────────────────────

    this.section('14. OPERATIONS');

    this.subsection('Feature Requests');
    await this.test('GET', '/feature-requests', [200], { token: this.studentToken });
    await this.test('GET', `/feature-requests/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /feature-requests/:id' });

    if (cfg.skipDestructive) {
      this.skip('POST /feature-requests (destructive)');
      this.skip('POST /feature-requests/:id/vote (destructive)');
    } else {
      await this.test('POST', '/feature-requests', [200, 201, 400], { token: this.studentToken, body: { title: 'Test feature', description: 'A test' } });
      await this.test('POST', `/feature-requests/${DUMMY}/vote`, [200, 404], { token: this.studentToken, description: 'POST /feature-requests/:id/vote' });
    }

    this.subsection('Release Notes');
    await this.test('GET', '/release-notes', [200], { description: 'GET /release-notes (public)' });
    await this.test('GET', `/release-notes/${DUMMY}`, [200, 404], { description: 'GET /release-notes/:id' });

    this.subsection('Feedback');
    if (cfg.skipDestructive) {
      this.skip('POST /feedback (destructive)');
    } else {
      await this.test('POST', '/feedback', [200, 201, 400], { token: this.studentToken, body: { type: 'bug', message: 'Test feedback' } });
    }
    await this.test('GET', '/feedback/mine', [200], { token: this.studentToken });

    this.subsection('Operational Status');
    await this.test('GET', '/operational-status', [200], { description: 'GET /operational-status (public)' });

    this.subsection('Maintenance Windows');
    await this.test('GET', '/maintenance-windows', [200], { description: 'GET /maintenance-windows (public)' });

    this.subsection('Support Tickets');
    await this.test('GET', '/support-tickets', [200], { token: this.studentToken });
    await this.test('GET', `/support-tickets/${DUMMY}`, [200, 404], { token: this.studentToken, description: 'GET /support-tickets/:id' });

    if (cfg.skipDestructive) {
      this.skip('POST /support-tickets (destructive)');
      this.skip('POST /support-tickets/:id/comments (destructive)');
    } else {
      await this.test('POST', '/support-tickets', [200, 201, 400], { token: this.studentToken, body: { subject: 'Test ticket', message: 'Testing' } });
      await this.test('POST', `/support-tickets/${DUMMY}/comments`, [200, 201, 400, 404], { token: this.studentToken, body: { message: 'Test comment' }, description: 'POST /support-tickets/:id/comments' });
    }

    // ────────────────────────────────────────────────────────────────────
    // 15. PARENT PORTAL
    // ────────────────────────────────────────────────────────────────────

    this.section('15. PARENT PORTAL');
    console.log(`  ${c.yellow('(Requires parent role — testing reachability only)')}`);

    await this.test('GET', '/api/v1/parent/children', [200, 403], { token: this.studentToken });
    await this.test('GET', '/api/v1/parent/dashboard-summary', [200, 403], { token: this.studentToken });
    await this.test('GET', '/api/v1/parent/invitations', [200, 403], { token: this.studentToken });
    await this.test('GET', '/api/v1/parent/notification-preferences', [200, 403], { token: this.studentToken });
    await this.test('GET', `/api/v1/parent/children/${DUMMY}/progress`, [200, 403, 404], { token: this.studentToken, description: 'GET /api/v1/parent/children/:childId/progress' });
    await this.test('GET', `/api/v1/parent/children/${DUMMY}/assessments`, [200, 403, 404], { token: this.studentToken, description: 'GET /api/v1/parent/children/:childId/assessments' });
    await this.test('GET', `/api/v1/parent/children/${DUMMY}/activity`, [200, 403, 404], { token: this.studentToken, description: 'GET /api/v1/parent/children/:childId/activity' });
    await this.test('GET', `/api/v1/parent/children/${DUMMY}/ai-summary`, [200, 403, 404], { token: this.studentToken, description: 'GET /api/v1/parent/children/:childId/ai-summary' });
    await this.test('GET', `/api/v1/parent/children/${DUMMY}/ai-safety-summary`, [200, 403, 404], { token: this.studentToken, description: 'GET /api/v1/parent/children/:childId/ai-safety-summary' });
    await this.test('GET', `/api/v1/parent/children/${DUMMY}/reports`, [200, 403, 404], { token: this.studentToken, description: 'GET /api/v1/parent/children/:childId/reports' });
    await this.test('GET', `/api/v1/parent/links/${DUMMY}/consents`, [200, 403, 404], { token: this.studentToken, description: 'GET /api/v1/parent/links/:linkId/consents' });
    await this.test('GET', '/parent/analytics/reports', [200, 403], { token: this.studentToken });

    if (cfg.skipDestructive) {
      ['POST /api/v1/parent/invitations', 'POST /api/v1/parent/invitations/accept',
       'POST /api/v1/parent/invitations/:id/revoke', 'POST /api/v1/parent/consents',
       'POST /api/v1/parent/consents/revoke', 'PATCH /api/v1/parent/notification-preferences',
       'POST /parent/analytics/reports/:key/run',
      ].forEach(d => this.skip(`${d} (destructive)`));
    } else {
      await this.test('POST', '/api/v1/parent/invitations', [200, 201, 400, 403], { token: this.studentToken, body: { childEmail: 'child@example.com' }, description: 'POST /api/v1/parent/invitations' });
      await this.test('POST', '/api/v1/parent/invitations/accept', [200, 400, 403, 404], { token: this.studentToken, body: { invitationId: DUMMY }, description: 'POST /api/v1/parent/invitations/accept' });
      await this.test('POST', `/api/v1/parent/invitations/${DUMMY}/revoke`, [200, 403, 404], { token: this.studentToken, description: 'POST /api/v1/parent/invitations/:id/revoke' });
      await this.test('POST', '/api/v1/parent/consents', [200, 201, 400, 403], { token: this.studentToken, body: { linkId: DUMMY, consentType: 'progress_view' }, description: 'POST /api/v1/parent/consents' });
      await this.test('POST', '/api/v1/parent/consents/revoke', [200, 400, 403, 404], { token: this.studentToken, body: { linkId: DUMMY, consentType: 'progress_view' }, description: 'POST /api/v1/parent/consents/revoke' });
      await this.test('PATCH', '/api/v1/parent/notification-preferences', [200, 400, 403], { token: this.studentToken, body: { channel: 'email', enabled: true } });
      await this.test('POST', '/parent/analytics/reports/weekly/run', [200, 201, 400, 403], { token: this.studentToken, description: 'POST /parent/analytics/reports/:key/run' });
    }

    // ────────────────────────────────────────────────────────────────────
    // 16. ADMIN ENDPOINTS
    // ────────────────────────────────────────────────────────────────────

    this.section('16. ADMIN ENDPOINTS');

    if (cfg.skipAdmin) {
      console.log(`  ${c.yellow('Skipping admin endpoints (no admin token or --skip-admin)')}`);
      ['Admin Users', 'Admin Roles', 'Admin AI Teacher', 'Admin Analytics',
       'Admin Billing', 'Admin Notifications', 'Admin Operations',
      ].forEach(s => this.skip(`${s} endpoints`));
    } else {
      this.subsection('Admin — Users & Roles');
      await this.test('GET', '/admin/users', [200], { token: this.adminToken });
      await this.test('GET', `/admin/users/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /admin/users/:id' });
      await this.test('GET', '/admin/roles', [200], { token: this.adminToken });
      await this.test('GET', '/admin/roles/student', [200, 404], { token: this.adminToken, description: 'GET /admin/roles/:key' });

      if (cfg.skipDestructive) {
        this.skip('PATCH /admin/users/:id/status (destructive)');
        this.skip('PUT /admin/users/:userId/roles (destructive)');
      } else {
        await this.test('PATCH', `/admin/users/${DUMMY}/status`, [200, 400, 404], { token: this.adminToken, body: { status: 'active' }, description: 'PATCH /admin/users/:id/status' });
        await this.test('PUT', `/admin/users/${DUMMY}/roles`, [200, 400, 404], { token: this.adminToken, body: { roleKey: 'student' }, description: 'PUT /admin/users/:userId/roles' });
      }

      this.subsection('Admin — AI Teacher');
      await this.test('GET', '/admin/ai/audit/logs', [200], { token: this.adminToken });
      await this.test('GET', '/admin/ai/model-configs', [200], { token: this.adminToken });
      await this.test('GET', `/admin/ai/model-configs/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /admin/ai/model-configs/:id' });
      await this.test('GET', '/admin/ai/prompts', [200], { token: this.adminToken });
      await this.test('GET', `/admin/ai/prompts/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /admin/ai/prompts/:id' });
      await this.test('GET', '/admin/ai/safety/events', [200], { token: this.adminToken });
      await this.test('GET', '/admin/ai/safety/feedback', [200], { token: this.adminToken });
      await this.test('GET', '/admin/ai/usage', [200], { token: this.adminToken });
      await this.test('GET', `/admin/ai/usage/student/${sid}`, [200, 404], { token: this.adminToken, description: 'GET /admin/ai/usage/student/:studentId' });
      await this.test('GET', `/admin/ai/usage/student/${sid}/limit-status`, [200, 404], { token: this.adminToken, description: 'GET /admin/ai/usage/student/:studentId/limit-status' });

      if (cfg.skipDestructive) {
        ['POST /admin/ai/model-configs/:id/status', 'POST /admin/ai/model-configs/:id/limits',
         'POST /admin/ai/prompts', 'POST /admin/ai/prompts/:id/publish', 'POST /admin/ai/prompts/:id/retire',
        ].forEach(d => this.skip(`${d} (destructive)`));
      } else {
        await this.test('POST', `/admin/ai/model-configs/${DUMMY}/status`, [200, 400, 404], { token: this.adminToken, body: { status: 'active' }, description: 'POST /admin/ai/model-configs/:id/status' });
        await this.test('POST', `/admin/ai/model-configs/${DUMMY}/limits`, [200, 400, 404], { token: this.adminToken, body: { maxTokensPerDay: 10000 }, description: 'POST /admin/ai/model-configs/:id/limits' });
        await this.test('POST', '/admin/ai/prompts', [200, 201, 400], { token: this.adminToken, body: { name: 'test', template: 'hello' }, description: 'POST /admin/ai/prompts' });
        await this.test('POST', `/admin/ai/prompts/${DUMMY}/publish`, [200, 400, 404], { token: this.adminToken, description: 'POST /admin/ai/prompts/:id/publish' });
        await this.test('POST', `/admin/ai/prompts/${DUMMY}/retire`, [200, 400, 404], { token: this.adminToken, description: 'POST /admin/ai/prompts/:id/retire' });
      }

      this.subsection('Admin — Analytics');
      await this.test('GET', '/admin/analytics/dashboard/overview', [200, 404], { token: this.adminToken, description: 'GET /admin/analytics/dashboard/:dashboardKey' });
      await this.test('GET', '/admin/analytics/reports/learning', [200], { token: this.adminToken });
      await this.test('GET', '/admin/analytics/reports/assessment', [200], { token: this.adminToken });
      await this.test('GET', '/admin/analytics/reports/revenue', [200], { token: this.adminToken });

      if (cfg.skipDestructive) {
        ['POST /admin/analytics/reports/learning/:key/run',
         'POST /admin/analytics/reports/assessment/:key/run',
         'POST /admin/analytics/reports/revenue/:key/run',
        ].forEach(d => this.skip(`${d} (destructive)`));
      } else {
        await this.test('POST', '/admin/analytics/reports/learning/summary/run', [200, 201, 400], { token: this.adminToken, description: 'POST /admin/analytics/reports/learning/:key/run' });
        await this.test('POST', '/admin/analytics/reports/assessment/summary/run', [200, 201, 400], { token: this.adminToken, description: 'POST /admin/analytics/reports/assessment/:key/run' });
        await this.test('POST', '/admin/analytics/reports/revenue/summary/run', [200, 201, 400], { token: this.adminToken, description: 'POST /admin/analytics/reports/revenue/:key/run' });
      }

      await this.test('GET', `/admin/analytics/reports/learning/runs/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /admin/analytics/reports/learning/runs/:runId' });
      await this.test('GET', `/admin/analytics/reports/assessment/runs/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /admin/analytics/reports/assessment/runs/:runId' });
      await this.test('GET', `/admin/analytics/reports/revenue/runs/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /admin/analytics/reports/revenue/runs/:runId' });

      this.subsection('Admin — Billing');
      await this.test('GET', `/admin/billing/subscriptions/${sid}`, [200, 404], { token: this.adminToken, description: 'GET /admin/billing/subscriptions/:userId' });
      await this.test('GET', `/admin/billing/payments/${sid}`, [200, 404], { token: this.adminToken, description: 'GET /admin/billing/payments/:userId' });
      await this.test('GET', `/admin/billing/invoices/${sid}`, [200, 404], { token: this.adminToken, description: 'GET /admin/billing/invoices/:userId' });
      await this.test('GET', `/admin/billing/refunds/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /admin/billing/refunds/:paymentId' });
      await this.test('GET', '/admin/billing/provider-events', [200], { token: this.adminToken });
      await this.test('GET', '/admin/billing/audit-logs', [200], { token: this.adminToken });

      this.subsection('Admin — Notifications');
      await this.test('GET', '/api/v1/admin/notifications/audit-logs', [200], { token: this.adminToken });
      await this.test('GET', '/api/v1/admin/notifications/templates', [200], { token: this.adminToken });
      await this.test('GET', `/api/v1/admin/notifications/templates/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /api/v1/admin/notifications/templates/:templateId' });
      await this.test('GET', `/api/v1/admin/notifications/events/${sid}`, [200, 404], { token: this.adminToken, description: 'GET /api/v1/admin/notifications/events/:userId' });
      await this.test('GET', `/api/v1/admin/notifications/delivery-attempts/${DUMMY}`, [200, 404], { token: this.adminToken, description: 'GET /api/v1/admin/notifications/delivery-attempts/:eventId' });

      this.subsection('Admin — Operations');
      await this.test('GET', '/admin/operations/dashboard', [200], { token: this.adminToken });
      await this.test('GET', '/admin/feature-flags', [200], { token: this.adminToken });
      await this.test('GET', '/admin/incidents', [200], { token: this.adminToken });
      await this.test('GET', '/admin/maintenance-windows', [200], { token: this.adminToken });
      await this.test('GET', '/admin/support-tickets', [200], { token: this.adminToken });
      await this.test('GET', '/admin/release-notes', [200], { token: this.adminToken });

      if (cfg.skipDestructive) {
        ['POST /admin/feature-flags', 'PATCH /admin/feature-flags/:id',
         'POST /admin/incidents', 'PATCH /admin/incidents/:id/status',
         'POST /admin/maintenance-windows', 'PATCH /admin/maintenance-windows/:id/status',
         'PATCH /admin/support-tickets/:id/status', 'PATCH /admin/support-tickets/:id/assign',
         'POST /admin/release-notes', 'POST /admin/release-notes/:id/publish',
         'POST /admin/release-notes/:id/archive',
        ].forEach(d => this.skip(`${d} (destructive)`));
      } else {
        await this.test('POST', '/admin/feature-flags', [200, 201, 400], { token: this.adminToken, body: { key: 'test-flag', enabled: false }, description: 'POST /admin/feature-flags' });
        await this.test('PATCH', `/admin/feature-flags/${DUMMY}`, [200, 400, 404], { token: this.adminToken, body: { enabled: true }, description: 'PATCH /admin/feature-flags/:id' });
        await this.test('POST', '/admin/incidents', [200, 201, 400], { token: this.adminToken, body: { title: 'Test incident', severity: 'low' }, description: 'POST /admin/incidents' });
        await this.test('PATCH', `/admin/incidents/${DUMMY}/status`, [200, 400, 404], { token: this.adminToken, body: { status: 'resolved' }, description: 'PATCH /admin/incidents/:id/status' });
        await this.test('POST', '/admin/maintenance-windows', [200, 201, 400], { token: this.adminToken, body: { title: 'Test window', startAt: new Date().toISOString(), endAt: new Date(Date.now() + 3600000).toISOString() }, description: 'POST /admin/maintenance-windows' });
        await this.test('PATCH', `/admin/maintenance-windows/${DUMMY}/status`, [200, 400, 404], { token: this.adminToken, body: { status: 'completed' }, description: 'PATCH /admin/maintenance-windows/:id/status' });
        await this.test('PATCH', `/admin/support-tickets/${DUMMY}/status`, [200, 400, 404], { token: this.adminToken, body: { status: 'closed' }, description: 'PATCH /admin/support-tickets/:id/status' });
        await this.test('PATCH', `/admin/support-tickets/${DUMMY}/assign`, [200, 400, 404], { token: this.adminToken, body: { assigneeId: DUMMY }, description: 'PATCH /admin/support-tickets/:id/assign' });
        await this.test('POST', '/admin/release-notes', [200, 201, 400], { token: this.adminToken, body: { title: 'Test release', body: 'Content' }, description: 'POST /admin/release-notes' });
        await this.test('POST', `/admin/release-notes/${DUMMY}/publish`, [200, 400, 404], { token: this.adminToken, description: 'POST /admin/release-notes/:id/publish' });
        await this.test('POST', `/admin/release-notes/${DUMMY}/archive`, [200, 400, 404], { token: this.adminToken, description: 'POST /admin/release-notes/:id/archive' });
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ────────────────────────────────────────────────────────────────────

    this.printSummary();
  }

  // ── Summary ───────────────────────────────────────────────────────────

  private printSummary(): void {
    const passed = this.results.filter(r => r.passed && r.status !== 'SKIP').length;
    const failed = this.results.filter(r => !r.passed).length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.durationMs, 0);
    const failures = this.results.filter(r => !r.passed);

    console.log('');
    console.log(c.bold(c.cyan('═══════════════════════════════════════════════════════════')));
    console.log(c.bold(c.cyan('  RESULTS')));
    console.log(c.bold(c.cyan('═══════════════════════════════════════════════════════════')));
    console.log('');
    console.log(`  Total:    ${total}`);
    console.log(`  ${c.green(`Passed:  ${passed}`)}`);
    console.log(`  ${c.red(`Failed:  ${failed}`)}`);
    console.log(`  ${c.yellow(`Skipped: ${skipped}`)}`);
    console.log(`  Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log('');

    if (failures.length > 0) {
      console.log(c.bold(c.red('Failed endpoints:')));
      for (const f of failures) {
        const statusStr = f.status === 'ERROR' ? `ERROR: ${f.error}` : `got ${f.status}, expected ${f.expected.join(',')}`;
        console.log(`  ${c.red('✗')} ${f.description} — ${statusStr}`);
      }
      console.log('');
    }

    if (this.config.json) {
      console.log(c.bold('JSON Report:'));
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        baseUrl: this.config.baseUrl,
        summary: { total, passed, failed, skipped, durationMs: totalDuration },
        failures: failures.map(f => ({
          method: f.method,
          path: f.path,
          description: f.description,
          status: f.status,
          expected: f.expected,
          error: f.error,
        })),
      }, null, 2));
    }

    if (failed === 0) {
      console.log(c.bold(c.green('All tested endpoints passed!')));
      process.exit(0);
    } else {
      console.log(c.bold(c.red(`${failed} endpoint(s) failed.`)));
      process.exit(1);
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

const config = parseArgs();
const tester = new EndpointTester(config);
tester.run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
