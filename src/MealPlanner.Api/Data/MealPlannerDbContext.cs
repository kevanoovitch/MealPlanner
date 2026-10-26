using MealPlanner.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MealPlanner.Api.Data;

public class MealPlannerDbContext : DbContext
{
    public MealPlannerDbContext(DbContextOptions<MealPlannerDbContext> options)
        : base(options) { }

    public DbSet<Ingredient> Ingredients => Set<Ingredient>();

    public DbSet<Recipe> Recipes => Set<Recipe>();

    public DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var recipeIngredient = modelBuilder.Entity<RecipeIngredient>();

        recipeIngredient.HasKey(entry => new { entry.RecipeId, entry.IngredientId });

        recipeIngredient
            .HasOne<Recipe>()
            .WithMany(recipe => recipe.Ingredients)
            .HasForeignKey(entry => entry.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        recipeIngredient
            .HasOne<Ingredient>()
            .WithMany()
            .HasForeignKey(entry => entry.IngredientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
