using aethon_e3.core.ApplicationServices;
using aethon_e3.core.Projections;
using aethon_e3.persistence.Enums;
using Microsoft.AspNetCore.Mvc;

namespace aethon_e3.api.Controllers;

[ApiController]
[Route("api/game")]
public class GameController(GameApplicationService gameService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<UiState>> CreateGame()
    {
        return Ok(await gameService.CreateGame());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UiState>> GetState(int id)
    {
        try
        {
            return Ok(await gameService.GetState(id));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/buildings")]
    public async Task<ActionResult<UiState>> BuildBuilding(int id, [FromBody] PlaceBuildingRequest request)
    {
        try
        {
            return Ok(await gameService.BuildBuilding(id, request.X, request.Y, request.Type));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/round")]
    public async Task<ActionResult<UiState>> EndRound(int id)
    {
        try
        {
            return Ok(await gameService.EndRound(id));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteGame(int id)
    {
        await gameService.DeleteGame(id);
        return NoContent();
    }
}

public record PlaceBuildingRequest(int X, int Y, BuildingType Type);
