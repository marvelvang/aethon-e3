namespace aethon_e3.core.Definitions;

public record BuildingDefinition(
    int PopulationCost,
    int IndustryCost,
    int ConsumerGoodsProduction,
    int IndustryProduction,
    int HousingContribution,
    int EnergyCost,
    int EnergyProduction
)
{
    public int MaintenancePopulationCost => (int)Math.Ceiling(PopulationCost * 0.25);
    public int MaintenanceIndustryCost   => (int)Math.Ceiling(IndustryCost   * 0.25);
    public int MaintenanceEnergyCost     => (int)Math.Ceiling(EnergyCost     * 0.25);
}
