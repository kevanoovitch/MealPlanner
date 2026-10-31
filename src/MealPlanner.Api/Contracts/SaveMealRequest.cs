namespace MealPlanner.Api.Contracts;

public class SaveMealRequest
{
    public required string Id { get; set; }

    public required string Title { get; set; }

    public required List<SaveMealRecipeRequest> Recipes { get; set; }
}
