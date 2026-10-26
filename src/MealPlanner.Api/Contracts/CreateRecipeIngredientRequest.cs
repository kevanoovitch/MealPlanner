namespace MealPlanner.Api.Contracts;

public class CreateRecipeIngredientRequest
{
    public required Guid IngredientId { get; set; }

    public required decimal AmountGrams { get; set; }
}
