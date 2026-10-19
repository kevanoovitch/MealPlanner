using MealPlanner.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MealPlanner.Api.Data;

public class MealPlannerDbContext : DbContext
{
    public MealPlannerDbContext(DbContextOptions<MealPlannerDbContext> options)
        : base(options) { }

    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
}
