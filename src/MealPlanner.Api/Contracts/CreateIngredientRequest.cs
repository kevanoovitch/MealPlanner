namespace MealPlanner.Api.Contracts;

public class CreateIngredientRequest
{
    public required string Name { get; set; }

    public required decimal KcalPer100g { get; set; }

    public required decimal ProteinPer100g { get; set; }

    public required decimal SugarPer100g { get; set; }

    public required decimal FatPer100g { get; set; }
}
