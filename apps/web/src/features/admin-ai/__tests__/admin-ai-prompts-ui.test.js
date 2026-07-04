// P18-074: Create Admin AI Prompt Management UI
// Verifies the prompt template page never decides which version is
// active client-side, never reads/writes provider or model secrets,
// always renders backend-approved loading/empty/error/forbidden states,
// and only mutates data through the api client (publish/retire/create
// are server-authoritative transitions).

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const FORBIDDEN_PATTERNS = [
  /apiKey/i,
  /api_key/i,
  /secret/i,
  /service[_-]?role/i,
  /computeMastery/i,
  /calculateScore/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin AI Prompts UI', () => {
  test('AdminAiPrompts page exists and is exported', () => {
    expect(fs.existsSync(path.join(PAGES_DIR, 'AdminAiPrompts.js'))).toBe(true);
    const indexContent = readFile(PAGES_DIR, 'index.js');
    expect(indexContent).toMatch(/AdminAiPrompts/);
  });

  test('page only imports prompt data via the api client', () => {
    const content = readFile(PAGES_DIR, 'AdminAiPrompts.js');
    expect(content).toMatch(/from '\.\.\/api'/);
    expect(content).toMatch(/listPromptTemplates/);
    expect(content).toMatch(/createPromptTemplateDraft/);
    expect(content).toMatch(/publishPromptTemplate/);
    expect(content).toMatch(/retirePromptTemplate/);
  });

  test('page never reads or writes provider/model secrets', () => {
    const content = readFile(PAGES_DIR, 'AdminAiPrompts.js');
    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('page handles loading, empty, error, and forbidden states', () => {
    const content = readFile(PAGES_DIR, 'AdminAiPrompts.js');
    expect(content.toLowerCase()).toMatch(/loading/);
    expect(content.toLowerCase()).toMatch(/empty/);
    expect(content.toLowerCase()).toMatch(/error/);
    expect(content.toLowerCase()).toMatch(/forbidden/);
  });

  test('publish and retire only call the api client, never set status locally', () => {
    const content = readFile(PAGES_DIR, 'AdminAiPrompts.js');
    expect(content).not.toMatch(/status\s*:\s*['"]active['"]/);
    expect(content).not.toMatch(/status\s*:\s*['"]retired['"]/);
  });

  test('api client exposes prompt management functions against the admin/ai/prompts route', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    expect(content).toMatch(/export async function listPromptTemplates/);
    expect(content).toMatch(/export async function createPromptTemplateDraft/);
    expect(content).toMatch(/export async function publishPromptTemplate/);
    expect(content).toMatch(/export async function retirePromptTemplate/);
    expect(content).toContain("'/prompts'");
    expect(content).toContain('/publish');
    expect(content).toContain('/retire');
  });
});
