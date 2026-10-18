# MealPlanner tutoring handoff

Last updated: 2026-10-18
Working branch: `react_foundation`

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

MealPlanner is a daily meal planner: ingredients compose recipes, and recipes
with planned serving quantities compose meals. The UI focuses on kcal and
protein; ingredient data also includes sugar and fat. Instructions are required.
Images and convenient units such as slices can wait.

- Frontend: React, TypeScript, Vite in `src/MealPlanner-web`.
- Backend foundation: ASP.NET in `src/MealPlanner.Api`.
- Current milestone: frontend 1.0 features are complete on `react_foundation`.
  Review the diff and CI, prepare a merge candidate, and merge before starting
  the real API and SQLite persistence in later work.
- Current persistence is browser localStorage. It does not travel with Git;
  ingredients, recipes, and meal choices may differ between machines.

## Current working frontend

- Five meal columns with recipe search/pickers, add/remove, serving adjustment,
  and desktop drag and drop. Moving into the same recipe combines quantities.
- Daily nutrition summaries, meal colors, editable targets, recipe details.
- Nutrition calculated from ingredient quantities, then divided by recipe
  servings for per-serving values. Meal quantities scale those values.
- Ingredient creation with product nutrition per 100 g.
- Recipe creation with name, servings, instructions, ingredient selection and
  amounts, removal, and nutrition preview. Missing ingredients can be created
  during recipe creation.
- Recipe catalog Edit reuses the creation form with a fresh draft. Saving
  preserves the recipe ID and updates existing placements; cancelling discards
  recipe edits. Ingredient grams are editable directly, and saving requires
  every amount to be finite and greater than zero.
- Planner, Recipes, and Ingredients navigation using `activeView` in `App`.
  Shared data stays in `App` while views are conditionally rendered.
- Searchable recipe cards with per-serving nutrition, Details, and New recipe.
- Active navigation highlighting and a searchable ingredient nutrition table.
- Settings includes JSON export/import of the current meals and daily targets.
  Catalogs remain separate: importing checks version, targets, supported meal
  columns, unique placements, and recipe references, then asks before replacing
  the current plan. Existing localStorage effects persist imported state.
- CI now includes a frontend job running `npm ci`, lint, and build. Its exact
  check name is `frontend lint and build` (lowercase).

## Next lesson

The user committed and pushed import work at `7f76103` (Add meal plan importing).
Recipe editing and the README screenshot were added afterward and remain
uncommitted at this handoff. Codex reran lint/build successfully on these edits.

1. Finish the browser checks for recipe editing: save changed amounts, cancel
   changes, create a fresh recipe, and refresh to verify persistence. Commit and
   push the recipe edits, README/screenshot, and this refreshed handoff when the
   user is ready; Codex has not committed or pushed anything.
2. Review the frontend 1.0 diff before merging. Keep `react_foundation` and its
   handoff intact; prepare a separate merge candidate without `TUTORING.md`.
   Creating branches or commits still requires the user's instruction.
3. Open a PR into `main`, check all CI results, and ensure the ruleset requires
   `frontend lint and build` as well as the existing checks. Do not merge until
   checks and the review pass.
4. After merging, plan the first ASP.NET/SQLite lesson. Do not start backend
   implementation as part of the frontend merge preparation.

## Observations and checks

- Two identical recipes named "test" were probably created by saving twice
  before the catalog was visible. IDs are unique; no overwrite was established.
  Do not assume recipe names must be unique or add validation without discussion.
- Editing ingredient grams after adding them to a recipe was suggested earlier,
  but the user chose catalog improvements as the next priority.
- `RecipeForm.tsx` exports `RecipeFrom`; `IngredientFrom.tsx` is also spelled
  that way in the repository. Use the actual names when guiding edits.
- The user confirmed catalog search, responsive card styling, navigation, and
  ingredient table checks. They also reported import testing worked after a
  hard refresh revealed the new control; individual import cases were not
  independently observed by Codex.
- The user confirmed recipe editing works and reports ingredient-amount editing
  is implemented. Detailed save/cancel/persistence browser checks for these edits
  have not been independently observed by Codex.
- Codex reran frontend lint and build successfully on 2026-10-18 after recipe
  editing, and `git diff --check` passed. GitHub CI results and the final ruleset
  configuration have not been inspected.
- Pending files: this handoff, `App.tsx`, `RecipeForm.tsx`, `readme.md`, and
  `docs/images/planner.png`. Codex updated notes and added the README image link;
  the user wrote the application changes.

## Keeping this file out of main

CI includes a `No tutoring notes on main` check for pull requests into `main`
and pushes to `main`. Make this check required in GitHub's protection/ruleset for
`main`; adding the workflow alone does not configure branch protection.

Before merging, prepare a merge candidate without `TUTORING.md`. Preserve the
latest notes on a development branch first. The check examines tracked files,
not commit history: an ordinary merge can still bring earlier versions into
main's history. If history exclusion matters, use a clean squash merge candidate
or keep notes in a separate repository. `.gitignore` is not a merge guard.
