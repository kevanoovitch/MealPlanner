using MealPlanner.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var databasePath = Path.Combine(builder.Environment.ContentRootPath, "mealplanner.db");

var connectionString = new SqliteConnectionStringBuilder { DataSource = databasePath }.ToString();

builder.Services.AddDbContext<MealPlannerDbContext>(options => options.UseSqlite(connectionString));

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

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

// run the app //
app.Run();
