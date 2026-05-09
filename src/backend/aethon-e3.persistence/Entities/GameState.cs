namespace aethon_e3.persistence.Entities;

public class GameState
{
    public const int GridSize = 10;

    public int Id { get; set; }
    public int Population { get; set; }
    public int ConsumerGoods { get; set; }
    public int Industry { get; set; }

    public ICollection<Building> Buildings { get; set; } = new List<Building>();

    public Building?[,] Grid => BuildGrid();

    private Building?[,] BuildGrid()
    {
        var grid = new Building?[GridSize, GridSize];
        foreach (var b in Buildings)
            grid[b.X, b.Y] = b;
        return grid;
    }
}
