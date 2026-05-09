using aethon_e3.core.DomainServices;
using aethon_e3.persistence;

namespace aethon_e3.core.ApplicationServices;

public class GameApplicationService(AppDbContext db, GameFactory factory)
{
    public async Task<int> CreateGame()
    {
        var state = factory.CreateNewGame();
        db.GameStates.Add(state);
        await db.SaveChangesAsync();
        return state.Id;
    }
}
