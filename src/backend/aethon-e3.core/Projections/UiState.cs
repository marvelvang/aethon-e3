using aethon_e3.persistence.Enums;

namespace aethon_e3.core.Projections;

public class UiState
{
    public required int GameStateId { get; init; }
    public required int Round { get; init; }
    public required int Population { get; init; }
    public required int FreePopulation { get; init; }
    public required int BoundPopulation { get; init; }
    public required int ConsumerGoods { get; init; }
    public required int Industry { get; init; }
    public required int Housing { get; init; }
    public required int ConsumerGoodsGain { get; init; }
    public required int IndustryGain { get; init; }
    public required int HousingGain { get; init; }
    public required int PopulationGain { get; init; }
    public required List<UiBuildingSlot> Buildings { get; init; }
    public required List<UiBuildingTypeInfo> BuildingTypes { get; init; }
}

public class UiBuildingSlot
{
    public required int X { get; init; }
    public required int Y { get; init; }
    public required BuildingType Type { get; init; }
    public required bool IsNewlyBuilt { get; init; }
}

public class UiBuildingTypeInfo
{
    public required BuildingType Type { get; init; }
    public required int PopulationCost { get; init; }
    public required int IndustryCost { get; init; }
    public required bool CanAfford { get; init; }
}
