namespace MealPlanner.Api.Contracts;

public class SaveMealRecipeRequest
{
    public required Guid RecipeId { get; set; }

    public required int Quantity { get; set; }
}
