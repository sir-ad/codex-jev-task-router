import {appendFileSync, mkdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

// Compact, privacy-safe task receipts so routed vs baseline runs can be compared.
// Only allow-listed scalar fields are stored: no prompts, summaries, paths or free text.
const ID = /^[A-Za-z0-9][A-Za-z0-9:._-]{0,63}$/;
const ARMS = ['routed', 'baseline'];
const IDS = ['taskId', 'tier', 'model', 'effort', 'actualModel', 'agentId'];
const NUMS = ['coordinatorTokens', 'workerTokens', 'routerTokens', 'verificationTokens', 'wallMs', 'retries'];
const BOOLS = ['accepted', 'delegated'];
const fail = message => { throw new Error(message); };

export function normalizeReceipt(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('Receipt must be an object');
  const allowed = new Set(['arm', ...IDS, ...NUMS, ...BOOLS]);
  const unknown = Object.keys(raw).find(k => !allowed.has(k));
  if (unknown !== undefined) fail(`Unrecognized receipt field${/^[A-Za-z]{1,40}$/.test(unknown) ? `: ${unknown}` : ''}`);
  if (!ARMS.includes(raw.arm)) fail('arm must be "routed" or "baseline"');
  if (typeof raw.taskId !== 'string' || !ID.test(raw.taskId)) fail('taskId must be a short identifier, not a description');
  const out = {arm: raw.arm, at: new Date().toISOString()};
  for (const k of IDS) if (raw[k] != null) {
    if (typeof raw[k] !== 'string' || !ID.test(raw[k])) fail(`${k} must be a short identifier`);
    out[k] = raw[k];
  }
  for (const k of NUMS) out[k] = raw[k] == null ? null : Number.isSafeInteger(raw[k]) && raw[k] >= 0 ? raw[k] : fail(`${k} must be a non-negative integer or null`);
  for (const k of BOOLS) out[k] = raw[k] == null ? null : typeof raw[k] === 'boolean' ? raw[k] : fail(`${k} must be boolean or null`);
  return out;
}

const totalTokens = r => ['coordinatorTokens', 'workerTokens', 'routerTokens', 'verificationTokens']
  .reduce((n, k) => n === null || r[k] === null ? null : n + r[k], 0);
const mean = xs => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;

export function summarize(receipts) {
  const arms = {};
  for (const arm of ARMS) {
    const rs = receipts.filter(r => r.arm === arm);
    const complete = rs.map(totalTokens).filter(n => n !== null);
    arms[arm] = {runs: rs.length, accepted: rs.filter(r => r.accepted === true).length,
      acceptanceRate: rs.length ? +(rs.filter(r => r.accepted === true).length / rs.length).toFixed(2) : null,
      // Only runs with every token field recorded count; incomplete runs are never guessed.
      runsWithCompleteTokens: complete.length, meanTotalTokens: mean(complete),
      meanWallMs: mean(rs.map(r => r.wallMs).filter(n => n !== null)), meanRetries: mean(rs.map(r => r.retries).filter(n => n !== null))};
  }
  const r = arms.routed, b = arms.baseline;
  const enough = Math.min(r.runsWithCompleteTokens, b.runsWithCompleteTokens) >= 20;
  return {arms, comparison: r.meanTotalTokens !== null && b.meanTotalTokens !== null ? {
    tokenRatioRoutedOverBaseline: +(r.meanTotalTokens / b.meanTotalTokens).toFixed(2),
    acceptanceDelta: +(r.acceptanceRate - b.acceptanceRate).toFixed(2),
    note: enough ? 'Sample is at least 20 per arm; still match task types before concluding.'
      : 'Fewer than 20 complete runs per arm: treat as anecdote, not evidence.'} : null};
}

const file = dir => join(dir, 'receipts.jsonl');
const load = dir => { try { return readFileSync(file(dir), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, ...rest] = process.argv.slice(2);
  const dirFlag = rest.indexOf('--dir');
  const dir = dirFlag >= 0 && rest[dirFlag + 1] ? rest[dirFlag + 1] : join('work', 'router');
  try {
    if (cmd === 'append') {
      const chunks = []; let bytes = 0;
      for await (const c of process.stdin) { bytes += c.length; if (bytes > 4000) fail('Input exceeds 4 KB'); chunks.push(c); }
      const receipt = normalizeReceipt(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      mkdirSync(dir, {recursive: true});
      appendFileSync(file(dir), JSON.stringify(receipt) + '\n');
      process.stdout.write(`Recorded ${receipt.arm} receipt for ${receipt.taskId}\n`);
    } else if (cmd === 'summary') {
      process.stdout.write(JSON.stringify(summarize(load(dir)), null, 2) + '\n');
    } else {
      process.stdout.write('Usage: node scripts/receipt.mjs append [--dir D] < receipt.json\n       node scripts/receipt.mjs summary [--dir D]\nSee references/release-checks.md for the matched-task protocol.\n');
    }
  } catch (error) {
    process.stderr.write(`Receipt rejected: ${error instanceof SyntaxError ? 'invalid JSON' : error.message}\n`);
    process.exitCode = 2;
  }
}
