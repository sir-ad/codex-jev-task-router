---
name: codex-task-router
description: Route substantial Codex work to available GPT models, thinking effort, relevant skills, bounded subagents and browser paths. Use at the start of a substantial task or after a material scope change. Tiny or clear requests need no routing.
---

# Codex task router

Goal: completed, verified work per unit of time and model usage. A route is a plan; only a real tool call and a checked result establish execution. Keep the user's explicit model, effort, skills, scope and permissions.

## 1. Triage (internal, brief)

- Tiny or clear request (rewrite, fact in context, one obvious edit): just do it. No script, no Jev, no subagent.
- Follow-up on an existing route: keep the route. Re-route only on new requirements, new evidence or a failed check.
- Skills: read any the user named. Otherwise pick one primary and at most two supporting skills by the real deliverable, from the skill metadata already in the session. If none fit, use judgment.

## 2. Route

Use the models and efforts exposed by the **active dispatch tool**, never a cache or memory.

| Work | Model | Effort |
| --- | --- | --- |
| Extraction, collection, narrow edits with clear checks | GPT-6 Luna | high |
| Implementation, debugging, synthesis, polished deliverables | GPT-6.1 Sol (else GPT-6 Sol) | medium |
| Hard architecture, unresolved diagnosis, consequential judgment | GPT-6 Astra | low, high if deeper analysis is needed |

Raise effort or tier for difficulty or a failed check, not for length. Max/Ultra only when the user asks. If an explicit model or effort is unavailable, say so; never substitute silently.

For a clear task apply the table yourself. Only for a genuinely ambiguous public task, run `node scripts/route.mjs < input.json` (Node 22+; fields in [routing contract](references/routing-contract.md)). Set `uncertain` explicitly: `false` for a clear task, `true` to resolve ambiguity. The summary must be generic: no names, employers, customers, paths, code, URLs, credentials or private details. Set `privacy: public` and `sanitized: true` only after reading exactly what would be sent. If it cannot be abstracted, keep it private and the helper stays local.

## 3. Execute

Delegate only when independent work can run beside useful coordinator work. At most two concurrent workers and one heavy local build or browser task at a time. Never delegate tiny work or sequential steps.

Copy the verified `dispatch.model` and `dispatch.reasoning_effort` into the actual tool call (with `collaboration.spawn_agent`, `fork_turns: none`). Give the worker a compact packet: goal, authorized files, skill paths, minimum evidence, constraints, acceptance check, and a result target of about 700 tokens plus file links. Separate file ownership or read-only. Workers never re-invoke this router or spawn more workers.

If model-selectable delegation is unavailable, continue in the primary and say so when it matters. Do not simulate a dispatch through a CLI or change global settings. This skill cannot change the model generating the current reply.

## 4. Verify

Check the artifact and run the task's real acceptance check; "done" from a worker is not evidence. Use independent review for critical risk. On failure, diagnose, then make one focused fix or one capability escalation, with no repeats without new evidence.

For delegated or Jev-routed work, record a receipt with `node scripts/receipt.mjs append` (allow-listed fields only; leave unknown values null). Never claim token savings or better accuracy from a route alone; compare matched routed and baseline tasks with `node scripts/receipt.mjs summary`.

## Reference (read only when needed)

- [Routing contract](references/routing-contract.md): helper input and output.
- [Policy details](references/policy-details.md): effort mapping, Jev thresholds, privacy rules, limits.
- [Model evidence](references/model-evidence.md): sources and dates; recheck before adding models.
- [Release checks](references/release-checks.md): release, rollback, and the matched-task evaluation protocol.
