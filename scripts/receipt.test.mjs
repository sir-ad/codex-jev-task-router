import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeReceipt, summarize} from './receipt.mjs';

const cli = fileURLToPath(new URL('./receipt.mjs', import.meta.url));
const ok = (arm, extra = {}) => ({arm, taskId: 't1', coordinatorTokens: 1000, workerTokens: 0, routerTokens: 0,
  verificationTokens: 100, wallMs: 5000, retries: 0, accepted: true, ...extra});

test('receipts keep only allow-listed scalars and reject free text', () => {
  assert.equal(normalizeReceipt(ok('routed', {model: 'gpt-6-luna'})).model, 'gpt-6-luna');
  assert.throws(() => normalizeReceipt({...ok('routed'), summary: 'private'}), /Unrecognized receipt field: summary/);
  assert.throws(() => normalizeReceipt(ok('routed', {taskId: 'Fix the billing bug for Acme'})), /short identifier/);
  assert.throws(() => normalizeReceipt(ok('routed', {wallMs: -1})), /non-negative/);
  assert.throws(() => normalizeReceipt(ok('other')), /arm must be/);
});
test('summary compares arms and never guesses missing token fields', () => {
  const rs = [normalizeReceipt(ok('baseline', {coordinatorTokens: 2000})), normalizeReceipt(ok('routed')),
    normalizeReceipt(ok('routed', {workerTokens: null, accepted: false}))];
  const s = summarize(rs);
  assert.equal(s.arms.routed.runs, 2); assert.equal(s.arms.routed.runsWithCompleteTokens, 1);
  assert.equal(s.comparison.tokenRatioRoutedOverBaseline, 0.52);
  assert.match(s.comparison.note, /anecdote/);
});
test('CLI appends and summarizes from a chosen directory', () => {
  const dir = mkdtempSync(join(tmpdir(), 'receipts-'));
  try {
    const run = (args, input = '') => spawnSync(process.execPath, [cli, ...args], {input, encoding: 'utf8'});
    assert.equal(run(['append', '--dir', dir], JSON.stringify(ok('routed'))).status, 0);
    assert.equal(readFileSync(join(dir, 'receipts.jsonl'), 'utf8').trim().split('\n').length, 1);
    assert.equal(JSON.parse(run(['summary', '--dir', dir]).stdout).arms.routed.runs, 1);
    const bad = run(['append', '--dir', dir], '{"arm":"routed","taskId":"t","note":"x"}');
    assert.equal(bad.status, 2); assert.match(bad.stderr, /Unrecognized receipt field: note/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
