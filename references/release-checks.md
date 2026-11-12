# Router release checks

Version 2.2.0, 2026-11-12.

## Release gate

1. Stage a complete copy; keep the installed version intact until checks pass.
2. Run `npm test` (all three test files) and the skill validator.
3. Check the active dispatch tool model and effort catalog. Cache membership is
   advisory. Do not add unknown models to automatic policy without current docs.
4. Use a few inspected public synthetic summaries for bounded live TypeSafe
   checks; record actual model, usage, uncertainty and policy overrides.
5. Perform a bounded real worker dispatch for useful independent work, using the
   exact selected effort. Record unavailable provider attestation/usage as null.
6. Install by replacing the staged directory; preserve a rollback copy. Confirm
   the installed file hashes match the staged release and global routing points
   to it. Do not overwrite unrelated global instructions.

## Acceptance scope

This release establishes input/response validation, timeout and failure behavior,
model/effort compatibility, explicit overrides, local fallbacks and live service
compatibility. It does not establish calibrated semantic accuracy, total-token
savings, speed improvements or guaranteed task success. Maintain task-specific
acceptance checks after dispatch. Skill instructions are not a pre-inference hook
and cannot change the primary model or thinking effort mid-response.

## Rollback

Keep the previous directory in a user-chosen backup location outside the skill. To roll back,
copy it to a sibling staging directory under `~/.codex/skills`, move the installed
router aside, and rename the staged copy into `codex-task-router` (the skill directory name; the repository is `codex-jev-task-router`). Check hashes
before removing any backup. No service, cron, MCP server, or background process
is installed by this router.

## Evaluate improvements

Use paired tasks with the same acceptance criteria and evidence, retaining failed
attempts. Measure correctness, source coverage, total coordinator/worker/router
usage, wall time, retries and review burden. Keep a held-out task set; threshold
changes and routing explanations alone are not measured improvement. Retain a
route across unchanged follow-ups and call Jev again only for a material change.

## Matched-task protocol (needed before claiming savings)

1. Choose 20 or more task types you really run (fix a bug, add a form, summarize sources). For each, fix the acceptance check before starting.
2. Run each task twice from the same starting state: once `baseline` (primary only, no router) and once `routed`. Alternate which runs first.
3. Record both with `node scripts/receipt.mjs append`: coordinator, worker, router and verification tokens, wall time, retries, and whether the acceptance check passed. Leave a field null rather than estimating.
4. Run `node scripts/receipt.mjs summary`. Routing is justified only if the routed arm's acceptance rate is no lower and total tokens or wall time is clearly lower, task type by task type. Otherwise tighten the policy or drop delegation for that task type.
