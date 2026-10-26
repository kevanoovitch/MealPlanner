namespace MealPlanner.Api.Models;

public class Ingredient
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public decimal KcalPer100g { get; set; }

    public decimal ProteinPer100g { get; set; }

    public decimal SugarPer100g { get; set; }

    public decimal FatPer100g { get; set; }
}
