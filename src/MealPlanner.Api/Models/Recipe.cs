namespace MealPlanner.Api.Models;

public class Recipe
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public int Servings { get; set; } = 1;

    public required string Instructions { get; set; }

    public string? ImageUrl { get; set; }

    public List<RecipeIngredient> Ingredients { get; set; } = [];
}
