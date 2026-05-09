using aethon_e3.persistence.Entities;
using aethon_e3.persistence.Enums;

namespace aethon_e3.core.DomainServices;

public class GameFactory
{
    public GameState CreateNewGame()
    {
        var state = new GameState
        {
            Round         = 1,
            Population    = 100,
            ConsumerGoods = 0,
            Industry      = 200
        };
        state.Buildings.Add(new Building
        {
            X            = 0,
            Y            = 0,
            Type         = BuildingType.Base,
            IsNewlyBuilt = false
        });
        return state;
    }
}
