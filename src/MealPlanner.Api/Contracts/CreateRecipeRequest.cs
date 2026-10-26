namespace MealPlanner.Api.Contracts;

public class CreateRecipeRequest
{
    public required string Name { get; set; }

    public required int Servings { get; set; }

    public required string Instructions { get; set; }

    public string? ImageUrl { get; set; }

    public required List<CreateRecipeIngredientRequest> Ingredients { get; set; }
}
