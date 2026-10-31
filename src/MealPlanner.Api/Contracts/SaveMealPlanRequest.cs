namespace MealPlanner.Api.Contracts;

public class SaveMealPlanRequest
{
    public required string Name { get; set; }

    public required List<SaveMealRequest> Meals { get; set; }
}
