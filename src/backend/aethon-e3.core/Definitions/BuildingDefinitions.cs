using aethon_e3.persistence.Enums;

namespace aethon_e3.core.Definitions;

public static class BuildingDefinitions
{
    private static readonly Dictionary<BuildingType, BuildingDefinition> _all = new()
    {
        [BuildingType.Base]     = new(0,  0,  100, 200, 150),
        [BuildingType.Consumer] = new(25, 15, 40,  0,   0),
        [BuildingType.Industry] = new(40, 70, 10,  50,  0),
        [BuildingType.Housing]  = new(50, 60, 0,   0,   20),
    };

    public static BuildingDefinition For(BuildingType type) => _all[type];
}
