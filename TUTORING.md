# MealPlanner tutoring handoff

Last updated: 2026-10-31
Working branch: `feat/edit-ingredients`

## How to use this file

At the start of a session, ask Codex to read `TUTORING.md` and inspect the current
code before continuing. This is a handoff for a new conversation, not a native
Codex session export. The code is the source of truth when these notes differ.

At the end of a session, update this file with completed work, the next small
exercise, unresolved issues, and checks actually performed. Keep it concise;
replace stale instructions rather than accumulating a transcript. Commit and
push it with the development branch so another machine can pick up the work.

Update rules for Codex:

- Preserve the title, existing section headings, and section order. Edit the
  relevant sections in place; do not regenerate the whole document or append
  a session transcript. Change the structure only when the user requests it.
- Update `Last updated` and `Working branch` from the actual session context.
- Keep tutoring preferences and project decisions unless the user changes them.
- Move completed exercises from `Next lesson` into `Current working frontend`;
  leave the next small, actionable exercise first in `Next lesson`.
- Keep unresolved observations until verified or explicitly deferred. Distinguish
  suggestions from implemented code and user reports from checks Codex ran.
- Record validation honestly, including checks not run. Refresh stale working
  tree observations so they describe the current handoff rather than old edits.
- Review the diff after updating to confirm only intended sections changed and
  that the handoff agrees with the current code. Do not commit or push unless
  the user explicitly asks.

## Tutoring agreement

- The user writes application code; Codex explains, gives small exercises, and
  reviews the saved files. Do not implement whole features unless asked.
- The user has Python full-stack experience, some C++ and C#, and less React
  experience. Explain React concepts without reteaching basic programming.
- Give exact insertion points and manageable snippets. Inspect the current code
  when something fails instead of guessing from an older conversation.
- Do not commit, push, create branches, or merge unless explicitly requested.
- Updating this handoff when requested is part of the workflow.

## Project and milestone

MealPlanner is a daily meal planner built with React/TypeScript/Vite and ASP.NET
.NET 10 / EF Core 10.0.13 / SQLite. Frontend, SQLite catalogs, and shopping lists
are merged into main. Ingredient editing and protected deletion plus recipe
deletion are committed on this feature branch (1cb4451).

Current milestone: named meal plans persisted in SQLite, then LAN deployment.
Targets deliberately remain browser-local and shared across plans; future user
accounts may own targets. No user accounts or weekly calendar in this scope.
Single-container ASP.NET hosting of built React plus API and a persistent SQLite
volume is the intended later deployment direction; it is not implemented.

MealPlan, Meal, MealRecipe models, request DTOs, DbContext mappings, migration
20261028210344_AddMealPlans, and GET list/detail, POST, PUT endpoints exist.
POST/PUT accept {name, meals}; meals have string id/title and recipeId/quantity
placements. Internal meal GUIDs are separate from frontend meal keys. PUT validates
then replaces child meals inside a transaction using ExecuteDeleteAsync/AddRange.
Validation checks nonblank names/keys/titles, unique meal keys, positive quantities,
unique placements per meal, and existing recipe IDs. Recipe deletion cascades its
placements out of all saved plans. Targets are absent from this schema/API.

## Current working frontend

- Five standard meal columns, recipe pickers, quantities, nutrition, desktop
  drag/drop, searchable ingredient/recipe catalogs, async create/edit/delete.
- Ingredient deletion rejects ingredients referenced by recipes (409).
- Shopping view aggregates grams using servings, days, and per-meal skips;
  settings affect groceries only; preview and Markdown download work.
- Settings JSON export/import includes meals and targets; catalogs stay separate.
  Meals and targets still have localStorage persistence effects.
- Types in src/types/mealPlanner.ts include MealPlanSummary and SavedMealPlan.
- src/api/mealPlans.ts exports getMealPlans/getMealPlan/createMealPlan/updateMealPlan.
  Responses are unknown and validated in App; writes return summary {id,name}.
- App fetches summaries on mount, offers a dropdown and Load plan, validates
  fetched detail/references, confirms replacement, and keeps targets unchanged.
- Loading maps over initialMeals to restore all five standard columns, filling
  omitted columns with empty meals. Backend test plans contain only Breakfast.
- activePlan is separate from selectedPlanId; Save changes uses the loaded plan ID.
  planSaving disables load controls. User reports saving works.
- Save as new plan is NOT wired yet. UI only saves updates to a loaded plan.
- Import bug found at this checkpoint: setActivePlan(null) is inside the catch
  block. Move it to the successful import path immediately after
  setMeals(parsed.meals), so importing detaches the draft only on success.

## Next lesson

1. Correct the misplaced import setActivePlan(null) described above.
2. Add Save as new plan: name input, createMealPlan({name: trimmedName, meals}),
   validate summary, add/sort dropdown entry, set selectedPlanId and activePlan
   to the created record. Reuse pending/error feedback and preserve targets.
3. Verify create, update, switching/cancellation, reload persistence, API-down
   draft retention, and unchanged targets. Run frontend lint/build and backend
   build/format before preparing a PR. Tests must be reported honestly.
4. Review plan/draft feedback and recipe deletion wording (cascade affects all
   saved plans). Decide any further controls with the user, then deployment.

The user writes application code. Give manageable snippets with exact anchors
(search text, function names, element names); explain JSX return and select/map
scope when needed. Do not implement the application on the user's behalf.

## Observations and checks

- User reports backend build, migration generation/application, POST/GET
  persistence across restarts, successful PUT, and quantity 0 returning 400
  without changing saved quantities. PUT route was corrected from singular
  /api/meal-plan to /api/meal-plans.
- User reports frontend lint passing after helpers and loading; loading the
  saved plan works, and restoring missing meal columns works. User now reports
  Save changes works. Latest full build/format and detailed save failure cases
  have not been confirmed. Codex inspected files; no app checks run at handoff.
- On disk Save changes is wired; latest save-as-new instructions are not yet
  implemented. Pending git changes include backend models/contracts/migration,
  DbContext/Program, frontend App/types/API helpers, and this handoff.
- Existing mock/test records are disposable; do not assume names must be unique.
- App currently ignores nonstandard meal keys while restoring the standard five;
  backend accepts arbitrary keys. Stronger alignment can be reviewed later.
- RecipeForm exports RecipeFrom; IngredientFrom.tsx is the actual filename.
- SQLite files are ignored and do NOT transfer with git. IDs/test records can
  differ on the desktop. Commit migration files and snapshot, not database files.
- Desktop setup: from repo root run dotnet tool restore, then in
  src/MealPlanner.Api run dotnet ef database update. Start API from root with
  dotnet run --project src/MealPlanner.Api --launch-profile http (port 5190).
- Frontend: cd src/MealPlanner-web; npm ci if needed; npm run dev.
  Verification: npm run lint and npm run build from that folder.
- Backend verification from root: dotnet build; dotnet format --verify-no-changes.
- Vite proxies /api to port 5190; both servers must run during development.
- Root tool manifest is dotnet-tools.json. Database lives under API content root.
- GitHub CI requires exact check No tutoring notes on main. Frontend check is
  frontend lint and build. Previously corrected stale check name/code scanning
  ruleset requirements; do not reintroduce them.
- No commits/pushes/branch operations performed by Codex. This handoff was absent
  and restored using its previous headings and tutoring agreement.

## Keeping this file out of main

CI includes a `No tutoring notes on main` check for pull requests into `main`
and pushes to `main`. Make this check required in GitHub's protection/ruleset for
`main`; adding the workflow alone does not configure branch protection.

Before merging, prepare a merge candidate without `TUTORING.md`. Preserve the
latest notes on a development branch first. The check examines tracked files,
not commit history: an ordinary merge can still bring earlier versions into
main's history. If history exclusion matters, use a clean squash merge candidate
or keep notes in a separate repository. `.gitignore` is not a merge guard.
