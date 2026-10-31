namespace MealPlanner.Api.Models;

public class Meal
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MealPlanId { get; set; }

    public required string Key { get; set; }

    public required string Title { get; set; }

    public int DisplayOrder { get; set; }

    public List<MealRecipe> Recipes { get; set; } = [];
}
