# MealPlanner tutoring handoff

Last updated: 2026-10-21
Working branch: `feat/sqlite-backend`

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
- Frontend 1.0 is merged. Current branch starts from merge commit `6282087`.
- Current milestone: add ASP.NET API endpoints backed by SQLite. Build one
  complete ingredient path first, then tackle recipes and their relationships.
- Current persistence is browser localStorage. It does not travel with Git;
  ingredients, recipes, and meal choices may differ between machines.
- Backend progress: .NET 10 API runs at `http://localhost:5190/` with the `http`
  launch profile and still returns Hello World. The user confirmed it runs.
- `Models/Ingredient.cs` defines a generated Guid ID, required string Name, and
  decimal kcal/protein/sugar/fat per 100 g. The user understands that `required`
  enforces initialization, not non-empty input; API validation is still needed.
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
  POST, input-value validation, and React API integration are not implemented.

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

Paused after creating CreateIngredientRequest; the user reports the build passed.
Resume with the POST handler, not the DTO, connection setup, or initial migration.

1. Add `POST /api/ingredients` accepting CreateIngredientRequest and the injected
   context. Reject null/blank names, negative kcal, and protein/sugar/fat outside
   0–100. Trim Name, construct Ingredient so the backend generates its ID, and
   persist with SaveChangesAsync. Explain the response status and body.
2. Test a valid POST, read it back with GET, and restart the API to verify
   persistence. Test missing fields and invalid values without adding records.
   If returning a resource Location URL, implement a matching GET-by-ID route.
3. Connect React's ingredient catalog to the API, including development-server
   cross-origin handling and error/loading states. Discuss existing localStorage
   data and recipe-ID compatibility before replacing browser persistence.
4. Extend to recipes, recipe ingredients and quantities, then meal plans. Keep
   each tutoring exercise small and verify it before introducing more layers.

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
- The user reports `dotnet build` passed after adding CreateIngredientRequest.
  Codex inspected the saved code but did not rerun the build at this pause.
  API formatting/CI checks for this checkpoint have not been run by Codex.
- Commands from repo root: `dotnet tool restore`, then enter
  `src/MealPlanner.Api` to run `dotnet ef database update`. This matches the
  migration exercise's working directory and database location. Start the API
  from repo root using `dotnet run --project src/MealPlanner.Api --launch-profile http`.
- Pending files at pause: `.gitignore`, API csproj, Program.cs, root
  `dotnet-tools.json`, `Contracts/CreateIngredientRequest.cs`, migration files,
  and this handoff update. Model/context were already committed. The user will
  commit and push; Codex has not committed or pushed anything.

## Keeping this file out of main

CI includes a `No tutoring notes on main` check for pull requests into `main`
and pushes to `main`. Make this check required in GitHub's protection/ruleset for
`main`; adding the workflow alone does not configure branch protection.

Before merging, prepare a merge candidate without `TUTORING.md`. Preserve the
latest notes on a development branch first. The check examines tracked files,
not commit history: an ordinary merge can still bring earlier versions into
main's history. If history exclusion matters, use a clean squash merge candidate
or keep notes in a separate repository. `.gitignore` is not a merge guard.
