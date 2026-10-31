using MealPlanner.Api.Contracts;
using MealPlanner.Api.Data;
using MealPlanner.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var databasePath =
    builder.Configuration["Database:Path"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "mealplanner.db");

var connectionString = new SqliteConnectionStringBuilder { DataSource = databasePath }.ToString();

builder.Services.AddDbContext<MealPlannerDbContext>(options => options.UseSqlite(connectionString));

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrations"))
{
    await using var scope = app.Services.CreateAsyncScope();

    var db = scope.ServiceProvider.GetRequiredService<MealPlannerDbContext>();

    await db.Database.MigrateAsync();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet(
    "/api/ingredients",
    async (MealPlannerDbContext db) =>
    {
        var ingredients = await db
            .Ingredients.AsNoTracking()
            .OrderBy(ingredient => ingredient.Name)
            .ToListAsync();

        return Results.Ok(ingredients);
    }
);

app.MapPost(
    "/api/ingredients",
    async (CreateIngredientRequest request, MealPlannerDbContext db) =>
    {
        var validationError = ValidateIngredientRequest(request);

        if (validationError is not null)
        {
            return validationError;
        }

        var ingredient = new Ingredient
        {
            Name = request.Name.Trim(),
            KcalPer100g = request.KcalPer100g,
            ProteinPer100g = request.ProteinPer100g,
            SugarPer100g = request.SugarPer100g,
            FatPer100g = request.FatPer100g,
        };

        db.Ingredients.Add(ingredient);
        await db.SaveChangesAsync();

        return Results.Json(ingredient, statusCode: StatusCodes.Status201Created);
    }
);

{ /* GET recipes */
}
app.MapGet(
    "/api/recipes",
    async (MealPlannerDbContext db) =>
    {
        var recipes = await db
            .Recipes.AsNoTracking()
            .OrderBy(recipe => recipe.Name)
            .Select(recipe => new
            {
                recipe.Id,
                recipe.Name,
                recipe.Servings,
                recipe.Instructions,
                recipe.ImageUrl,
                Ingredients = recipe
                    .Ingredients.Select(entry => new { entry.IngredientId, entry.AmountGrams })
                    .ToList(),
            })
            .ToListAsync();

        return Results.Ok(recipes);
    }
);

{ /*POST recipies endpoint*/
}

app.MapPost(
    "/api/recipes",
    async (CreateRecipeRequest request, MealPlannerDbContext db) =>
    {
        var validationError = await ValidateRecipeRequest(request, db);

        if (validationError is not null)
        {
            return validationError;
        }

        var recipe = new Recipe
        {
            Name = request.Name.Trim(),
            Servings = request.Servings,
            Instructions = request.Instructions.Trim(),
            ImageUrl = request.ImageUrl,
            Ingredients = request
                .Ingredients.Select(entry => new RecipeIngredient
                {
                    IngredientId = entry.IngredientId,
                    AmountGrams = entry.AmountGrams,
                })
                .ToList(),
        };

        db.Recipes.Add(recipe);
        await db.SaveChangesAsync();

        return Results.Json(
            new
            {
                recipe.Id,
                recipe.Name,
                recipe.Servings,
                recipe.Instructions,
                recipe.ImageUrl,
                Ingredients = recipe.Ingredients.Select(entry => new
                {
                    entry.IngredientId,
                    entry.AmountGrams,
                }),
            },
            statusCode: StatusCodes.Status201Created
        );
    }
);

app.MapPut(
    "/api/recipes/{id:guid}",
    async (Guid id, CreateRecipeRequest request, MealPlannerDbContext db) =>
    {
        var recipe = await db
            .Recipes.Include(recipe => recipe.Ingredients)
            .SingleOrDefaultAsync(recipe => recipe.Id == id);

        if (recipe is null)
        {
            return Results.NotFound();
        }

        var validationError = await ValidateRecipeRequest(request, db);

        if (validationError is not null)
        {
            return validationError;
        }

        recipe.Name = request.Name.Trim();
        recipe.Servings = request.Servings;
        recipe.Instructions = request.Instructions.Trim();
        recipe.ImageUrl = request.ImageUrl;

        var requestedIds = request.Ingredients.Select(entry => entry.IngredientId).ToHashSet();

        foreach (var entry in recipe.Ingredients.ToList())
        {
            if (!requestedIds.Contains(entry.IngredientId))
            {
                recipe.Ingredients.Remove(entry);
            }
        }

        foreach (var requested in request.Ingredients)
        {
            var existing = recipe.Ingredients.SingleOrDefault(entry =>
                entry.IngredientId == requested.IngredientId
            );

            if (existing is not null)
            {
                existing.AmountGrams = requested.AmountGrams;
            }
            else
            {
                recipe.Ingredients.Add(
                    new RecipeIngredient
                    {
                        RecipeId = recipe.Id,
                        IngredientId = requested.IngredientId,
                        AmountGrams = requested.AmountGrams,
                    }
                );
            }
        }

        await db.SaveChangesAsync();

        return Results.Ok(
            new
            {
                recipe.Id,
                recipe.Name,
                recipe.Servings,
                recipe.Instructions,
                recipe.ImageUrl,
                Ingredients = recipe.Ingredients.Select(entry => new
                {
                    entry.IngredientId,
                    entry.AmountGrams,
                }),
            }
        );
    }
);

// PUT ingredients //

app.MapPut(
    "/api/ingredients/{id:guid}",
    async (Guid id, CreateIngredientRequest request, MealPlannerDbContext db) =>
    {
        var ingredient = await db.Ingredients.FindAsync(id);

        if (ingredient is null)
        {
            return Results.NotFound();
        }

        var validationError = ValidateIngredientRequest(request);

        if (validationError is not null)
        {
            return validationError;
        }

        ingredient.Name = request.Name.Trim();
        ingredient.KcalPer100g = request.KcalPer100g;
        ingredient.ProteinPer100g = request.ProteinPer100g;
        ingredient.SugarPer100g = request.SugarPer100g;
        ingredient.FatPer100g = request.FatPer100g;

        await db.SaveChangesAsync();

        return Results.Ok(ingredient);
    }
);

// Delete ingredients //

app.MapDelete(
    "/api/ingredients/{id:guid}",
    async (Guid id, MealPlannerDbContext db) =>
    {
        var ingredient = await db.Ingredients.FindAsync(id);

        if (ingredient is null)
        {
            return Results.NotFound();
        }

        const string inUseMessage =
            "This ingredient is used by a recipe. Remove it from those recipes first!";

        var isUsed = await db.RecipeIngredients.AnyAsync(entry => entry.IngredientId == id);

        if (isUsed)
        {
            return Results.Conflict(inUseMessage);
        }

        db.Ingredients.Remove(ingredient);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is SqliteException { SqliteExtendedErrorCode: 787 })
        {
            return Results.Conflict(inUseMessage);
        }

        return Results.NoContent();
    }
);

app.MapDelete(
    "/api/recipes/{id:guid}",
    async (Guid id, MealPlannerDbContext db) =>
    {
        var recipe = await db.Recipes.FindAsync(id);

        if (recipe is null)
        {
            return Results.NotFound();
        }

        db.Recipes.Remove(recipe);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
);

app.MapGet(
    "/api/meal-plans",
    async (MealPlannerDbContext db) =>
    {
        var plans = await db
            .MealPlans.AsNoTracking()
            .OrderBy(plan => plan.Name)
            .Select(plan => new { plan.Id, plan.Name })
            .ToListAsync();

        return Results.Ok(plans);
    }
);

app.MapGet(
    "/api/meal-plans/{id:guid}",
    async (Guid id, MealPlannerDbContext db) =>
    {
        var plan = await db
            .MealPlans.AsNoTracking()
            .Where(plan => plan.Id == id)
            .Select(plan => new
            {
                plan.Id,
                plan.Name,
                Meals = plan
                    .Meals.OrderBy(meal => meal.DisplayOrder)
                    .Select(meal => new
                    {
                        Id = meal.Key,
                        meal.Title,
                        Recipes = meal
                            .Recipes.Select(entry => new { entry.RecipeId, entry.Quantity })
                            .ToList(),
                    })
                    .ToList(),
            })
            .SingleOrDefaultAsync();

        if (plan is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(plan);
    }
);

app.MapPost(
    "/api/meal-plans",
    async (SaveMealPlanRequest request, MealPlannerDbContext db) =>
    {
        var validationError = await ValidateMealPlanRequest(request, db);

        if (validationError is not null)
        {
            return validationError;
        }

        var plan = new MealPlan
        {
            Name = request.Name.Trim(),
            Meals = request
                .Meals.Select(
                    (meal, index) =>
                        new Meal
                        {
                            Key = meal.Id.Trim(),
                            Title = meal.Title.Trim(),
                            DisplayOrder = index,
                            Recipes = meal
                                .Recipes.Select(entry => new MealRecipe
                                {
                                    RecipeId = entry.RecipeId,
                                    Quantity = entry.Quantity,
                                })
                                .ToList(),
                        }
                )
                .ToList(),
        };
        db.MealPlans.Add(plan);
        await db.SaveChangesAsync();

        return Results.Created($"/api/meal-plans/{plan.Id}", new { plan.Id, plan.Name });
    }
);

app.MapPut(
    "/api/meal-plans/{id:guid}",
    async (Guid id, SaveMealPlanRequest request, MealPlannerDbContext db) =>
    {
        var plan = await db.MealPlans.FindAsync(id);

        if (plan is null)
        {
            return Results.NotFound();
        }

        var validationError = await ValidateMealPlanRequest(request, db);

        if (validationError is not null)
        {
            return validationError;
        }

        await using var transaction = await db.Database.BeginTransactionAsync();

        await db.Meals.Where(meal => meal.MealPlanId == id).ExecuteDeleteAsync();

        plan.Name = request.Name.Trim();

        var replacementMeals = request
            .Meals.Select(
                (meal, index) =>
                    new Meal
                    {
                        MealPlanId = plan.Id,
                        Key = meal.Id.Trim(),
                        Title = meal.Title.Trim(),
                        DisplayOrder = index,
                        Recipes = meal
                            .Recipes.Select(entry => new MealRecipe
                            {
                                RecipeId = entry.RecipeId,
                                Quantity = entry.Quantity,
                            })
                            .ToList(),
                    }
            )
            .ToList();

        db.Meals.AddRange(replacementMeals);

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Results.Ok(new { plan.Id, plan.Name });
    }
);

// run the app //
app.Run();

static async Task<IResult?> ValidateRecipeRequest(
    CreateRecipeRequest request,
    MealPlannerDbContext db
)
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Instructions))
    {
        return Results.BadRequest("Enter a recipe name and instructions.");
    }

    if (request.Servings < 1)
    {
        return Results.BadRequest("Servings must be at leat one.");
    }
    if (
        request.Ingredients is null
        || request.Ingredients.Count == 0
        || request.Ingredients.Any(entry => entry is null || entry.AmountGrams <= 0)
    )
    {
        return Results.BadRequest(
            "Add at least one ingredient, with positive grams for every entry."
        );
    }

    var ingredientIds = request.Ingredients.Select(entry => entry.IngredientId).ToList();

    if (ingredientIds.Distinct().Count() != ingredientIds.Count)
    {
        return Results.BadRequest("Each ingredient can appear only once in a recipe.");
    }

    var exisitingCount = await db.Ingredients.CountAsync(ingredient =>
        ingredientIds.Contains(ingredient.Id)
    );

    if (exisitingCount != ingredientIds.Count)
    {
        return Results.BadRequest("One or more ingredients do not exist.");
    }

    return null;
}

static IResult? ValidateIngredientRequest(CreateIngredientRequest request)
{
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest("Enter an ingredient name.");
    }

    if (request.KcalPer100g < 0)
    {
        return Results.BadRequest("Calories cannot be negative");
    }

    if (
        request.ProteinPer100g is < 0 or > 100
        || request.SugarPer100g is < 0 or > 100
        || request.FatPer100g is < 0 or > 100
    )
    {
        return Results.BadRequest(
            "Protein, sugar, and fat must each be betweeen 0 and 100 g per 100 g."
        );
    }

    return null;
}

static async Task<IResult?> ValidateMealPlanRequest(
    SaveMealPlanRequest request,
    MealPlannerDbContext db
)
{
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest("Enter a meal-plan name.");
    }

    if (request.Meals is null || request.Meals.Count == 0)
    {
        return Results.BadRequest("A plan needs at least one meal column.");
    }

    if (
        request.Meals.Any(meal =>
            meal is null
            || string.IsNullOrWhiteSpace(meal.Id)
            || string.IsNullOrWhiteSpace(meal.Title)
            || meal.Recipes is null
        )
    )
    {
        return Results.BadRequest("Each meal needs an ID, title and recipe list.");
    }

    var mealKeys = request.Meals.Select(meal => meal.Id.Trim()).ToList();

    if (mealKeys.Distinct().Count() != mealKeys.Count)
    {
        return Results.BadRequest("Meal column IDs must be unique");
    }

    foreach (var meal in request.Meals)
    {
        if (meal.Recipes.Any(entry => entry is null || entry.Quantity < 1))
        {
            return Results.BadRequest("Every planned recipe needs a positive servings quantity.");
        }

        var recipeIds = meal.Recipes.Select(entry => entry.RecipeId).ToList();

        if (recipeIds.Distinct().Count() != recipeIds.Count)
        {
            return Results.BadRequest("A recipe can appear only once within each meal.");
        }
    }

    var allRecipeIds = request
        .Meals.SelectMany(meal => meal.Recipes)
        .Select(entry => entry.RecipeId)
        .Distinct()
        .ToList();

    var exisitingCount = await db.Recipes.CountAsync(recipe => allRecipeIds.Contains(recipe.Id));

    if (exisitingCount != allRecipeIds.Count)
    {
        return Results.BadRequest("One or more recipes do not exist.");
    }

    return null;
}
