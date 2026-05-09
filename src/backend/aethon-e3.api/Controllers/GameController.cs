using aethon_e3.core.ApplicationServices;
using aethon_e3.persistence.Enums;
using Microsoft.AspNetCore.Mvc;

namespace aethon_e3.api.Controllers;

[ApiController]
[Route("api/game")]
public class GameController(GameApplicationService gameService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateGame()
    {
        var uiState = await gameService.CreateGame();
        return Ok(uiState);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetState(int id)
    {
        try
        {
            var uiState = await gameService.GetState(id);
            return Ok(uiState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/buildings")]
    public async Task<IActionResult> BuildBuilding(int id, [FromBody] PlaceBuildingRequest request)
    {
        try
        {
            var uiState = await gameService.BuildBuilding(id, request.X, request.Y, request.Type);
            return Ok(uiState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/round")]
    public async Task<IActionResult> EndRound(int id)
    {
        try
        {
            var uiState = await gameService.EndRound(id);
            return Ok(uiState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public record PlaceBuildingRequest(int X, int Y, BuildingType Type);
