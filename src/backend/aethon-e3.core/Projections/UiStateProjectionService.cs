using aethon_e3.core.Definitions;
using aethon_e3.core.DomainServices;
using aethon_e3.persistence.Entities;
using aethon_e3.persistence.Enums;

namespace aethon_e3.core.Projections;

public class UiStateProjectionService(ResourceGainService gainService)
{
    private static readonly BuildingType[] AllTypes =
        [BuildingType.Base, BuildingType.Consumer, BuildingType.Industry, BuildingType.Housing, BuildingType.PowerPlant];

    private static readonly HashSet<BuildingType> BuildableTypes =
        [BuildingType.Consumer, BuildingType.Industry, BuildingType.Housing, BuildingType.PowerPlant];

    public UiState Project(GameState state)
    {
        int housing = state.Buildings.Sum(b => BuildingDefinitions.For(b.Type).HousingContribution);
        int bound   = state.Buildings
                          .Where(b => b.IsNewlyBuilt)
                          .Sum(b => BuildingDefinitions.For(b.Type).PopulationCost);
        int freePopulation = state.Population - bound;
        var gains = gainService.Calculate(state);

        return new UiState
        {
            BackendVersion    = UiState.APP_VERSION,
            GameStateId       = state.Id,
            Round             = state.Round,
            Population        = state.Population,
            FreePopulation    = freePopulation,
            BoundPopulation   = bound,
            ConsumerGoods     = state.ConsumerGoods,
            Industry          = state.Industry,
            Energy            = state.Energy,
            Housing           = housing,
            ConsumerGoodsGain = gains.ConsumerGoodsGain,
            IndustryGain      = gains.IndustryGain,
            EnergyGain        = gains.EnergyGain,
            HousingGain       = gains.HousingGain,
            PopulationGain    = gains.PopulationGain,
            Buildings       = state.Buildings
                                  .Select(b => new UiBuildingSlot
                                  {
                                      X            = b.X,
                                      Y            = b.Y,
                                      Type         = b.Type,
                                      IsNewlyBuilt = b.IsNewlyBuilt
                                  })
                                  .ToList(),
            BuildingTypes   = AllTypes
                                  .Select(t =>
                                  {
                                      var def = BuildingDefinitions.For(t);
                                      bool buildable = BuildableTypes.Contains(t);
                                      return new UiBuildingTypeInfo
                                      {
                                          Type                    = t,
                                          PopulationCost          = def.PopulationCost,
                                          IndustryCost            = def.IndustryCost,
                                          EnergyCost              = def.EnergyCost,
                                          ConsumerGoodsProduction = def.ConsumerGoodsProduction,
                                          IndustryProduction      = def.IndustryProduction,
                                          EnergyProduction        = def.EnergyProduction,
                                          HousingContribution     = def.HousingContribution,
                                          IsBuildable             = buildable,
                                          CanAfford               = buildable
                                                                 && freePopulation >= def.PopulationCost
                                                                 && state.Industry  >= def.IndustryCost
                                                                 && state.Energy    >= def.EnergyCost
                                      };
                                  })
                                  .ToList()
        };
    }
}
