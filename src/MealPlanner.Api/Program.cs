using MealPlanner.Api.Contracts;
using MealPlanner.Api.Data;
using MealPlanner.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var databasePath = Path.Combine(builder.Environment.ContentRootPath, "mealplanner.db");

var connectionString = new SqliteConnectionStringBuilder { DataSource = databasePath }.ToString();

builder.Services.AddDbContext<MealPlannerDbContext>(options => options.UseSqlite(connectionString));

var app = builder.Build();

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
