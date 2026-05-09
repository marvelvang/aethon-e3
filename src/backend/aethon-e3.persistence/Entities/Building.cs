using aethon_e3.persistence.Enums;

namespace aethon_e3.persistence.Entities;

public class Building
{
    public int Id { get; set; }
    public int GameStateId { get; set; }
    public GameState GameState { get; set; } = null!;

    public int X { get; set; }
    public int Y { get; set; }

    public BuildingType Type { get; set; }
    public bool IsNewlyBuilt { get; set; }
}
