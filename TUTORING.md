# MealPlanner tutoring handoff

Last updated: 2026-10-16
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
- Current milestone: finish frontend 1.0 on `react_foundation`, review and merge
  it, then start the real API and SQLite persistence in later work.
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
- Planner, Recipes, and Ingredients navigation using `activeView` in `App`.
  Shared data stays in `App` while views are conditionally rendered.
- Recipes now displays the catalog with per-serving nutrition and Details
  buttons, plus New recipe. Ingredients still uses a plain bulleted list.

## Next lesson

The user stopped after confirming the recipe catalog displays saved recipes.
Catalog search was suggested but is NOT implemented in the inspected code.

1. Add `recipeSearch` state inside `App` and derive `filteredRecipes` from
   `recipes` using a trimmed, case-insensitive name search.
2. Add a labeled search input to the Recipes view, render `filteredRecipes`,
   and display a no-matches message. Verify matching, no matches, and clearing.
3. Style the recipe catalog and indicate the active navigation view.
4. Give Ingredients a searchable table or similarly usable catalog layout.
5. Review remaining frontend 1.0 requirements together before expanding scope.
   Run the frontend build/lint and exercise the main flows before merging.

## Observations and checks

- Two identical recipes named "test" were probably created by saving twice
  before the catalog was visible. IDs are unique; no overwrite was established.
  Do not assume recipe names must be unique or add validation without discussion.
- Editing ingredient grams after adding them to a recipe was suggested earlier,
  but the user chose catalog improvements as the next priority.
- `RecipeForm.tsx` exports `RecipeFrom`; `IngredientFrom.tsx` is also spelled
  that way in the repository. Use the actual names when guiding edits.
- The user manually confirmed navigation, recipe saving, and catalog display.
  No frontend build or lint was run during this session.
- At handoff creation, `App.tsx`, `package.json`, and `package-lock.json` already
  had user changes. Preserve them; their validation is still pending.

## Keeping this file out of main

CI includes a `No tutoring notes on main` check for pull requests into `main`
and pushes to `main`. Make this check required in GitHub's protection/ruleset for
`main`; adding the workflow alone does not configure branch protection.

Before merging, prepare a merge candidate without `TUTORING.md`. Preserve the
latest notes on a development branch first. The check examines tracked files,
not commit history: an ordinary merge can still bring earlier versions into
main's history. If history exclusion matters, use a clean squash merge candidate
or keep notes in a separate repository. `.gitignore` is not a merge guard.
