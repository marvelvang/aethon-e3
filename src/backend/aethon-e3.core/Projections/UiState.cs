using aethon_e3.persistence.Enums;

namespace aethon_e3.core.Projections;

public class UiState
{
    public int GameStateId { get; init; }
    public int Population { get; init; }
    public int FreePopulation { get; init; }
    public int BoundPopulation { get; init; }
    public int ConsumerGoods { get; init; }
    public int Industry { get; init; }
    public int Housing { get; init; }
    public List<UiBuildingSlot> Buildings { get; init; } = [];
    public List<UiBuildingTypeInfo> BuildingTypes { get; init; } = [];
}

public class UiBuildingSlot
{
    public int X { get; init; }
    public int Y { get; init; }
    public BuildingType Type { get; init; }
    public bool IsNewlyBuilt { get; init; }
}

public class UiBuildingTypeInfo
{
    public BuildingType Type { get; init; }
    public int PopulationCost { get; init; }
    public int IndustryCost { get; init; }
    public bool CanAfford { get; init; }
}
