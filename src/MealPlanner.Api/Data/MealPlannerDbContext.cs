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

    public DbSet<MealPlan> MealPlans => Set<MealPlan>();

    public DbSet<Meal> Meals => Set<Meal>();

    public DbSet<MealRecipe> MealRecipes => Set<MealRecipe>();

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

        var meal = modelBuilder.Entity<Meal>();

        meal.HasIndex(entry => new { entry.MealPlanId, entry.Key }).IsUnique();

        meal.HasOne<MealPlan>()
            .WithMany(plan => plan.Meals)
            .HasForeignKey(entry => entry.MealPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        var mealRecipe = modelBuilder.Entity<MealRecipe>();

        mealRecipe.HasKey(entry => new { entry.MealId, entry.RecipeId });

        mealRecipe
            .HasOne<Meal>()
            .WithMany(entry => entry.Recipes)
            .HasForeignKey(entry => entry.MealId)
            .OnDelete(DeleteBehavior.Cascade);

        mealRecipe
            .HasOne<Recipe>()
            .WithMany()
            .HasForeignKey(entry => entry.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
