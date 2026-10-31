namespace MealPlanner.Api.Models;

public class MealPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public List<Meal> Meals { get; set; } = [];
}
