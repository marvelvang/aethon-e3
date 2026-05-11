using aethon_e3.core.Definitions;
using aethon_e3.persistence.Entities;

namespace aethon_e3.core.DomainServices;

public record ResourceGains(int ConsumerGoodsGain, int IndustryGain, int HousingGain, int PopulationGain);

public class ResourceGainService(PopulationGrowthService growthService)
{
    public ResourceGains Calculate(GameState state)
    {
        int cgProduction  = state.Buildings.Sum(b => BuildingDefinitions.For(b.Type).ConsumerGoodsProduction);
        int indProduction = state.Buildings.Sum(b => BuildingDefinitions.For(b.Type).IndustryProduction);
        int totalHousing  = state.Buildings.Sum(b => BuildingDefinitions.For(b.Type).HousingContribution);

        int cgGain      = cgProduction - state.Population;
        int industryGain = indProduction;
        int housingGain  = state.Buildings
                               .Where(b => b.IsNewlyBuilt)
                               .Sum(b => BuildingDefinitions.For(b.Type).HousingContribution);
        int populationGain = CalculatePopulationGain(state, cgProduction, totalHousing);

        return new ResourceGains(cgGain, industryGain, housingGain, populationGain);
    }

    private int CalculatePopulationGain(GameState state, int cgProduction, int totalHousing)
    {
        if (state.Population == 0) return 0;

        int nextGoods = Math.Max(0, state.ConsumerGoods + cgProduction - state.Population);
        double supply = (double)nextGoods / state.Population;
        double delta  = growthService.CalculateDelta(state.Population, supply);

        int nextPopulation = Math.Min((int)(state.Population + delta), totalHousing);
        return nextPopulation - state.Population;
    }
}
