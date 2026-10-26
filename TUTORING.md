# MealPlanner tutoring handoff

Last updated: 2026-10-26
Working branch: `feat/shopping-lists`

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
- Frontend 1.0 and SQLite ingredient/recipe catalogs are merged. This branch
  starts from `5220528` (Merge/sqlite backend (#2)).
- Current milestone: shopping-list calculation, configuration, preview, and
  Markdown download are implemented. Final build/diff review and PR remain.
  Meal-plan database persistence is deferred, not implemented.
- Ingredients and recipes now use SQLite through the API, including recipe
  editing. Meals and daily targets still use localStorage. Obsolete ingredient
  and recipe localStorage effects have been removed.
- The user explicitly considers existing browser/mock data disposable: no data
  migration is needed. Reset mock recipes/meal references when switching sources,
  but preserve unrelated settings and the real SQLite ingredient records.
- Backend: .NET 10 API at `http://localhost:5190` using the `http` launch profile.
  Program.cs now maps ingredient endpoints; the Hello World route was removed.
- `Models/Ingredient.cs` defines a generated Guid ID, required string Name, and
  decimal kcal/protein/sugar/fat per 100 g. The user understands that `required`
  enforces initialization, not non-empty input; POST validates actual values.
- Installed `Microsoft.EntityFrameworkCore.Sqlite` version `10.0.13`.
  `Data/MealPlannerDbContext.cs` inherits DbContext, takes typed options in its
  constructor, and exposes `DbSet<Ingredient> Ingredients`.
- Program.cs registers the context with AddDbContext / UseSqlite. A connection
  string builder points to `mealplanner.db` under the API content root.
- Installed EF Core Design and local `dotnet-ef`, both version `10.0.13`.
  The tool manifest is at repository root: `dotnet-tools.json` (not `.config/`).
- Generated and applied `InitialCreate`; migration files are in the API's
  `Migrations` directory. The user reports database update succeeded.
  `.gitignore` excludes `/src/MealPlanner.Api/mealplanner.db*`.
- `GET /api/ingredients` reads SQLite using AsNoTracking, orders by Name, and
  returns JSON. The user confirmed it works with the initially empty table.
- `Contracts/CreateIngredientRequest.cs` defines required Name and required
  decimal nutrition properties, with no ID. DTO compilation succeeded per user.
- `POST /api/ingredients` rejects blank names, negative kcal, and protein/sugar/
  fat outside 0–100. It trims Name, generates the ID, persists with
  SaveChangesAsync, and returns JSON with status 201 (no Location header).
  The user verified creation, reading back, persistence across restart, and
  rejection of an out-of-range nutrient value.
- Recipe and RecipeIngredient models are registered in the context. AddRecipes
  migration creates Recipes and RecipeIngredients, with a composite recipe/
  ingredient key, cascade deletion from Recipe, and restricted deletion from
  Ingredient. The user applied it and verified recipe persistence.
- Recipe GET/POST/PUT endpoints are implemented. POST and PUT share
  ValidateRecipeRequest, returning IResult errors or null on success. They check
  names/instructions, servings, positive grams, duplicate IDs, and existence of
  referenced ingredients. PUT retains the recipe ID, updates matching entries,
  removes omitted entries, and adds new entries in one SaveChangesAsync call.
- Ingredient editing/deletion is deferred to a separate feature. Neither is
  implemented; do not imply a delete/recreate API workflow already exists.

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
- Vite proxies `/api` to `http://localhost:5190`. Both API and Vite must run;
  the proxy only configures development traffic, not production hosting.
- `src/api/ingredients.ts` provides GET/POST helpers returning unknown JSON;
  App validates it with isIngredient. The Ingredients tab displays server data,
  with loading/error feedback and search.
- IngredientFrom accepts asynchronous onAdd, awaits it, disables submit while
  saving, and retains values/display errors on failure.
- App's shared async addIngredient posts to the API, validates the response,
  updates the single ingredients list, and returns the saved Ingredient.
  Both standalone creation and RecipeForm's missing-ingredient callback use it.
  RecipeForm's onCreateIngredient now returns Promise<Ingredient> and is awaited.
- Shared Ingredient, RecipeIngredient, and Recipe types now live in
  `src/types/mealPlanner.ts`; mockData.ts imports these types and contains only
  mock records. API helpers and components import the shared type definitions.
- `src/api/recipes.ts` implements GET, POST, and PUT helpers. App loads both
  catalogs with Promise.all, validates JSON, and gates rendering on shared
  catalogsLoading/catalogsError state. Recipe imageUrl accepts null as returned
  by the API. Creation/editing uses server responses to update catalog state.
- RecipeForm awaits onSave, displays errors without discarding the draft, and
  disables Save/Cancel during saving. New recipe and Edit are enabled again.
- ShoppingList.tsx provides a shopping view with days (default 7), per-meal skip
  counts (default 0), ingredient totals, errors, and an empty state. App keeps
  it mounted using a hidden wrapper so switching views preserves configuration.
- utils/shoppingList.ts calculates grams / recipe servings * planned servings *
  (days - skips), aggregating by ingredient ID across all meals. It rejects
  invalid days/skips and missing recipes/ingredients rather than undercounting.
- Shopping options affect groceries only, never meal placements or nutrition.
  Shared types include Meal, PlannedRecipe, ShoppingListOptions, ShoppingListItem.
- Download Markdown creates shopping-list.md with the planning period, included/
  skipped meal counts, and ingredient checkboxes with grams rounded to one
  decimal. Download is blocked for errors/empty totals. Blob URLs are revoked.
- App.css includes responsive shopping-list control layout and list spacing.

## Next lesson

The agreed first version is implemented. The user confirmed the preview, skip
controls, styling, and Markdown download work, and latest lint passes.

1. Run a final frontend build after the download change and review the diff.
   Verify shared ingredients across recipes/meals, multi-serving recipe scaling,
   empty/all-skipped lists, invalid skips, and unchanged planner nutrition if
   those edge cases have not already been covered. No frontend test suite exists.
2. Commit/push the feature and this handoff when the user is ready. Keep notes
   on feat/shopping-lists and prepare a separate merge candidate without
   TUTORING.md, following the existing required check. Do not commit database
   files. Codex has not committed or pushed anything.
3. Review the PR and required CI before merging. Choose the next feature with
   the user afterward; do not automatically expand this shopping-list scope.

Meal plans and targets still use localStorage. Named-plan persistence, ingredient
editing/deletion, and weekly scheduling are separate deferred work. Preserve the
existing tutoring agreement: the user writes application code.

## Observations and checks

- Two identical recipes named "test" were probably created by saving twice
  before the catalog was visible. IDs are unique; no overwrite was established.
  Do not assume recipe names must be unique or add validation without discussion.
- `RecipeForm.tsx` exports `RecipeFrom`; `IngredientFrom.tsx` is also spelled
  that way in the repository. Use the actual names when guiding edits.
- The user confirmed catalog search, responsive card styling, navigation, and
  ingredient table checks. They also reported import testing worked after a
  hard refresh revealed the new control; individual import cases were not
  independently observed by Codex.
- The user confirmed recipe editing works and reports ingredient-amount editing
  is implemented. Detailed save/cancel/persistence browser checks for these edits
  have not been independently observed by Codex.
- Frontend lint/build passed locally on 2026-10-18. The user's PR screenshots
  showed all five CI jobs passing. A misspelled required check and an unconfigured
  code-scanning requirement blocked merging; the user corrected the ruleset.
- On 2026-10-19 the user confirmed Hello World, model compilation, and the build
  after installing SQLite EF Core and creating the context. Codex inspected the
  files but did not independently rerun the backend build during this handoff.
- On 2026-10-21 the user confirmed Hello World after context registration,
  successful migration setup/application, and the GET endpoint working. An
  initial 404 was caused by `/app/ingredients` instead of `/api/ingredients`;
  the saved route is now correct. Restart plain `dotnet run` after code edits.
- On 2026-10-24 the user confirmed the API POST returned 201, records survived
  restart, invalid input returned 400, and the React Ingredients tab showed
  SQLite data through Vite.
- An omitted await in the standalone create callback caused isIngredient to
  validate a Promise and report a false failure even though the POST saved.
  It is fixed. The user has duplicate test ingredients from retrying; duplicates
  are understood and no uniqueness restriction or deletion endpoint was added.
- The user reports lint/build passed after moving types and again after sharing
  addIngredient and awaiting the nested recipe callback. Codex inspected those
  edits but did not rerun checks or independently verify the nested browser flow
  at this pause. API formatting/CI checks remain unverified for this checkpoint.
- On 2026-10-25 the user reported lint/build pass after unifying ingredients,
  and confirmed recipe creation/use, refresh persistence, nested ingredient
  persistence, and API-down handling. Codex inspected the state changes and
  found the obsolete ingredient-saving effect still present.
- The blank ingredient-name error was corrected. Recipe servings feedback still
  has a cosmetic typo: "at leat" instead of "at least".
- On 2026-10-25/26 the user verified recipe POST/GET persistence, explicit 400
  rejection for servings 0, and successful PUT using a recipe ID in the URL and
  existing ingredient IDs in the body. Nonexistent-ingredient rejection was
  suggested but not explicitly confirmed. GET initially omitted Servings; fixed.
- On 2026-10-26 a singular Ingredient property in the PUT response caused
  isRecipe to reject it after saving; changed to Ingredients, and the user
  confirmed editing works. They also confirmed the requested browser checks for
  refresh/nutrition, ingredient add/remove, and API-down draft retention.
- Latest final frontend lint/build, backend build/format, and CI results after
  the PUT response correction have not been independently checked by Codex.
- Commands from repo root: `dotnet tool restore`, then enter
  `src/MealPlanner.Api` to run `dotnet ef database update`. This matches the
  migration exercise's working directory and database location. Start the API
  from repo root using `dotnet run --project src/MealPlanner.Api --launch-profile http`.
- Catalog work is merged at `5220528`. On 2026-10-26 the new shopping-list branch
  was clean before copying this handoff. The user wrote the shopping-list code;
  Codex only copied/updated these notes and provided tutoring.
- The shopping calculator exposed a stale recipe ID in the browser meal plan
  (b04d8fd1-d3f7-416a-a305-091690f8dce1). Codex verified it was absent in SQLite
  using a read-only query. The user was guided to remove only that saved
  placement; they reported the view then worked. The planner silently hides
  unavailable placements, while shopping intentionally reports an error. A
  general cleanup control remains a possible future improvement.
- The user reported lint/build passing before export, then successful Markdown
  download/quantity/skip checks and passing lint after export. The final build
  after export has not been reported; Codex has not run application checks on
  this branch. Notes-only diff whitespace checks passed.
- Pending: App.tsx, App.css, shared types, new ShoppingList.tsx and
  utils/shoppingList.ts, and this root handoff (still untracked). No backend
  changes or migration are needed for this shopping-list feature.

## Keeping this file out of main

CI includes a `No tutoring notes on main` check for pull requests into `main`
and pushes to `main`. Make this check required in GitHub's protection/ruleset for
`main`; adding the workflow alone does not configure branch protection.

Before merging, prepare a merge candidate without `TUTORING.md`. Preserve the
latest notes on a development branch first. The check examines tracked files,
not commit history: an ordinary merge can still bring earlier versions into
main's history. If history exclusion matters, use a clean squash merge candidate
or keep notes in a separate repository. `.gitignore` is not a merge guard.
