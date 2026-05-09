using aethon_e3.core.Definitions;
using aethon_e3.persistence.Entities;

namespace aethon_e3.core.DomainServices;

public class RoundService
{
    public void Simulate(GameState state)
    {
        // Step 1: Normalization — releases bound population
        foreach (var b in state.Buildings)
            b.IsNewlyBuilt = false;

        // Step 2: Production — all buildings produce
        foreach (var b in state.Buildings)
        {
            var def = BuildingDefinitions.For(b.Type);
            state.ConsumerGoods += def.ConsumerGoodsProduction;
            state.Industry      += def.IndustryProduction;
        }

        // Step 3: Consumption
        state.ConsumerGoods = Math.Max(0, state.ConsumerGoods - state.Population);

        if (state.Population > 0)
        {
            // Step 4: Supply ratio
            double supply = (double)state.ConsumerGoods / state.Population;

            // Step 5: Population change
            double delta = 0.0;
            if (supply > 1.0)
            {
                double rate = 0.0025 * Math.Pow(supply - 1.0, 1.2);
                delta = state.Population * rate;
            }
            else if (supply < 1.0)
            {
                double rate = 0.005 * Math.Abs(supply - 1.0);
                delta = -(state.Population * rate);
            }

            // Step 6: Housing cap
            int housing = state.Buildings.Sum(b => BuildingDefinitions.For(b.Type).HousingContribution);
            state.Population = Math.Min((int)(state.Population + delta), housing);
        }

        // Step 7: Advance round counter
        state.Round++;
    }
}
