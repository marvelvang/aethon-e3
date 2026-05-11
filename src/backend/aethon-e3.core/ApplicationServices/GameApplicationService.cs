using aethon_e3.core.DomainServices;
using aethon_e3.core.Projections;
using aethon_e3.persistence;
using aethon_e3.persistence.Entities;
using aethon_e3.persistence.Enums;
using Microsoft.EntityFrameworkCore;

namespace aethon_e3.core.ApplicationServices;

public class GameApplicationService(
    AppDbContext db,
    GameFactory factory,
    BuildService buildService,
    RoundService roundService,
    UiStateProjectionService projectionService)
{
    public async Task<UiState> CreateGame()
    {
        var state = factory.CreateNewGame();
        db.GameStates.Add(state);
        await db.SaveChangesAsync();
        return projectionService.Project(state);
    }

    public async Task<UiState> GetState(int gameId)
    {
        var state = await LoadState(gameId);
        return projectionService.Project(state);
    }

    public async Task<UiState> BuildBuilding(int gameId, int x, int y, BuildingType type)
    {
        var state = await LoadState(gameId);
        buildService.PlaceBuilding(state, x, y, type);
        await db.SaveChangesAsync();
        return projectionService.Project(state);
    }

    public async Task<UiState> EndRound(int gameId)
    {
        var state = await LoadState(gameId);
        roundService.Simulate(state);
        await db.SaveChangesAsync();
        return projectionService.Project(state);
    }

    public async Task DeleteGame(int gameId)
    {
        var state = await db.GameStates
            .Include(s => s.Buildings)
            .FirstOrDefaultAsync(s => s.Id == gameId);
        if (state is null) return;
        db.Buildings.RemoveRange(state.Buildings);
        db.GameStates.Remove(state);
        await db.SaveChangesAsync();
    }

    private async Task<GameState> LoadState(int gameId) =>
        await db.GameStates
            .Include(s => s.Buildings)
            .FirstOrDefaultAsync(s => s.Id == gameId)
        ?? throw new InvalidOperationException($"GameState {gameId} not found.");
}
