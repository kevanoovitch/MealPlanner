namespace MealPlanner.Api.Models;

public class RecipeIngredient
{
    public Guid RecipeId { get; set; }

    public Guid IngredientId { get; set; }

    public decimal AmountGrams { get; set; }
}
