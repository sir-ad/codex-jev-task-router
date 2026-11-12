# Model and runtime evidence

Researched 2026-09-23; rechecked 2026-11-12. Recheck this guidance when exposed models change; never treat the date as a guarantee of account access.

- [Official Codex models](https://learn.chatgpt.com/docs/models): Luna for focused repeatable work, Sol for everyday and complex coding, Astra for the hardest workflows. Starting efforts are Luna high, Sol medium, Astra low. More reasoning can consume more time and tokens. Most tasks do not need Max or Ultra. GPT-5.5 retires from ChatGPT-backed Codex on 2026-10-14; do not introduce it as an automatic default.
- [Official subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents): explicit model/effort selection is supported. Applicable skill or AGENTS.md instructions can request delegation. Each worker consumes its own model and tool tokens; parallel work is not automatically cheaper.
- [Global instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md#how-codex-discovers-guidance): Codex reads the first nonempty global AGENTS.override.md or AGENTS.md when building a run's instruction chain. Global activation applies to new runs; it is not a guaranteed pre-inference prompt hook or a hot swap of the current model.
- [TypeSafe HTTP contract](https://docs.typesafe.ai/api): POST to the fixed systemone endpoint with model, state, and typed questions. Usage includes input/output tokens; return model identifies the serving Jev snapshot.
- [Choice](https://docs.typesafe.ai/primitives/choice), [Noul](https://docs.typesafe.ai/primitives/noul), [confidence](https://docs.typesafe.ai/confidence), and [function-calling cookbook](https://docs.typesafe.ai/cookbooks/function_calling): ask independent judgments together; code applies constraints and consumes the relevant answers. Confidence describes distribution concentration, not guaranteed correctness.

The active dispatch tool determines model and effort availability. A local model cache may be stale or incomplete; its entries do not prove account access. The router intersects policy with the caller's active tool catalog. It uses no OpenAI API key and quotes no API-dollar prices for ChatGPT allowance consumption.

The policy is quality constrained: avoid unnecessary routing/worker overhead; use the smallest adequate model for bounded work; escalate on evidence; keep explicit choices and correctness floors. Actual comparative savings and quality require an end-to-end matched benchmark. The initial live routing tests only establish request compatibility and behavior on the listed cases.


Version 2 reasoning policy was checked against the live official models page on
2026-09-23. Defaults remain Luna High, Sol Medium, Astra Light (`low`). Light Sol
is used for locally assessed light work; deep work uses High and exceptional work
uses Astra Extra High (`xhigh`). These are local policy mappings informed by the
guide, not cross-model benchmark equivalences. Max is deeper single-task reasoning;
Ultra can involve additional agents, and is explicit-only in this router. The
active collaboration tool remains authoritative for supported effort values.

Claude Code, checked 2026-11-12 against the [subagents](https://code.claude.com/docs/en/sub-agents) and [skills](https://code.claude.com/docs/en/skills) docs: an `Agent` call's `model` parameter takes the aliases `sonnet`, `opus`, `haiku` or `fable` (not full IDs); an `effort` parameter can be passed per call and, when omitted on a different model, that model's own level applies; project skills in `.claude/skills/<name>/SKILL.md` and personal skills in `~/.claude/skills/<name>/SKILL.md` are discovered, and `${CLAUDE_SKILL_DIR}` resolves a skill's own directory. The haiku/sonnet/opus/fable tier assignment is this project's judgment (small, balanced, most capable), not a benchmark; no Claude cost or quality comparison was measured here. Model aliases move to newer versions over time, so recheck.

Update 2026-11-12: the [official models page](https://learn.chatgpt.com/docs/models) now lists GPT-6.1 Sol (described as near-Astra performance at lower cost than Astra) and GPT-6.1 Terra (needs a recent Codex CLI). The router treats `gpt-6.1-sol` as standard tier and prefers it over Astra for standard work. `gpt-6.1-terra` has no verified role in this policy: pass an explicit `tier` in `availableModels` to route to it, otherwise it is used only on explicit request and flagged for review. Recheck this page before relying on either, since model lineups change quickly. Relative prices quoted by third-party sites were not verified here and are not encoded in the policy.
