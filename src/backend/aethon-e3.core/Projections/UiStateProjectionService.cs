using aethon_e3.core.Definitions;
using aethon_e3.persistence.Entities;
using aethon_e3.persistence.Enums;

namespace aethon_e3.core.Projections;

public class UiStateProjectionService
{
    private static readonly BuildingType[] BuildableTypes =
        [BuildingType.Consumer, BuildingType.Industry, BuildingType.Housing];

    public UiState Project(GameState state)
    {
        int housing = state.Buildings.Sum(b => BuildingDefinitions.For(b.Type).HousingContribution);
        int bound   = state.Buildings
                          .Where(b => b.IsNewlyBuilt)
                          .Sum(b => BuildingDefinitions.For(b.Type).PopulationCost);
        int freePopulation = state.Population - bound;

        return new UiState
        {
            GameStateId     = state.Id,
            Population      = state.Population,
            FreePopulation  = freePopulation,
            BoundPopulation = bound,
            ConsumerGoods   = state.ConsumerGoods,
            Industry        = state.Industry,
            Housing         = housing,
            Buildings       = state.Buildings
                                  .Select(b => new UiBuildingSlot
                                  {
                                      X            = b.X,
                                      Y            = b.Y,
                                      Type         = b.Type,
                                      IsNewlyBuilt = b.IsNewlyBuilt
                                  })
                                  .ToList(),
            BuildingTypes   = BuildableTypes
                                  .Select(t =>
                                  {
                                      var def = BuildingDefinitions.For(t);
                                      return new UiBuildingTypeInfo
                                      {
                                          Type           = t,
                                          PopulationCost = def.PopulationCost,
                                          IndustryCost   = def.IndustryCost,
                                          CanAfford      = freePopulation >= def.PopulationCost
                                                        && state.Industry  >= def.IndustryCost
                                      };
                                  })
                                  .ToList()
        };
    }
}
