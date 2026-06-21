// P18-075: Create Admin AI Model Config UI
// Verifies the model config page only renders the non-secret
// provider_key_ref string, never reads/writes provider API keys or
// model secrets, always renders backend-approved loading/empty/error/
// forbidden states, and only mutates status/limits through the api
// client.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const FORBIDDEN_PATTERNS = [
  /apiKey/i,
  /api_key/i,
  /provider_secret/i,
  /providerSecret/i,
  /computeMastery/i,
  /calculateScore/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin AI Model Config UI', () => {
  test('AdminAiModelConfig page exists and is exported', () => {
    expect(fs.existsSync(path.join(PAGES_DIR, 'AdminAiModelConfig.js'))).toBe(true);
    const indexContent = readFile(PAGES_DIR, 'index.js');
    expect(indexContent).toMatch(/AdminAiModelConfig/);
  });

  test('page only imports model config data via the api client', () => {
    const content = readFile(PAGES_DIR, 'AdminAiModelConfig.js');
    expect(content).toMatch(/from '\.\.\/api'/);
    expect(content).toMatch(/listModelConfigs/);
    expect(content).toMatch(/setModelConfigStatus/);
    expect(content).toMatch(/updateModelConfigLimits/);
  });

  test('page only renders provider_key_ref, never a raw provider secret/api key', () => {
    const content = readFile(PAGES_DIR, 'AdminAiModelConfig.js');
    expect(content).toMatch(/provider_key_ref/);
    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('page handles loading, empty, error, and forbidden states', () => {
    const content = readFile(PAGES_DIR, 'AdminAiModelConfig.js');
    expect(content.toLowerCase()).toMatch(/loading/);
    expect(content.toLowerCase()).toMatch(/empty/);
    expect(content.toLowerCase()).toMatch(/error/);
    expect(content.toLowerCase()).toMatch(/forbidden/);
  });

  test('status changes only call the api client, never set status locally as a literal assignment', () => {
    const content = readFile(PAGES_DIR, 'AdminAiModelConfig.js');
    expect(content).not.toMatch(/\bcfg\.status\s*=\s*['"]/);
  });

  test('api client exposes model config functions against the admin/ai/model-configs route', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    expect(content).toMatch(/export async function listModelConfigs/);
    expect(content).toMatch(/export async function setModelConfigStatus/);
    expect(content).toMatch(/export async function updateModelConfigLimits/);
    expect(content).toContain("'/model-configs'");
    expect(content).toContain('/status');
    expect(content).toContain('/limits');
  });
});
