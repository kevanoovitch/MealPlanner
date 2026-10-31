namespace MealPlanner.Api.Models;

public class MealRecipe
{
    public Guid MealId { get; set; }

    public Guid RecipeId { get; set; }

    public int Quantity { get; set; } = 1;
}
