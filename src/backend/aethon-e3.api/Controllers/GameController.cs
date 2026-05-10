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
    [ProducesResponseType<UiState>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateGame()
    {
        return Ok(await gameService.CreateGame());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<UiState>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetState(int id)
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
    [ProducesResponseType<UiState>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BuildBuilding(int id, [FromBody] PlaceBuildingRequest request)
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
    [ProducesResponseType<UiState>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> EndRound(int id)
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
}

public record PlaceBuildingRequest(int X, int Y, BuildingType Type);
