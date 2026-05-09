using aethon_e3.core.Definitions;
using aethon_e3.persistence.Entities;
using aethon_e3.persistence.Enums;

namespace aethon_e3.core.DomainServices;

public class BuildService
{
    public void PlaceBuilding(GameState state, int x, int y, BuildingType type)
    {
        if (type == BuildingType.Base)
            throw new InvalidOperationException("Base cannot be built manually.");

        if (x < 0 || x >= GameState.GridSize || y < 0 || y >= GameState.GridSize)
            throw new InvalidOperationException($"Position ({x},{y}) is outside the grid.");

        if (state.Grid[x, y] != null)
            throw new InvalidOperationException($"Position ({x},{y}) is already occupied.");

        var def = BuildingDefinitions.For(type);

        int bound = state.Buildings
                        .Where(b => b.IsNewlyBuilt)
                        .Sum(b => BuildingDefinitions.For(b.Type).PopulationCost);
        int freePopulation = state.Population - bound;

        if (freePopulation < def.PopulationCost)
            throw new InvalidOperationException(
                $"Insufficient free population. Need {def.PopulationCost}, have {freePopulation}.");

        if (state.Industry < def.IndustryCost)
            throw new InvalidOperationException(
                $"Insufficient industry. Need {def.IndustryCost}, have {state.Industry}.");

        state.Industry -= def.IndustryCost;

        state.Buildings.Add(new Building
        {
            X            = x,
            Y            = y,
            Type         = type,
            IsNewlyBuilt = true
        });
    }
}
