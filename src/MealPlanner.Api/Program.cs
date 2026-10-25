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

// run the app //
app.Run();
