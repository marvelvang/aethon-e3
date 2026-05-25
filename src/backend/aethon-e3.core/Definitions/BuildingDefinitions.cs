using aethon_e3.persistence.Enums;

namespace aethon_e3.core.Definitions;

public static class BuildingDefinitions
{
    private static readonly Dictionary<BuildingType, BuildingDefinition> _all = new()
    {
        //                          PopCost IndCost CGProd IndProd Housing EneCost EneProd MaintPop MaintInd MaintEne
        [BuildingType.Base]       = new(0,  0,  100, 200, 150, 0,  0,  10, 15, 15),
        [BuildingType.Consumer]   = new(25, 15, 40,  0,   0,   15, 0,  7,  5,  5),
        [BuildingType.Industry]   = new(40, 70, 10,  50,  0,   70, 0,  10, 7,  7),
        [BuildingType.Housing]    = new(50, 60, 0,   0,   20,  60, 0,  0,  0,  0),
        [BuildingType.PowerPlant] = new(40, 70, 0,   0,   0,   70, 50, 10, 7,  7),
    };

    public static BuildingDefinition For(BuildingType type) => _all[type];
}
